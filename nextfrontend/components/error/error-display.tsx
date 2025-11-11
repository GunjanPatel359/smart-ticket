"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline"

interface ErrorDisplayProps {
  message?: string
  onRetry?: () => void
  title?: string
}

export function ErrorDisplay({ 
  message = "Failed to load data", 
  onRetry,
  title = "Something went wrong"
}: ErrorDisplayProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-6">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center">
            <ExclamationTriangleIcon className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-muted-foreground mb-4">{message}</p>
            {onRetry && (
              <Button onClick={onRetry}>
                Try Again
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function InlineErrorDisplay({ 
  message = "Failed to load data", 
  onRetry 
}: ErrorDisplayProps) {
  return (
    <div className="text-center py-8">
      <ExclamationTriangleIcon className="h-8 w-8 mx-auto text-red-500 mb-3" />
      <p className="text-red-600 mb-4">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} size="sm" variant="outline">
          Retry
        </Button>
      )}
    </div>
  )
}
