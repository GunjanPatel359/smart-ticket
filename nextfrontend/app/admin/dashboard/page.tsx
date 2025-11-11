"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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

const comprehensiveTicketData = [
  {
    month: "Jan",
    tickets: 120,
    resolved: 110,
    sla: 92,
    critical: 8,
    high: 25,
    medium: 60,
    low: 27,
    avgResolution: 2.4,
    satisfaction: 4.2,
    escalations: 5,
  },
  {
    month: "Feb",
    tickets: 135,
    resolved: 125,
    sla: 94,
    critical: 12,
    high: 30,
    medium: 65,
    low: 28,
    avgResolution: 2.1,
    satisfaction: 4.4,
    escalations: 7,
  },
  {
    month: "Mar",
    tickets: 148,
    resolved: 140,
    sla: 89,
    critical: 15,
    high: 35,
    medium: 70,
    low: 28,
    avgResolution: 2.8,
    satisfaction: 4.1,
    escalations: 12,
  },
  {
    month: "Apr",
    tickets: 162,
    resolved: 155,
    sla: 96,
    critical: 10,
    high: 32,
    medium: 85,
    low: 35,
    avgResolution: 1.9,
    satisfaction: 4.6,
    escalations: 4,
  },
  {
    month: "May",
    tickets: 178,
    resolved: 170,
    sla: 95,
    critical: 18,
    high: 40,
    medium: 90,
    low: 30,
    avgResolution: 2.2,
    satisfaction: 4.5,
    escalations: 8,
  },
  {
    month: "Jun",
    tickets: 195,
    resolved: 185,
    sla: 97,
    critical: 14,
    high: 45,
    medium: 95,
    low: 41,
    avgResolution: 1.8,
    satisfaction: 4.7,
    escalations: 6,
  },
]

const statusDistribution = [
  { name: "New", value: 25, color: "#3b82f6", percentage: 12.8 },
  { name: "Assigned", value: 35, color: "#8b5cf6", percentage: 17.9 },
  { name: "In Progress", value: 45, color: "#f59e0b", percentage: 23.1 },
  { name: "On Hold", value: 15, color: "#ef4444", percentage: 7.7 },
  { name: "Resolved", value: 60, color: "#22c55e", percentage: 30.8 },
  { name: "Closed", value: 15, color: "#6b7280", percentage: 7.7 },
]

const categoryPerformance = [
  { category: "Hardware", tickets: 45, resolved: 42, avgTime: 2.1, satisfaction: 4.5, slaCompliance: 95 },
  { category: "Software", tickets: 38, resolved: 35, avgTime: 1.8, satisfaction: 4.6, slaCompliance: 92 },
  { category: "Network", tickets: 32, resolved: 30, avgTime: 3.2, satisfaction: 4.2, slaCompliance: 88 },
  { category: "Access", tickets: 28, resolved: 27, avgTime: 1.2, satisfaction: 4.8, slaCompliance: 98 },
  { category: "Email", tickets: 22, resolved: 20, avgTime: 2.5, satisfaction: 4.4, slaCompliance: 90 },
]

const workloadDistribution = [
  { name: "Underutilized (0-50%)", size: 3, color: "#22c55e", avgWorkload: 35 },
  { name: "Optimal (51-80%)", size: 8, color: "#3b82f6", avgWorkload: 68 },
  { name: "High (81-90%)", size: 6, color: "#f59e0b", avgWorkload: 85 },
  { name: "Overloaded (91-100%)", size: 4, color: "#ef4444", avgWorkload: 95 },
  { name: "Critical (>100%)", size: 2, color: "#7c2d12", avgWorkload: 105 },
]

const skillLevelDistribution = [
  {
    name: "Junior",
    value: 8,
    color: "#22c55e",
    percentage: 34.8,
    avgWorkload: 65,
    totalTicketsResolved: 120,
    avgRating: 4.2,
    availableCount: 6,
  },
  {
    name: "Mid",
    value: 7,
    color: "#3b82f6",
    percentage: 30.4,
    avgWorkload: 75,
    totalTicketsResolved: 180,
    avgRating: 4.5,
    availableCount: 5,
  },
  {
    name: "Senior",
    value: 6,
    color: "#f59e0b",
    percentage: 26.1,
    avgWorkload: 85,
    totalTicketsResolved: 240,
    avgRating: 4.7,
    availableCount: 4,
  },
  {
    name: "Expert",
    value: 2,
    color: "#8b5cf6",
    percentage: 8.7,
    avgWorkload: 92,
    totalTicketsResolved: 320,
    avgRating: 4.9,
    availableCount: 2,
  },
]

const availabilityDistribution = [
  { status: "Available", count: 12, color: "#22c55e" },
  { status: "Busy", count: 8, color: "#f59e0b" },
  { status: "In Meeting", count: 3, color: "#8b5cf6" },
  { status: "On Break", count: 2, color: "#6b7280" },
  { status: "Focus Mode", count: 1, color: "#ef4444" },
]

const realTimeMetrics = [
  { time: "09:00", open: 45, inProgress: 32, resolved: 18, closed: 8 },
  { time: "10:00", open: 48, inProgress: 35, resolved: 22, closed: 12 },
  { time: "11:00", open: 52, inProgress: 38, resolved: 28, closed: 15 },
  { time: "12:00", open: 49, inProgress: 42, resolved: 35, closed: 18 },
  { time: "13:00", open: 46, inProgress: 45, resolved: 42, closed: 22 },
  { time: "14:00", open: 44, inProgress: 48, resolved: 48, closed: 28 },
]

const slaPerformanceData = [
  { metric: "First Response", target: 2, actual: 1.8, compliance: 95 },
  { metric: "Resolution Time", target: 24, actual: 18.5, compliance: 92 },
  { metric: "Escalation Rate", target: 5, actual: 3.2, compliance: 98 },
  { metric: "Reopened Tickets", target: 10, actual: 7.8, compliance: 88 },
]

export default function ITSupportDashboard() {

  const renderDashboardContent = () => {
    return (
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
              <TicketIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-green-600">+12% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">SLA Compliance</CardTitle>
              <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">94.2%</div>
              <p className="text-xs text-green-600">Above target (90%)</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Technicians</CardTitle>
              <UserIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">3 on break</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
              <TrophyIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.6/5</div>
              <p className="text-xs text-green-600">+0.2 from last month</p>
            </CardContent>
          </Card>
        </div>

        {/* First Row - Ticket Trends and Status Distribution */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Ticket Volume Trend</CardTitle>
              <CardDescription>Monthly ticket creation and resolution</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={comprehensiveTicketData}>
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
                  <Bar dataKey="escalations" fill="#ef4444" name="Escalations" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status Distribution</CardTitle>
              <CardDescription>Current ticket status breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
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
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={comprehensiveTicketData}>
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SLA Performance Metrics</CardTitle>
              <CardDescription>Key performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={slaPerformanceData}>
                  <RadialBar dataKey="compliance" cornerRadius={10} fill="#22c55e" />
                  <Tooltip />
                </RadialBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Third Row - Real-time Metrics and Category Performance */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Ticket Flow</CardTitle>
              <CardDescription>Live ticket status transitions</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={realTimeMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="open" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="inProgress" stroke="#f59e0b" strokeWidth={2} />
                  <Line type="monotone" dataKey="resolved" stroke="#22c55e" strokeWidth={2} />
                  <Line type="monotone" dataKey="closed" stroke="#6b7280" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Category Performance</CardTitle>
              <CardDescription>Resolution rates by category</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="tickets" fill="#3b82f6" name="Total" />
                  <Bar dataKey="resolved" fill="#22c55e" name="Resolved" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Fourth Row - Satisfaction and Response Time */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Customer Satisfaction Trend</CardTitle>
              <CardDescription>Monthly satisfaction ratings</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={comprehensiveTicketData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[3.5, 5]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="satisfaction" stroke="#8b5cf6" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Average Resolution Time</CardTitle>
              <CardDescription>Response time trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={comprehensiveTicketData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="avgResolution" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Fifth Row - Workload Distribution and Skill Levels */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Technician Workload Distribution</CardTitle>
              <CardDescription>Capacity planning overview</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <Treemap data={workloadDistribution} dataKey="size" aspectRatio={4 / 3} stroke="#fff" fill="#8884d8">
                  <Tooltip />
                </Treemap>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Skill Level Distribution</CardTitle>
              <CardDescription>Team expertise breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={skillLevelDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percentage }) => `${name} ${percentage}%`}
                  >
                    {skillLevelDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Sixth Row - Availability and Escalation Funnel */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Technician Availability</CardTitle>
              <CardDescription>Current availability status</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={availabilityDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Escalation Funnel</CardTitle>
              <CardDescription>Ticket escalation flow</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <FunnelChart>
                  <Tooltip />
                  <Funnel
                    dataKey="value"
                    data={[
                      { name: "Total Tickets", value: 1234, fill: "#3b82f6" },
                      { name: "Escalated", value: 123, fill: "#f59e0b" },
                      { name: "Manager Review", value: 45, fill: "#ef4444" },
                      { name: "Executive", value: 12, fill: "#7c2d12" },
                    ]}
                  >
                    <LabelList position="center" fill="#fff" stroke="none" />
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
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
