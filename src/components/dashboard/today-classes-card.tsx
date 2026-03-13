import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'

const classes = [
  {
    time: "09:00",
    subject: "Data Structures",
    room: "B-201",
    status: "done",
  },
  {
    time: "11:00",
    subject: "Operating Systems",
    room: "34-401",
    status: "next",
  },
  {
    time: "14:00",
    subject: "AI Lab",
    room: "Lab 3",
    status: "pending",
  },
]

export default function TodayClassesCard() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          My Classes Today
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-2 text-sm">
        {classes.map((cls, index) => (
          <div
            key={index}
            className="first:bg-accent flex items-center rounded-md border border-border/60 px-3 py-2"
          >
            <div className="w-1/3 text-foreground">{cls.time}</div>

            <div className="w-1/3 flex flex-col items-start">
              <span className="font-medium">{cls.subject}</span>
              <span className="font-light text-muted-foreground">
                {cls.room}
              </span>
            </div>

            <div className="w-1/3 flex justify-end">
              {cls.status === "done" && (
                <Badge className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
                  Done
                </Badge>
              )}

              {cls.status === "next" && (
                <Badge className="bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300">
                  Next
                </Badge>
              )}

              {cls.status === "pending" && (
                <Badge variant="secondary" className="invisible">
                  Pending
                </Badge>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
