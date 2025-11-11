"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  TicketIcon,
  PlusCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline"
import { getUserSupportTickets } from "@/actions/ticket"
import { Ticket } from "@prisma/client"
import { KPICardsGridSkeleton, TicketListSkeleton } from "@/components/loading"
import { ErrorDisplay, EmptyState, useAuthErrorHandler } from "@/components/error"
import { ClientCache } from "@/lib/cache"
import { MemoizedTicketCard } from "@/components/optimized"

interface KPIData {
  totalTickets: number
  openTickets: number
  resolvedTickets: number
}

export default function UserHomePage() {
  const [kpiData, setKpiData] = useState<KPIData | null>(null)
  const [userTickets, setUserTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openTicketsLimit, setOpenTicketsLimit] = useState(10)
  const [resolvedTicketsLimit, setResolvedTicketsLimit] = useState(10)
  const { handleAuthError } = useAuthErrorHandler()

  const fetchData = async (useCache: boolean = true) => {
    try {
      setLoading(true)
      setError(null)

        // Try to get from cache first
        if (useCache) {
          const cachedData = ClientCache.get<{
            kpiData: KPIData
            userTickets: Ticket[]
          }>("user_home_data")
          
          if (cachedData) {
            setKpiData(cachedData.kpiData)
            setUserTickets(cachedData.userTickets)
            setLoading(false)
            return
          }
        }

        // Fetch user's tickets
        const ticketsResponse = await getUserSupportTickets()
        
        if (!ticketsResponse.success) {
          throw new Error(ticketsResponse.message)
        }

        const tickets = ticketsResponse.tickets || []
        setUserTickets(tickets)

        // Calculate KPIs
        const totalTickets = tickets.length
        const openTickets = tickets.filter(t => 
          t.status === "new" || 
          t.status === "assigned" || 
          t.status === "in_progress" || 
          t.status === "on_hold"
        ).length
        const resolvedTickets = tickets.filter(t => 
          t.status === "resolved" || 
          t.status === "closed"
        ).length

        setKpiData({
          totalTickets,
          openTickets,
          resolvedTickets,
        })

        // Cache the data for 3 minutes
        ClientCache.set("user_home_data", {
          kpiData: {
            totalTickets,
            openTickets,
            resolvedTickets,
          },
          userTickets: tickets,
        }, 3 * 60 * 1000)
      } catch (err) {
        console.error("Error fetching user home data:", err)
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

  const getLastUpdatedTime = (updatedAt: Date | string) => {
    const updated = new Date(updatedAt).getTime()
    const now = new Date().getTime()
    const diffMinutes = Math.floor((now - updated) / (1000 * 60))

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
    ClientCache.remove("user_home_data")
    fetchData(false)
  }

  if (error) {
    return <ErrorDisplay message={error} onRetry={handleRetry} />
  }

  return (
    <main className="flex bg-background">
      <div className="flex-1 p-6">
        <header className="mb-6">
          <h1 className="text-3xl font-bold">My Support</h1>
          <p className="text-muted-foreground">Track your tickets and get help</p>
        </header>
        
        {/* Screen reader announcements for loading states */}
        <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
          {loading ? "Loading support tickets..." : "Support tickets loaded"}
        </div>

        <div className="space-y-6">
          {/* KPI Cards Section */}
          <section aria-labelledby="kpi-heading">
            <h2 id="kpi-heading" className="sr-only">Ticket Summary</h2>
            <div className="grid gap-4 md:grid-cols-3" role="list" aria-label="Ticket statistics">
            {loading ? (
              <KPICardsGridSkeleton count={3} />
            ) : (
              <>
                <Card role="listitem" aria-label="Total tickets metric">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
                    <TicketIcon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" aria-label={`${kpiData?.totalTickets || 0} total tickets`}>{kpiData?.totalTickets || 0}</div>
                    <p className="text-xs text-muted-foreground">All time</p>
                  </CardContent>
                </Card>

                <Card role="listitem" aria-label="Open tickets metric">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
                    <ClockIcon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" aria-label={`${kpiData?.openTickets || 0} open tickets`}>{kpiData?.openTickets || 0}</div>
                    <p className="text-xs text-muted-foreground">In progress</p>
                  </CardContent>
                </Card>

                <Card role="listitem" aria-label="Resolved tickets metric">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Resolved Tickets</CardTitle>
                    <CheckCircleIcon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" aria-label={`${kpiData?.resolvedTickets || 0} resolved tickets`}>{kpiData?.resolvedTickets || 0}</div>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </CardContent>
                </Card>
              </>
            )}
            </div>
          </section>

          {/* Create Ticket CTA */}
          <section aria-labelledby="create-ticket-heading">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h2 id="create-ticket-heading" className="text-lg font-semibold mb-1">Need Help?</h2>
                    <p className="text-sm text-muted-foreground">
                      Create a new support ticket and our team will assist you
                    </p>
                  </div>
                  <Link href="/user/create-ticket" aria-label="Navigate to create new support ticket">
                    <Button size="lg" className="w-full md:w-auto">
                      <PlusCircleIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                      Create New Ticket
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* My Tickets List */}
          <section aria-labelledby="my-tickets-heading">
            <Card>
              <CardHeader>
                <CardTitle id="my-tickets-heading">My Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <TicketListSkeleton count={5} />
                ) : userTickets.length === 0 ? (
                  <EmptyState
                    icon={<TicketIcon className="h-12 w-12 text-muted-foreground" />}
                    title="No tickets yet"
                    description="Create your first support ticket to get started"
                    action={{
                      label: "Create Ticket",
                      onClick: () => window.location.href = "/user/create-ticket"
                    }}
                  />
                ) : (
                  <div className="space-y-4">
                    {/* Open Tickets Section */}
                    {userTickets.filter(t => 
                      t.status === "new" || 
                      t.status === "assigned" || 
                      t.status === "in_progress" || 
                      t.status === "on_hold"
                    ).length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                          Open Tickets ({userTickets.filter(t => 
                            t.status === "new" || 
                            t.status === "assigned" || 
                            t.status === "in_progress" || 
                            t.status === "on_hold"
                          ).length})
                        </h3>
                        <div className="space-y-3" role="list" aria-label="Open tickets">
                          {userTickets
                            .filter(t => 
                              t.status === "new" || 
                              t.status === "assigned" || 
                              t.status === "in_progress" || 
                              t.status === "on_hold"
                            )
                            .slice(0, openTicketsLimit)
                            .map(ticket => (
                              <MemoizedTicketCard
                                key={ticket.id}
                                id={ticket.id}
                                subject={ticket.subject}
                                status={ticket.status}
                                priority={ticket.priority}
                                timeInfo={`Last updated ${getLastUpdatedTime(ticket.updatedAt)}`}
                                onNavigate={handleTicketNavigation}
                                getStatusBadgeColor={getStatusBadgeColor}
                                getPriorityBadgeColor={getPriorityBadgeColor}
                              />
                            ))}
                          {userTickets.filter(t => 
                            t.status === "new" || 
                            t.status === "assigned" || 
                            t.status === "in_progress" || 
                            t.status === "on_hold"
                          ).length > openTicketsLimit && (
                            <div className="mt-4 text-center">
                              <Button
                                variant="outline"
                                onClick={() => setOpenTicketsLimit(prev => prev + 10)}
                                aria-label="Load more open tickets"
                              >
                                Load More ({userTickets.filter(t => 
                                  t.status === "new" || 
                                  t.status === "assigned" || 
                                  t.status === "in_progress" || 
                                  t.status === "on_hold"
                                ).length - openTicketsLimit} remaining)
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Resolved/Closed Tickets Section */}
                    {userTickets.filter(t => 
                      t.status === "resolved" || 
                      t.status === "closed" || 
                      t.status === "cancelled"
                    ).length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                          Resolved Tickets ({userTickets.filter(t => 
                            t.status === "resolved" || 
                            t.status === "closed" || 
                            t.status === "cancelled"
                          ).length})
                        </h3>
                        <div className="space-y-3" role="list" aria-label="Resolved tickets">
                          {userTickets
                            .filter(t => 
                              t.status === "resolved" || 
                              t.status === "closed" || 
                              t.status === "cancelled"
                            )
                            .slice(0, resolvedTicketsLimit)
                            .map(ticket => (
                              <div key={ticket.id} className="opacity-75">
                                <MemoizedTicketCard
                                  id={ticket.id}
                                  subject={ticket.subject}
                                  status={ticket.status}
                                  priority={ticket.priority}
                                  timeInfo={`Last updated ${getLastUpdatedTime(ticket.updatedAt)}`}
                                  onNavigate={handleTicketNavigation}
                                  getStatusBadgeColor={getStatusBadgeColor}
                                  getPriorityBadgeColor={getPriorityBadgeColor}
                                />
                              </div>
                            ))}
                          {userTickets.filter(t => 
                            t.status === "resolved" || 
                            t.status === "closed" || 
                            t.status === "cancelled"
                          ).length > resolvedTicketsLimit && (
                            <div className="mt-4 text-center">
                              <Button
                                variant="outline"
                                onClick={() => setResolvedTicketsLimit(prev => prev + 10)}
                                aria-label="Load more resolved tickets"
                              >
                                Load More ({userTickets.filter(t => 
                                  t.status === "resolved" || 
                                  t.status === "closed" || 
                                  t.status === "cancelled"
                                ).length - resolvedTicketsLimit} remaining)
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Quick Links Section */}
          <section aria-labelledby="quick-links-heading">
            <Card>
              <CardHeader>
                <CardTitle id="quick-links-heading">Quick Links</CardTitle>
              </CardHeader>
              <CardContent>
                <nav aria-label="Quick action links">
                  <div className="grid gap-3 md:grid-cols-3">
                    <Link href="/user/create-ticket" aria-label="Navigate to create new ticket">
                      <Button className="w-full" variant="default">
                        <PlusCircleIcon className="h-4 w-4 mr-2" aria-hidden="true" />
                        Create Ticket
                      </Button>
                    </Link>
                    <Link href="/user/tickets" aria-label="Navigate to view all tickets">
                      <Button className="w-full" variant="outline">
                        <TicketIcon className="h-4 w-4 mr-2" aria-hidden="true" />
                        View All Tickets
                      </Button>
                    </Link>
                    <Link href="/user/reports" aria-label="Navigate to view reports">
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
        </div>
      </div>
    </main>
  )
}
