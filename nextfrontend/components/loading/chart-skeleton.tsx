import { Skeleton } from "@/components/ui/skeleton"

export function PieChartSkeleton() {
  return (
    <div className="flex items-center justify-center h-[300px]">
      <Skeleton className="h-48 w-48 rounded-full" />
    </div>
  )
}

export function BarChartSkeleton() {
  return (
    <div className="flex items-center justify-center h-[300px]">
      <Skeleton className="h-48 w-full" />
    </div>
  )
}
