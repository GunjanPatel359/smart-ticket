"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export default function ITSupportDashboard() {
    const renderDashboardContent = () => {
        return (
            <>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Statistics</CardTitle>
                  <CardDescription>Your support activity this month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Tickets Created</p>
                      <p className="text-2xl font-bold">8</p>
                      <Progress value={65} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Avg Resolution Time</p>
                      <p className="text-2xl font-bold">3.2h</p>
                      <Progress value={80} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Satisfaction Score</p>
                      <p className="text-2xl font-bold">4.8/5</p>
                      <Progress value={96} className="h-2" />
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