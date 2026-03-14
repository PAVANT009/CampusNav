"use client"

import React, { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { gooeyToast } from "@/components/ui/goey-toaster"

type ChatMessage = {
  id?: string
  role: "user" | "assistant"
  content: string
}

const CONVERSATION_KEY = "convoid"

export default function Page() {
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState("")
  const [sending, setSending] = useState(false)
  const [creating, setCreating] = useState(false)
  const [initialPromptSent, setInitialPromptSent] = useState(false)
  const [initialPrompt, setInitialPrompt] = useState<string | null>(null)

  const createConversation = async () => {
    setCreating(true)
    try {
      const response = await fetch("/api/chat/conversations", { method: "POST" })
      if (!response.ok) {
        return
      }
      const data = (await response.json()) as { id?: string }
      if (data.id) {
        window.localStorage.setItem(CONVERSATION_KEY, data.id)
        setConversationId(data.id)
      }
    } finally {
      setCreating(false)
    }
  }

  useEffect(() => {
    let cancelled = false

    const ensureConversation = async () => {
      const storedId = typeof window !== "undefined"
        ? window.localStorage.getItem(CONVERSATION_KEY)
        : null

      if (storedId) {
        if (!cancelled) {
          setConversationId(storedId)
        }
        return
      }

      await createConversation()
      if (cancelled) return
    }

    ensureConversation()
    return () => {
      cancelled = true
    }
  }, [])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || !conversationId || sending) return

    const nextMessage: ChatMessage = {
      role: "user",
      content: text.trim(),
    }

    setMessages((prev) => [
      ...prev,
      nextMessage,
      { role: "assistant", content: "" },
    ])
    setDraft("")
    setSending(true)

    try {
      const response = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          role: "user",
          content: nextMessage.content,
        }),
      })
      if (!response.body) {
        return
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""

      const updateAssistant = (text: string) => {
        setMessages((prev) => {
          const next = [...prev]
          const lastIndex = next.length - 1
          if (lastIndex >= 0 && next[lastIndex].role === "assistant") {
            next[lastIndex] = {
              ...next[lastIndex],
              content: next[lastIndex].content + text,
            }
          }
          return next
        })
      }

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split("\n\n")
        buffer = parts.pop() ?? ""
        for (const part of parts) {
          const line = part.trim()
          if (!line.startsWith("data:")) continue
          const payload = line.replace(/^data:\s?/, "")
          try {
            const parsed = JSON.parse(payload) as {
              type?: string
              text?: string
              status?: string
              message?: string
            }
            if (parsed.type === "delta" && parsed.text) {
              updateAssistant(parsed.text)
            }
            if (parsed.type === "tool" && parsed.status && parsed.message) {
              if (parsed.status === "success") {
                const toastId = gooeyToast.success(parsed.message, {
                  description: "Saved successfully.",
                  action: {
                    label: "Cancel",
                    onClick: () => gooeyToast.dismiss(toastId),
                  },
                })
              } else {
                const toastId = gooeyToast.error(parsed.message, {
                  description: "Please try again.",
                  action: {
                    label: "Cancel",
                    onClick: () => gooeyToast.dismiss(toastId),
                  },
                })
              }
            }
          } catch {
            // ignore malformed chunks
          }
        }
      }
    } finally {
      setSending(false)
    }
  }, [conversationId, sending])

  const handleSend = async (event: React.FormEvent) => {
    event.preventDefault()
    await sendMessage(draft)
  }

  useEffect(() => {
    if (typeof window === "undefined") return
    const prompt = new URLSearchParams(window.location.search).get("prompt")
    if (prompt) {
      setInitialPrompt(prompt)
    }
  }, [])

  useEffect(() => {
    if (!initialPrompt || initialPromptSent || !conversationId) return
    if (messages.length > 0) return
    setInitialPromptSent(true)
    sendMessage(initialPrompt)
  }, [conversationId, initialPrompt, initialPromptSent, messages.length, sendMessage])

  return (
    <div className="flex flex-1 flex-col gap-4 px-6 pt-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xl font-semibold text-foreground">Chat</p>
          <p className="text-sm text-muted-foreground">
            {conversationId ? "" : "Creating..."}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={creating}
          onClick={async () => {
            window.localStorage.removeItem(CONVERSATION_KEY)
            setConversationId(null)
            setMessages([])
            await createConversation()
          }}
        >
          {creating ? "Creating..." : "New chat"}
        </Button>
      </div>

      <div className="flex min-h-[50vh] flex-1 flex-col gap-3 rounded-xl border border-border bg-card p-4">
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Start the conversation. 
          </p>
        ) : (
          messages.map((message, index) => (
            <div
              key={`${message.content}-${index}`}
              className={[
                "w-fit max-w-[70%] rounded-2xl px-4 py-2 text-sm",
                message.role === "user"
                  ? "ml-auto bg-primary text-primary-foreground"
                  : "mr-auto bg-muted text-foreground",
              ].join(" ")}
            >
              {message.content}
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <Input
          placeholder="Type a message..."
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        <Button type="submit" disabled={!draft.trim() || !conversationId || sending}>
          {sending ? "Sending..." : "Send"}
        </Button>
      </form>
    </div>
  )
}
