"use client"

import React from "react"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { MoveUpRight, Plus } from "lucide-react"

const categories = [
  "All",
  "Today",
  "Academics",
  "Cultural",
  "Sports",
  "Workshops",
  "Near me",
]

export default function Page() {
  const [eventDate, setEventDate] = React.useState<Date | undefined>()
  const [eventCategory, setEventCategory] = React.useState<string>("")

  return (
    <div className="flex flex-1 flex-col gap-4 px-6 pt-8">
      {/* nav of event */}
      <div className="flex flex-row justify-between">
        <span className="text-xl font-semibold text-foreground">Events</span>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus />
              Add event
              <MoveUpRight />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create event</DialogTitle>
              <DialogDescription>
                Add the basics now. We will wire the API next.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3">
              <div className="grid gap-2">
                <label className="text-sm text-muted-foreground">
                  Event name
                </label>
                <Input placeholder="Hackathon kickoff" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm text-muted-foreground">Date</label>
                <Input
                  type="date"
                  value={eventDate ? format(eventDate, "yyyy-MM-dd") : ""}
                  onChange={(event) => {
                    const nextDate = event.target.value
                      ? new Date(event.target.value)
                      : undefined
                    setEventDate(nextDate)
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <label className="text-sm text-muted-foreground">
                    Start time
                  </label>
                  <Input type="time" />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm text-muted-foreground">
                    End time
                  </label>
                  <Input type="time" />
                </div>
              </div>
              <div className="grid gap-2">
                <label className="text-sm text-muted-foreground">Category</label>
                <Select value={eventCategory} onValueChange={setEventCategory}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="academics">Academics</SelectItem>
                    <SelectItem value="cultural">Cultural</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="workshops">Workshops</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <label className="text-sm text-muted-foreground">
                  Expected attendees
                </label>
                <Input type="number" min={0} placeholder="120" />
              </div>
              <div className="flex justify-end">
                <Button type="button">Save draft</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Input
        className="h-10 w-full self-center"
        placeholder="Search Events,Clubs,Venus..."
      />
      <div className="flex flex-row gap-3">
        {categories.map((cat, i) => (
          <div
            key={i}
            className="rounded-lg border border-border px-2 py-1 text-sm font-light text-slate-200 first:bg-accent first:text-accent-foreground"
          >
            {cat}
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-3">
        {/* Event */}
        <span className="text-muted-foreground">TODAY - MARCH 14</span>
        <div className="flex flex-row items-center gap-4 rounded-md border border-border bg-card px-6 py-4">
          <div>
            <div className="inline-flex flex-col rounded-lg bg-muted px-3.5 py-2.5">
              <span className="text-muted-foreground">MAR</span>
              <span>14</span>
            </div>
          </div>
          <div className="flex w-fit flex-1 flex-col items-start">
            <div className="flex items-center justify-between gap-4">
              <span>Hackathon kickoff</span>
              <Badge className="bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300">
                Live Now
              </Badge>
            </div>
            <div className="items-center justify-between text-sm text-muted-foreground">
              <span>3:00 pm - 5:00 pm</span>
              <span className="ml-2">Auditorium Hall</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Badge className="bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                Academic
              </Badge>
              <span className="ml-auto">120 attending</span>
            </div>
          </div>
          <div className="ml-auto flex justify-end font-light">
            <MoveUpRight />
          </div>
        </div>
      </div>
    </div>
  )
}
