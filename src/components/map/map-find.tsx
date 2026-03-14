import React, { useEffect, useState } from "react"
import { Button } from "../ui/button"
import { SearchIcon } from "lucide-react"
import { MapCommand } from "./map-command"

type Destination = {
  id: string
  name: string
  lat: number
  lng: number
}

type MapFindProps = {
  destinations: Destination[]
  selectedId: string | null
  onSelect: (id: string) => void
  loading?: boolean
}

export default function MapFind({
  destinations,
  selectedId,
  onSelect,
  loading = false,
}: MapFindProps) {
  const [commandOpen, setCommandOpen] = useState(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setCommandOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <div className="absolute right-4 top-4 z-[1000] w-[260px]">
      <MapCommand
        open={commandOpen}
        setOpen={setCommandOpen}
        destinations={destinations}
        selectedId={selectedId}
        onSelect={onSelect}
      />
      <Button
        className="h-9 w-full justify-start gap-2 font-normal text-muted-foreground hover:text-muted-foreground bg-card"
        size="sm"
        onClick={() => setCommandOpen((open) => !open)}
        disabled={loading}
      >
        <SearchIcon className="size-4" />
        Search
        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span>&#8984;</span>k
        </kbd>
      </Button>
    </div>
  )
}
