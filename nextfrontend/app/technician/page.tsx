"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  TicketIcon,
  CheckCircleIcon,
  ClockIcon,
  StarIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline"
import { LazyBarChart } from "@/components/charts"
import { getTechnicianAllTickets } from "@/actions/ticket"
import { Ticket } from "@prisma/client"
import { KPICardsGridSkeleton, TicketListSkeleton, BarChartSkeleton } from "@/components/loading"
import { ErrorDisplay, EmptyState, useAuthErrorHandler } from "@/components/error"
import { ClientCache } from "@/lib/cache"
import { MemoizedTicketCard } from "@/components/optimized"

interface KPIData {
  assignedTickets: number
  resolvedToday: number
  avgResolutionTime: string
  customerRating: number
}

interface PriorityDistribution {
  name: string
  count: number
}

export default function TechnicianHomePage() {
  const [kpiData, setKpiData] = useState<KPIData | null>(null)
  const [assignedTickets, setAssignedTickets] = useState<Ticket[]>([])
  const [priorityDistribution, setPriorityDistribution] = useState<PriorityDistribution[]>([])
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
            assignedTickets: Ticket[]
            priorityDistribution: PriorityDistribution[]
          }>("technician_home_data")
          
          if (cachedData) {
            setKpiData(cachedData.kpiData)
            setAssignedTickets(cachedData.assignedTickets)
            setPriorityDistribution(cachedData.priorityDistribution)
            setLoading(false)
            return
          }
        }

        // Fetch all technician's tickets (including resolved ones for metrics)
        const ticketsResponse = await getTechnicianAllTickets()
        
        if (!ticketsResponse.success) {
          throw new Error(ticketsResponse.message)
        }

        const tickets = ticketsResponse.tickets || []
        
        // Debug: Log ticket data
        console.log("Fetched tickets:", tickets.length)
        console.log("Tickets data:", tickets)
        
        // Filter tickets by status (assigned, in_progress, on_hold)
        const filteredTickets = tickets.filter(t => 
          t.status === "assigned" || t.status === "in_progress" || t.status === "on_hold"
        )
        setAssignedTickets(filteredTickets)

        // Calculate KPIs
        const assignedCount = filteredTickets.length

        // Calculate resolved today (use all tickets from response for this metric)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const resolvedToday = tickets.filter(t => {
          if (t.status === "resolved" || t.status === "closed") {
            const updatedDate = new Date(t.updatedAt)
            updatedDate.setHours(0, 0, 0, 0)
            return updatedDate.getTime() === today.getTime()
          }
          return false
        }).length

        // Calculate average resolution time (for resolved tickets, use all tickets)
        const resolvedTickets = tickets.filter(t => t.status === "resolved" || t.status === "closed")
        let avgResolutionTime = "N/A"
        if (resolvedTickets.length > 0) {
          const totalMinutes = resolvedTickets.reduce((sum, ticket) => {
            const created = new Date(ticket.createdAt).getTime()
            const updated = new Date(ticket.updatedAt).getTime()
            return sum + (updated - created) / (1000 * 60)
          }, 0)
          const avgMinutes = totalMinutes / resolvedTickets.length
          
          if (avgMinutes < 60) {
            avgResolutionTime = `${Math.round(avgMinutes)}m`
          } else if (avgMinutes < 1440) {
            avgResolutionTime = `${Math.round(avgMinutes / 60)}h`
          } else {
            avgResolutionTime = `${Math.round(avgMinutes / 1440)}d`
          }
        }

        // Calculate customer rating (average satisfaction)
        const ticketsWithRating = tickets.filter(t => t.satisfactionRating !== null && t.satisfactionRating !== undefined)
        const customerRating = ticketsWithRating.length > 0
          ? Number((ticketsWithRating.reduce((sum, t) => sum + (t.satisfactionRating || 0), 0) / ticketsWithRating.length).toFixed(1))
          : 0

        setKpiData({
          assignedTickets: assignedCount,
          resolvedToday,
          avgResolutionTime,
          customerRating,
        })

        // Calculate priority distribution (for filtered tickets only)
        const priorityCounts: Record<string, number> = {
          critical: 0,
          high: 0,
          normal: 0,
          low: 0,
        }
        
        filteredTickets.forEach(ticket => {
          if (ticket.priority in priorityCounts) {
            priorityCounts[ticket.priority]++
          }
        })

        const distribution = Object.entries(priorityCounts).map(([name, count]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          count,
        }))

        setPriorityDistribution(distribution)

        // Cache the data for 3 minutes (shorter TTL for technician data)
        ClientCache.set("technician_home_data", {
          kpiData: {
            assignedTickets: assignedCount,
            resolvedToday,
            avgResolutionTime,
            customerRating,
          },
          assignedTickets: filteredTickets,
          priorityDistribution: distribution,
        }, 3 * 60 * 1000)
      } catch (err) {
        console.error("Error fetching technician home data:", err)
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
    // Clear cache on mount to ensure fresh data
    ClientCache.remove("technician_home_data")
    fetchData(false)
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

  const getTimeSinceCreation = (createdAt: Date | string) => {
    const created = new Date(createdAt).getTime()
    const now = new Date().getTime()
    const diffMinutes = Math.floor((now - created) / (1000 * 60))

    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`
    } else if (diffMinutes < 1440) {
      return `${Math.floor(diffMinutes / 60)}h ago`
    } else {
      return `${Math.floor(diffMinutes / 1440)}d ago`
    }
  }

  const handleTicketNavigation = useCallback((id: number) => {
    window.location.href = `/ticket/${id}`
  }, [])

  const handleRetry = () => {
    ClientCache.remove("technician_home_data")
    fetchData(false)
  }

  if (error) {
    return <ErrorDisplay message={error} onRetry={handleRetry} />
  }

  return (
    <main className="flex bg-background">
      <div className="flex-1 p-6">
        <header className="mb-6">
          <h1 className="text-3xl font-bold">My Workspace</h1>
          <p className="text-muted-foreground">Manage your assigned tickets and track performance</p>
        </header>
        
        {/* Screen reader announcements for loading states */}
        <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
          {loading ? "Loading workspace data..." : "Workspace data loaded"}
        </div>

        <div className="space-y-6">
          {/* KPI Cards Section */}
          <section aria-labelledby="kpi-heading">
            <h2 id="kpi-heading" className="sr-only">Performance Metrics</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" role="list" aria-label="Performance metrics">
            {loading ? (
              <KPICardsGridSkeleton count={4} />
            ) : (
              <>
                <Card role="listitem" aria-label="Assigned tickets metric">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Assigned Tickets</CardTitle>
                    <TicketIcon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" aria-label={`${kpiData?.assignedTickets || 0} assigned tickets`}>{kpiData?.assignedTickets || 0}</div>
                    <p className="text-xs text-muted-foreground">Active workload</p>
                  </CardContent>
                </Card>

                <Card role="listitem" aria-label="Resolved today metric">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
                    <CheckCircleIcon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" aria-label={`${kpiData?.resolvedToday || 0} tickets resolved today`}>{kpiData?.resolvedToday || 0}</div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      {(kpiData?.resolvedToday || 0) > 0 ? (
                        <>
                          <ArrowTrendingUpIcon className="h-3 w-3 text-green-600" aria-hidden="true" />
                          <span className="text-green-600">Great progress</span>
                        </>
                      ) : (
                        <span className="text-muted-foreground">Today's count</span>
                      )}
                    </p>
                  </CardContent>
                </Card>

                <Card role="listitem" aria-label="Average resolution time metric">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Resolution Time</CardTitle>
                    <ClockIcon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" aria-label={`Average resolution time: ${kpiData?.avgResolutionTime || "not available"}`}>{kpiData?.avgResolutionTime || "N/A"}</div>
                    <p className="text-xs text-muted-foreground">Per ticket</p>
                  </CardContent>
                </Card>

                <Card role="listitem" aria-label="Customer rating metric">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Customer Rating</CardTitle>
                    <StarIcon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" aria-label={kpiData?.customerRating ? `${kpiData.customerRating} out of 5 customer rating` : "No customer rating available"}>
                      {kpiData?.customerRating ? `${kpiData.customerRating}/5` : "N/A"}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      {(kpiData?.customerRating || 0) >= 4 ? (
                        <>
                          <ArrowTrendingUpIcon className="h-3 w-3 text-green-600" aria-hidden="true" />
                          <span className="text-green-600">Excellent</span>
                        </>
                      ) : (kpiData?.customerRating || 0) > 0 ? (
                        <span className="text-muted-foreground">Customer feedback</span>
                      ) : (
                        <span className="text-muted-foreground">No ratings yet</span>
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
                  <div className="grid gap-3 md:grid-cols-3">
                    <Link href="/technician/tickets" aria-label="Navigate to view all tickets">
                      <Button className="w-full" variant="outline">
                        <TicketIcon className="h-4 w-4 mr-2" aria-hidden="true" />
                        View All Tickets
                      </Button>
                    </Link>
                    <Link href="/technician/overview" aria-label="Navigate to performance metrics">
                      <Button className="w-full" variant="outline">
                        <ChartBarIcon className="h-4 w-4 mr-2" aria-hidden="true" />
                        Performance Metrics
                      </Button>
                    </Link>
                    <Link href="/technician/reports" aria-label="Navigate to view reports">
                      <Button className="w-full" variant="outline">
                        <DocumentTextIcon className="h-4 w-4 mr-2" aria-hidden="true" />
                        View Reports
                      </Button>
                    </Link>
                  </div>
                </nav>
              </CardContent>
            </Card>
          </section>

          {/* Assigned Tickets and Priority Distribution */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Assigned Tickets List */}
            <section aria-labelledby="assigned-tickets-heading">
              <Card>
                <CardHeader>
                  <CardTitle id="assigned-tickets-heading">My Assigned Tickets</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <TicketListSkeleton count={5} />
                  ) : assignedTickets.length === 0 ? (
                    <EmptyState
                      icon={<TicketIcon className="h-12 w-12 text-muted-foreground" />}
                      title="No tickets assigned"
                      description="You're all caught up!"
                    />
                  ) : (
                    <div className="space-y-3" role="list" aria-label="Assigned tickets">
                      {assignedTickets.slice(0, displayLimit).map(ticket => (
                        <MemoizedTicketCard
                          key={ticket.id}
                          id={ticket.id}
                          subject={ticket.subject}
                          status={ticket.status}
                          priority={ticket.priority}
                          timeInfo={`Created ${getTimeSinceCreation(ticket.createdAt)}`}
                          onNavigate={handleTicketNavigation}
                          getStatusBadgeColor={getStatusBadgeColor}
                          getPriorityBadgeColor={getPriorityBadgeColor}
                        />
                      ))}
                      {assignedTickets.length > displayLimit && (
                        <div className="mt-4 text-center">
                          <Button
                            variant="outline"
                            onClick={() => setDisplayLimit(prev => prev + 10)}
                            aria-label="Load more tickets"
                          >
                            Load More ({assignedTickets.length - displayLimit} remaining)
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>

            {/* Priority Distribution Chart */}
            <section aria-labelledby="priority-distribution-heading">
              <Card>
                <CardHeader>
                  <CardTitle id="priority-distribution-heading">Priority Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <BarChartSkeleton />
                  ) : priorityDistribution.every(p => p.count === 0) ? (
                    <EmptyState
                      icon={<ChartBarIcon className="h-12 w-12 text-muted-foreground" />}
                      title="No data available"
                    />
                  ) : (
                    <LazyBarChart 
                      data={priorityDistribution} 
                      ariaLabel="Bar chart showing ticket priority distribution"
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
