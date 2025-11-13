"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { motion } from "framer-motion"

export default function GuitarString() {
  const stringRef = useRef<SVGPathElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!stringRef.current || !containerRef.current) return

    const container = containerRef.current
    const string = stringRef.current

    const handleClick = (e: MouseEvent) => {
      if (!string || !container) return

      const rect = container.getBoundingClientRect()
      const clickY = e.clientY - rect.top
      const clickX = e.clientX - rect.left

      // Calculate relative position (0-800 for viewBox)
      const relativeX = (clickX / rect.width) * 800
      const relativeY = (clickY / rect.height) * 400

      // Clamp values to prevent extreme distortions
      const clampedX = Math.max(100, Math.min(700, relativeX))
      const clampedY = Math.max(100, Math.min(300, relativeY))

      // Kill any existing animations
      gsap.killTweensOf(string)

      // Animate the string pluck
      gsap.to(string, {
        attr: {
          d: `M 0 200 Q ${clampedX} ${clampedY} 800 200`,
        },
        duration: 0.08,
        ease: "power2.out",
        onComplete: () => {
          // Oscillate back with elastic easing
          gsap.to(string, {
            attr: {
              d: "M 0 200 Q 400 200 800 200",
            },
            duration: 1.2,
            ease: "elastic.out(1, 0.4)",
          })
        },
      })

      // Create ripple effect
      const ripple = document.createElement("div")
      ripple.className = "absolute w-4 h-4 bg-indigo-500 rounded-full animate-ping pointer-events-none"
      ripple.style.left = `${clickX - 8}px`
      ripple.style.top = `${clickY - 8}px`
      container.appendChild(ripple)
      setTimeout(() => {
        if (ripple.parentNode === container) {
          container.removeChild(ripple)
        }
      }, 1000)
    }

    container.addEventListener("click", handleClick)

    return () => {
      container.removeEventListener("click", handleClick)
      gsap.killTweensOf(string)
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl shadow-2xl p-8 border border-purple-100"
    >
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Interactive Experience</h3>
        <p className="text-gray-600">Click anywhere on the string to play!</p>
      </div>

      <div
        ref={containerRef}
        className="relative w-full h-[400px] bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl overflow-hidden cursor-pointer"
      >
        {/* Fretboard markers */}
        <div className="absolute inset-0 flex items-center justify-around px-8">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="w-2 h-2 bg-gray-600 rounded-full opacity-50" />
          ))}
        </div>

        {/* Guitar String */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 400">
          <defs>
            <linearGradient id="stringGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Shadow string */}
          <path
            d="M 0 200 Q 400 200 800 200"
            stroke="rgba(0,0,0,0.3)"
            strokeWidth="6"
            fill="none"
            transform="translate(0, 4)"
          />

          {/* Main string */}
          <path
            ref={stringRef}
            d="M 0 200 Q 400 200 800 200"
            stroke="url(#stringGradient)"
            strokeWidth="4"
            fill="none"
            filter="url(#glow)"
            strokeLinecap="round"
          />

          {/* String endpoints */}
          <circle cx="0" cy="200" r="8" fill="#6366f1" />
          <circle cx="800" cy="200" r="8" fill="#ec4899" />
        </svg>

        {/* Ambient particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-purple-400 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Experience the harmony of AI and human interaction
        </p>
      </div>
    </motion.div>
  )
}
