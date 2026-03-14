"use client"

import React from "react"
import { format, isSameDay, parseISO } from "date-fns"
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

const events = [
  {
    id: "hackathon-kickoff",
    name: "Hackathon kickoff",
    date: "2026-03-14",
    startTime: "3:00 pm",
    endTime: "5:00 pm",
    location: "Auditorium Hall",
    category: "Academics",
    attendees: 120,
    status: "Live Now",
    isNearby: true,
  },
  {
    id: "robotics-demo",
    name: "Robotics demo day",
    date: "2026-03-14",
    startTime: "5:30 pm",
    endTime: "7:00 pm",
    location: "Engineering Lab 2",
    category: "Workshops",
    attendees: 68,
    status: "Starting Soon",
    isNearby: false,
  },
  {
    id: "cultural-night",
    name: "Cultural night rehearsal",
    date: "2026-03-15",
    startTime: "6:00 pm",
    endTime: "8:00 pm",
    location: "Open Air Theatre",
    category: "Cultural",
    attendees: 210,
    status: "Upcoming",
    isNearby: true,
  },
  {
    id: "sports-meet",
    name: "Inter-hostel sports meet",
    date: "2026-03-16",
    startTime: "4:00 pm",
    endTime: "6:30 pm",
    location: "Main Stadium",
    category: "Sports",
    attendees: 300,
    status: "Upcoming",
    isNearby: false,
  },
]

type EventItem = {
  id: string
  name: string
  date: string
  startTime: string
  endTime: string
  location: string
  category: string
  attendees: number
  status: string
  isNearby: boolean
}

export default function Page() {
  const [eventDate, setEventDate] = React.useState<Date | undefined>()
  const [eventCategory, setEventCategory] = React.useState<string>("")
  const [activeFilter, setActiveFilter] = React.useState("All")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [remoteEvents, setRemoteEvents] = React.useState<EventItem[]>([])

  const today = new Date()
  const normalizedQuery = searchQuery.trim().toLowerCase()

  React.useEffect(() => {
    const loadEvents = async () => {
      const response = await fetch("/api/events")
      if (!response.ok) return
      const data = (await response.json()) as {
        events?: {
          id: string
          name: string
          date: string
          startTime: string | null
          endTime: string | null
          location: string | null
          category: string | null
          attendees: number
          status: string
        }[]
      }
      if (!data.events) return
      setRemoteEvents(
        data.events.map((event) => ({
          id: event.id,
          name: event.name,
          date: event.date.slice(0, 10),
          startTime: event.startTime ?? "TBD",
          endTime: event.endTime ?? "TBD",
          location: event.location ?? "TBD",
          category: event.category ?? "General",
          attendees: event.attendees ?? 0,
          status: event.status ?? "Upcoming",
          isNearby: false,
        }))
      )
    }

    loadEvents()
  }, [])

  const allEvents = [...remoteEvents, ...events]

  const filteredEvents = allEvents.filter((event) => {
    if (activeFilter === "Today") {
      return isSameDay(parseISO(event.date), today)
    }
    if (activeFilter === "Near me") {
      return event.isNearby
    }
    if (activeFilter !== "All" && event.category !== activeFilter) {
      return false
    }

    if (!normalizedQuery) {
      return true
    }

    const haystack = `${event.name} ${event.location} ${event.category}`.toLowerCase()
    return haystack.includes(normalizedQuery)
  })

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
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
      />
      <div className="flex flex-row gap-3">
        {categories.map((cat, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActiveFilter(cat)}
            className={`rounded-lg border border-border px-2 py-1 text-sm font-light ${
              activeFilter === cat
                ? "bg-accent text-accent-foreground"
                : "text-slate-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-3">
        {/* Event */}
        <span className="text-muted-foreground">
          {filteredEvents.length
            ? format(parseISO(filteredEvents[0].date), "EEEE - MMMM d")
                .toUpperCase()
            : "NO EVENTS FOUND"}
        </span>
        {filteredEvents.map((event) => {
          const eventDate = parseISO(event.date)
          return (
            <div
              key={event.id}
              className="flex flex-row items-center gap-4 rounded-md border border-border bg-card px-6 py-4"
            >
              <div>
                <div className="inline-flex flex-col rounded-lg bg-muted px-3.5 py-2.5">
                  <span className="text-muted-foreground">
                    {format(eventDate, "MMM").toUpperCase()}
                  </span>
                  <span>{format(eventDate, "d")}</span>
                </div>
              </div>
              <div className="flex w-fit flex-1 flex-col items-start">
                <div className="flex items-center justify-between gap-4">
                  <span>{event.name}</span>
                  <Badge className="bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300">
                    {event.status}
                  </Badge>
                </div>
                <div className="items-center justify-between text-sm text-muted-foreground">
                  <span>
                    {event.startTime} - {event.endTime}
                  </span>
                  <span className="ml-2">{event.location}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Badge className="bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                    {event.category}
                  </Badge>
                  <span className="ml-auto">{event.attendees} attending</span>
                </div>
              </div>
              <div className="ml-auto flex justify-end font-light">
                <MoveUpRight />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
