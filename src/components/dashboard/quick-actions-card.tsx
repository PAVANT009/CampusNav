import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

export default function QuickActionsCard() {
  return (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="rounded-md border border-border/60 px-3 py-2">
                Find empty classes
              </div>
              <div className="rounded-md border border-border/60 px-3 py-2">
                View today’s events
              </div>
              <div className="rounded-md border border-border/60 px-3 py-2">
                Open campus map
              </div>
            </CardContent>
          </Card>
  )
}
