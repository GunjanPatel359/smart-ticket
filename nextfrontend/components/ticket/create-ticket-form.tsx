"use client"

import type React from "react"

import { useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { createTicket } from "@/actions/ticket"

// Types aligned with the provided schema
type Priority = "low" | "normal" | "high" | "critical"
type Impact = "low" | "medium" | "high" | "critical"
type Urgency = "low" | "normal" | "high" | "critical"

type TicketCreatePayload = {
  subject: string
  description: string
  tags: string[] // stored as JSON array server-side
  priority: Priority
  impact: Impact
  urgency: Urgency
  // requesterId would normally come from auth context/server-side user
}

export default function CreateTicketForm() {
  const router = useRouter()
  const [subject, setSubject] = useState("")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [priority, setPriority] = useState<Priority>("normal")
  const [impact, setImpact] = useState<Impact>("medium")
  const [urgency, setUrgency] = useState<Urgency>("normal")
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const remaining = useMemo(() => Math.max(0, 500 - subject.length), [subject])

  const addTag = (raw: string) => {
    const t = raw.trim()
    if (!t) return
    if (tags.includes(t)) return
    setTags((prev) => [...prev, t])
  }

  const removeTag = (t: string) => {
    setTags((prev) => prev.filter((x) => x !== t))
  }

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addTag(tagInput)
      setTagInput("")
    }
  }

  const validate = (): boolean => {
    const next: Record<string, string> = {}
    if (!subject.trim()) next.subject = "Subject is required."
    if (subject.length > 500) next.subject = "Subject must be at most 500 characters."
    if (!description.trim()) next.description = "Description is required."
    if (!priority) next.priority = "Priority is required."
    if (!impact) next.impact = "Impact is required."
    if (!urgency) next.urgency = "Urgency is required."
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    // Simulate a save. Replace with a Server Action or API call when backend is ready.
    const payload: TicketCreatePayload = {
      subject: subject.trim(),
      description: description.trim(),
      tags,
      priority,
      impact,
      urgency,
    }

  try {
    // ✅ Call backend server action
    const res = await createTicket(payload)

    if (res.success && res.ticket) {
      router.push(`/ticket/${res.ticket.id}`)
    } else {
      alert(res.message || "Failed to create ticket")
    }

    setSubmitted(true)
  } catch (err) {
    console.error("Error submitting ticket:", err)
    alert("Something went wrong")
  } finally {
    setSubmitting(false)
  }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Subject */}
      <div className="space-y-2">
        <label htmlFor="subject" className="block text-sm font-medium">
          Subject <span className="sr-only">required</span>
        </label>
        <Input
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Briefly summarize your issue"
          maxLength={500}
          aria-invalid={!!errors.subject || undefined}
          aria-describedby="subject-help subject-error"
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground" id="subject-help">
          <span>Provide a concise summary (max 500 chars).</span>
          <span>{remaining} left</span>
        </div>
        {errors.subject && (
          <p id="subject-error" className="text-xs text-red-600">
            {errors.subject}
          </p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label htmlFor="description" className="block text-sm font-medium">
          Description <span className="sr-only">required</span>
        </label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the problem, steps to reproduce, any error messages, and expected outcome"
          rows={6}
          aria-invalid={!!errors.description || undefined}
          aria-describedby="description-error"
        />
        {errors.description && (
          <p id="description-error" className="text-xs text-red-600">
            {errors.description}
          </p>
        )}
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <label htmlFor="tags" className="block text-sm font-medium">
          Tags
        </label>
        <Input
          id="tags"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagKeyDown}
          placeholder="Type a tag and press Enter or comma"
          aria-describedby="tags-help"
        />
        <p id="tags-help" className="text-xs text-muted-foreground">
          Useful for categorization, e.g., "network", "email", "hardware".
        </p>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <span
                key={t}
                className={cn("inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs", "text-foreground")}
              >
                {t}
                <button
                  type="button"
                  onClick={() => removeTag(t)}
                  className="ml-2 rounded-sm px-1 text-muted-foreground hover:text-foreground"
                  aria-label={`Remove tag ${t}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Priority, Impact, Urgency */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Priority</label>
          <Select value={priority} onValueChange={(v: Priority) => setPriority(v)}>
            <SelectTrigger aria-invalid={!!errors.priority || undefined}>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
          {errors.priority && <p className="text-xs text-red-600">{errors.priority}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Impact</label>
          <Select value={impact} onValueChange={(v: Impact) => setImpact(v)}>
            <SelectTrigger aria-invalid={!!errors.impact || undefined}>
              <SelectValue placeholder="Select impact" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
          {errors.impact && <p className="text-xs text-red-600">{errors.impact}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Urgency</label>
          <Select value={urgency} onValueChange={(v: Urgency) => setUrgency(v)}>
            <SelectTrigger aria-invalid={!!errors.urgency || undefined}>
              <SelectValue placeholder="Select urgency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
          {errors.urgency && <p className="text-xs text-red-600">{errors.urgency}</p>}
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          By submitting, you agree this request will be reviewed by the IT team.
        </div>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Ticket"}
        </Button>
      </div>

      {submitted && (
        <div className="rounded-md border p-3 text-sm">
          <p className="font-medium mb-1">Ticket submitted!</p>
          <p className="text-muted-foreground">
            Thanks. Your request has been received. You can track it in “My Tickets.”
          </p>
        </div>
      )}
    </form>
  )
}
