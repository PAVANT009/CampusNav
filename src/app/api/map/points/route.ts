import { NextResponse } from "next/server"
import db from "@/lib/db"
import { auth } from "@/lib/auth"

type CreatePointPayload = {
  name?: string
  lat?: number
  lng?: number
  isPublic?: boolean
}

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  })

  const points = await db.mapPoint.findMany({
    where: session?.user
      ? {
          OR: [
            { isPublic: true },
            { userId: String(session.user.id) },
          ],
        }
      : { isPublic: true },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ points })
}

export async function POST(request: Request) {
  const body = (await request.json()) as CreatePointPayload

  if (!body.name || typeof body.lat !== "number" || typeof body.lng !== "number") {
    return NextResponse.json(
      { error: "name, lat, and lng are required" },
      { status: 400 }
    )
  }

  const session = await auth.api.getSession({
    headers: request.headers,
  })

  const point = await db.mapPoint.create({
    data: {
      name: body.name,
      lat: body.lat,
      lng: body.lng,
      isPublic: body.isPublic ?? false,
      userId: session?.user?.id ?? null,
    },
  })

  return NextResponse.json({ point })
}
