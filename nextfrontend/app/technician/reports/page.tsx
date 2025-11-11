"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"


export default function ITSupportDashboard() {
    const renderDashboardContent = () => {
        return (
            <>
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Monthly Performance Report</CardTitle>
                            <CardDescription>Your detailed statistics for this month</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-4">
                                    <h4 className="font-semibold">Key Metrics</h4>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span>Tickets Resolved</span>
                                            <span className="font-bold">156</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Avg Resolution Time</span>
                                            <span className="font-bold">1.2h</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Customer Rating</span>
                                            <span className="font-bold">4.9/5</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>SLA Compliance</span>
                                            <span className="font-bold">98%</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="font-semibold">Achievements</h4>
                                    <div className="space-y-2">
                                        <Badge variant="secondary" className="w-full justify-start">
                                            🏆 Top Performer - Highest resolution rate
                                        </Badge>
                                        <Badge variant="secondary" className="w-full justify-start">
                                            ⚡ Speed Demon - Fastest avg response time
                                        </Badge>
                                        <Badge variant="secondary" className="w-full justify-start">
                                            ⭐ Customer Favorite - 4.9+ rating
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
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