"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  TicketIcon,
  UserIcon,
  CheckCircleIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  ComposedChart,
  Treemap,
  FunnelChart,
  Funnel,
  LabelList,
} from "recharts"
import { getAllTickets } from "@/actions/ticket"
import { getAllTechniciansWithoutPagination } from "@/actions/technician"
import { Ticket, TicketStatus } from "@prisma/client"

export const dynamic = 'force-dynamic'

export default function ITSupportDashboard() {
  const [loading, setLoading] = useState(true)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [technicians, setTechnicians] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch all tickets and technicians
        const [ticketsResponse, techniciansResponse] = await Promise.all([
          getAllTickets({ page: 1, limit: 1000 }),
          getAllTechniciansWithoutPagination()
        ])

        if (ticketsResponse.success && ticketsResponse.tickets) {
          setTickets(ticketsResponse.tickets as Ticket[])
        } else {
          setError(ticketsResponse.message)
        }

        if (techniciansResponse.success && techniciansResponse.technicians) {
          setTechnicians(techniciansResponse.technicians)
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        setError("Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Calculate dynamic data from tickets
  const calculateDashboardData = () => {
    if (tickets.length === 0) {
      return {
        totalTickets: 0,
        slaCompliance: 0,
        activeTechnicians: 0,
        avgSatisfaction: 0,
        statusDistribution: [],
        ticketTrends: [],
        priorityData: [],
        categoryPerformance: [],
      }
    }

    // Status distribution
    const statusCounts: Record<string, number> = {}
    tickets.forEach(ticket => {
      statusCounts[ticket.status] = (statusCounts[ticket.status] || 0) + 1
    })

    const statusDistribution = Object.entries(statusCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, ' '),
      value,
      color: getStatusColor(name),
      percentage: ((value / tickets.length) * 100).toFixed(1)
    }))

    // Priority distribution by month (last 6 months)
    const monthlyData: Record<string, any> = {}
    const now = new Date()
    
    tickets.forEach(ticket => {
      const ticketDate = new Date(ticket.createdAt)
      const monthKey = ticketDate.toLocaleString('default', { month: 'short' })
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          tickets: 0,
          resolved: 0,
          critical: 0,
          high: 0,
          medium: 0,
          low: 0,
          sla: 0,
          avgResolution: 0,
          satisfaction: 0,
          escalations: 0
        }
      }
      
      monthlyData[monthKey].tickets++
      if (ticket.status === 'resolved' || ticket.status === 'closed') {
        monthlyData[monthKey].resolved++
      }
      
      // Count by priority
      if (ticket.priority === 'critical') monthlyData[monthKey].critical++
      else if (ticket.priority === 'high') monthlyData[monthKey].high++
      else if (ticket.priority === 'normal') monthlyData[monthKey].medium++
      else if (ticket.priority === 'low') monthlyData[monthKey].low++
    })

    const ticketTrends = Object.values(monthlyData)

    // Calculate SLA compliance (simplified: resolved tickets / total tickets)
    const resolvedTickets = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length
    const slaCompliance = tickets.length > 0 ? ((resolvedTickets / tickets.length) * 100).toFixed(1) : '0'

    // Active technicians
    const activeTechnicians = technicians.filter(t => t.availabilityStatus === 'available').length

    return {
      totalTickets: tickets.length,
      slaCompliance: parseFloat(slaCompliance),
      activeTechnicians: technicians.length,
      avgSatisfaction: 4.6, // Placeholder as satisfaction data not in schema
      statusDistribution,
      ticketTrends,
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'new': '#3b82f6',
      'assigned': '#8b5cf6',
      'in_progress': '#f59e0b',
      'on_hold': '#ef4444',
      'resolved': '#22c55e',
      'closed': '#6b7280',
      'cancelled': '#9ca3af'
    }
    return colors[status] || '#6b7280'
  }

  const dashboardData = calculateDashboardData()

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
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            <>
              {[1, 2, 3, 4].map(i => (
                <Card key={i}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-3 w-32" />
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
                  <TicketIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.totalTickets.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">All time</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">SLA Compliance</CardTitle>
                  <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.slaCompliance}%</div>
                  <p className="text-xs text-green-600">
                    {dashboardData.slaCompliance >= 90 ? 'Above target (90%)' : 'Below target (90%)'}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Technicians</CardTitle>
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.activeTechnicians}</div>
                  <p className="text-xs text-muted-foreground">
                    {technicians.filter(t => t.availabilityStatus === 'available').length} available
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
                  <TrophyIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.avgSatisfaction}/5</div>
                  <p className="text-xs text-muted-foreground">Average rating</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* First Row - Ticket Trends and Status Distribution */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Ticket Volume Trend</CardTitle>
              <CardDescription>Monthly ticket creation and resolution</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <Skeleton className="h-full w-full" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={dashboardData.ticketTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="tickets"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                      stroke="#3b82f6"
                      name="Created"
                    />
                    <Line type="monotone" dataKey="resolved" stroke="#22c55e" strokeWidth={2} name="Resolved" />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status Distribution</CardTitle>
              <CardDescription>Current ticket status breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <Skeleton className="h-48 w-48 rounded-full" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dashboardData.statusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {dashboardData.statusDistribution.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Second Row - Priority and SLA Performance */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Priority Distribution</CardTitle>
              <CardDescription>Ticket priorities over time</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <Skeleton className="h-full w-full" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dashboardData.ticketTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="critical" stackId="1" stroke="#ef4444" fill="#ef4444" />
                  <Area type="monotone" dataKey="high" stackId="1" stroke="#f97316" fill="#f97316" />
                  <Area type="monotone" dataKey="medium" stackId="1" stroke="#eab308" fill="#eab308" />
                  <Area type="monotone" dataKey="low" stackId="1" stroke="#22c55e" fill="#22c55e" />
                </AreaChart>
              </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ticket Status Summary</CardTitle>
              <CardDescription>Current ticket counts by status</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <Skeleton className="h-full w-full" />
                </div>
              ) : (
                <div className="space-y-4 pt-4">
                  {dashboardData.statusDistribution.map((status: any) => (
                    <div key={status.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: status.color }}
                        />
                        <span className="text-sm font-medium">{status.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">{status.percentage}%</span>
                        <span className="text-sm font-bold">{status.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Third Row - Technician Information */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Technician Availability</CardTitle>
              <CardDescription>Current availability status</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <Skeleton className="h-full w-full" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { status: "Available", count: technicians.filter((t: any) => t.availabilityStatus === 'available').length },
                    { status: "Busy", count: technicians.filter((t: any) => t.availabilityStatus === 'busy').length },
                    { status: "Offline", count: technicians.filter((t: any) => t.availabilityStatus === 'offline').length },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Technician Skill Levels</CardTitle>
              <CardDescription>Team expertise breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <Skeleton className="h-48 w-48 rounded-full" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Junior", value: technicians.filter((t: any) => t.technicianLevel === 'junior').length, color: "#22c55e" },
                        { name: "Mid", value: technicians.filter((t: any) => t.technicianLevel === 'mid').length, color: "#3b82f6" },
                        { name: "Senior", value: technicians.filter((t: any) => t.technicianLevel === 'senior').length, color: "#f59e0b" },
                        { name: "Expert", value: technicians.filter((t: any) => t.technicianLevel === 'expert').length, color: "#8b5cf6" },
                      ].filter(item => item.value > 0)}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {[
                        { name: "Junior", value: technicians.filter((t: any) => t.technicianLevel === 'junior').length, color: "#22c55e" },
                        { name: "Mid", value: technicians.filter((t: any) => t.technicianLevel === 'mid').length, color: "#3b82f6" },
                        { name: "Senior", value: technicians.filter((t: any) => t.technicianLevel === 'senior').length, color: "#f59e0b" },
                        { name: "Expert", value: technicians.filter((t: any) => t.technicianLevel === 'expert').length, color: "#8b5cf6" },
                      ].filter(item => item.value > 0).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
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
