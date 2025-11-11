"use client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  TicketIcon,
  ClockIcon,
  CheckCircleIcon,
  TrophyIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  BoltIcon,
} from "@heroicons/react/24/outline"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { getTechnicianAllTickets } from "@/actions/ticket"
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
                
                const response = await getTechnicianAllTickets()
                
                if (response.success && response.tickets) {
                    setTickets(response.tickets)
                } else {
                    setError(response.message)
                }
            } catch (err) {
                console.error("Error fetching technician data:", err)
                setError("Failed to load technician data")
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    // Calculate performance metrics from tickets
    const calculateMetrics = () => {
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        
        // Count tickets resolved today
        const resolvedToday = tickets.filter(ticket => {
            if (ticket.status === 'resolved' || ticket.status === 'closed') {
                const updatedDate = new Date(ticket.updatedAt)
                return updatedDate >= today
            }
            return false
        }).length

        // Calculate average resolution time (using hours between created and resolved/closed for resolved tickets)
        const resolvedTickets = tickets.filter(t => t.status === 'resolved' || t.status === 'closed')
        let avgResolutionTime = 0
        if (resolvedTickets.length > 0) {
            const totalHours = resolvedTickets.reduce((sum, ticket) => {
                const created = new Date(ticket.createdAt).getTime()
                const resolved = ticket.resolvedAt ? new Date(ticket.resolvedAt).getTime() : new Date(ticket.updatedAt).getTime()
                return sum + (resolved - created) / (1000 * 60 * 60) // Convert to hours
            }, 0)
            avgResolutionTime = totalHours / resolvedTickets.length
        }

        // Count critical tickets
        const criticalTickets = tickets.filter(t => t.priority === 'critical').length

        // Calculate customer satisfaction from satisfaction ratings
        const ticketsWithRatings = tickets.filter(t => t.satisfactionRating !== null && t.satisfactionRating !== undefined)
        let avgSatisfactionRating = 0
        let satisfactionPercentage = 0
        
        if (ticketsWithRatings.length > 0) {
            const totalRating = ticketsWithRatings.reduce((sum, ticket) => sum + (ticket.satisfactionRating || 0), 0)
            avgSatisfactionRating = totalRating / ticketsWithRatings.length
            // Convert 5-point scale to percentage (assuming ratings are 1-5)
            satisfactionPercentage = (avgSatisfactionRating / 5) * 100
        }

        // Generate monthly trend data
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

        // Performance data
        const totalAssigned = tickets.length
        const totalResolved = resolvedTickets.length
        
        // Calculate SLA compliance based on tickets that didn't violate SLA
        const slaCompliantTickets = tickets.filter(t => !t.slaViolated).length
        const slaCompliance = totalAssigned > 0 ? (slaCompliantTickets / totalAssigned) * 100 : 0
        
        // Calculate resolution time performance (inverse - lower time is better)
        // Assuming target resolution time is 24 hours
        const avgResolutionPercentage = avgResolutionTime > 0 ? Math.min((24 / avgResolutionTime) * 100, 100) : 0

        const performanceData = [
            { name: "SLA Compliance", value: Math.round(slaCompliance) },
            { name: "Avg Resolution Time", value: Math.round(avgResolutionPercentage) },
            { name: "Customer Satisfaction", value: Math.round(satisfactionPercentage) },
            { name: "Tickets Resolved", value: totalResolved > 0 ? Math.round((totalResolved / totalAssigned) * 100) : 0 },
        ]

        // Count currently assigned tickets (not resolved/closed)
        const currentlyAssigned = tickets.filter(t => 
            t.status === 'assigned' || 
            t.status === 'in_progress' || 
            t.status === 'on_hold' ||
            t.status === 'new'
        ).length

        // This week's performance
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        const resolvedThisWeek = tickets.filter(ticket => {
            if (ticket.status === 'resolved' || ticket.status === 'closed') {
                const resolvedDate = ticket.resolvedAt ? new Date(ticket.resolvedAt) : new Date(ticket.updatedAt)
                return resolvedDate >= weekAgo
            }
            return false
        }).length

        // Escalated tickets
        const escalatedTickets = tickets.filter(t => t.escalationCount > 0).length

        // Reopened tickets
        const reopenedTickets = tickets.filter(t => t.reopenedCount > 0).length

        // First response time
        const ticketsWithResponse = tickets.filter(t => t.firstResponseTime !== null)
        let avgFirstResponseTime = 0
        if (ticketsWithResponse.length > 0) {
            const totalResponseHours = ticketsWithResponse.reduce((sum, ticket) => {
                const created = new Date(ticket.createdAt).getTime()
                const responded = new Date(ticket.firstResponseTime!).getTime()
                return sum + (responded - created) / (1000 * 60 * 60)
            }, 0)
            avgFirstResponseTime = totalResponseHours / ticketsWithResponse.length
        }

        // Priority distribution
        const priorityDistribution = [
            { name: 'Critical', value: tickets.filter(t => t.priority === 'critical').length, color: '#ef4444' },
            { name: 'High', value: tickets.filter(t => t.priority === 'high').length, color: '#f97316' },
            { name: 'Normal', value: tickets.filter(t => t.priority === 'normal').length, color: '#3b82f6' },
            { name: 'Low', value: tickets.filter(t => t.priority === 'low').length, color: '#10b981' },
        ].filter(item => item.value > 0)

        // Status distribution
        const statusDistribution = [
            { name: 'In Progress', value: tickets.filter(t => t.status === 'in_progress').length },
            { name: 'On Hold', value: tickets.filter(t => t.status === 'on_hold').length },
            { name: 'Assigned', value: tickets.filter(t => t.status === 'assigned').length },
            { name: 'Resolved', value: tickets.filter(t => t.status === 'resolved').length },
            { name: 'Closed', value: tickets.filter(t => t.status === 'closed').length },
        ].filter(item => item.value > 0)

        return {
            assignedTickets: currentlyAssigned,
            resolvedToday,
            avgResolutionTime: avgResolutionTime.toFixed(1),
            criticalTickets,
            avgSatisfactionRating: avgSatisfactionRating.toFixed(1),
            ticketsWithRatings: ticketsWithRatings.length,
            performanceData,
            ticketTrendData,
            totalResolved,
            resolvedThisWeek,
            escalatedTickets,
            reopenedTickets,
            avgFirstResponseTime: avgFirstResponseTime.toFixed(1),
            priorityDistribution,
            statusDistribution,
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
                    {/* First Row - Primary KPIs */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Assigned</CardTitle>
                                <TicketIcon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="text-2xl font-bold">...</div>
                                ) : (
                                    <>
                                        <div className="text-2xl font-bold">{metrics.assignedTickets}</div>
                                        <p className="text-xs text-red-600">
                                            {metrics.criticalTickets} critical
                                        </p>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
                                <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="text-2xl font-bold">...</div>
                                ) : (
                                    <>
                                        <div className="text-2xl font-bold">{metrics.resolvedToday}</div>
                                        <p className="text-xs text-muted-foreground">Today</p>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Avg Resolution</CardTitle>
                                <ClockIcon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="text-2xl font-bold">...</div>
                                ) : (
                                    <>
                                        <div className="text-2xl font-bold">{metrics.avgResolutionTime}h</div>
                                        <p className="text-xs text-muted-foreground">Average time</p>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Rating</CardTitle>
                                <TrophyIcon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="text-2xl font-bold">...</div>
                                ) : (
                                    <>
                                        <div className="text-2xl font-bold">
                                            {metrics.ticketsWithRatings > 0 ? `${metrics.avgSatisfactionRating}/5` : 'N/A'}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {metrics.ticketsWithRatings > 0 
                                                ? `${metrics.ticketsWithRatings} rating${metrics.ticketsWithRatings !== 1 ? 's' : ''}`
                                                : 'No ratings yet'}
                                        </p>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Second Row - Additional Analytics */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Resolved</CardTitle>
                                <CheckCircleIcon className="h-4 w-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="text-2xl font-bold">...</div>
                                ) : (
                                    <>
                                        <div className="text-2xl font-bold">{metrics.totalResolved}</div>
                                        <p className="text-xs text-muted-foreground">Lifetime</p>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">This Week</CardTitle>
                                <ArrowTrendingUpIcon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="text-2xl font-bold">...</div>
                                ) : (
                                    <>
                                        <div className="text-2xl font-bold">{metrics.resolvedThisWeek}</div>
                                        <p className="text-xs text-muted-foreground">Resolved</p>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Escalated</CardTitle>
                                <ExclamationTriangleIcon className="h-4 w-4 text-orange-600" />
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="text-2xl font-bold">...</div>
                                ) : (
                                    <>
                                        <div className="text-2xl font-bold">{metrics.escalatedTickets}</div>
                                        <p className="text-xs text-muted-foreground">Tickets</p>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">First Response</CardTitle>
                                <BoltIcon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="text-2xl font-bold">...</div>
                                ) : (
                                    <>
                                        <div className="text-2xl font-bold">{metrics.avgFirstResponseTime}h</div>
                                        <p className="text-xs text-muted-foreground">Avg time</p>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Charts Row 1 */}
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
                                        <AreaChart data={metrics.ticketTrendData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis />
                                            <Tooltip />
                                            <Area type="monotone" dataKey="resolved" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                                        </AreaChart>
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
                                <CardTitle>Performance Metrics</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="flex items-center justify-center h-[300px]">
                                        <div className="text-muted-foreground">Loading...</div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {metrics.performanceData.map((metric) => (
                                            <div key={metric.name} className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span>{metric.name}</span>
                                                    <span>{metric.value}%</span>
                                                </div>
                                                <Progress value={metric.value} className="h-2" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Charts Row 2 */}
                    <div className="grid gap-4 md:grid-cols-2">
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
                                                labelLine={false}
                                                label={(entry: any) => `${entry.name}: ${((entry.value / tickets.length) * 100).toFixed(0)}%`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {metrics.priorityDistribution.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
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
                                <CardTitle>Status Overview</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="flex items-center justify-center h-[300px]">
                                        <div className="text-muted-foreground">Loading...</div>
                                    </div>
                                ) : metrics.statusDistribution.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={metrics.statusDistribution}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="value" fill="#3b82f6" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-[300px]">
                                        <div className="text-muted-foreground">No data available</div>
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