import { NextResponse } from "next/server"
import db from "@/lib/db"

export async function POST() {
  const conversation = await db.conversation.create({
    data: {},
  })

  return NextResponse.json({ id: conversation.id })
}
