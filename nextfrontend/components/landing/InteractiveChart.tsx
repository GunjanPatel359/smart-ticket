"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const ticketData = [
  { month: "Jan", tickets: 45, resolved: 42, avgTime: 2.3, satisfaction: 85 },
  { month: "Feb", tickets: 52, resolved: 50, avgTime: 2.1, satisfaction: 87 },
  { month: "Mar", tickets: 61, resolved: 58, avgTime: 1.9, satisfaction: 89 },
  { month: "Apr", tickets: 58, resolved: 56, avgTime: 1.8, satisfaction: 91 },
  { month: "May", tickets: 70, resolved: 68, avgTime: 1.6, satisfaction: 93 },
  { month: "Jun", tickets: 75, resolved: 73, avgTime: 1.5, satisfaction: 95 },
  { month: "Jul", tickets: 82, resolved: 80, avgTime: 1.4, satisfaction: 96 },
  { month: "Aug", tickets: 88, resolved: 86, avgTime: 1.3, satisfaction: 97 },
]

const priorityData = [
  { name: "Critical", value: 15, color: "#ef4444" },
  { name: "High", value: 25, color: "#f97316" },
  { name: "Normal", value: 40, color: "#eab308" },
  { name: "Low", value: 20, color: "#22c55e" },
]

const skillData = [
  { skill: "Network", junior: 12, mid: 18, senior: 25, expert: 8 },
  { skill: "Security", junior: 8, mid: 15, senior: 20, expert: 12 },
  { skill: "Database", junior: 10, mid: 20, senior: 18, expert: 10 },
  { skill: "Cloud", junior: 15, mid: 22, senior: 15, expert: 6 },
  { skill: "Hardware", junior: 14, mid: 16, senior: 12, expert: 5 },
]

const performanceData = [
  { time: "00:00", load: 20, response: 150 },
  { time: "04:00", load: 15, response: 120 },
  { time: "08:00", load: 65, response: 180 },
  { time: "12:00", load: 85, response: 220 },
  { time: "16:00", load: 75, response: 200 },
  { time: "20:00", load: 45, response: 160 },
  { time: "23:59", load: 25, response: 140 },
]

export default function InteractiveChart() {
  const [activeChart, setActiveChart] = useState<"tickets" | "priority" | "skills" | "performance">("tickets")
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={isVisible ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.8 }}
      className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100"
    >
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Live Analytics Dashboard</h3>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => setActiveChart("tickets")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeChart === "tickets"
                ? "bg-indigo-600 text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Ticket Trends
          </button>
          <button
            onClick={() => setActiveChart("priority")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeChart === "priority"
                ? "bg-purple-600 text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Priority Distribution
          </button>
          <button
            onClick={() => setActiveChart("skills")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeChart === "skills"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Skill Levels
          </button>
          <button
            onClick={() => setActiveChart("performance")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeChart === "performance"
                ? "bg-green-600 text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Performance
          </button>
        </div>
      </div>

      <motion.div
        key={activeChart}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="h-[400px]"
      >
        {activeChart === "tickets" && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={ticketData}>
              <defs>
                <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Area
                type="monotone"
                dataKey="tickets"
                stroke="#6366f1"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorTickets)"
              />
              <Area
                type="monotone"
                dataKey="resolved"
                stroke="#22c55e"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorResolved)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {activeChart === "priority" && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={priorityData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                animationBegin={0}
                animationDuration={800}
              >
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )}

        {activeChart === "skills" && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={skillData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="skill" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="junior" stackId="a" fill="#93c5fd" radius={[0, 0, 0, 0]} />
              <Bar dataKey="mid" stackId="a" fill="#60a5fa" radius={[0, 0, 0, 0]} />
              <Bar dataKey="senior" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
              <Bar dataKey="expert" stackId="a" fill="#1d4ed8" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {activeChart === "performance" && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performanceData}>
              <defs>
                <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorResponse" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="time" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="load"
                stroke="#22c55e"
                strokeWidth={3}
                dot={{ fill: "#22c55e", r: 5 }}
                activeDot={{ r: 8 }}
              />
              <Line
                type="monotone"
                dataKey="response"
                stroke="#f59e0b"
                strokeWidth={3}
                dot={{ fill: "#f59e0b", r: 5 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </motion.div>
    </motion.div>
  )
}
