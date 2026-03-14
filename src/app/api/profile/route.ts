import { NextResponse } from "next/server"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import db from "@/lib/db"

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const name =
    typeof body?.name === "string" ? body.name.trim() : ""

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 })
  }

  const user = await db.user.update({
    where: { id: session.user.id },
    data: { name },
    select: { id: true, name: true, email: true },
  })

  return NextResponse.json({ user })
}
