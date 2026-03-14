"use client"

import React, { useState } from "react"
import { format, isSameDay, parseISO } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { gooeyToast } from "@/components/ui/goey-toaster"
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
  const [open,setOpen] = useState(false)
  const [eventDate, setEventDate] = React.useState<Date | undefined>()
  const [eventCategory, setEventCategory] = React.useState<string>("")
  const [eventName, setEventName] = React.useState("")
  const [eventStartTime, setEventStartTime] = React.useState("")
  const [eventEndTime, setEventEndTime] = React.useState("")
  const [eventLocation, setEventLocation] = React.useState("")
  const [eventAttendees, setEventAttendees] = React.useState("")
  const [isSaving, setIsSaving] = React.useState(false)
  const [activeFilter, setActiveFilter] = React.useState("All")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [remoteEvents, setRemoteEvents] = React.useState<EventItem[]>([])

  const today = new Date()
  const normalizedQuery = searchQuery.trim().toLowerCase()

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const filter = new URLSearchParams(window.location.search).get("filter")
      if (filter === "today") {
        setActiveFilter("Today")
      }
    }
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

  const allEvents = remoteEvents

  const filteredEvents = allEvents.filter((event) => {
    if (activeFilter === "Today") {
      return isSameDay(parseISO(event.date), today)
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

  const handleCreateEvent = async () => {
    if (!eventName.trim() || !eventDate) return
    setIsSaving(true)
    try {
      const categoryLabel = eventCategory
        ? eventCategory.charAt(0).toUpperCase() + eventCategory.slice(1)
        : null
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: eventName.trim(),
          date: format(eventDate, "yyyy-MM-dd"),
          startTime: eventStartTime || null,
          endTime: eventEndTime || null,
          location: eventLocation || null,
          category: categoryLabel,
          attendees: eventAttendees ? Number(eventAttendees) : 0,
          status: "Upcoming",
        }),
      })
      if (!response.ok) {
        throw new Error("Failed to create event")
      }
      const data = (await response.json()) as {
        event?: {
          id: string
          name: string
          date: string
          startTime: string | null
          endTime: string | null
          location: string | null
          category: string | null
          attendees: number
          status: string
        }
      }
      const createdEvent = data.event
      if (!createdEvent) {
        throw new Error("Missing event in response")
      }
      setRemoteEvents((prev) => [
        {
          id: createdEvent.id,
          name: createdEvent.name,
          date: createdEvent.date.slice(0, 10),
          startTime: createdEvent.startTime ?? "TBD",
          endTime: createdEvent.endTime ?? "TBD",
          location: createdEvent.location ?? "TBD",
          category: createdEvent.category ?? "General",
          attendees: createdEvent.attendees ?? 0,
          status: createdEvent.status ?? "Upcoming",
          isNearby: false,
        },
        ...prev,
      ])
      setEventName("")
      setEventDate(undefined)
      setEventStartTime("")
      setEventEndTime("")
      setEventLocation("")
      setEventAttendees("")
      setEventCategory("")
      gooeyToast.success("Event created", {
        description: "Saved to your events list.",
      })
    } catch {
      gooeyToast.error("Failed to create event", {
        description: "Please try again.",
      })
    } finally {
      setIsSaving(false)
      setOpen(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 px-6 pt-8">
      {/* nav of event */}
      <div className="flex flex-row justify-between">
        <span className="text-xl font-semibold text-foreground">Events</span>
        <Dialog open={open} onOpenChange={setOpen}>
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
                <Input
                  placeholder="Hackathon kickoff"
                  value={eventName}
                  onChange={(event) => setEventName(event.target.value)}
                />
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
                  <Input
                    type="time"
                    value={eventStartTime}
                    onChange={(event) => setEventStartTime(event.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm text-muted-foreground">
                    End time
                  </label>
                  <Input
                    type="time"
                    value={eventEndTime}
                    onChange={(event) => setEventEndTime(event.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <label className="text-sm text-muted-foreground">Location</label>
                <Input
                  placeholder="Auditorium Hall"
                  value={eventLocation}
                  onChange={(event) => setEventLocation(event.target.value)}
                />
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
                <Input
                  type="number"
                  min={0}
                  placeholder="120"
                  value={eventAttendees}
                  onChange={(event) => setEventAttendees(event.target.value)}
                />
              </div>
              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={handleCreateEvent}
                  disabled={isSaving || !eventName.trim() || !eventDate}
                >
                  {isSaving ? "Saving..." : "Save event"}
                </Button>
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
          {activeFilter === "Today"
            ? `TODAY - ${format(today, "MMMM d").toUpperCase()}`
            : filteredEvents.length
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
