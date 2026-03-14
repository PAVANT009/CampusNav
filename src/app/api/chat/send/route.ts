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
        isPublic: { type: "boolean" },
      },
      required: ["name", "lat", "lng"],
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

      const systemInstruction = `You are a campus assistant. You can create events and map points when asked. Ask for missing details before calling tools.`

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
            parts: [{ text: message.content }],
          })),
        { role: "user", parts: [{ text: content }] },
      ]

      const sendEvent = (payload: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`))
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
          try {
            const parsedDate = new Date(args.date)
            if (Number.isNaN(parsedDate.getTime())) {
              throw new Error("Invalid date")
            }
            const event = await db.event.create({
              data: {
                name: args.name,
                date: parsedDate,
                startTime: args.startTime ?? null,
                endTime: args.endTime ?? null,
                location: args.location ?? null,
                category: args.category ?? null,
                attendees: args.attendees ?? 0,
                status: args.status ?? "Upcoming",
                userId,
              },
            })
            sendEvent({
              type: "tool",
              status: "success",
              message: `Event "${event.name}" created.`,
            })
          } catch (error) {
            sendEvent({
              type: "tool",
              status: "error",
              message: "Failed to create event.",
            })
          }
        }

        if (call.name === "createMapPoint" && args) {
          toolHandled = true
          try {
            const lat = Number(args.lat)
            const lng = Number(args.lng)
            if (!Number.isFinite(lat) || !Number.isFinite(lng) || !args.name) {
              throw new Error("Invalid map point payload")
            }
            const point = await db.mapPoint.create({
              data: {
                name: args.name,
                lat,
                lng,
                isPublic: args.isPublic ?? false,
                userId,
              },
            })
            sendEvent({
              type: "tool",
              status: "success",
              message: `Map point "${point.name}" added.`,
            })
          } catch (error) {
            console.error("[DB] Failed to add map point:", error)
            sendEvent({
              type: "tool",
              status: "error",
              message: "Failed to add map point.",
            })
          }
        }
      }

      if (!toolHandled) {
        const extracted = extractPointFromText(content)
        if (extracted) {
          try {
            const point = await db.mapPoint.create({
              data: {
                name: extracted.name,
                lat: extracted.lat,
                lng: extracted.lng,
                isPublic: false,
                userId,
              },
            })
            sendEvent({
              type: "tool",
              status: "success",
              message: `Map point "${point.name}" added.`,
            })
          } catch (error) {
            console.error("[DB] Failed to add map point (fallback):", error)
            sendEvent({
              type: "tool",
              status: "error",
              message: "Failed to add map point.",
            })
          }
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
