import React from "react"
import { TrendingUp } from "lucide-react"

import { DashBoardNavbar } from "./dashboard-navbar"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartAreaInteractive } from "../chart-area"
import DashboardStats from "./dashboard-stats"
import TodayClassesCard from "./today-classes-card"
import QuickActionsCard from "./quick-actions-card"

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
      <DashBoardNavbar />
      <div className="flex flex-col gap-4 flex-1 min-w-0 px-4 pb-8 pt-2 md:px-6">
        <DashboardStats/>
        <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
          <TodayClassesCard/>
          <QuickActionsCard/>
        </div>
        <div>
          <ChartAreaInteractive/>
        </div>
      </div>
    </div>
  )
}
