import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { TrendingUp } from 'lucide-react'

export default function DashboardStats() {
  return (
        <div className="grid gap-4 md:gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Open Classes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">4</div>
              <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600">
                <TrendingUp className="size-3" />
                <span>8%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Events Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">4</div>
              <p className="mt-2 text-xs text-muted-foreground">
                In next 20 min
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Busy Zones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">5</div>
              <p className="mt-2 text-xs text-muted-foreground">Canteen</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                My Next Classes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">11:00</div>
              <p className="mt-2 text-xs text-muted-foreground">
                Room 34-401
              </p>
            </CardContent>
          </Card>
        </div>
  )
}
