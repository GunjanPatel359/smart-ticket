"use client"

import { motion } from "framer-motion"
import { SparklesIcon, BoltIcon, ChartBarIcon, ShieldCheckIcon } from "@heroicons/react/24/outline"

export default function FloatingElements() {
  const icons = [
    { Icon: SparklesIcon, color: "text-indigo-500", delay: 0 },
    { Icon: BoltIcon, color: "text-purple-500", delay: 0.5 },
    { Icon: ChartBarIcon, color: "text-pink-500", delay: 1 },
    { Icon: ShieldCheckIcon, color: "text-blue-500", delay: 1.5 },
  ]

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {icons.map(({ Icon, color, delay }, index) => (
        <motion.div
          key={index}
          className={`absolute ${color}`}
          style={{
            left: `${20 + index * 20}%`,
            top: `${30 + (index % 2) * 40}%`,
          }}
          animate={{
            y: [0, -30, 0],
            rotate: [0, 10, -10, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 4 + index,
            repeat: Infinity,
            delay: delay,
            ease: "easeInOut",
          }}
        >
          <Icon className="w-12 h-12 opacity-20" />
        </motion.div>
      ))}
    </div>
  )
}
