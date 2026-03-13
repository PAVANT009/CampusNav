import React from "react"
import { ChartArea, TrendingUp } from "lucide-react"

import { PageNavbar } from "./dashboard-navbar"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartAreaInteractive } from "../chart-area"

// export default function DashboardClient() {
//   return (
//     <div>
//       <PageNavbar/>
//       <div>

//       </div>
//       <div>

//       </div>
//     </div>
//   )
// }

export default function DashboardClient() {
  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-6">
      <PageNavbar />
      <div className="flex flex-col gap-4 flex-1 min-w-0 px-4 pb-8 pt-2 md:px-6">
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
        <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                My Classes Today
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between rounded-md border border-border/60 px-3 py-2">
                <span className="font-medium">Data Structures</span>
                <span className="text-muted-foreground">09:00 · B-201</span>
              </div>
              <div className="flex items-center justify-between rounded-md border border-border/60 px-3 py-2">
                <span className="font-medium">Operating Systems</span>
                <span className="text-muted-foreground">11:00 · 34-401</span>
              </div>
              <div className="flex items-center justify-between rounded-md border border-border/60 px-3 py-2">
                <span className="font-medium">AI Lab</span>
                <span className="text-muted-foreground">14:00 · Lab 3</span>
              </div>
            </CardContent>
          </Card>

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
        </div>
        <div>
          <ChartAreaInteractive/>
        </div>
      </div>
    </div>
  )
}
