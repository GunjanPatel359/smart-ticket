"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  TicketIcon,
  ClockIcon,
  CheckCircleIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline"
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { getUserSupportTickets } from "@/actions/ticket"
import { Ticket } from "@prisma/client"

export default function ITSupportDashboard() {
    const [loading, setLoading] = useState(true)
    const [tickets, setTickets] = useState<Ticket[]>([])
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                setError(null)
                
                const response = await getUserSupportTickets()
                
                if (response.success && response.tickets) {
                    setTickets(response.tickets)
                } else {
                    setError(response.message)
                }
            } catch (err) {
                console.error("Error fetching user tickets:", err)
                setError("Failed to load ticket data")
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    // Calculate metrics from tickets
    const calculateMetrics = () => {
        const openTickets = tickets.filter(t => 
            t.status === 'new' || t.status === 'assigned' || t.status === 'in_progress' || t.status === 'on_hold'
        ).length
        
        const resolvedTickets = tickets.filter(t => 
            t.status === 'resolved' || t.status === 'closed'
        ).length

        // Priority distribution
        const priorityCounts: Record<string, number> = {
            critical: 0,
            high: 0,
            normal: 0,
            low: 0
        }
        
        tickets.forEach(ticket => {
            if (ticket.priority in priorityCounts) {
                priorityCounts[ticket.priority]++
            }
        })

        const priorityDistribution = [
            { name: "Critical", value: priorityCounts.critical, color: "#ef4444" },
            { name: "High", value: priorityCounts.high, color: "#f97316" },
            { name: "Medium", value: priorityCounts.normal, color: "#eab308" },
            { name: "Low", value: priorityCounts.low, color: "#22c55e" },
        ].filter(item => item.value > 0)

        // Monthly trend data
        const monthlyData: Record<string, { month: string; tickets: number; resolved: number }> = {}
        
        tickets.forEach(ticket => {
            const ticketDate = new Date(ticket.createdAt)
            const monthKey = ticketDate.toLocaleString('default', { month: 'short' })
            
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = { month: monthKey, tickets: 0, resolved: 0 }
            }
            
            monthlyData[monthKey].tickets++
            if (ticket.status === 'resolved' || ticket.status === 'closed') {
                monthlyData[monthKey].resolved++
            }
        })

        const ticketTrendData = Object.values(monthlyData)

        // Calculate average response time (simplified)
        const resolvedWithTime = tickets.filter(t => t.status === 'resolved' || t.status === 'closed')
        let avgResponseTime = 0
        if (resolvedWithTime.length > 0) {
            const totalHours = resolvedWithTime.reduce((sum, ticket) => {
                const created = new Date(ticket.createdAt).getTime()
                const updated = new Date(ticket.updatedAt).getTime()
                return sum + (updated - created) / (1000 * 60 * 60)
            }, 0)
            avgResponseTime = totalHours / resolvedWithTime.length
        }

        return {
            totalTickets: tickets.length,
            openTickets,
            resolvedTickets,
            avgResponseTime: avgResponseTime.toFixed(1),
            highPriorityOpen: tickets.filter(t => 
                (t.priority === 'high' || t.priority === 'critical') && 
                (t.status === 'new' || t.status === 'assigned' || t.status === 'in_progress')
            ).length,
            priorityDistribution,
            ticketTrendData
        }
    }

    const metrics = calculateMetrics()

    const renderDashboardContent = () => {
        if (error) {
            return (
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <p className="text-red-600 mb-4">{error}</p>
                        <button 
                            onClick={() => window.location.reload()} 
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            )
        }
        return (
            <>
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
                    <TicketIcon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-2xl font-bold">...</div>
                    ) : (
                      <>
                        <div className="text-2xl font-bold">{metrics.openTickets}</div>
                        <p className="text-xs text-muted-foreground">
                          {metrics.highPriorityOpen} high priority
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
                    <ClockIcon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-2xl font-bold">...</div>
                    ) : (
                      <>
                        <div className="text-2xl font-bold">{metrics.avgResponseTime}h</div>
                        <p className="text-xs text-muted-foreground">Average time</p>
                      </>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
                    <TrophyIcon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-2xl font-bold">...</div>
                    ) : (
                      <>
                        <div className="text-2xl font-bold">{metrics.totalTickets}</div>
                        <p className="text-xs text-muted-foreground">All time</p>
                      </>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Resolved</CardTitle>
                    <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-2xl font-bold">...</div>
                    ) : (
                      <>
                        <div className="text-2xl font-bold">{metrics.resolvedTickets}</div>
                        <p className="text-xs text-muted-foreground">Completed</p>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Ticket Resolution Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex items-center justify-center h-[300px]">
                        <div className="text-muted-foreground">Loading...</div>
                      </div>
                    ) : metrics.ticketTrendData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={metrics.ticketTrendData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="resolved" stroke="#22c55e" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-[300px]">
                        <div className="text-muted-foreground">No data available</div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Priority Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex items-center justify-center h-[300px]">
                        <div className="text-muted-foreground">Loading...</div>
                      </div>
                    ) : metrics.priorityDistribution.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={metrics.priorityDistribution}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="value"
                            label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {metrics.priorityDistribution.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-[300px]">
                        <div className="text-muted-foreground">No tickets yet</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
            </>
        )
    }
    return (
        <div className="flex bg-background">

            <div className="flex-1 p-6">

                {renderDashboardContent()}
            </div>

        </div>
    )
}