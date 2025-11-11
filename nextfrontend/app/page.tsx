"use client"
export default function app(){
  return (
    <>
    <div>
      hello
    </div>
    </>
  )
}
// "use client"

// import { useState } from "react"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Progress } from "@/components/ui/progress"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { Input } from "@/components/ui/input"
// import {
//   TicketIcon,
//   UserIcon,
//   ChartBarIcon,
//   ClockIcon,
//   CheckCircleIcon,
//   Cog6ToothIcon,
//   PlusIcon,
//   QueueListIcon,
//   TrophyIcon,
//   ChatBubbleLeftRightIcon,
//   Bars3Icon,
//   XMarkIcon,
//   CalendarIcon,
//   ArrowTrendingUpIcon,
//   BellIcon,
//   MagnifyingGlassIcon,
//   ChevronLeftIcon,
//   ChevronRightIcon,
// } from "@heroicons/react/24/outline"
// import {
//   LineChart,
//   Line,
//   AreaChart,
//   Area,
//   BarChart,
//   Bar,
//   PieChart,
//   Pie,
//   Cell,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   RadialBarChart,
//   RadialBar,
//   ComposedChart,
//   Treemap,
//   FunnelChart,
//   Funnel,
//   LabelList,
// } from "recharts"

// type UserRole = "user" | "admin" | "technician"

// const roleNavigation = {
//   user: [
//     { name: "Dashboard", href: "/dashboard", icon: ChartBarIcon },
//     { name: "Create Ticket", href: "/create-ticket", icon: PlusIcon },
//     { name: "My Tickets", href: "/my-tickets", icon: TicketIcon },
//     { name: "Knowledge Base", href: "/knowledge", icon: ChatBubbleLeftRightIcon },
//   ],
//   admin: [
//     { name: "Dashboard", href: "/dashboard", icon: ChartBarIcon },
//     { name: "Tickets", href: "/tickets", icon: TicketIcon },
//     { name: "Technicians", href: "/technicians", icon: UserIcon },
//     { name: "Analytics", href: "/analytics", icon: ArrowTrendingUpIcon },
//     { name: "Reports", href: "/reports", icon: CalendarIcon },
//     { name: "Settings", href: "/settings", icon: Cog6ToothIcon },
//   ],
//   technician: [
//     { name: "Dashboard", href: "/dashboard", icon: ChartBarIcon },
//     { name: "Ticket Queue", href: "/queue", icon: QueueListIcon },
//     { name: "Assigned", href: "/assigned", icon: TicketIcon },
//     { name: "Performance", href: "/performance", icon: TrophyIcon },
//   ],
// }

// const comprehensiveTicketData = [
//   {
//     month: "Jan",
//     tickets: 120,
//     resolved: 110,
//     sla: 92,
//     critical: 8,
//     high: 25,
//     medium: 60,
//     low: 27,
//     avgResolution: 2.4,
//     satisfaction: 4.2,
//     escalations: 5,
//   },
//   {
//     month: "Feb",
//     tickets: 135,
//     resolved: 125,
//     sla: 94,
//     critical: 12,
//     high: 30,
//     medium: 65,
//     low: 28,
//     avgResolution: 2.1,
//     satisfaction: 4.4,
//     escalations: 7,
//   },
//   {
//     month: "Mar",
//     tickets: 148,
//     resolved: 140,
//     sla: 89,
//     critical: 15,
//     high: 35,
//     medium: 70,
//     low: 28,
//     avgResolution: 2.8,
//     satisfaction: 4.1,
//     escalations: 12,
//   },
//   {
//     month: "Apr",
//     tickets: 162,
//     resolved: 155,
//     sla: 96,
//     critical: 10,
//     high: 32,
//     medium: 85,
//     low: 35,
//     avgResolution: 1.9,
//     satisfaction: 4.6,
//     escalations: 4,
//   },
//   {
//     month: "May",
//     tickets: 178,
//     resolved: 170,
//     sla: 95,
//     critical: 18,
//     high: 40,
//     medium: 90,
//     low: 30,
//     avgResolution: 2.2,
//     satisfaction: 4.5,
//     escalations: 8,
//   },
//   {
//     month: "Jun",
//     tickets: 195,
//     resolved: 185,
//     sla: 97,
//     critical: 14,
//     high: 45,
//     medium: 95,
//     low: 41,
//     avgResolution: 1.8,
//     satisfaction: 4.7,
//     escalations: 6,
//   },
// ]

// const priorityDistribution = [
//   { name: "Critical", value: 15, color: "#ef4444", percentage: 7.7 },
//   { name: "High", value: 45, color: "#f97316", percentage: 23.1 },
//   { name: "Medium", value: 95, color: "#eab308", percentage: 48.7 },
//   { name: "Low", value: 40, color: "#22c55e", percentage: 20.5 },
// ]

// const statusDistribution = [
//   { name: "New", value: 25, color: "#3b82f6", percentage: 12.8 },
//   { name: "Assigned", value: 35, color: "#8b5cf6", percentage: 17.9 },
//   { name: "In Progress", value: 45, color: "#f59e0b", percentage: 23.1 },
//   { name: "On Hold", value: 15, color: "#ef4444", percentage: 7.7 },
//   { name: "Resolved", value: 60, color: "#22c55e", percentage: 30.8 },
//   { name: "Closed", value: 15, color: "#6b7280", percentage: 7.7 },
// ]

// const technicianData = [
//   {
//     id: 1,
//     name: "John Doe",
//     email: "john@company.com",
//     skillLevel: "senior",
//     workload: 85,
//     availabilityStatus: "available",
//     assignedTickets: 12,
//     resolvedToday: 8,
//     avgRating: 4.8,
//     specialization: "Network Infrastructure",
//     skills: ["Networking", "Security", "Hardware"],
//   },
//   {
//     id: 2,
//     name: "Jane Smith",
//     email: "jane@company.com",
//     skillLevel: "expert",
//     workload: 92,
//     availabilityStatus: "busy",
//     assignedTickets: 15,
//     resolvedToday: 11,
//     avgRating: 4.9,
//     specialization: "Software Development",
//     skills: ["Programming", "Database", "Cloud"],
//   },
//   {
//     id: 3,
//     name: "Mike Johnson",
//     email: "mike@company.com",
//     skillLevel: "mid",
//     workload: 78,
//     availabilityStatus: "available",
//     assignedTickets: 10,
//     resolvedToday: 6,
//     avgRating: 4.6,
//     specialization: "System Administration",
//     skills: ["Windows", "Linux", "Virtualization"],
//   },
//   {
//     id: 4,
//     name: "Sarah Wilson",
//     email: "sarah@company.com",
//     skillLevel: "senior",
//     workload: 88,
//     availabilityStatus: "in_meeting",
//     assignedTickets: 13,
//     resolvedToday: 9,
//     avgRating: 4.7,
//     specialization: "Cybersecurity",
//     skills: ["Security", "Compliance", "Forensics"],
//   },
//   {
//     id: 5,
//     name: "David Brown",
//     email: "david@company.com",
//     skillLevel: "junior",
//     workload: 65,
//     availabilityStatus: "available",
//     assignedTickets: 8,
//     resolvedToday: 5,
//     avgRating: 4.4,
//     specialization: "Help Desk",
//     skills: ["Support", "Documentation", "Training"],
//   },
// ]

// const mockTickets = [
//   {
//     id: "TK-001",
//     subject: "Email server down",
//     description: "Exchange server not responding",
//     priority: "critical",
//     status: "in_progress",
//     impact: "high",
//     urgency: "critical",
//     requester: "Alice Johnson",
//     assignedTechnician: "John Doe",
//     created: "2 hours ago",
//     slaViolated: false,
//     satisfactionRating: null,
//     category: "Infrastructure",
//   },
//   {
//     id: "TK-002",
//     subject: "Password reset request",
//     description: "User unable to access account",
//     priority: "low",
//     status: "resolved",
//     impact: "low",
//     urgency: "normal",
//     requester: "Bob Smith",
//     assignedTechnician: "Jane Smith",
//     created: "4 hours ago",
//     slaViolated: false,
//     satisfactionRating: 5,
//     category: "Access Management",
//   },
//   {
//     id: "TK-003",
//     subject: "Software installation",
//     description: "Need Adobe Creative Suite installed",
//     priority: "normal",
//     status: "assigned",
//     impact: "medium",
//     urgency: "normal",
//     requester: "Carol Davis",
//     assignedTechnician: "Mike Johnson",
//     created: "1 day ago",
//     slaViolated: false,
//     satisfactionRating: null,
//     category: "Software",
//   },
//   {
//     id: "TK-004",
//     subject: "Network connectivity issue",
//     description: "Unable to connect to company VPN",
//     priority: "high",
//     status: "new",
//     impact: "high",
//     urgency: "high",
//     requester: "David Wilson",
//     assignedTechnician: null,
//     created: "3 hours ago",
//     slaViolated: false,
//     satisfactionRating: null,
//     category: "Network",
//   },
//   {
//     id: "TK-005",
//     subject: "Printer not working",
//     description: "Office printer showing error messages",
//     priority: "normal",
//     status: "on_hold",
//     impact: "medium",
//     urgency: "normal",
//     requester: "Eve Martinez",
//     assignedTechnician: "Sarah Wilson",
//     created: "6 hours ago",
//     slaViolated: true,
//     satisfactionRating: null,
//     category: "Hardware",
//   },
// ]

// const categoryPerformance = [
//   { category: "Hardware", tickets: 45, resolved: 42, avgTime: 2.1, satisfaction: 4.5, slaCompliance: 95 },
//   { category: "Software", tickets: 38, resolved: 35, avgTime: 1.8, satisfaction: 4.6, slaCompliance: 92 },
//   { category: "Network", tickets: 32, resolved: 30, avgTime: 3.2, satisfaction: 4.2, slaCompliance: 88 },
//   { category: "Access", tickets: 28, resolved: 27, avgTime: 1.2, satisfaction: 4.8, slaCompliance: 98 },
//   { category: "Email", tickets: 22, resolved: 20, avgTime: 2.5, satisfaction: 4.4, slaCompliance: 90 },
// ]

// const workloadDistribution = [
//   { name: "Underutilized (0-50%)", size: 3, color: "#22c55e", avgWorkload: 35 },
//   { name: "Optimal (51-80%)", size: 8, color: "#3b82f6", avgWorkload: 68 },
//   { name: "High (81-90%)", size: 6, color: "#f59e0b", avgWorkload: 85 },
//   { name: "Overloaded (91-100%)", size: 4, color: "#ef4444", avgWorkload: 95 },
//   { name: "Critical (>100%)", size: 2, color: "#7c2d12", avgWorkload: 105 },
// ]

// const skillLevelDistribution = [
//   {
//     name: "Junior",
//     value: 8,
//     color: "#22c55e",
//     percentage: 34.8,
//     avgWorkload: 65,
//     totalTicketsResolved: 120,
//     avgRating: 4.2,
//     availableCount: 6,
//   },
//   {
//     name: "Mid",
//     value: 7,
//     color: "#3b82f6",
//     percentage: 30.4,
//     avgWorkload: 75,
//     totalTicketsResolved: 180,
//     avgRating: 4.5,
//     availableCount: 5,
//   },
//   {
//     name: "Senior",
//     value: 6,
//     color: "#f59e0b",
//     percentage: 26.1,
//     avgWorkload: 85,
//     totalTicketsResolved: 240,
//     avgRating: 4.7,
//     availableCount: 4,
//   },
//   {
//     name: "Expert",
//     value: 2,
//     color: "#8b5cf6",
//     percentage: 8.7,
//     avgWorkload: 92,
//     totalTicketsResolved: 320,
//     avgRating: 4.9,
//     availableCount: 2,
//   },
// ]

// const availabilityDistribution = [
//   { status: "Available", count: 12, color: "#22c55e" },
//   { status: "Busy", count: 8, color: "#f59e0b" },
//   { status: "In Meeting", count: 3, color: "#8b5cf6" },
//   { status: "On Break", count: 2, color: "#6b7280" },
//   { status: "Focus Mode", count: 1, color: "#ef4444" },
// ]

// const realTimeMetrics = [
//   { time: "09:00", open: 45, inProgress: 32, resolved: 18, closed: 8 },
//   { time: "10:00", open: 48, inProgress: 35, resolved: 22, closed: 12 },
//   { time: "11:00", open: 52, inProgress: 38, resolved: 28, closed: 15 },
//   { time: "12:00", open: 49, inProgress: 42, resolved: 35, closed: 18 },
//   { time: "13:00", open: 46, inProgress: 45, resolved: 42, closed: 22 },
//   { time: "14:00", open: 44, inProgress: 48, resolved: 48, closed: 28 },
// ]

// const slaPerformanceData = [
//   { metric: "First Response", target: 2, actual: 1.8, compliance: 95 },
//   { metric: "Resolution Time", target: 24, actual: 18.5, compliance: 92 },
//   { metric: "Escalation Rate", target: 5, actual: 3.2, compliance: 98 },
//   { metric: "Reopened Tickets", target: 10, actual: 7.8, compliance: 88 },
// ]

// const getPriorityColor = (priority: string) => {
//   switch (priority) {
//     case "critical":
//       return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
//     case "high":
//       return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
//     case "normal":
//       return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
//     case "low":
//       return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
//     default:
//       return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
//   }
// }

// const getStatusColor = (status: string) => {
//   switch (status) {
//     case "new":
//       return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
//     case "assigned":
//       return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
//     case "in_progress":
//       return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
//     case "on_hold":
//       return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
//     case "resolved":
//       return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
//     case "closed":
//       return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
//     default:
//       return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
//   }
// }

// const getAvailabilityColor = (status: string) => {
//   switch (status) {
//     case "available":
//       return "bg-green-100 text-green-800"
//     case "busy":
//       return "bg-yellow-100 text-yellow-800"
//     case "in_meeting":
//       return "bg-purple-100 text-purple-800"
//     case "on_break":
//       return "bg-gray-100 text-gray-800"
//     case "focus_mode":
//       return "bg-red-100 text-red-800"
//     default:
//       return "bg-gray-100 text-gray-800"
//   }
// }

// export default function ITSupportDashboard() {
//   const [currentRole, setCurrentRole] = useState<UserRole>("admin")
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
//   const [showRoleSwitcher, setShowRoleSwitcher] = useState(false)
//   const [currentPage, setCurrentPage] = useState(1)
//   const [searchTerm, setSearchTerm] = useState("")
//   const itemsPerPage = 10
//   const navigation = roleNavigation[currentRole]

//   // Mock data for charts and tables that were missing
//   const ticketTrendData = [
//     { month: "Jan", tickets: 120, resolved: 110 },
//     { month: "Feb", tickets: 135, resolved: 125 },
//     { month: "Mar", tickets: 148, resolved: 140 },
//     { month: "Apr", tickets: 162, resolved: 155 },
//     { month: "May", tickets: 178, resolved: 170 },
//     { month: "Jun", tickets: 195, resolved: 185 },
//   ]

//   const performanceData = [
//     { name: "SLA Compliance", value: 98 },
//     { name: "Avg Resolution Time", value: 85 },
//     { name: "Customer Satisfaction", value: 92 },
//     { name: "Tickets Resolved", value: 95 },
//   ]

//   const categoryData = [
//     { category: "Hardware", tickets: 45 },
//     { category: "Software", tickets: 38 },
//     { category: "Network", tickets: 32 },
//     { category: "Access", tickets: 28 },
//     { category: "Email", tickets: 22 },
//   ]

//   const renderAdminDashboard = () => (
//     <Tabs defaultValue="dashboard" className="space-y-6">
//       <TabsList className="grid w-full grid-cols-4">
//         <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
//         <TabsTrigger value="tickets">Tickets</TabsTrigger>
//         <TabsTrigger value="technicians">Technicians</TabsTrigger>
//         <TabsTrigger value="reports">Monthly Report</TabsTrigger>
//       </TabsList>

//       {/* Dashboard Tab with 15+ Charts */}
//       <TabsContent value="dashboard" className="space-y-6">
//         {/* KPI Cards */}
//         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
//               <TicketIcon className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">1,234</div>
//               <p className="text-xs text-green-600">+12% from last month</p>
//             </CardContent>
//           </Card>
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">SLA Compliance</CardTitle>
//               <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">94.2%</div>
//               <p className="text-xs text-green-600">Above target (90%)</p>
//             </CardContent>
//           </Card>
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Active Technicians</CardTitle>
//               <UserIcon className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">24</div>
//               <p className="text-xs text-muted-foreground">3 on break</p>
//             </CardContent>
//           </Card>
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
//               <TrophyIcon className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">4.6/5</div>
//               <p className="text-xs text-green-600">+0.2 from last month</p>
//             </CardContent>
//           </Card>
//         </div>

//         {/* First Row - Ticket Trends and Status Distribution */}
//         <div className="grid gap-4 md:grid-cols-2">
//           <Card>
//             <CardHeader>
//               <CardTitle>Ticket Volume Trend</CardTitle>
//               <CardDescription>Monthly ticket creation and resolution</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <ResponsiveContainer width="100%" height={300}>
//                 <ComposedChart data={comprehensiveTicketData}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="month" />
//                   <YAxis />
//                   <Tooltip />
//                   <Legend />
//                   <Area
//                     type="monotone"
//                     dataKey="tickets"
//                     fill="#3b82f6"
//                     fillOpacity={0.3}
//                     stroke="#3b82f6"
//                     name="Created"
//                   />
//                   <Line type="monotone" dataKey="resolved" stroke="#22c55e" strokeWidth={2} name="Resolved" />
//                   <Bar dataKey="escalations" fill="#ef4444" name="Escalations" />
//                 </ComposedChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle>Status Distribution</CardTitle>
//               <CardDescription>Current ticket status breakdown</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <ResponsiveContainer width="100%" height={300}>
//                 <PieChart>
//                   <Pie
//                     data={statusDistribution}
//                     cx="50%"
//                     cy="50%"
//                     innerRadius={60}
//                     outerRadius={100}
//                     paddingAngle={5}
//                     dataKey="value"
//                   >
//                     {statusDistribution.map((entry, index) => (
//                       <Cell key={`cell-${index}`} fill={entry.color} />
//                     ))}
//                   </Pie>
//                   <Tooltip />
//                   <Legend />
//                 </PieChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Second Row - Priority and SLA Performance */}
//         <div className="grid gap-4 md:grid-cols-2">
//           <Card>
//             <CardHeader>
//               <CardTitle>Priority Distribution</CardTitle>
//               <CardDescription>Ticket priorities over time</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <ResponsiveContainer width="100%" height={300}>
//                 <AreaChart data={comprehensiveTicketData}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="month" />
//                   <YAxis />
//                   <Tooltip />
//                   <Legend />
//                   <Area type="monotone" dataKey="critical" stackId="1" stroke="#ef4444" fill="#ef4444" />
//                   <Area type="monotone" dataKey="high" stackId="1" stroke="#f97316" fill="#f97316" />
//                   <Area type="monotone" dataKey="medium" stackId="1" stroke="#eab308" fill="#eab308" />
//                   <Area type="monotone" dataKey="low" stackId="1" stroke="#22c55e" fill="#22c55e" />
//                 </AreaChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle>SLA Performance Metrics</CardTitle>
//               <CardDescription>Key performance indicators</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <ResponsiveContainer width="100%" height={300}>
//                 <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={slaPerformanceData}>
//                   <RadialBar dataKey="compliance" cornerRadius={10} fill="#22c55e" />
//                   <Tooltip />
//                 </RadialBarChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Third Row - Real-time Metrics and Category Performance */}
//         <div className="grid gap-4 md:grid-cols-2">
//           <Card>
//             <CardHeader>
//               <CardTitle>Real-time Ticket Flow</CardTitle>
//               <CardDescription>Live ticket status transitions</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <ResponsiveContainer width="100%" height={300}>
//                 <LineChart data={realTimeMetrics}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="time" />
//                   <YAxis />
//                   <Tooltip />
//                   <Legend />
//                   <Line type="monotone" dataKey="open" stroke="#3b82f6" strokeWidth={2} />
//                   <Line type="monotone" dataKey="inProgress" stroke="#f59e0b" strokeWidth={2} />
//                   <Line type="monotone" dataKey="resolved" stroke="#22c55e" strokeWidth={2} />
//                   <Line type="monotone" dataKey="closed" stroke="#6b7280" strokeWidth={2} />
//                 </LineChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle>Category Performance</CardTitle>
//               <CardDescription>Resolution rates by category</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <ResponsiveContainer width="100%" height={300}>
//                 <BarChart data={categoryPerformance}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="category" />
//                   <YAxis />
//                   <Tooltip />
//                   <Legend />
//                   <Bar dataKey="tickets" fill="#3b82f6" name="Total" />
//                   <Bar dataKey="resolved" fill="#22c55e" name="Resolved" />
//                 </BarChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Fourth Row - Satisfaction and Response Time */}
//         <div className="grid gap-4 md:grid-cols-2">
//           <Card>
//             <CardHeader>
//               <CardTitle>Customer Satisfaction Trend</CardTitle>
//               <CardDescription>Monthly satisfaction ratings</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <ResponsiveContainer width="100%" height={300}>
//                 <LineChart data={comprehensiveTicketData}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="month" />
//                   <YAxis domain={[3.5, 5]} />
//                   <Tooltip />
//                   <Line type="monotone" dataKey="satisfaction" stroke="#8b5cf6" strokeWidth={3} />
//                 </LineChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle>Average Resolution Time</CardTitle>
//               <CardDescription>Response time trends</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <ResponsiveContainer width="100%" height={300}>
//                 <AreaChart data={comprehensiveTicketData}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="month" />
//                   <YAxis />
//                   <Tooltip />
//                   <Area type="monotone" dataKey="avgResolution" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
//                 </AreaChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Fifth Row - Workload Distribution and Skill Levels */}
//         <div className="grid gap-4 md:grid-cols-2">
//           <Card>
//             <CardHeader>
//               <CardTitle>Technician Workload Distribution</CardTitle>
//               <CardDescription>Capacity planning overview</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <ResponsiveContainer width="100%" height={300}>
//                 <Treemap data={workloadDistribution} dataKey="size" aspectRatio={4 / 3} stroke="#fff" fill="#8884d8">
//                   <Tooltip />
//                 </Treemap>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle>Skill Level Distribution</CardTitle>
//               <CardDescription>Team expertise breakdown</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <ResponsiveContainer width="100%" height={300}>
//                 <PieChart>
//                   <Pie
//                     data={skillLevelDistribution}
//                     cx="50%"
//                     cy="50%"
//                     outerRadius={100}
//                     dataKey="value"
//                     label={({ name, percentage }) => `${name} ${percentage}%`}
//                   >
//                     {skillLevelDistribution.map((entry, index) => (
//                       <Cell key={`cell-${index}`} fill={entry.color} />
//                     ))}
//                   </Pie>
//                   <Tooltip />
//                 </PieChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Sixth Row - Availability and Escalation Funnel */}
//         <div className="grid gap-4 md:grid-cols-2">
//           <Card>
//             <CardHeader>
//               <CardTitle>Technician Availability</CardTitle>
//               <CardDescription>Current availability status</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <ResponsiveContainer width="100%" height={300}>
//                 <BarChart data={availabilityDistribution}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="status" />
//                   <YAxis />
//                   <Tooltip />
//                   <Bar dataKey="count" fill="#3b82f6" />
//                 </BarChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle>Escalation Funnel</CardTitle>
//               <CardDescription>Ticket escalation flow</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <ResponsiveContainer width="100%" height={300}>
//                 <FunnelChart>
//                   <Tooltip />
//                   <Funnel
//                     dataKey="value"
//                     data={[
//                       { name: "Total Tickets", value: 1234, fill: "#3b82f6" },
//                       { name: "Escalated", value: 123, fill: "#f59e0b" },
//                       { name: "Manager Review", value: 45, fill: "#ef4444" },
//                       { name: "Executive", value: 12, fill: "#7c2d12" },
//                     ]}
//                   >
//                     <LabelList position="center" fill="#fff" stroke="none" />
//                   </Funnel>
//                 </FunnelChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>
//         </div>
//       </TabsContent>

//       {/* Tickets Tab with Detailed Table */}
//       <TabsContent value="tickets" className="space-y-6">
//         <Card>
//           <CardHeader>
//             <div className="flex items-center justify-between">
//               <div>
//                 <CardTitle>All Tickets</CardTitle>
//                 <CardDescription>Comprehensive ticket management</CardDescription>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <div className="relative">
//                   <MagnifyingGlassIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
//                   <Input
//                     placeholder="Search tickets..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className="pl-8 w-64"
//                   />
//                 </div>
//                 <Button>
//                   <PlusIcon className="h-4 w-4 mr-2" />
//                   New Ticket
//                 </Button>
//               </div>
//             </div>
//           </CardHeader>
//           <CardContent>
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>ID</TableHead>
//                   <TableHead>Subject</TableHead>
//                   <TableHead>Priority</TableHead>
//                   <TableHead>Status</TableHead>
//                   <TableHead>Requester</TableHead>
//                   <TableHead>Assigned To</TableHead>
//                   <TableHead>Created</TableHead>
//                   <TableHead>SLA</TableHead>
//                   <TableHead>Rating</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {mockTickets.map((ticket) => (
//                   <TableRow key={ticket.id}>
//                     <TableCell className="font-medium">{ticket.id}</TableCell>
//                     <TableCell>
//                       <div>
//                         <p className="font-medium">{ticket.subject}</p>
//                         <p className="text-sm text-muted-foreground">{ticket.description}</p>
//                       </div>
//                     </TableCell>
//                     <TableCell>
//                       <Badge className={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
//                     </TableCell>
//                     <TableCell>
//                       <Badge className={getStatusColor(ticket.status)}>{ticket.status.replace("_", " ")}</Badge>
//                     </TableCell>
//                     <TableCell>{ticket.requester}</TableCell>
//                     <TableCell>{ticket.assignedTechnician || "Unassigned"}</TableCell>
//                     <TableCell>{ticket.created}</TableCell>
//                     <TableCell>
//                       {ticket.slaViolated ? (
//                         <Badge className="bg-red-100 text-red-800">Violated</Badge>
//                       ) : (
//                         <Badge className="bg-green-100 text-green-800">On Track</Badge>
//                       )}
//                     </TableCell>
//                     <TableCell>
//                       {ticket.satisfactionRating ? (
//                         <div className="flex items-center">
//                           <span>{ticket.satisfactionRating}/5</span>
//                           <span className="ml-1 text-yellow-500">★</span>
//                         </div>
//                       ) : (
//                         <span className="text-muted-foreground">-</span>
//                       )}
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>

//             {/* Pagination */}
//             <div className="flex items-center justify-between mt-4">
//               <p className="text-sm text-muted-foreground">
//                 Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
//                 {Math.min(currentPage * itemsPerPage, mockTickets.length)} of {mockTickets.length} tickets
//               </p>
//               <div className="flex items-center space-x-2">
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
//                   disabled={currentPage === 1}
//                 >
//                   <ChevronLeftIcon className="h-4 w-4" />
//                   Previous
//                 </Button>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => setCurrentPage(currentPage + 1)}
//                   disabled={currentPage * itemsPerPage >= mockTickets.length}
//                 >
//                   Next
//                   <ChevronRightIcon className="h-4 w-4" />
//                 </Button>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </TabsContent>

//       {/* Technicians Tab with Detailed Table */}
//       <TabsContent value="technicians" className="space-y-6">
//         <Card>
//           <CardHeader>
//             <div className="flex items-center justify-between">
//               <div>
//                 <CardTitle>Technician Management</CardTitle>
//                 <CardDescription>Team performance and workload overview</CardDescription>
//               </div>
//               <Button>
//                 <PlusIcon className="h-4 w-4 mr-2" />
//                 Add Technician
//               </Button>
//             </div>
//           </CardHeader>
//           <CardContent>
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Name</TableHead>
//                   <TableHead>Skill Level</TableHead>
//                   <TableHead>Workload</TableHead>
//                   <TableHead>Status</TableHead>
//                   <TableHead>Assigned</TableHead>
//                   <TableHead>Resolved Today</TableHead>
//                   <TableHead>Rating</TableHead>
//                   <TableHead>Specialization</TableHead>
//                   <TableHead>Skills</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {technicianData.map((tech) => (
//                   <TableRow key={tech.id}>
//                     <TableCell>
//                       <div className="flex items-center space-x-3">
//                         <Avatar className="h-8 w-8">
//                           <AvatarFallback>
//                             {tech.name
//                               .split(" ")
//                               .map((n) => n[0])
//                               .join("")}
//                           </AvatarFallback>
//                         </Avatar>
//                         <div>
//                           <p className="font-medium">{tech.name}</p>
//                           <p className="text-sm text-muted-foreground">{tech.email}</p>
//                         </div>
//                       </div>
//                     </TableCell>
//                     <TableCell>
//                       <Badge variant="outline" className="capitalize">
//                         {tech.skillLevel}
//                       </Badge>
//                     </TableCell>
//                     <TableCell>
//                       <div className="flex items-center space-x-2">
//                         <Progress value={tech.workload} className="w-16" />
//                         <span className="text-sm">{tech.workload}%</span>
//                       </div>
//                     </TableCell>
//                     <TableCell>
//                       <Badge className={getAvailabilityColor(tech.availabilityStatus)}>
//                         {tech.availabilityStatus.replace("_", " ")}
//                       </Badge>
//                     </TableCell>
//                     <TableCell>{tech.assignedTickets}</TableCell>
//                     <TableCell>{tech.resolvedToday}</TableCell>
//                     <TableCell>
//                       <div className="flex items-center">
//                         <span>{tech.avgRating}/5</span>
//                         <span className="ml-1 text-yellow-500">★</span>
//                       </div>
//                     </TableCell>
//                     <TableCell>{tech.specialization}</TableCell>
//                     <TableCell>
//                       <div className="flex flex-wrap gap-1">
//                         {tech.skills.slice(0, 2).map((skill) => (
//                           <Badge key={skill} variant="secondary" className="text-xs">
//                             {skill}
//                           </Badge>
//                         ))}
//                         {tech.skills.length > 2 && (
//                           <Badge variant="secondary" className="text-xs">
//                             +{tech.skills.length - 2}
//                           </Badge>
//                         )}
//                       </div>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </CardContent>
//         </Card>
//       </TabsContent>

//       {/* Monthly Report Tab */}
//       <TabsContent value="reports" className="space-y-6">
//         <Card>
//           <CardHeader>
//             <CardTitle>Monthly Executive Report</CardTitle>
//             <CardDescription>Comprehensive overview of IT support operations</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="grid gap-6 md:grid-cols-2">
//               <div className="space-y-4">
//                 <h4 className="font-semibold">Key Performance Indicators</h4>
//                 <div className="space-y-3">
//                   <div className="flex justify-between">
//                     <span>Total Tickets Processed</span>
//                     <span className="font-bold">1,234</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span>Resolution Rate</span>
//                     <span className="font-bold">94.2%</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span>Avg First Response Time</span>
//                     <span className="font-bold">1.8h</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span>Customer Satisfaction</span>
//                     <span className="font-bold">4.6/5</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span>Cost per Ticket</span>
//                     <span className="font-bold">$42</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span>Team Utilization</span>
//                     <span className="font-bold">78%</span>
//                   </div>
//                 </div>
//               </div>
//               <div className="space-y-4">
//                 <h4 className="font-semibold">Trends & Insights</h4>
//                 <div className="space-y-2">
//                   <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
//                     <p className="text-sm font-medium text-green-800 dark:text-green-200">
//                       📈 12% increase in ticket volume
//                     </p>
//                     <p className="text-xs text-green-600 dark:text-green-400">Higher than seasonal average</p>
//                   </div>
//                   <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
//                     <p className="text-sm font-medium text-blue-800 dark:text-blue-200">⚡ 15% faster response times</p>
//                     <p className="text-xs text-blue-600 dark:text-blue-400">New AI routing system impact</p>
//                   </div>
//                   <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
//                     <p className="text-sm font-medium text-purple-800 dark:text-purple-200">🎯 98% SLA compliance</p>
//                     <p className="text-xs text-purple-600 dark:text-purple-400">Exceeding target by 8%</p>
//                   </div>
//                   <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
//                     <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
//                       👥 3 new team members onboarded
//                     </p>
//                     <p className="text-xs text-orange-600 dark:text-orange-400">Expanding capacity for Q4</p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </TabsContent>
//     </Tabs>
//   )

//   const renderDashboardContent = () => {
//     switch (currentRole) {
//       case "user":
//         return (
//           <Tabs defaultValue="overview" className="space-y-6">
//             <TabsList className="grid w-full grid-cols-3">
//               <TabsTrigger value="overview">Overview</TabsTrigger>
//               <TabsTrigger value="tickets">My Tickets</TabsTrigger>
//               <TabsTrigger value="reports">Monthly Report</TabsTrigger>
//             </TabsList>

//             <TabsContent value="overview" className="space-y-6">
//               <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//                 <Card>
//                   <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                     <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
//                     <TicketIcon className="h-4 w-4 text-muted-foreground" />
//                   </CardHeader>
//                   <CardContent>
//                     <div className="text-2xl font-bold">3</div>
//                     <p className="text-xs text-muted-foreground">2 high priority</p>
//                   </CardContent>
//                 </Card>
//                 <Card>
//                   <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                     <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
//                     <ClockIcon className="h-4 w-4 text-muted-foreground" />
//                   </CardHeader>
//                   <CardContent>
//                     <div className="text-2xl font-bold">2.4h</div>
//                     <p className="text-xs text-green-600">15% faster</p>
//                   </CardContent>
//                 </Card>
//                 <Card>
//                   <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                     <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
//                     <TrophyIcon className="h-4 w-4 text-muted-foreground" />
//                   </CardHeader>
//                   <CardContent>
//                     <div className="text-2xl font-bold">4.8/5</div>
//                     <p className="text-xs text-muted-foreground">Recent tickets</p>
//                   </CardContent>
//                 </Card>
//                 <Card>
//                   <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                     <CardTitle className="text-sm font-medium">Resolved</CardTitle>
//                     <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />
//                   </CardHeader>
//                   <CardContent>
//                     <div className="text-2xl font-bold">24</div>
//                     <p className="text-xs text-muted-foreground">This month</p>
//                   </CardContent>
//                 </Card>
//               </div>

//               <div className="grid gap-4 md:grid-cols-2">
//                 <Card>
//                   <CardHeader>
//                     <CardTitle>Ticket Resolution Trend</CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <ResponsiveContainer width="100%" height={300}>
//                       <LineChart data={ticketTrendData}>
//                         <CartesianGrid strokeDasharray="3 3" />
//                         <XAxis dataKey="month" />
//                         <YAxis />
//                         <Tooltip />
//                         <Line type="monotone" dataKey="resolved" stroke="#22c55e" strokeWidth={2} />
//                       </LineChart>
//                     </ResponsiveContainer>
//                   </CardContent>
//                 </Card>

//                 <Card>
//                   <CardHeader>
//                     <CardTitle>Priority Distribution</CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <ResponsiveContainer width="100%" height={300}>
//                       <PieChart>
//                         <Pie
//                           data={priorityDistribution}
//                           cx="50%"
//                           cy="50%"
//                           outerRadius={80}
//                           dataKey="value"
//                           label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
//                         >
//                           {priorityDistribution.map((entry, index) => (
//                             <Cell key={`cell-${index}`} fill={entry.color} />
//                           ))}
//                         </Pie>
//                         <Tooltip />
//                       </PieChart>
//                     </ResponsiveContainer>
//                   </CardContent>
//                 </Card>
//               </div>
//             </TabsContent>

//             <TabsContent value="tickets" className="space-y-6">
//               <Card>
//                 <CardHeader>
//                   <CardTitle>My Tickets</CardTitle>
//                   <CardDescription>Track your support requests</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-4">
//                     {mockTickets.slice(0, 3).map((ticket) => (
//                       <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg">
//                         <div className="space-y-1">
//                           <p className="font-medium">{ticket.subject}</p>
//                           <p className="text-sm text-muted-foreground">
//                             #{ticket.id} • {ticket.created}
//                           </p>
//                         </div>
//                         <div className="flex items-center gap-2">
//                           <Badge className={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
//                           <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </CardContent>
//               </Card>
//             </TabsContent>

//             <TabsContent value="reports" className="space-y-6">
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Monthly Statistics</CardTitle>
//                   <CardDescription>Your support activity this month</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="grid gap-4 md:grid-cols-3">
//                     <div className="space-y-2">
//                       <p className="text-sm font-medium">Tickets Created</p>
//                       <p className="text-2xl font-bold">8</p>
//                       <Progress value={65} className="h-2" />
//                     </div>
//                     <div className="space-y-2">
//                       <p className="text-sm font-medium">Avg Resolution Time</p>
//                       <p className="text-2xl font-bold">3.2h</p>
//                       <Progress value={80} className="h-2" />
//                     </div>
//                     <div className="space-y-2">
//                       <p className="text-sm font-medium">Satisfaction Score</p>
//                       <p className="text-2xl font-bold">4.8/5</p>
//                       <Progress value={96} className="h-2" />
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             </TabsContent>
//           </Tabs>
//         )

//       case "technician":
//         return (
//           <Tabs defaultValue="overview" className="space-y-6">
//             <TabsList className="grid w-full grid-cols-4">
//               <TabsTrigger value="overview">Overview</TabsTrigger>
//               <TabsTrigger value="queue">Queue</TabsTrigger>
//               <TabsTrigger value="performance">Performance</TabsTrigger>
//               <TabsTrigger value="reports">Monthly Report</TabsTrigger>
//             </TabsList>

//             <TabsContent value="overview" className="space-y-6">
//               <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//                 <Card>
//                   <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                     <CardTitle className="text-sm font-medium">Assigned</CardTitle>
//                     <TicketIcon className="h-4 w-4 text-muted-foreground" />
//                   </CardHeader>
//                   <CardContent>
//                     <div className="text-2xl font-bold">12</div>
//                     <p className="text-xs text-red-600">4 critical</p>
//                   </CardContent>
//                 </Card>
//                 <Card>
//                   <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                     <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
//                     <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />
//                   </CardHeader>
//                   <CardContent>
//                     <div className="text-2xl font-bold">8</div>
//                     <p className="text-xs text-green-600">+20% from yesterday</p>
//                   </CardContent>
//                 </Card>
//                 <Card>
//                   <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                     <CardTitle className="text-sm font-medium">Avg Resolution</CardTitle>
//                     <ClockIcon className="h-4 w-4 text-muted-foreground" />
//                   </CardHeader>
//                   <CardContent>
//                     <div className="text-2xl font-bold">1.2h</div>
//                     <p className="text-xs text-green-600">Below SLA</p>
//                   </CardContent>
//                 </Card>
//                 <Card>
//                   <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                     <CardTitle className="text-sm font-medium">Rating</CardTitle>
//                     <TrophyIcon className="h-4 w-4 text-muted-foreground" />
//                   </CardHeader>
//                   <CardContent>
//                     <div className="text-2xl font-bold">4.9/5</div>
//                     <p className="text-xs text-green-600">Excellent</p>
//                   </CardContent>
//                 </Card>
//               </div>

//               <div className="grid gap-4 md:grid-cols-2">
//                 <Card>
//                   <CardHeader>
//                     <CardTitle>Daily Performance</CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <ResponsiveContainer width="100%" height={300}>
//                       <AreaChart data={ticketTrendData}>
//                         <CartesianGrid strokeDasharray="3 3" />
//                         <XAxis dataKey="month" />
//                         <YAxis />
//                         <Tooltip />
//                         <Area type="monotone" dataKey="resolved" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
//                       </AreaChart>
//                     </ResponsiveContainer>
//                   </CardContent>
//                 </Card>

//                 <Card>
//                   <CardHeader>
//                     <CardTitle>Performance Metrics</CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="space-y-4">
//                       {performanceData.map((metric) => (
//                         <div key={metric.name} className="space-y-2">
//                           <div className="flex justify-between text-sm">
//                             <span>{metric.name}</span>
//                             <span>{metric.value}%</span>
//                           </div>
//                           <Progress value={metric.value} className="h-2" />
//                         </div>
//                       ))}
//                     </div>
//                   </CardContent>
//                 </Card>
//               </div>
//             </TabsContent>

//             <TabsContent value="queue" className="space-y-6">
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Ticket Queue</CardTitle>
//                   <CardDescription>Your assigned tickets requiring attention</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-4">
//                     {mockTickets.map((ticket) => (
//                       <div
//                         key={ticket.id}
//                         className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
//                       >
//                         <div className="space-y-1">
//                           <p className="font-medium">{ticket.subject}</p>
//                           <p className="text-sm text-muted-foreground">
//                             #{ticket.id} • {ticket.created}
//                           </p>
//                         </div>
//                         <div className="flex items-center gap-2">
//                           <Badge className={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
//                           <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>
//                           <Button size="sm" variant="outline">
//                             View
//                           </Button>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </CardContent>
//               </Card>
//             </TabsContent>

//             <TabsContent value="performance" className="space-y-6">
//               <div className="grid gap-4 md:grid-cols-2">
//                 <Card>
//                   <CardHeader>
//                     <CardTitle>Resolution Rate</CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <ResponsiveContainer width="100%" height={200}>
//                       <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={[{ value: 87 }]}>
//                         <RadialBar dataKey="value" cornerRadius={10} fill="#22c55e" />
//                       </RadialBarChart>
//                     </ResponsiveContainer>
//                     <div className="text-center">
//                       <p className="text-2xl font-bold">87%</p>
//                       <p className="text-sm text-muted-foreground">This month</p>
//                     </div>
//                   </CardContent>
//                 </Card>

//                 <Card>
//                   <CardHeader>
//                     <CardTitle>Category Breakdown</CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <ResponsiveContainer width="100%" height={300}>
//                       <BarChart data={categoryData} layout="horizontal">
//                         <CartesianGrid strokeDasharray="3 3" />
//                         <XAxis type="number" />
//                         <YAxis dataKey="category" type="category" width={80} />
//                         <Tooltip />
//                         <Bar dataKey="tickets" fill="#3b82f6" />
//                       </BarChart>
//                     </ResponsiveContainer>
//                   </CardContent>
//                 </Card>
//               </div>
//             </TabsContent>

//             <TabsContent value="reports" className="space-y-6">
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Monthly Performance Report</CardTitle>
//                   <CardDescription>Your detailed statistics for this month</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="grid gap-6 md:grid-cols-2">
//                     <div className="space-y-4">
//                       <h4 className="font-semibold">Key Metrics</h4>
//                       <div className="space-y-3">
//                         <div className="flex justify-between">
//                           <span>Tickets Resolved</span>
//                           <span className="font-bold">156</span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span>Avg Resolution Time</span>
//                           <span className="font-bold">1.2h</span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span>Customer Rating</span>
//                           <span className="font-bold">4.9/5</span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span>SLA Compliance</span>
//                           <span className="font-bold">98%</span>
//                         </div>
//                       </div>
//                     </div>
//                     <div className="space-y-4">
//                       <h4 className="font-semibold">Achievements</h4>
//                       <div className="space-y-2">
//                         <Badge variant="secondary" className="w-full justify-start">
//                           🏆 Top Performer - Highest resolution rate
//                         </Badge>
//                         <Badge variant="secondary" className="w-full justify-start">
//                           ⚡ Speed Demon - Fastest avg response time
//                         </Badge>
//                         <Badge variant="secondary" className="w-full justify-start">
//                           ⭐ Customer Favorite - 4.9+ rating
//                         </Badge>
//                       </div>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             </TabsContent>
//           </Tabs>
//         )

//       case "admin":
//         return renderAdminDashboard()
//       default: // admin
//         return renderAdminDashboard()
//     }
//   }

//   return (
//     <div className="flex h-screen bg-background">
//       <div
//         className={`${sidebarCollapsed ? "w-16" : "w-64"} bg-card border-r border-border transition-all duration-300`}
//       >
//         <div className="p-6">
//           <div className="flex items-center justify-between">
//             {!sidebarCollapsed && (
//               <div>
//                 <h1 className="text-xl font-bold text-foreground">IT Support Pro</h1>
//                 <p className="text-sm text-muted-foreground">AI-Powered Platform</p>
//               </div>
//             )}
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
//               className="h-8 w-8 p-0"
//             >
//               {sidebarCollapsed ? <Bars3Icon className="h-4 w-4" /> : <XMarkIcon className="h-4 w-4" />}
//             </Button>
//           </div>
//         </div>

//         <nav className="px-3 space-y-1">
//           {!sidebarCollapsed && (
//             <p className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Navigation</p>
//           )}
//           {navigation.map((item) => (
//             <Button
//               key={item.name}
//               variant="ghost"
//               className={`w-full ${sidebarCollapsed ? "justify-center px-2" : "justify-start"}`}
//               asChild
//             >
//               <a href={item.href} className="flex items-center gap-3">
//                 <item.icon className="h-4 w-4 flex-shrink-0" />
//                 {!sidebarCollapsed && <span>{item.name}</span>}
//               </a>
//             </Button>
//           ))}
//         </nav>
//       </div>

//       <div className="flex-1 flex flex-col overflow-hidden">
//         <header className="bg-card border-b border-border px-6 py-4">
//           <div className="flex items-center justify-between">
//             <div>
//               <h2 className="text-2xl font-bold text-foreground capitalize">
//                 {currentRole === "admin"
//                   ? "Admin Console"
//                   : currentRole === "technician"
//                     ? "Technician Workspace"
//                     : "User Portal"}
//               </h2>
//               <p className="text-sm text-muted-foreground">
//                 {currentRole === "admin" && "Comprehensive IT support management and analytics"}
//                 {currentRole === "technician" && "Handle tickets and track your performance"}
//                 {currentRole === "user" && "Submit requests and track your tickets"}
//               </p>
//             </div>
//             <div className="flex items-center gap-4">
//               <Button variant="outline" size="sm">
//                 <BellIcon className="h-4 w-4 mr-2" />
//                 Notifications
//               </Button>
//               <Avatar>
//                 <AvatarImage src="/user-profile-illustration.png" />
//                 <AvatarFallback>
//                   {currentRole === "admin" && "AD"}
//                   {currentRole === "technician" && "TC"}
//                   {currentRole === "user" && "US"}
//                 </AvatarFallback>
//               </Avatar>
//             </div>
//           </div>
//         </header>

//         <main className="flex-1 overflow-auto p-6">{renderDashboardContent()}</main>
//       </div>

//       <div className="fixed bottom-6 left-6 z-50">
//         <div className="relative">
//           {showRoleSwitcher && (
//             <div className="absolute bottom-full mb-2 bg-card border border-border rounded-lg shadow-lg p-2 min-w-[120px]">
//               <p className="text-xs font-medium text-muted-foreground mb-2 px-2">Switch Role</p>
//               {(["admin", "technician", "user"] as UserRole[]).map((role) => (
//                 <Button
//                   key={role}
//                   variant={currentRole === role ? "default" : "ghost"}
//                   size="sm"
//                   onClick={() => {
//                     setCurrentRole(role)
//                     setShowRoleSwitcher(false)
//                   }}
//                   className="w-full justify-start capitalize mb-1"
//                 >
//                   {role}
//                 </Button>
//               ))}
//             </div>
//           )}
//           <Button
//             onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
//             className="rounded-full h-12 w-12 shadow-lg"
//             size="sm"
//           >
//             <UserIcon className="h-5 w-5" />
//           </Button>
//         </div>
//       </div>
//     </div>
//   )
// }
