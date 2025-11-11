"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export const dynamic = 'force-dynamic'

export default function ITSupportDashboard() {
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Simulate data loading
        const timer = setTimeout(() => {
            setLoading(false)
        }, 800)
        return () => clearTimeout(timer)
    }, [])

    const renderDashboardContent = () => {
        return (
            <>
                <div>
                    {/* Monthly Report Tab */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Monthly Executive Report</CardTitle>
                                <CardDescription>Comprehensive overview of IT support operations</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="space-y-4">
                                        <Skeleton className="h-8 w-48" />
                                        <div className="space-y-3">
                                            {[1, 2, 3, 4, 5, 6].map(i => (
                                                <div key={i} className="flex justify-between">
                                                    <Skeleton className="h-4 w-40" />
                                                    <Skeleton className="h-4 w-16" />
                                                </div>
                                            ))}
                                        </div>
                                        <Skeleton className="h-8 w-48 mt-6" />
                                        <div className="space-y-2">
                                            {[1, 2, 3, 4].map(i => (
                                                <Skeleton key={i} className="h-16 w-full" />
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-4">
                                        <h4 className="font-semibold">Key Performance Indicators</h4>
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span>Total Tickets Processed</span>
                                                <span className="font-bold">1,234</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Resolution Rate</span>
                                                <span className="font-bold">94.2%</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Avg First Response Time</span>
                                                <span className="font-bold">1.8h</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Customer Satisfaction</span>
                                                <span className="font-bold">4.6/5</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Cost per Ticket</span>
                                                <span className="font-bold">$42</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Team Utilization</span>
                                                <span className="font-bold">78%</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="font-semibold">Trends & Insights</h4>
                                        <div className="space-y-2">
                                            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                                    📈 12% increase in ticket volume
                                                </p>
                                                <p className="text-xs text-green-600 dark:text-green-400">Higher than seasonal average</p>
                                            </div>
                                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">⚡ 15% faster response times</p>
                                                <p className="text-xs text-blue-600 dark:text-blue-400">New AI routing system impact</p>
                                            </div>
                                            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                                <p className="text-sm font-medium text-purple-800 dark:text-purple-200">🎯 98% SLA compliance</p>
                                                <p className="text-xs text-purple-600 dark:text-purple-400">Exceeding target by 8%</p>
                                            </div>
                                            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                                <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                                                    👥 3 new team members onboarded
                                                </p>
                                                <p className="text-xs text-orange-600 dark:text-orange-400">Expanding capacity for Q4</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                )}
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
