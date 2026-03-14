import { NextResponse } from "next/server"
import db from "@/lib/db"

type CreateMessagePayload = {
  conversationId?: string
  role?: string
  content?: string
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const conversationId = searchParams.get("conversationId")

  if (!conversationId) {
    return NextResponse.json(
      { error: "conversationId is required" },
      { status: 400 }
    )
  }

  const messages = await db.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
  })

  return NextResponse.json({ messages })
}

export async function POST(request: Request) {
  const body = (await request.json()) as CreateMessagePayload

  if (!body.conversationId || !body.content) {
    return NextResponse.json(
      { error: "conversationId and content are required" },
      { status: 400 }
    )
  }

  const message = await db.message.create({
    data: {
      conversationId: body.conversationId,
      role: body.role ?? "user",
      content: body.content,
    },
  })

  return NextResponse.json({ message })
}
