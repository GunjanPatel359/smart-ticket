"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { ArrowDownTrayIcon, CalendarIcon } from "@heroicons/react/24/outline"
import { getDetailedReport } from "@/actions/reports"

export const dynamic = 'force-dynamic'

export default function ReportsPage() {
    const [loading, setLoading] = useState(true)
    const [reportData, setReportData] = useState<any>(null)
    const [downloading, setDownloading] = useState(false)

    useEffect(() => {
        fetchReport()
    }, [])

    const fetchReport = async () => {
        setLoading(true)
        try {
            const result = await getDetailedReport()
            if (result.success && result.data) {
                setReportData(result.data)
            }
        } catch (error) {
            console.error("Error fetching report:", error)
        } finally {
            setLoading(false)
        }
    }

    const downloadReport = () => {
        if (!reportData) return

        setDownloading(true)
        try {
            const reportContent = generateReportText(reportData)
            const blob = new Blob([reportContent], { type: 'text/plain' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `IT-Support-Report-${new Date().toISOString().split('T')[0]}.txt`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
        } catch (error) {
            console.error("Error downloading report:", error)
        } finally {
            setDownloading(false)
        }
    }

    const generateReportText = (data: any) => {
        const startDate = new Date(data.period.start).toLocaleDateString()
        const endDate = new Date(data.period.end).toLocaleDateString()

        return `
================================================================================
                    IT SUPPORT DETAILED REPORT
================================================================================

Report Period: ${startDate} - ${endDate}
Generated: ${new Date().toLocaleString()}

================================================================================
                        TICKET STATISTICS
================================================================================

Total Tickets: ${data.tickets.total}

Status Breakdown:
  • New: ${data.tickets.byStatus.new}
  • Assigned: ${data.tickets.byStatus.assigned}
  • In Progress: ${data.tickets.byStatus.inProgress}
  • On Hold: ${data.tickets.byStatus.onHold}
  • Resolved: ${data.tickets.byStatus.resolved}
  • Closed: ${data.tickets.byStatus.closed}
  • Cancelled: ${data.tickets.byStatus.cancelled}

Priority Distribution:
  • Low: ${data.tickets.byPriority.low || 0}
  • Normal: ${data.tickets.byPriority.normal || 0}
  • High: ${data.tickets.byPriority.high || 0}
  • Critical: ${data.tickets.byPriority.critical || 0}

Special Metrics:
  • SLA Violated: ${data.tickets.slaViolated}
  • Reopened: ${data.tickets.reopened}
  • Escalated: ${data.tickets.escalated}
  • With Feedback: ${data.tickets.withFeedback}

================================================================================
                      PERFORMANCE METRICS
================================================================================

Resolution Rate: ${data.performance.resolutionRate}%
SLA Compliance: ${data.performance.slaCompliance}%

Average Resolution Time: ${data.performance.avgResolutionTimeHours} hours
Average First Response Time: ${data.performance.avgFirstResponseTimeHours} hours

Customer Satisfaction:
  • Average Rating: ${data.performance.avgSatisfactionRating || 'N/A'}${data.performance.avgSatisfactionRating ? '/5' : ''}
  • Total Responses: ${data.performance.satisfactionResponseCount}

================================================================================
                      TECHNICIAN STATISTICS
================================================================================

Total Technicians: ${data.technicians.total}
Active Technicians: ${data.technicians.active}
Average Workload: ${data.technicians.avgWorkload}%
Total Tickets Resolved: ${data.technicians.totalResolved}

Top Performers:
${data.technicians.topPerformers.map((tech: any, index: number) => 
  `  ${index + 1}. ${tech.name} (${tech.level})
     - Resolved: ${tech.resolvedTickets} tickets
     - Current: ${tech.currentTickets} tickets`
).join('\n')}

================================================================================
                        USER STATISTICS
================================================================================

Total Users: ${data.users.total}
Active Users (in period): ${data.users.activeInPeriod}

================================================================================
                      WORK LOG STATISTICS
================================================================================

Total Work Logs: ${data.workLogs.total}
Total Time Spent: ${data.workLogs.totalTimeSpentHours} hours
Average Time per Log: ${data.workLogs.avgTimePerLogMinutes} minutes

================================================================================
                        SKILLS OVERVIEW
================================================================================

Total Active Skills: ${data.skills.total}

================================================================================
                            END OF REPORT
================================================================================
        `.trim()
    }

    if (loading) {
        return (
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="grid gap-6 md:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-6 w-32" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-16" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        )
    }

    if (!reportData) {
        return (
            <div className="p-6">
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-center text-muted-foreground">Failed to load report data</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const { tickets, performance, technicians, users, workLogs, skills, period } = reportData

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Detailed Report</h1>
                    <p className="text-muted-foreground flex items-center gap-2 mt-1">
                        <CalendarIcon className="h-4 w-4" />
                        {new Date(period.start).toLocaleDateString()} - {new Date(period.end).toLocaleDateString()}
                    </p>
                </div>
                <Button onClick={downloadReport} disabled={downloading}>
                    <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                    {downloading ? "Downloading..." : "Download Report"}
                </Button>
            </div>

            {/* Ticket Statistics */}
            <Card>
                <CardHeader>
                    <CardTitle>Ticket Statistics</CardTitle>
                    <CardDescription>Comprehensive ticket metrics for the period</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Total Tickets</p>
                            <p className="text-3xl font-bold">{tickets.total}</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Resolved</p>
                            <p className="text-3xl font-bold text-green-600">{tickets.byStatus.resolved}</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">In Progress</p>
                            <p className="text-3xl font-bold text-blue-600">{tickets.byStatus.inProgress}</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Closed</p>
                            <p className="text-3xl font-bold text-gray-600">{tickets.byStatus.closed}</p>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t">
                        <h4 className="font-semibold mb-4">Status Breakdown</h4>
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                                <span className="text-sm">New</span>
                                <Badge variant="secondary">{tickets.byStatus.new}</Badge>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                                <span className="text-sm">Assigned</span>
                                <Badge variant="secondary">{tickets.byStatus.assigned}</Badge>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                                <span className="text-sm">On Hold</span>
                                <Badge variant="secondary">{tickets.byStatus.onHold}</Badge>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                                <span className="text-sm">Cancelled</span>
                                <Badge variant="secondary">{tickets.byStatus.cancelled}</Badge>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t">
                        <h4 className="font-semibold mb-4">Priority Distribution</h4>
                        <div className="grid gap-3 md:grid-cols-4">
                            <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                <span className="text-sm font-medium">Critical</span>
                                <span className="text-lg font-bold">{tickets.byPriority.critical || 0}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                <span className="text-sm font-medium">High</span>
                                <span className="text-lg font-bold">{tickets.byPriority.high || 0}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                <span className="text-sm font-medium">Normal</span>
                                <span className="text-lg font-bold">{tickets.byPriority.normal || 0}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <span className="text-sm font-medium">Low</span>
                                <span className="text-lg font-bold">{tickets.byPriority.low || 0}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t">
                        <h4 className="font-semibold mb-4">Special Metrics</h4>
                        <div className="grid gap-3 md:grid-cols-4">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">SLA Violated</p>
                                <p className="text-2xl font-bold text-red-600">{tickets.slaViolated}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Reopened</p>
                                <p className="text-2xl font-bold text-orange-600">{tickets.reopened}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Escalated</p>
                                <p className="text-2xl font-bold text-purple-600">{tickets.escalated}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">With Feedback</p>
                                <p className="text-2xl font-bold text-blue-600">{tickets.withFeedback}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Performance Metrics */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Performance Metrics</CardTitle>
                        <CardDescription>Key performance indicators</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div>
                                <p className="text-sm text-muted-foreground">Resolution Rate</p>
                                <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                                    {performance.resolutionRate}%
                                </p>
                            </div>
                            <Badge className="bg-green-600">
                                {performance.resolutionRate >= 90 ? "Excellent" : performance.resolutionRate >= 75 ? "Good" : "Needs Improvement"}
                            </Badge>
                        </div>

                        <div className="flex justify-between items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div>
                                <p className="text-sm text-muted-foreground">SLA Compliance</p>
                                <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                                    {performance.slaCompliance}%
                                </p>
                            </div>
                            <Badge className="bg-blue-600">
                                {performance.slaCompliance >= 95 ? "Excellent" : performance.slaCompliance >= 85 ? "Good" : "Needs Improvement"}
                            </Badge>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm">Avg Resolution Time</span>
                                <span className="font-semibold">{performance.avgResolutionTimeHours}h</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm">Avg First Response Time</span>
                                <span className="font-semibold">{performance.avgFirstResponseTimeHours}h</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Customer Satisfaction</CardTitle>
                        <CardDescription>Feedback and ratings</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {performance.avgSatisfactionRating ? (
                            <div className="space-y-4">
                                <div className="text-center p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                    <p className="text-sm text-muted-foreground mb-2">Average Rating</p>
                                    <p className="text-5xl font-bold text-purple-700 dark:text-purple-400">
                                        {performance.avgSatisfactionRating}
                                        <span className="text-2xl text-muted-foreground">/5</span>
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Based on {performance.satisfactionResponseCount} responses
                                    </p>
                                </div>
                                <div className="flex justify-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <span
                                            key={star}
                                            className={`text-2xl ${
                                                star <= Math.round(performance.avgSatisfactionRating)
                                                    ? "text-yellow-400"
                                                    : "text-gray-300"
                                            }`}
                                        >
                                            ★
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                No satisfaction ratings available for this period
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Technician Statistics */}
            <Card>
                <CardHeader>
                    <CardTitle>Technician Statistics</CardTitle>
                    <CardDescription>Team performance and workload</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6 md:grid-cols-4 mb-6">
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Total Technicians</p>
                            <p className="text-3xl font-bold">{technicians.total}</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Active</p>
                            <p className="text-3xl font-bold text-green-600">{technicians.active}</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Avg Workload</p>
                            <p className="text-3xl font-bold text-blue-600">{technicians.avgWorkload}%</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Total Resolved</p>
                            <p className="text-3xl font-bold text-purple-600">{technicians.totalResolved}</p>
                        </div>
                    </div>

                    <div className="pt-6 border-t">
                        <h4 className="font-semibold mb-4">Top Performers</h4>
                        <div className="space-y-3">
                            {technicians.topPerformers.map((tech: any, index: number) => (
                                <div key={tech.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="font-medium">{tech.name}</p>
                                            <p className="text-sm text-muted-foreground capitalize">{tech.level}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-green-600">{tech.resolvedTickets} resolved</p>
                                        <p className="text-sm text-muted-foreground">{tech.currentTickets} current</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Additional Statistics */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Users</CardTitle>
                        <CardDescription>User activity</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Total Users</span>
                                <span className="text-2xl font-bold">{users.total}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Active in Period</span>
                                <span className="text-2xl font-bold text-blue-600">{users.activeInPeriod}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Work Logs</CardTitle>
                        <CardDescription>Time tracking</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Total Logs</span>
                                <span className="text-2xl font-bold">{workLogs.total}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Total Time</span>
                                <span className="text-2xl font-bold text-purple-600">{workLogs.totalTimeSpentHours}h</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Avg per Log</span>
                                <span className="text-lg font-semibold">{workLogs.avgTimePerLogMinutes}m</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Skills</CardTitle>
                        <CardDescription>Available expertise</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Active Skills</span>
                                <span className="text-2xl font-bold">{skills.total}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
