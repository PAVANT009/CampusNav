"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { goeyToast } from "@/components/ui/goey-toaster"
import { useSession } from "@/lib/auth-client"

export default function SettingsPage() {
  const { data: session } = useSession()
  const [name, setName] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name)
    }
  }, [session?.user?.name])

  const userName = name || session?.user?.email || "Campus User"

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })

      if (!response.ok) {
        throw new Error("Failed to save profile")
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("profileName", name)
        window.dispatchEvent(new Event("profile-updated"))
      }

      goeyToast.success("Profile updated", {
        description: "Your name has been saved.",
      })
    } catch (error) {
      goeyToast.error("Update failed", {
        description: "Please try again.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 px-6 pt-8">
      <div className="flex items-center gap-3">
        <img
          src={`https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(
            userName
          )}`}
          alt={userName}
          className="size-12 rounded-full border border-border/60 bg-background"
        />
        <div className="flex flex-col">
          <span className="text-lg font-semibold">Profile</span>
          <span className="text-sm text-muted-foreground">
            Update your display name
          </span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Basic Info</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-muted-foreground">Name</label>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter your name"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-muted-foreground">University</label>
            <Input
              value={"Lovely Professional University"}
              className="cursor-not-allowed disabled:pointer-events-auto"
              disabled
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
