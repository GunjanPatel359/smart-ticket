"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TrendingUp, TrendingDown, Clock, CheckCircle2, AlertCircle, BarChart3, Calendar, Info } from "lucide-react"
import { getUserReport } from "@/actions/reports"
import { toast } from "sonner"

interface TicketStats {
  total: number
  open: number
  inProgress: number
  resolved: number
  closed: number
  avgResolutionTime: number
  satisfactionScore: number
}

interface CategoryData {
  name: string
  count: number
  percentage: number
}

interface TrendData {
  period: string
  tickets: number
  resolved: number
}

interface PriorityData {
  name: string
  count: number
  percentage: number
}

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState("30")
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<TicketStats>({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
    avgResolutionTime: 0,
    satisfactionScore: 0
  })
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [priorities, setPriorities] = useState<PriorityData[]>([])
  const [trends, setTrends] = useState<TrendData[]>([])

  useEffect(() => {
    fetchReportData()
  }, [timeRange])

  const fetchReportData = async () => {
    setLoading(true)
    try {
      const result = await getUserReport(parseInt(timeRange))
      
      if (result.success && result.data) {
        setStats(result.data.stats)
        setCategories(result.data.categories)
        setPriorities(result.data.priorities || [])
        setTrends(result.data.trends)
      } else {
        toast.error(result.message || "Failed to load report data")
      }
    } catch (error) {
      console.error("Error fetching report:", error)
      toast.error("Failed to load report data")
    } finally {
      setLoading(false)
    }
  }

  const resolutionRate = stats.total > 0 ? Math.round(((stats.resolved + stats.closed) / stats.total) * 100) : 0
  const openRate = stats.total > 0 ? Math.round((stats.open / stats.total) * 100) : 0

  return (
    <div className="flex bg-background">
      <div className="flex-1 p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Reports & Analytics</h1>
            <p className="text-muted-foreground">Track your support performance and insights</p>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Timeline Indicator */}
        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
          <Calendar className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-sm text-blue-900 dark:text-blue-100">
            Showing tickets created in the <span className="font-semibold">
              {timeRange === "7" ? "last 7 days" : timeRange === "30" ? "last 30 days" : "last 90 days"}
            </span>
            {stats.total > 0 && (
              <span className="ml-1">
                ({stats.total} {stats.total === 1 ? "ticket" : "tickets"} found)
              </span>
            )}
          </AlertDescription>
        </Alert>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : stats.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.open} open, {stats.inProgress} in progress
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : `${resolutionRate}%`}</div>
              <Progress value={resolutionRate} className="h-2 mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Resolution Time</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : `${stats.avgResolutionTime.toFixed(1)}h`}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingDown className="h-3 w-3 text-green-600" />
                12% faster than last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Satisfaction Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : `${stats.satisfactionScore.toFixed(1)}/5`}
              </div>
              <Progress value={stats.satisfactionScore * 20} className="h-2 mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="categories">By Category</TabsTrigger>
            <TabsTrigger value="priorities">By Priority</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Ticket Status Distribution</CardTitle>
                  <CardDescription>Current status of all tickets</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Open</span>
                      <Badge variant="destructive">{stats.open}</Badge>
                    </div>
                    <Progress value={openRate} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">In Progress</span>
                      <Badge variant="default">{stats.inProgress}</Badge>
                    </div>
                    <Progress value={(stats.inProgress / stats.total) * 100} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Resolved</span>
                      <Badge variant="secondary">{stats.resolved}</Badge>
                    </div>
                    <Progress value={(stats.resolved / stats.total) * 100} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Closed</span>
                      <Badge variant="outline">{stats.closed}</Badge>
                    </div>
                    <Progress value={(stats.closed / stats.total) * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Insights</CardTitle>
                  <CardDescription>Key performance indicators</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium">High Resolution Rate</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">{resolutionRate}%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium">Fast Response Time</span>
                    </div>
                    <span className="text-lg font-bold text-blue-600">{stats.avgResolutionTime.toFixed(1)}h</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-yellow-600" />
                      <span className="text-sm font-medium">Customer Satisfaction</span>
                    </div>
                    <span className="text-lg font-bold text-yellow-600">{stats.satisfactionScore.toFixed(1)}/5</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      <span className="text-sm font-medium">Pending Tickets</span>
                    </div>
                    <span className="text-lg font-bold text-red-600">{stats.open}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tickets by Category</CardTitle>
                <CardDescription>Distribution across different support categories</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : categories.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No category data available</div>
                ) : (
                  <div className="space-y-4">
                    {categories.map((category, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{category.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">{category.count} tickets</span>
                            <Badge variant="outline">{category.percentage}%</Badge>
                          </div>
                        </div>
                        <Progress value={category.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="priorities" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tickets by Priority</CardTitle>
                <CardDescription>Distribution across priority levels</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : priorities.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No priority data available</div>
                ) : (
                  <div className="space-y-4">
                    {priorities.map((priority, index) => {
                      const getVariant = (name: string) => {
                        if (name === "Critical") return "destructive"
                        if (name === "High") return "default"
                        if (name === "Normal") return "secondary"
                        return "outline"
                      }
                      
                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{priority.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">{priority.count} tickets</span>
                              <Badge variant={getVariant(priority.name)}>{priority.percentage}%</Badge>
                            </div>
                          </div>
                          <Progress value={priority.percentage} className="h-2" />
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Ticket Trends</CardTitle>
                <CardDescription>Created vs Resolved tickets over time</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : trends.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No trend data available</div>
                ) : (
                  <div className="space-y-4">
                    {trends.map((trend, index) => {
                      const maxTickets = Math.max(...trends.map(t => Math.max(t.tickets, t.resolved)), 1)
                      return (
                        <div key={index} className="flex items-center gap-4">
                          <div className="w-20 text-sm text-muted-foreground">{trend.period}</div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <div className="flex-1">
                                <Progress value={(trend.tickets / maxTickets) * 100} className="h-2 bg-red-100" />
                              </div>
                              <span className="text-xs text-muted-foreground w-12">{trend.tickets} new</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1">
                                <Progress value={(trend.resolved / maxTickets) * 100} className="h-2 bg-green-100" />
                              </div>
                              <span className="text-xs text-muted-foreground w-12">{trend.resolved} done</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}