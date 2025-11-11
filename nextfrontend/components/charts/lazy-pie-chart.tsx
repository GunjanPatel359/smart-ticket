"use client"

import { memo, lazy, Suspense } from "react"
import { PieChartSkeleton } from "@/components/loading"
import { Cell } from "recharts"

// Dynamically import Recharts to reduce initial bundle size
const PieChart = lazy(() => import("recharts").then(mod => ({ default: mod.PieChart })))
const Pie = lazy(() => import("recharts").then(mod => ({ default: mod.Pie })))
const ResponsiveContainer = lazy(() => import("recharts").then(mod => ({ default: mod.ResponsiveContainer })))
const Tooltip = lazy(() => import("recharts").then(mod => ({ default: mod.Tooltip })))
const Legend = lazy(() => import("recharts").then(mod => ({ default: mod.Legend })))

interface StatusDistribution {
  name: string
  value: number
  color: string
  [key: string]: string | number
}

interface LazyPieChartProps {
  data: StatusDistribution[]
  ariaLabel?: string
}

const LazyPieChartComponent = ({ data, ariaLabel = "Pie chart" }: LazyPieChartProps) => {
  return (
    <Suspense fallback={<PieChartSkeleton />}>
      <div role="img" aria-label={ariaLabel}>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Suspense>
  )
}

// Memoize to prevent unnecessary re-renders
export const LazyPieChart = memo(LazyPieChartComponent, (prevProps, nextProps) => {
  // Only re-render if data length or values change
  if (prevProps.data.length !== nextProps.data.length) return false
  
  return prevProps.data.every((item, index) => 
    item.value === nextProps.data[index]?.value &&
    item.name === nextProps.data[index]?.name &&
    item.color === nextProps.data[index]?.color
  )
})
