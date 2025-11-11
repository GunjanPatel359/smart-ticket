"use client"

import { memo, lazy, Suspense } from "react"
import { BarChartSkeleton } from "@/components/loading"

// Dynamically import Recharts to reduce initial bundle size
const BarChart = lazy(() => import("recharts").then(mod => ({ default: mod.BarChart })))
const Bar = lazy(() => import("recharts").then(mod => ({ default: mod.Bar })))
const XAxis = lazy(() => import("recharts").then(mod => ({ default: mod.XAxis })))
const YAxis = lazy(() => import("recharts").then(mod => ({ default: mod.YAxis })))
const CartesianGrid = lazy(() => import("recharts").then(mod => ({ default: mod.CartesianGrid })))
const Tooltip = lazy(() => import("recharts").then(mod => ({ default: mod.Tooltip })))
const ResponsiveContainer = lazy(() => import("recharts").then(mod => ({ default: mod.ResponsiveContainer })))
const Legend = lazy(() => import("recharts").then(mod => ({ default: mod.Legend })))

interface PriorityDistribution {
  name: string
  count: number
}

interface LazyBarChartProps {
  data: PriorityDistribution[]
  ariaLabel?: string
}

const LazyBarChartComponent = ({ data, ariaLabel = "Bar chart" }: LazyBarChartProps) => {
  return (
    <Suspense fallback={<BarChartSkeleton />}>
      <div role="img" aria-label={ariaLabel}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#8b5cf6" name="Tickets" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Suspense>
  )
}

// Memoize to prevent unnecessary re-renders
export const LazyBarChart = memo(LazyBarChartComponent, (prevProps, nextProps) => {
  // Only re-render if data length or values change
  if (prevProps.data.length !== nextProps.data.length) return false
  
  return prevProps.data.every((item, index) => 
    item.count === nextProps.data[index]?.count &&
    item.name === nextProps.data[index]?.name
  )
})
