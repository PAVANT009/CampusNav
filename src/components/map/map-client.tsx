
"use client"

import React, { useEffect, useMemo, useState } from "react"
import dynamic from "next/dynamic"
import { useMap } from "react-leaflet"

import "leaflet/dist/leaflet.css"

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
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
)

function MapUpdater({
  center,
  bounds,
}: {
  center: [number, number]
  bounds: [[number, number], [number, number]]
}) {
  const map = useMap()

  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true })
    map.setMaxBounds(bounds)
    const minZoom = map.getBoundsZoom(bounds, true)
    map.setMinZoom(minZoom)
  }, [center, bounds, map])

  return null
}

export default function MapClient() {
  const [mounted, setMounted] = useState(false)
  const [position, setPosition] = useState<[number, number] | null>(null)
  const [bounds, setBounds] = useState<[[number, number], [number, number]] | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const onSuccess = (pos: GeolocationPosition) => {
      setPosition([pos.coords.latitude, pos.coords.longitude])
    }

    const onError = () => {
      setPosition([12.9716, 77.5946])
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

  return (
    <div className="flex-1 p-4 md:p-6">
      <div className="h-[90vh] w-full overflow-hidden rounded-xl border border-border/60 shadow-sm">
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
            <MapUpdater center={center} bounds={bounds} />
            <Marker position={center}>
              <Popup>Current location</Popup>
            </Marker>
          </MapContainer>
        )}
      </div>
    </div>
  )
}
