
"use client"

import React, { useEffect, useMemo, useState } from "react"
import dynamic from "next/dynamic"
import { useMap } from "react-leaflet"

import "leaflet/dist/leaflet.css"
import MapFind from "./map-find"

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

export default function MapClient() {
  const [mounted, setMounted] = useState(false)
  const [position, setPosition] = useState<[number, number] | null>(null)
  const [bounds, setBounds] = useState<[[number, number], [number, number]] | null>(null)
  const [userZoom, setUserZoom] = useState(15)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [route, setRoute] = useState<[number, number][] | null>(null)
  const [routeLoading, setRouteLoading] = useState(false)
  const [routeError, setRouteError] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
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

  const destinations = useMemo(
    () => [
        // 31.257949059343144, 75.70685846191137
      { id: "block-28", name: "Block 28", lat: 31.25261194951896, lng: 75.70372940151643 },
      { id: "block-27", name: "Block 27", lat: 31.25259857065149, lng: 75.70329120592311 },
      { id: "block-26", name: "Block 26", lat: 31.25261194951896, lng: 75.70286866017241 },
      { id: "library", name: "Library", lat: 31.252081678342265, lng: 75.70406046377747 },
      { id: "block-37", name: "Block 37", lat: 31.251907952465444, lng: 75.70350923530131 },
      { id: "block-36", name: "Block 36", lat: 31.25171321883544, lng: 75.70382813636337 },
      { id: "block-35", name: "Block 35", lat: 31.251419267088608, lng: 75.70416843514994 },
      { id: "lovely-bakery", name: "Lovely Bakery", lat: 31.251678975097033, lng: 75.70198085284099 },
      { id: "sports-center", name: "Sports Center", lat: 31.250905122375816, lng: 75.70218657932475 },
      {id: "gate-parking", name: "Lpu Main Gate Parking ", lat : 31.25985274967803, lng: 75.70623290638696},
      {id: "Uni health center ", name: "Uni Health Center", lat : 31.257949059343144, lng: 75.70685846191137}
    ],  
    []
  )

  useEffect(() => {
    if (!position || !selectedId) return
    const destination = destinations.find((item) => item.id === selectedId)
    if (!destination) return

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
        setRoute(coords.length > 0 ? coords : null)
      } catch (error) {
        setRoute(null)
        setRouteError("Unable to load route right now.")
      } finally {
        setRouteLoading(false)
      }
    }

    fetchRoute()
  }, [destinations, position, selectedId])

  return (
    <div className="flex-1 p-4 md:p-6">
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
            Loading route…
          </span>
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
            {route && (
              <Polyline positions={route} pathOptions={{ color: "#0f172a", weight: 4 }} />
            )}
          </MapContainer>
        )}
      </div>
    </div>
  )
}
