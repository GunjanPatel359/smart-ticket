import { Skeleton } from "@/components/ui/skeleton"

export function TicketCardSkeleton() {
  return (
    <div className="p-4 border rounded-lg">
      <Skeleton className="h-5 w-3/4 mb-2" />
      <div className="flex gap-2 mb-2">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-20" />
      </div>
      <Skeleton className="h-4 w-24" />
    </div>
  )
}

export function TicketListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <TicketCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function TicketTableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 py-3 border-b last:border-b-0">
      <Skeleton className="h-4 w-12" />
      <Skeleton className="h-4 flex-1" />
      <Skeleton className="h-6 w-20" />
      <Skeleton className="h-6 w-20" />
      <Skeleton className="h-4 w-24" />
    </div>
  )
}

export function TicketTableSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <TicketTableRowSkeleton key={i} />
      ))}
    </div>
  )
}
