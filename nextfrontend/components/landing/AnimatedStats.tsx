"use client"

import { useEffect, useRef, useState } from "react"
import CountUp from "react-countup"
import { motion, useInView } from "framer-motion"

interface StatProps {
  end: number
  label: string
  suffix?: string
  prefix?: string
  decimals?: number
  color: string
}

function StatCard({ end, label, suffix = "", prefix = "", decimals = 0, color }: StatProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    if (isInView && !hasAnimated) {
      setHasAnimated(true)
    }
  }, [isInView, hasAnimated])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="text-center"
    >
      <div className={`text-5xl md:text-6xl font-extrabold mb-2 ${color}`}>
        {hasAnimated ? (
          <CountUp
            start={0}
            end={end}
            duration={2.5}
            decimals={decimals}
            prefix={prefix}
            suffix={suffix}
          />
        ) : (
          "0"
        )}
      </div>
      <div className="text-lg text-indigo-200 font-medium">{label}</div>
    </motion.div>
  )
}

export default function AnimatedStats() {
  return (
    <div className="grid md:grid-cols-4 gap-8">
      <StatCard end={99.9} label="Uptime" suffix="%" decimals={1} color="text-white" />
      <StatCard end={50} label="Faster Resolution" suffix="%" color="text-white" />
      <StatCard end={10000} label="Tickets Resolved" suffix="+" color="text-white" />
      <StatCard end={247} label="Support Available" suffix="" color="text-white" />
    </div>
  )
}
