import { NextResponse } from "next/server"
import db from "@/lib/db"
import { auth } from "@/lib/auth"

type CreateEventPayload = {
  name?: string
  date?: string
  startTime?: string
  endTime?: string
  location?: string
  category?: string
  attendees?: number
  status?: string
}

export async function GET() {
  const events = await db.event.findMany({
    orderBy: { date: "asc" },
  })

  return NextResponse.json({
    events: events.map((event) => ({
      ...event,
      date: event.date.toISOString(),
    })),
  })
}

export async function POST(request: Request) {
  const body = (await request.json()) as CreateEventPayload

  if (!body.name || !body.date) {
    return NextResponse.json(
      { error: "name and date are required" },
      { status: 400 }
    )
  }

  const parsedDate = new Date(body.date)
  if (Number.isNaN(parsedDate.getTime())) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 })
  }

  const session = await auth.api.getSession({
    headers: request.headers,
  })

  const event = await db.event.create({
    data: {
      name: body.name,
      date: parsedDate,
      startTime: body.startTime ?? null,
      endTime: body.endTime ?? null,
      location: body.location ?? null,
      category: body.category ?? null,
      attendees: body.attendees ?? 0,
      status: body.status ?? "Upcoming",
      userId: session?.user?.id ?? null,
    },
  })

  return NextResponse.json({
    event: {
      ...event,
      date: event.date.toISOString(),
    },
  })
}
