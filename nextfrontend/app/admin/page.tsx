"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  TicketIcon,
  UserIcon,
  CheckCircleIcon,
  TrophyIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UsersIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline"
import { LazyPieChart } from "@/components/charts"
import { getAllTickets } from "@/actions/ticket"
import { getAllTechniciansWithoutPagination } from "@/actions/technician"
import { KPICardsGridSkeleton, TicketTableSkeleton, PieChartSkeleton } from "@/components/loading"
import { ErrorDisplay, useAuthErrorHandler } from "@/components/error"
import { ClientCache } from "@/lib/cache"

interface KPIData {
  totalTickets: number
  activeTechnicians: number
  slaCompliance: number
  avgSatisfaction: number
}

interface TicketData {
  id: number
  subject: string
  status: string
  priority: string
  assignedTechnician: { name: string } | null
  createdAt: string
}

interface StatusDistribution {
  name: string
  value: number
  color: string
  [key: string]: string | number
}

export default function AdminHomePage() {
  const [kpiData, setKpiData] = useState<KPIData | null>(null)
  const [recentTickets, setRecentTickets] = useState<TicketData[]>([])
  const [statusDistribution, setStatusDistribution] = useState<StatusDistribution[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [displayLimit, setDisplayLimit] = useState(10)
  const { handleAuthError } = useAuthErrorHandler()

  const fetchData = async (useCache: boolean = true) => {
    try {
      setLoading(true)
      setError(null)

        // Try to get from cache first
        if (useCache) {
          const cachedData = ClientCache.get<{
            kpiData: KPIData
            recentTickets: TicketData[]
            statusDistribution: StatusDistribution[]
          }>("admin_home_data")
          
          if (cachedData) {
            setKpiData(cachedData.kpiData)
            setRecentTickets(cachedData.recentTickets)
            setStatusDistribution(cachedData.statusDistribution)
            setLoading(false)
            return
          }
        }

        // Fetch all tickets
        const ticketsResponse = await getAllTickets({ page: 1, limit: 1000 })
        
        if (!ticketsResponse.success) {
          throw new Error(ticketsResponse.message)
        }

        const tickets = ticketsResponse.tickets || []

        // Fetch technicians
        const techniciansResponse = await getAllTechniciansWithoutPagination()
        
        if (!techniciansResponse.success) {
          throw new Error(techniciansResponse.message)
        }

        const technicians = techniciansResponse.technicians || []

        // Calculate KPIs
        const totalTickets = tickets.length
        const activeTechnicians = technicians.filter(t => t.availabilityStatus === "available" || t.availabilityStatus === "busy").length
        
        // Calculate SLA compliance (tickets resolved within expected time)
        const resolvedTickets = tickets.filter(t => t.status === "resolved" || t.status === "closed")
        const slaCompliantTickets = resolvedTickets.filter(t => !t.slaViolated)
        const slaCompliance = resolvedTickets.length > 0 
          ? Math.round((slaCompliantTickets.length / resolvedTickets.length) * 100)
          : 0

        // Calculate average satisfaction
        const ticketsWithRating = tickets.filter(t => t.satisfactionRating !== null && t.satisfactionRating !== undefined)
        const avgSatisfaction = ticketsWithRating.length > 0
          ? Number((ticketsWithRating.reduce((sum, t) => sum + (t.satisfactionRating || 0), 0) / ticketsWithRating.length).toFixed(1))
          : 0

        setKpiData({
          totalTickets,
          activeTechnicians,
          slaCompliance,
          avgSatisfaction,
        })

        // Get recent tickets (sorted by creation date)
        const sortedTickets = [...tickets].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        setRecentTickets(sortedTickets)

        // Calculate status distribution
        const statusCounts: Record<string, number> = {}
        tickets.forEach(ticket => {
          statusCounts[ticket.status] = (statusCounts[ticket.status] || 0) + 1
        })

        const statusColors: Record<string, string> = {
          new: "#3b82f6",
          assigned: "#8b5cf6",
          in_progress: "#f59e0b",
          on_hold: "#ef4444",
          resolved: "#22c55e",
          closed: "#6b7280",
          cancelled: "#9ca3af",
        }

        const distribution = Object.entries(statusCounts).map(([name, value]) => ({
          name: name.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
          value,
          color: statusColors[name] || "#6b7280",
        }))

        setStatusDistribution(distribution)

        // Cache the data for 5 minutes
        ClientCache.set("admin_home_data", {
          kpiData: {
            totalTickets,
            activeTechnicians,
            slaCompliance,
            avgSatisfaction,
          },
          recentTickets: sortedTickets,
          statusDistribution: distribution,
        }, 5 * 60 * 1000)
      } catch (err) {
        console.error("Error fetching admin home data:", err)
        const errorMessage = err instanceof Error ? err.message : "Failed to load data"
        
        // Check if it's an authentication error
        const isAuthError = handleAuthError(err instanceof Error ? err : new Error(errorMessage))
        
        if (!isAuthError) {
          setError(errorMessage)
        }
      } finally {
        setLoading(false)
      }
    }

  useEffect(() => {
    fetchData()
  }, [])

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      new: "bg-blue-100 text-blue-800",
      assigned: "bg-purple-100 text-purple-800",
      in_progress: "bg-yellow-100 text-yellow-800",
      on_hold: "bg-red-100 text-red-800",
      resolved: "bg-green-100 text-green-800",
      closed: "bg-gray-100 text-gray-800",
      cancelled: "bg-gray-100 text-gray-600",
    }
    return colors[status] || "bg-gray-100 text-gray-800"
  }

  const getPriorityBadgeColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: "bg-green-100 text-green-800",
      normal: "bg-blue-100 text-blue-800",
      high: "bg-orange-100 text-orange-800",
      critical: "bg-red-100 text-red-800",
    }
    return colors[priority] || "bg-gray-100 text-gray-800"
  }

  const handleRetry = () => {
    ClientCache.remove("admin_home_data")
    fetchData(false)
  }

  if (error) {
    return <ErrorDisplay message={error} onRetry={handleRetry} />
  }

  return (
    <main className="flex bg-background">
      <div className="flex-1 p-6">
        <header className="mb-6">
          <h1 className="text-3xl font-bold">Admin Home</h1>
          <p className="text-muted-foreground">IT Support System Overview</p>
        </header>
        
        {/* Screen reader announcements for loading states */}
        <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
          {loading ? "Loading dashboard data..." : "Dashboard data loaded"}
        </div>

        <div className="space-y-6">
          {/* KPI Cards Section */}
          <section aria-labelledby="kpi-heading">
            <h2 id="kpi-heading" className="sr-only">Key Performance Indicators</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" role="list" aria-label="Performance metrics">
            {loading ? (
              <KPICardsGridSkeleton count={4} />
            ) : (
              <>
                <Card role="listitem" aria-label="Total tickets metric">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
                    <TicketIcon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" aria-label={`${kpiData?.totalTickets || 0} total tickets`}>{kpiData?.totalTickets || 0}</div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <ArrowTrendingUpIcon className="h-3 w-3 text-green-600" aria-hidden="true" />
                      <span className="text-green-600">System-wide</span>
                    </p>
                  </CardContent>
                </Card>

                <Card role="listitem" aria-label="Active technicians metric">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Technicians</CardTitle>
                    <UserIcon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" aria-label={`${kpiData?.activeTechnicians || 0} active technicians`}>{kpiData?.activeTechnicians || 0}</div>
                    <p className="text-xs text-muted-foreground">Available or busy</p>
                  </CardContent>
                </Card>

                <Card role="listitem" aria-label="SLA compliance metric">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">SLA Compliance</CardTitle>
                    <CheckCircleIcon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" aria-label={`${kpiData?.slaCompliance || 0} percent SLA compliance`}>{kpiData?.slaCompliance || 0}%</div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      {(kpiData?.slaCompliance || 0) >= 90 ? (
                        <>
                          <ArrowTrendingUpIcon className="h-3 w-3 text-green-600" aria-hidden="true" />
                          <span className="text-green-600">Above target</span>
                        </>
                      ) : (
                        <>
                          <ArrowTrendingDownIcon className="h-3 w-3 text-red-600" aria-hidden="true" />
                          <span className="text-red-600">Below target</span>
                        </>
                      )}
                    </p>
                  </CardContent>
                </Card>

                <Card role="listitem" aria-label="Average satisfaction metric">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Satisfaction</CardTitle>
                    <TrophyIcon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" aria-label={kpiData?.avgSatisfaction ? `${kpiData.avgSatisfaction} out of 5 average satisfaction` : "No satisfaction data available"}>
                      {kpiData?.avgSatisfaction ? `${kpiData.avgSatisfaction}/5` : "N/A"}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      {(kpiData?.avgSatisfaction || 0) >= 4 ? (
                        <>
                          <ArrowTrendingUpIcon className="h-3 w-3 text-green-600" aria-hidden="true" />
                          <span className="text-green-600">Good rating</span>
                        </>
                      ) : (
                        <span className="text-muted-foreground">Customer feedback</span>
                      )}
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
            </div>
          </section>

          {/* Quick Actions Section */}
          <section aria-labelledby="quick-actions-heading">
            <Card>
              <CardHeader>
                <CardTitle id="quick-actions-heading">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <nav aria-label="Quick action links">
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                    <Link href="/admin/tickets" aria-label="Navigate to view all tickets">
                      <Button className="w-full" variant="outline">
                        <TicketIcon className="h-4 w-4 mr-2" aria-hidden="true" />
                        View All Tickets
                      </Button>
                    </Link>
                    <Link href="/admin/technicians" aria-label="Navigate to manage technicians">
                      <Button className="w-full" variant="outline">
                        <UsersIcon className="h-4 w-4 mr-2" aria-hidden="true" />
                        Manage Technicians
                      </Button>
                    </Link>
                    <Link href="/admin/analytics" aria-label="Navigate to view analytics">
                      <Button className="w-full" variant="outline">
                        <ArrowTrendingUpIcon className="h-4 w-4 mr-2" aria-hidden="true" />
                        View Analytics
                      </Button>
                    </Link>
                    <Link href="/admin/skills" aria-label="Navigate to manage skills">
                      <Button className="w-full" variant="outline">
                        <AcademicCapIcon className="h-4 w-4 mr-2" aria-hidden="true" />
                        Manage Skills
                      </Button>
                    </Link>
                  </div>
                </nav>
              </CardContent>
            </Card>
          </section>

          {/* Recent Activity and Status Distribution */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Recent Tickets Table */}
            <section aria-labelledby="recent-activity-heading">
              <Card>
                <CardHeader>
                  <CardTitle id="recent-activity-heading">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <TicketTableSkeleton count={10} />
                  ) : recentTickets.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No tickets found</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full" aria-label="Recent tickets table">
                        <thead>
                          <tr className="border-b">
                            <th scope="col" className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">ID</th>
                            <th scope="col" className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Subject</th>
                            <th scope="col" className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
                            <th scope="col" className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Priority</th>
                            <th scope="col" className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Assigned To</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentTickets.slice(0, displayLimit).map(ticket => (
                            <tr
                              key={ticket.id}
                              onClick={() => window.location.href = `/ticket/${ticket.id}`}
                              className="border-b last:border-b-0 hover:bg-accent cursor-pointer transition-colors"
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault()
                                  window.location.href = `/ticket/${ticket.id}`
                                }
                              }}
                              aria-label={`View ticket ${ticket.id}: ${ticket.subject}`}
                            >
                              <td className="py-3 px-2 text-sm font-medium">#{ticket.id}</td>
                              <td className="py-3 px-2 text-sm max-w-xs truncate">{ticket.subject}</td>
                              <td className="py-3 px-2">
                                <Badge className={getStatusBadgeColor(ticket.status)}>
                                  {ticket.status.replace(/_/g, " ")}
                                </Badge>
                              </td>
                              <td className="py-3 px-2">
                                <Badge className={getPriorityBadgeColor(ticket.priority)}>
                                  {ticket.priority}
                                </Badge>
                              </td>
                              <td className="py-3 px-2 text-sm text-muted-foreground">
                                {ticket.assignedTechnician?.name || "Unassigned"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {recentTickets.length > displayLimit && (
                        <div className="mt-4 text-center">
                          <Button
                            variant="outline"
                            onClick={() => setDisplayLimit(prev => prev + 10)}
                            aria-label="Load more tickets"
                          >
                            Load More ({recentTickets.length - displayLimit} remaining)
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>

            {/* Status Distribution Chart */}
            <section aria-labelledby="status-distribution-heading">
              <Card>
                <CardHeader>
                  <CardTitle id="status-distribution-heading">Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <PieChartSkeleton />
                  ) : statusDistribution.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No data available</p>
                  ) : (
                    <LazyPieChart 
                      data={statusDistribution} 
                      ariaLabel="Pie chart showing ticket status distribution"
                    />
                  )}
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
