"use client"

import { memo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface MemoizedKPICardProps {
  title: string
  value: string | number
  subtext?: string
  icon: React.ReactNode
  ariaLabel?: string
}

const MemoizedKPICardComponent = ({ 
  title, 
  value, 
  subtext, 
  icon, 
  ariaLabel 
}: MemoizedKPICardProps) => {
  return (
    <Card role="listitem" aria-label={ariaLabel || `${title} metric`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div aria-hidden="true">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold" aria-label={ariaLabel}>
          {value}
        </div>
        {subtext && (
          <p className="text-xs text-muted-foreground">{subtext}</p>
        )}
      </CardContent>
    </Card>
  )
}

// Memoize to prevent unnecessary re-renders when parent re-renders
export const MemoizedKPICard = memo(MemoizedKPICardComponent, (prevProps, nextProps) => {
  return (
    prevProps.title === nextProps.title &&
    prevProps.value === nextProps.value &&
    prevProps.subtext === nextProps.subtext
  )
})
