
"use client"

import React, { useEffect, useMemo, useState } from "react"
import dynamic from "next/dynamic"
import { useMap, useMapEvents } from "react-leaflet"

import "leaflet/dist/leaflet.css"
import MapFind from "./map-find"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog"
import { Plus } from "lucide-react"
import { goeyToast } from "../ui/goey-toaster"

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
)
const Polyline = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polyline),
  { ssr: false }
)
const CircleMarker = dynamic(
  () => import("react-leaflet").then((mod) => mod.CircleMarker),
  { ssr: false }
)
const Circle = dynamic(
  () => import("react-leaflet").then((mod) => mod.Circle),
  { ssr: false }
)
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
)

function MapUpdater({
  center,
  bounds,
  zoom,
}: {
  center: [number, number]
  bounds: [[number, number], [number, number]]
  zoom: number
}) {
  const map = useMap()

  useEffect(() => {
    map.setView(center, zoom, { animate: true })
    map.setMaxBounds(bounds)
    const minZoom = map.getBoundsZoom(bounds, true)
    map.setMinZoom(minZoom)
  }, [center, bounds, map, zoom])

  return null
}

function MapRightClickCopy() {
  useMapEvents({
    contextmenu: (event) => {
      const { lat, lng } = event.latlng
      const coords = `${lat}, ${lng}`
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard
          .writeText(coords)
          .then(() => {
            const toastId = goeyToast.success("Coordinates copied", {
              description: coords,
              action: {
                label: "Cancel",
                onClick: () => goeyToast.dismiss(toastId),
              },
            })
          })
          .catch(() => {
            const toastId = goeyToast.error("Copy failed", {
              description: coords,
              action: {
                label: "Cancel",
                onClick: () => goeyToast.dismiss(toastId),
              },
            })
          })
      } else {
        const toastId = goeyToast.error("Clipboard unavailable", {
          description: coords,
          action: {
            label: "Cancel",
            onClick: () => goeyToast.dismiss(toastId),
          },
        })
      }
    },
  })

  return null
}

export default function MapClient() {
  const [open,setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [position, setPosition] = useState<[number, number] | null>(null)
  const [bounds, setBounds] = useState<[[number, number], [number, number]] | null>(null)
  const [userZoom, setUserZoom] = useState(15)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [route, setRoute] = useState<[number, number][] | null>(null)
  const [routeLoading, setRouteLoading] = useState(false)
  const [routeError, setRouteError] = useState<string | null>(null)
  const [routeCache, setRouteCache] = useState<Record<string, [number, number][]>>({})
  const [customPoints, setCustomPoints] = useState<
    { id: string; name: string; lat: number; lng: number }[]
  >([])
  const [pointName, setPointName] = useState("")
  const [pointLat, setPointLat] = useState("")
  const [pointLng, setPointLng] = useState("")
  const [savingPoint, setSavingPoint] = useState(false)
  const [pointError, setPointError] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const loadPoints = async () => {
      const response = await fetch("/api/map/points")
      if (!response.ok) return
      const data = (await response.json()) as {
        points?: { id: string; name: string; lat: number; lng: number }[]
      }
      if (data.points) {
        setCustomPoints(data.points)
      }
    }

    loadPoints()
  }, [])

  useEffect(() => {
    if (!mounted) return

    let firstFix = true
    const onSuccess = (pos: GeolocationPosition) => {
      setPosition([pos.coords.latitude, pos.coords.longitude])
      if (firstFix) {
        setUserZoom(17)
        firstFix = false
      }
    }

    const onError = () => {
      setPosition([12.9716, 77.5946])
      setUserZoom(14)
    }

    if (!navigator.geolocation) {
      onError()
      return
    }

    const watchId = navigator.geolocation.watchPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      maximumAge: 10_000,
      timeout: 10_000,
    })

    return () => navigator.geolocation.clearWatch(watchId)
  }, [mounted])

  useEffect(() => {
    if (!mounted) return

    import("leaflet").then((L) => {
      const defaultIcon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      })
      L.Marker.prototype.options.icon = defaultIcon
      if (position) {
        const latLng = L.latLng(position[0], position[1])
        const nextBounds = latLng.toBounds(5000)
        setBounds([
          [nextBounds.getSouthWest().lat, nextBounds.getSouthWest().lng],
          [nextBounds.getNorthEast().lat, nextBounds.getNorthEast().lng],
        ])
      }
    })
  }, [mounted, position])

  const center = useMemo<[number, number]>(() => {
    return position ?? [12.9716, 77.5946]
  }, [position])

  const destinations = useMemo(() => customPoints, [customPoints])
  const busyZones = useMemo(
    () => [
      {
        id: "busy-spot-1",
        name: "High activity area",
        lat: 31.251736929338826,
        lng: 75.70553183555604,
        radius: 30,
      },
    ],
    []
  )

  useEffect(() => {
    if (!position || !selectedId) return
    const destination = destinations.find((item) => item.id === selectedId)
    if (!destination) return

    const cached = routeCache[selectedId]
    if (cached) {
      setRoute(cached)
      setRouteError(null)
      setRouteLoading(false)
      return
    }

    const fetchRoute = async () => {
      setRouteLoading(true)
      setRouteError(null)
      try {
        const url = `https://router.project-osrm.org/route/v1/foot/${position[1]},${position[0]};${destination.lng},${destination.lat}?overview=full&geometries=geojson`
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error("Failed to fetch route")
        }
        const data = await response.json()
        const coords: [number, number][] =
          data?.routes?.[0]?.geometry?.coordinates?.map(
            (pair: [number, number]) => [pair[1], pair[0]]
          ) ?? []
        if (coords.length > 0) {
          setRoute(coords)
          setRouteCache((prev) => ({ ...prev, [selectedId]: coords }))
        } else {
          setRoute(null)
        }
      } catch (error) {
        setRoute(null)
        setRouteError("Unable to load route right now.")
      } finally {
        setRouteLoading(false)
      }
    }

    fetchRoute()
  }, [destinations, position, routeCache, selectedId])

  return (
    <div className="flex-1 p-4 md:p-6">
      {/* <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card p-4"> */}
        {/* <div className="min-w-[160px] flex-1">
          <label className="text-xs text-muted-foreground">Name</label>
          <Input
            className="mt-1 h-9"
            placeholder="Point name"
            value={pointName}
            onChange={(event) => setPointName(event.target.value)}
          />
        </div> */}
        {/* <div className="min-w-[120px]">
          <label className="text-xs text-muted-foreground">Lat</label>
          <Input
            className="mt-1 h-9"
            placeholder="31.2526"
            value={pointLat}
            onChange={(event) => setPointLat(event.target.value)}
          />
        </div> */}
        {/* <div className="min-w-[120px]">
          <label className="text-xs text-muted-foreground">Lng</label>
          <Input
            className="mt-1 h-9"
            placeholder="75.7037"
            value={pointLng}
            onChange={(event) => setPointLng(event.target.value)}
          />
        </div> */}
        {/* <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-border"
            checked={pointPublic}
            onChange={(event) => setPointPublic(event.target.checked)}
          />
          Public
        </label> */}
        {/* <Button
          className="h-9"
          disabled={savingPoint || !pointName.trim() || !pointLat || !pointLng}
          onClick={async () => {
            const lat = Number(pointLat)
            const lng = Number(pointLng)
            if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
              setPointError("Enter valid latitude and longitude.")
              return
            }
            setSavingPoint(true)
            setPointError(null)
            try {
              const response = await fetch("/api/map/points", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  name: pointName.trim(),
                  lat,
                  lng,
                  isPublic: false,
                }),
              })
              if (!response.ok) {
                throw new Error("Failed to add point")
              }
              const data = (await response.json()) as {
                point?: { id: string; name: string; lat: number; lng: number }
              }
              if (data.point) {
                setCustomPoints((prev) =>
                  data.point ? [data.point, ...prev] : prev
                )
                setPointName("")
                setPointLat("")
                setPointLng("")
              }
            } catch {
              setPointError("Unable to save point.")
            } finally {
              setSavingPoint(false)
            }
          }}
        >
          {savingPoint ? "Saving..." : "Add point"}
        </Button> */}

      {/* </div> */}
      <div className="w-full flex flex-row justify-between">
        <span>Maps</span>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus />
              Add point
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add map point</DialogTitle>
              <DialogDescription>
                Add a private point to your map.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3">
              <div className="grid gap-2">
                <label className="text-sm text-muted-foreground">Name</label>
                <Input
                  placeholder="Food Factory"
                  value={pointName}
                  onChange={(event) => setPointName(event.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <label className="text-sm text-muted-foreground">Lat</label>
                  <Input
                    placeholder="31.2526"
                    value={pointLat}
                    onChange={(event) => setPointLat(event.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm text-muted-foreground">Lng</label>
                  <Input
                    placeholder="75.7037"
                    value={pointLng}
                    onChange={(event) => setPointLng(event.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Paste coordinates like 31.2529, 75.7054</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      const text = await navigator.clipboard.readText()
                      const match = text
                        .trim()
                        .match(/(-?\d+(?:\.\d+)?)[,\s]+(-?\d+(?:\.\d+)?)/)
                      if (!match) {
                        goeyToast.error("Paste failed", {
                          description: "Clipboard doesn't look like coordinates.",
                        })
                        return
                      }
                      setPointLat(match[1])
                      setPointLng(match[2])
                    } catch {
                      goeyToast.error("Paste failed", {
                        description: "Clipboard access denied.",
                      })
                    }
                  }}
                >
                  Paste
                </Button>
              </div>
              <div className="flex justify-end">
                <Button
                  type="button"
                  disabled={
                    savingPoint ||
                    !pointName.trim() ||
                    !pointLat.trim() ||
                    !pointLng.trim()
                  }
                  onClick={async () => {
                    const lat = Number(pointLat)
                    const lng = Number(pointLng)
                    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
                      setPointError("Enter valid latitude and longitude.")
                      return
                    }
                    setSavingPoint(true)
                    setPointError(null)
                    try {
                      const response = await fetch("/api/map/points", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          name: pointName.trim(),
                          lat,
                          lng,
                        }),
                      })
                      if (!response.ok) {
                        throw new Error("Failed to add point")
                      }
                      const data = (await response.json()) as {
                        point?: {
                          id: string
                          name: string
                          lat: number
                          lng: number
                        }
                      }
                      if (data.point) {
                        setCustomPoints((prev) =>
                          data.point ? [data.point, ...prev] : prev
                        )
                        setPointName("")
                        setPointLat("")
                        setPointLng("")
                        let toastId: string | number
                        toastId = goeyToast.success("Map point added", {
                          description: "Saved to your private map.",
                          action: {
                            label: "Cancel",
                            onClick: () => goeyToast.dismiss(toastId),
                          },
                        })
                      }
                    } catch {
                      setPointError("Unable to save point.")
                      let toastId: string | number
                      toastId = goeyToast.error("Failed to add point", {
                        description: "Please try again.",
                        action: {
                          label: "Cancel",
                          onClick: () => goeyToast.dismiss(toastId),
                        },
                      })
                    } finally {
                      setSavingPoint(false)
                      setOpen(false)

                    }
                  }}
                >
                  {savingPoint ? "Saving..." : "Save point"}
                </Button>
              </div>
              {pointError && (
                <p className="text-xs text-destructive">{pointError}</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {destinations.slice(0,8).map((item) => (
          <button
            key={item.id}
            onClick={() => setSelectedId(item.id)}
            className={[
              "rounded-full border px-3 py-1 text-xs font-medium transition",
              "hover:bg-accent hover:text-accent-foreground",
              selectedId === item.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border/60 text-foreground",
            ].join(" ")}
          >
            {item.name}
          </button>
        ))}
        <button
          onClick={() => {
            setSelectedId(null)
            setRoute(null)
            setRouteError(null)
          }}
          className="rounded-full border border-border/60 px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          Clear
        </button>
        {routeLoading && (
          <span className="self-center text-xs text-muted-foreground">
            Calculating route...</span>
        )}
        {routeError && (
          <span className="self-center text-xs text-destructive">
            {routeError}
          </span>
        )}
      </div>
      <div className="relative isolate z-0 h-[80vh] w-full overflow-hidden rounded-xl border border-border/60 shadow-sm">
        <MapFind
          destinations={destinations}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onClear={() => {
            setSelectedId(null)
            setRoute(null)
            setRouteError(null)
          }}
          loading={routeLoading}
        />
        {mounted && bounds && (
          <MapContainer
            center={center}
            zoom={15}
            className="h-full w-full"
            scrollWheelZoom
            maxBounds={bounds}
            maxBoundsViscosity={1}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapUpdater center={center} bounds={bounds} zoom={userZoom} />
            <MapRightClickCopy />
            <CircleMarker
              center={center}
              radius={8}
              pathOptions={{ color: "#16a34a", fillColor: "#22c55e" }}
              fillOpacity={0.9}
            >
              <Popup>Current location</Popup>
            </CircleMarker>
            {destinations.map((item) => (
              <Marker key={item.id} position={[item.lat, item.lng]}>
                <Popup>{item.name}</Popup>
              </Marker>
            ))}
            {busyZones.map((zone) => (
              <Circle
                key={zone.id}
                center={[zone.lat, zone.lng]}
                radius={zone.radius}
                pathOptions={{
                  color: "#ef4444",
                  fillColor: "#f87171",
                  fillOpacity: 0.25,
                }}
              >
                <Popup>{zone.name}</Popup>
              </Circle>
            ))}
            {route && (
              <Polyline positions={route} pathOptions={{ color: "#0f172a", weight: 4 }} />
            )}
          </MapContainer>
        )}
      </div>
    </div>
  )
}
