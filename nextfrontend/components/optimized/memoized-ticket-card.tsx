"use client"

import { memo, useCallback } from "react"
import { Badge } from "@/components/ui/badge"

interface MemoizedTicketCardProps {
  id: number
  subject: string
  status: string
  priority: string
  timeInfo: string
  onNavigate: (id: number) => void
  getStatusBadgeColor: (status: string) => string
  getPriorityBadgeColor: (priority: string) => string
}

const MemoizedTicketCardComponent = ({
  id,
  subject,
  status,
  priority,
  timeInfo,
  onNavigate,
  getStatusBadgeColor,
  getPriorityBadgeColor,
}: MemoizedTicketCardProps) => {
  const handleClick = useCallback(() => {
    onNavigate(id)
  }, [id, onNavigate])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onNavigate(id)
    }
  }, [id, onNavigate])

  return (
    <article
      onClick={handleClick}
      className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label={`View ticket ${id}: ${subject}, priority ${priority}, status ${status.replace(/_/g, " ")}`}
    >
      <h3 className="font-medium mb-2 line-clamp-1">{subject}</h3>
      <div className="flex gap-2 mb-2 flex-wrap">
        <Badge className={getPriorityBadgeColor(priority)}>
          {priority}
        </Badge>
        <Badge className={getStatusBadgeColor(status)}>
          {status.replace(/_/g, " ")}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground">
        {timeInfo}
      </p>
    </article>
  )
}

// Memoize to prevent unnecessary re-renders
export const MemoizedTicketCard = memo(MemoizedTicketCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.id === nextProps.id &&
    prevProps.subject === nextProps.subject &&
    prevProps.status === nextProps.status &&
    prevProps.priority === nextProps.priority &&
    prevProps.timeInfo === nextProps.timeInfo
  )
})
