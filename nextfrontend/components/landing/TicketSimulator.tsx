"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { SparklesIcon, CheckCircleIcon, ClockIcon, UserIcon } from "@heroicons/react/24/outline"

interface Ticket {
  id: number
  title: string
  priority: "low" | "normal" | "high" | "critical"
  status: "new" | "assigned" | "resolved"
  technician?: string
  time: number
}

const sampleTickets = [
  { title: "Network connectivity issue", priority: "high" as const },
  { title: "Password reset request", priority: "normal" as const },
  { title: "Server down - critical", priority: "critical" as const },
  { title: "Software installation", priority: "low" as const },
  { title: "Email not working", priority: "high" as const },
]

const technicians = ["Alex (Network Expert)", "Sarah (Security Senior)", "Mike (Cloud Mid)", "Emma (Database Expert)"]

const priorityColors = {
  low: "bg-green-100 text-green-700 border-green-300",
  normal: "bg-yellow-100 text-yellow-700 border-yellow-300",
  high: "bg-orange-100 text-orange-700 border-orange-300",
  critical: "bg-red-100 text-red-700 border-red-300",
}

export default function TicketSimulator() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [ticketCounter, setTicketCounter] = useState(0)

  const createTicket = () => {
    const sample = sampleTickets[Math.floor(Math.random() * sampleTickets.length)]
    const newTicket: Ticket = {
      id: ticketCounter,
      title: sample.title,
      priority: sample.priority,
      status: "new",
      time: 0,
    }
    setTicketCounter((prev) => prev + 1)
    setTickets((prev) => [newTicket, ...prev].slice(0, 3))

    // Simulate AI assignment after 1 second
    setTimeout(() => {
      setTickets((prev) =>
        prev.map((t) =>
          t.id === newTicket.id
            ? {
                ...t,
                status: "assigned",
                technician: technicians[Math.floor(Math.random() * technicians.length)],
              }
            : t
        )
      )
    }, 1000)

    // Simulate resolution after 3 seconds
    setTimeout(() => {
      setTickets((prev) =>
        prev.map((t) => (t.id === newTicket.id ? { ...t, status: "resolved" } : t))
      )
    }, 3000)
  }

  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        createTicket()
      }, 4000)
      return () => clearInterval(interval)
    }
  }, [isRunning, ticketCounter])

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl shadow-2xl p-8 border border-indigo-100"
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">AI Ticket Assignment Demo</h3>
          <p className="text-gray-600">Watch how our AI instantly matches tickets to technicians</p>
        </div>
        <button
          onClick={() => {
            setIsRunning(!isRunning)
            if (!isRunning) createTicket()
          }}
          className={`px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 ${
            isRunning
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-indigo-600 hover:bg-indigo-700 text-white"
          }`}
        >
          {isRunning ? "Stop Demo" : "Start Demo"}
        </button>
      </div>

      <div className="space-y-4 min-h-[300px]">
        <AnimatePresence>
          {tickets.map((ticket) => (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, x: -50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                        priorityColors[ticket.priority]
                      }`}
                    >
                      {ticket.priority.toUpperCase()}
                    </span>
                    {ticket.status === "new" && (
                      <span className="flex items-center gap-1 text-blue-600 text-sm">
                        <ClockIcon className="h-4 w-4" />
                        Processing...
                      </span>
                    )}
                    {ticket.status === "assigned" && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center gap-1 text-purple-600 text-sm font-medium"
                      >
                        <SparklesIcon className="h-4 w-4" />
                        AI Assigned
                      </motion.span>
                    )}
                    {ticket.status === "resolved" && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center gap-1 text-green-600 text-sm font-medium"
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                        Resolved
                      </motion.span>
                    )}
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{ticket.title}</h4>
                  {ticket.technician && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <UserIcon className="h-4 w-4" />
                      <span className="text-sm">{ticket.technician}</span>
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  {ticket.status === "new" && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"
                    />
                  )}
                  {ticket.status === "assigned" && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center"
                    >
                      <SparklesIcon className="h-5 w-5 text-purple-600" />
                    </motion.div>
                  )}
                  {ticket.status === "resolved" && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center"
                    >
                      <CheckCircleIcon className="h-5 w-5 text-green-600" />
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {tickets.length === 0 && !isRunning && (
          <div className="flex items-center justify-center h-[300px] text-gray-400">
            <div className="text-center">
              <SparklesIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Click "Start Demo" to see AI in action!</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
