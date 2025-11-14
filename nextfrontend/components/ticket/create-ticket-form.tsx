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
  const [aiStep, setAiStep] = useState(0)

  const aiSteps = [
    { icon: "🔍", text: "Analyzing ticket description..." },
    { icon: "🎯", text: "Extracting required skills..." },
    { icon: "👥", text: "Searching for available technicians..." },
    { icon: "🤖", text: "Finding best match using AI..." },
    { icon: "✅", text: "Assigning ticket to technician..." },
  ]

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
    setAiStep(0)
    const payload: TicketCreatePayload = {
      subject: subject.trim(),
      description: description.trim(),
      tags,
      priority,
      impact,
      urgency,
    }

    try {
      // Simulate AI processing steps with visual feedback - slower for better UX
      const stepDurations = [1500, 2000, 1800, 2500, 1500] // Different timing for each step
      let currentStep = 0
      
      const advanceStep = () => {
        if (currentStep < aiSteps.length - 1) {
          currentStep++
          setAiStep(currentStep)
          setTimeout(advanceStep, stepDurations[currentStep])
        }
      }
      
      // Start the animation
      setTimeout(advanceStep, stepDurations[0])

      // ✅ Call backend server action with AI processing
      const res = await createTicket(payload)

      // Ensure we show the final step
      setAiStep(aiSteps.length - 1)
      
      // Small delay to show completion
      await new Promise(resolve => setTimeout(resolve, 800))

      if (res.success && res.ticket) {
        setSubmitted(true)
        // Redirect after showing success message
        setTimeout(() => {
          router.push(`/ticket/${res.ticket.id}`)
        }, 2500)
      } else {
        setErrors({ submit: res.message || "Failed to create ticket" })
      }
    } catch (err) {
      console.error("Error submitting ticket:", err)
      setErrors({ submit: "Something went wrong. Please try again." })
    } finally {
      setSubmitting(false)
      setAiStep(0)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Subject */}
      <div className="space-y-2">
        <label htmlFor="subject" className="block text-sm font-medium">
          Subject <span className="text-red-500">*</span>
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
          <span className={cn(remaining < 50 && "text-orange-600 font-medium")}>{remaining} left</span>
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
          Description <span className="text-red-500">*</span>
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
                className={cn("inline-flex items-center rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium", "text-primary")}
              >
                {t}
                <button
                  type="button"
                  onClick={() => removeTag(t)}
                  className="ml-1.5 rounded-sm px-1 hover:bg-primary/20"
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
          <label className="block text-sm font-medium">
            Priority <span className="text-red-500">*</span>
          </label>
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
          <label className="block text-sm font-medium">
            Impact <span className="text-red-500">*</span>
          </label>
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
          <label className="block text-sm font-medium">
            Urgency <span className="text-red-500">*</span>
          </label>
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

      {/* AI Processing Loader */}
      {submitting && (
        <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800 p-6 space-y-5 animate-in fade-in slide-in-from-top-4 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <span className="text-2xl animate-pulse">🤖</span>
              </div>
              <div className="absolute inset-0 rounded-full border-3 border-blue-400 animate-ping opacity-40"></div>
              <div className="absolute -inset-1 rounded-full border-2 border-blue-300 animate-pulse opacity-60"></div>
            </div>
            <div className="flex-1">
              <p className="text-lg font-bold text-blue-900 dark:text-blue-100">AI Processing Your Ticket</p>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-0.5">Analyzing and finding the perfect technician match...</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {aiSteps.map((step, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-lg transition-all duration-500 transform",
                  index <= aiStep
                    ? "bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-800/40 dark:to-indigo-800/40 border-2 border-blue-300 dark:border-blue-600 shadow-md scale-100"
                    : "bg-gray-50 dark:bg-gray-800/20 border border-gray-200 dark:border-gray-700 opacity-40 scale-95"
                )}
                style={{
                  transitionDelay: `${index * 50}ms`
                }}
              >
                <div className={cn(
                  "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold transition-all duration-500 shadow-md",
                  index < aiStep
                    ? "bg-gradient-to-br from-green-400 to-emerald-500 text-white scale-110"
                    : index === aiStep
                    ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white animate-pulse scale-110 ring-4 ring-blue-300 dark:ring-blue-700"
                    : "bg-gray-300 dark:bg-gray-600 text-gray-500 scale-100"
                )}>
                  {index < aiStep ? (
                    <span className="animate-in zoom-in">✓</span>
                  ) : (
                    <span className={index === aiStep ? "animate-bounce" : ""}>{step.icon}</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className={cn(
                    "text-sm font-semibold transition-all duration-300",
                    index <= aiStep
                      ? "text-blue-900 dark:text-blue-100"
                      : "text-gray-500 dark:text-gray-400"
                  )}>
                    {step.text}
                  </p>
                  {index < aiStep && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1 animate-in fade-in slide-in-from-left-2">
                      Completed ✓
                    </p>
                  )}
                </div>
                {index === aiStep && (
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce shadow-sm" style={{ animationDelay: "0ms", animationDuration: "1s" }}></span>
                    <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce shadow-sm" style={{ animationDelay: "200ms", animationDuration: "1s" }}></span>
                    <span className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-bounce shadow-sm" style={{ animationDelay: "400ms", animationDuration: "1s" }}></span>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="pt-3 border-t border-blue-200 dark:border-blue-700">
            <p className="text-xs text-center text-blue-600 dark:text-blue-400 animate-pulse">
              ⚡ Powered by Advanced AI Technology
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errors.submit && !submitting && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 text-sm text-red-800 dark:text-red-200">
          <p className="font-medium">Error</p>
          <p>{errors.submit}</p>
        </div>
      )}

      {/* Submit */}
      {!submitting && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t">
          <div className="text-xs text-muted-foreground space-y-1">
            <p className="flex items-center gap-1">
              <span className="text-base">🤖</span>
              <span className="font-medium">AI-powered ticket assignment</span>
            </p>
            <p>Your ticket will be automatically analyzed and assigned to the best technician.</p>
          </div>
          <Button type="submit" disabled={submitting} className="w-full sm:w-auto min-w-[180px]">
            Submit Ticket
          </Button>
        </div>
      )}

      {/* Success Message */}
      {submitted && (
        <div className="rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-300 dark:border-green-700 p-6 text-sm animate-in fade-in zoom-in slide-in-from-top-4 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg animate-in zoom-in spin-in">
                <span className="text-2xl">✅</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-lg font-bold text-green-800 dark:text-green-200 mb-2">
                Ticket Submitted Successfully!
              </p>
              <p className="text-green-700 dark:text-green-300 mb-3">
                Your ticket has been created and intelligently assigned by our AI system to the best available technician.
              </p>
              <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: "200ms" }}></span>
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: "400ms" }}></span>
                </div>
                <span>Redirecting to ticket details...</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  )
}
