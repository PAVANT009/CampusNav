import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import db from "@/lib/db"
import { auth } from "@/lib/auth"

const coordinatePattern = /(-?\d+(?:\.\d+)?)[,\s]+(-?\d+(?:\.\d+)?)/i

const extractPointFromText = (text: string) => {
  const match = text.match(coordinatePattern)
  if (!match) return null
  const lat = Number(match[1])
  const lng = Number(match[2])
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  const after = text.slice((match.index ?? 0) + match[0].length).trim()
  const before = text.slice(0, match.index ?? 0).trim()
  const name = (after || before || "")
    .replace(/^(add|create|point|map|location|at)\s+/i, "")
    .trim()
  if (!name) return null
  return { name, lat, lng }
}

const PENDING_PREFIX = "__PENDING_ACTION__:"

const encodePending = (payload: { type: string; data: Record<string, unknown> }) =>
  `${PENDING_PREFIX}${JSON.stringify(payload)}`

const decodePending = (text: string) => {
  const index = text.indexOf(PENDING_PREFIX)
  if (index === -1) return null
  const raw = text.slice(index + PENDING_PREFIX.length)
  try {
    return JSON.parse(raw) as { type: string; data: Record<string, unknown> }
  } catch {
    return null
  }
}

const stripPending = (text: string) => {
  const index = text.indexOf(PENDING_PREFIX)
  if (index === -1) return text
  return text.slice(0, index).trim()
}

const isConfirmation = (text: string) =>
  /\b(yes|confirm|ok|okay|sure|do it|go ahead|please do)\b/i.test(text)

const isRejection = (text: string) =>
  /\b(no|cancel|stop|dont|don't|nope)\b/i.test(text)

const functionDeclarations = [
  {
    name: "createEvent",
    description: "Create a new campus event.",
    parameters: {
      type: "object",
      properties: {
        name: { type: "string" },
        date: {
          type: "string",
          description: "Event date in YYYY-MM-DD format",
        },
        startTime: { type: "string" },
        endTime: { type: "string" },
        location: { type: "string" },
        category: { type: "string" },
        attendees: { type: "number" },
        status: { type: "string" },
      },
      required: ["name", "date"],
    },
  },
  {
    name: "createMapPoint",
    description: "Create a new map point for the campus map.",
    parameters: {
      type: "object",
      properties: {
        name: { type: "string" },
        lat: { type: "number" },
        lng: { type: "number" },
      },
      required: ["name", "lat", "lng"],
    },
  },
  {
    name: "findMapPoint",
    description: "Find map points by name and return coordinates.",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string" },
      },
      required: ["query"],
    },
  },
  {
    name: "findEvents",
    description: "Find events by name or category.",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string" },
      },
      required: ["query"],
    },
  },
]

type SendPayload = {
  conversationId?: string
  content?: string
}

export async function POST(req: Request) {
  const body = (await req.json()) as SendPayload
  const conversationId = body.conversationId
  const content = body.content

  if (!conversationId || !content) {
    return NextResponse.json(
      { error: "Missing conversationId or content" },
      { status: 400 }
    )
  }

  const session = await auth.api.getSession({
    headers: req.headers,
  })

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = String(session.user.id)

  const recentMessages = await db.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "desc" },
    take: 10,
  })

  const lastAssistant = recentMessages.find((message) => message.role === "assistant")
  const pending = lastAssistant ? decodePending(lastAssistant.content) : null

  const mapPoints = await db.mapPoint.findMany({
    where: {
      OR: [{ isPublic: true }, { userId }],
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  const events = await db.event.findMany({
    orderBy: { date: "asc" },
    take: 50,
  })

  await db.message.create({
    data: {
      conversationId,
      role: "user",
      content,
    },
  })

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: "API key missing on server." },
      { status: 500 }
    )
  }

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      let assistantMessage = ""

      const systemInstruction = `You are a campus assistant. You can create events and map points when asked. Ask for missing details before calling tools.

Known map points (public + user's private):
${mapPoints.length ? JSON.stringify(mapPoints.map((point) => ({
        name: point.name,
        lat: point.lat,
        lng: point.lng,
        isPublic: point.isPublic,
      })), null, 2) : "No map points yet."}

Known events:
${events.length ? JSON.stringify(events.map((event) => ({
        name: event.name,
        date: event.date.toISOString().slice(0, 10),
        startTime: event.startTime,
        endTime: event.endTime,
        location: event.location,
        category: event.category,
        status: event.status,
      })), null, 2) : "No events yet."}
`

      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction,
      })

      const contents = [
        ...recentMessages
          .slice()
          .reverse()
          .map((message) => ({
            role: message.role === "assistant" ? "model" : "user",
            parts: [
              {
                text:
                  message.role === "assistant"
                    ? stripPending(message.content)
                    : message.content,
              },
            ],
          })),
        { role: "user", parts: [{ text: content }] },
      ]

      const sendEvent = (payload: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`))
      }

      if (pending && isConfirmation(content)) {
        try {
          if (pending.type === "createMapPoint") {
            const data = pending.data as {
              name?: string
              lat?: number
              lng?: number
            }
            const lat = Number(data.lat)
            const lng = Number(data.lng)
            if (!data.name || !Number.isFinite(lat) || !Number.isFinite(lng)) {
              throw new Error("Invalid map point payload")
            }
            const point = await db.mapPoint.create({
              data: {
                name: data.name,
                lat,
                lng,
                isPublic: false,
                userId,
              },
            })
            assistantMessage = `Map point "${point.name}" added.`
            sendEvent({ type: "delta", text: assistantMessage })
            sendEvent({
              type: "tool",
              status: "success",
              message: `Map point "${point.name}" added.`,
            })
          }

          if (pending.type === "createEvent") {
            const data = pending.data as {
              name?: string
              date?: string
              startTime?: string
              endTime?: string
              location?: string
              category?: string
              attendees?: number
              status?: string
            }
            if (!data.name || !data.date) {
              throw new Error("Invalid event payload")
            }
            const parsedDate = new Date(String(data.date))
            if (Number.isNaN(parsedDate.getTime())) {
              throw new Error("Invalid date")
            }
            const event = await db.event.create({
              data: {
                name: data.name,
                date: parsedDate,
                startTime: data.startTime ?? null,
                endTime: data.endTime ?? null,
                location: data.location ?? null,
                category: data.category ?? null,
                attendees: data.attendees ?? 0,
                status: data.status ?? "Upcoming",
                userId,
              },
            })
            assistantMessage = `Event "${event.name}" created.`
            sendEvent({ type: "delta", text: assistantMessage })
            sendEvent({
              type: "tool",
              status: "success",
              message: `Event "${event.name}" created.`,
            })
          }
        } catch (error) {
          console.error("[DB] Failed to complete pending action:", error)
          sendEvent({
            type: "tool",
            status: "error",
            message: "Failed to complete the action.",
          })
        }

        await db.message.create({
          data: {
            conversationId,
            role: "assistant",
            content: assistantMessage || "Done.",
          },
        })
        sendEvent({ type: "done" })
        controller.close()
        return
      }

      if (pending && isRejection(content)) {
        assistantMessage = "Okay, canceled."
        sendEvent({ type: "delta", text: assistantMessage })
        await db.message.create({
          data: {
            conversationId,
            role: "assistant",
            content: assistantMessage,
          },
        })
        sendEvent({ type: "done" })
        controller.close()
        return
      }

      const result = await model.generateContentStream({
        contents,
        tools: [{ functionDeclarations }],
        toolConfig: {
          functionCallingConfig: { mode: "auto" },
        },
      })

      for await (const chunk of result.stream) {
        const delta = chunk.text()
        if (delta) {
          assistantMessage += delta
          sendEvent({ type: "delta", text: delta })
        }
      }

      const finalResponse = await result.response
      const functionCalls = finalResponse.functionCalls()
      let toolHandled = false

      if (functionCalls && functionCalls.length > 0) {
        const call = functionCalls[0]
        let args: any = call.args

        if (typeof args === "string") {
          try {
            args = JSON.parse(args)
          } catch (error) {
            sendEvent({
              type: "tool",
              status: "error",
              message: "Invalid tool arguments.",
            })
          }
        }

        if (call.name === "createEvent" && args) {
          toolHandled = true
          const confirmText = `You provided "${args.name}" on ${args.date}. Add this event? (yes/no)`
          assistantMessage += confirmText
          sendEvent({ type: "delta", text: confirmText })
          assistantMessage += `\n\n${encodePending({
            type: "createEvent",
            data: args,
          })}`
        }

        if (call.name === "createMapPoint" && args) {
          toolHandled = true
          const confirmText = `You provided "${args.name}" at ${args.lat}, ${args.lng}. Add this point? (yes/no)`
          assistantMessage += confirmText
          sendEvent({ type: "delta", text: confirmText })
          assistantMessage += `\n\n${encodePending({
            type: "createMapPoint",
            data: args,
          })}`
        }

        if (call.name === "findMapPoint" && args?.query) {
          toolHandled = true
          const q = String(args.query).toLowerCase()
          const matches = mapPoints.filter((point) =>
            point.name.toLowerCase().includes(q)
          )
          sendEvent({
            type: "tool",
            status: "success",
            message: matches.length
              ? JSON.stringify(
                  matches.map((point) => ({
                    name: point.name,
                    lat: point.lat,
                    lng: point.lng,
                  })),
                  null,
                  2
                )
              : "No matching map points found.",
          })
        }

        if (call.name === "findEvents" && args?.query) {
          toolHandled = true
          const q = String(args.query).toLowerCase()
          const matches = events.filter((event) => {
            const haystack = `${event.name} ${event.category ?? ""} ${
              event.location ?? ""
            }`.toLowerCase()
            return haystack.includes(q)
          })
          sendEvent({
            type: "tool",
            status: "success",
            message: matches.length
              ? JSON.stringify(
                  matches.map((event) => ({
                    name: event.name,
                    date: event.date.toISOString().slice(0, 10),
                    location: event.location,
                    category: event.category,
                  })),
                  null,
                  2
                )
              : "No matching events found.",
          })
        }
      }

      if (!toolHandled) {
        const extracted = extractPointFromText(content)
        if (extracted) {
          const confirmText = `You provided "${extracted.name}" at ${extracted.lat}, ${extracted.lng}. Add this point? (yes/no)`
          assistantMessage += confirmText
          sendEvent({ type: "delta", text: confirmText })
          assistantMessage += `\n\n${encodePending({
            type: "createMapPoint",
            data: extracted,
          })}`
        }
      }

      await db.message.create({
        data: {
          conversationId,
          role: "assistant",
          content: assistantMessage,
        },
      })

      sendEvent({ type: "done" })
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
