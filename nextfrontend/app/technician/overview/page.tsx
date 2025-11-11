"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  TicketIcon,
  ClockIcon,
  CheckCircleIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"


export default function ITSupportDashboard() {
    const renderDashboardContent = () => {
        const performanceData = [
            { name: "SLA Compliance", value: 98 },
            { name: "Avg Resolution Time", value: 85 },
            { name: "Customer Satisfaction", value: 92 },
            { name: "Tickets Resolved", value: 95 },
        ]
          const ticketTrendData = [
            { month: "Jan", tickets: 120, resolved: 110 },
            { month: "Feb", tickets: 135, resolved: 125 },
            { month: "Mar", tickets: 148, resolved: 140 },
            { month: "Apr", tickets: 162, resolved: 155 },
            { month: "May", tickets: 178, resolved: 170 },
            { month: "Jun", tickets: 195, resolved: 185 },
          ]
        return (
            <>
                <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Assigned</CardTitle>
                                <TicketIcon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">12</div>
                                <p className="text-xs text-red-600">4 critical</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
                                <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">8</div>
                                <p className="text-xs text-green-600">+20% from yesterday</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Avg Resolution</CardTitle>
                                <ClockIcon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">1.2h</div>
                                <p className="text-xs text-green-600">Below SLA</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Rating</CardTitle>
                                <TrophyIcon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">4.9/5</div>
                                <p className="text-xs text-green-600">Excellent</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Daily Performance</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={ticketTrendData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip />
                                        <Area type="monotone" dataKey="resolved" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Performance Metrics</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {performanceData.map((metric) => (
                                        <div key={metric.name} className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>{metric.name}</span>
                                                <span>{metric.value}%</span>
                                            </div>
                                            <Progress value={metric.value} className="h-2" />
                                        </div>
                                    ))}
                                </div>
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