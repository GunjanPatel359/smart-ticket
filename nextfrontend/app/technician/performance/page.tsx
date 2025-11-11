"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    RadialBarChart,
    RadialBar,
} from "recharts"

export default function ITSupportDashboard() {
    const categoryData = [
        { category: "Hardware", tickets: 45 },
        { category: "Software", tickets: 38 },
        { category: "Network", tickets: 32 },
        { category: "Access", tickets: 28 },
        { category: "Email", tickets: 22 },
    ]
    const renderDashboardContent = () => {
        return (
            <>
                <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Resolution Rate</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={200}>
                                    <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={[{ value: 87 }]}>
                                        <RadialBar dataKey="value" cornerRadius={10} fill="#22c55e" />
                                    </RadialBarChart>
                                </ResponsiveContainer>
                                <div className="text-center">
                                    <p className="text-2xl font-bold">87%</p>
                                    <p className="text-sm text-muted-foreground">This month</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Category Breakdown</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={categoryData} layout="horizontal">
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" />
                                        <YAxis dataKey="category" type="category" width={80} />
                                        <Tooltip />
                                        <Bar dataKey="tickets" fill="#3b82f6" />
                                    </BarChart>
                                </ResponsiveContainer>
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