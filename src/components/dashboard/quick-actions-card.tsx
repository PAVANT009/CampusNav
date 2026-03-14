import React from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"

export default function QuickActionsCard() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <Link
          href="/chat?prompt=find%20me%20empty%20classes"
          className="block rounded-md border border-border/60 px-3 py-2 hover:bg-accent hover:text-accent-foreground"
        >
          Find empty classes
        </Link>
        <Link
          href="/events?filter=today"
          className="block rounded-md border border-border/60 px-3 py-2 hover:bg-accent hover:text-accent-foreground"
        >
          View today's events
        </Link>
        <Link
          href="/map"
          className="block rounded-md border border-border/60 px-3 py-2 hover:bg-accent hover:text-accent-foreground"
        >
          Open campus map
        </Link>
      </CardContent>
    </Card>
  )
}
