"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { getTechnician } from "@/actions/technician"

const getLevelColor = (level: string) => {
  switch (level) {
    case "junior":
      return "bg-blue-100 text-blue-800"
    case "mid":
      return "bg-yellow-100 text-yellow-800"
    case "senior":
      return "bg-green-100 text-green-800"
    case "expert":
      return "bg-purple-100 text-purple-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const getAvailabilityColor = (status: string) => {
  switch (status) {
    case "available":
      return "bg-green-100 text-green-800"
    case "busy":
      return "bg-yellow-100 text-yellow-800"
    case "in_meeting":
      return "bg-purple-100 text-purple-800"
    case "on_break":
      return "bg-gray-100 text-gray-800"
    case "end_of_shift":
      return "bg-gray-100 text-gray-800"
    case "focus_mode":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default function TechnicianPublicProfile() {
  const params = useParams()
  const technicianId = parseInt(params.id as string)

  const [loading, setLoading] = useState(true)
  const [technician, setTechnician] = useState<any>(null)

  useEffect(() => {
    fetchTechnician()
  }, [technicianId])

  const fetchTechnician = async () => {
    setLoading(true)
    try {
      const result = await getTechnician(technicianId)
      if (result.success && result.technician) {
        setTechnician(result.technician)
      }
    } catch (error) {
      console.error("Error fetching technician:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    )
  }

  if (!technician) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Technician not found</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-6">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="text-2xl">
                  {technician.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold">{technician.name}</h1>
                    <p className="text-muted-foreground mt-1">{technician.email}</p>
                    {technician.department && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {technician.department}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <Badge className={getLevelColor(technician.technicianLevel)}>
                      {technician.technicianLevel}
                    </Badge>
                    <Badge className={getAvailabilityColor(technician.availabilityStatus)}>
                      {technician.availabilityStatus.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
                {technician.contactNo && (
                  <p className="text-sm mt-4">
                    <span className="font-medium">Contact:</span> {technician.contactNo}
                  </p>
                )}
                <p className="text-sm mt-1">
                  <span className="font-medium">Experience:</span> {technician.experience} years
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Statistics</CardTitle>
            <CardDescription>Ticket handling and workload metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Current Tickets</p>
                <p className="text-3xl font-bold">{technician.currentTickets}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Resolved Tickets</p>
                <p className="text-3xl font-bold text-green-600">{technician.resolvedTickets}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Tickets</p>
                <p className="text-3xl font-bold">{technician.totalTickets}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Workload</p>
                <div className="flex items-center gap-2">
                  <Progress value={technician.workload} className="flex-1" />
                  <span className="text-sm font-medium">{technician.workload}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skills */}
        <Card>
          <CardHeader>
            <CardTitle>Skills & Expertise</CardTitle>
            <CardDescription>Technical skills and proficiency levels</CardDescription>
          </CardHeader>
          <CardContent>
            {technician.technicianSkills?.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No skills listed yet
              </p>
            ) : (
              <div className="space-y-4">
                {technician.technicianSkills?.map((ts: any) => (
                  <div key={ts.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{ts.skill.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {ts.skill.category}
                        </Badge>
                      </div>
                      <span className="text-sm font-medium">{ts.score}%</span>
                    </div>
                    <Progress value={ts.score} className="h-2" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Info */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Status</p>
                <p className="font-medium">
                  {technician.isActive ? "Active" : "Inactive"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Member Since</p>
                <p className="font-medium">
                  {new Date(technician.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
