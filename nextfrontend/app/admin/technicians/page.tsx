"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PlusIcon, ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline"
import { getAllTechnicians } from "@/actions/technician"

// 🔹 Skill level colors
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

// 🔹 Availability colors
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
    case "focus_mode":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default function ITSupportDashboard() {
  const [technicians, setTechnicians] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [sortField, setSortField] = useState("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        setLoading(true)
        const res = await getAllTechnicians(page, 5, sortField, sortOrder)
        if (res.success && res.technicians) {
          setTechnicians(res.technicians)
          setTotalPages(res.totalPages || 1)
        }
      } catch (err) {
        console.error("Failed to fetch technicians:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchTechnicians()
  }, [page, sortField, sortOrder])

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  const renderSortIcon = (field: string) => {
    if (sortField !== field) return null
    return sortOrder === "asc" ? (
      <ArrowUpIcon className="h-4 w-4 inline ml-1" />
    ) : (
      <ArrowDownIcon className="h-4 w-4 inline ml-1" />
    )
  }

  return (
    <div className="flex bg-background">
      <div className="flex-1 p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Technician Management</CardTitle>
                <CardDescription>Team performance and workload overview</CardDescription>
              </div>
              <Button>
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Technician
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex items-center gap-4 py-3 border-b">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                  ))}
                </div>
              </div>
            ) : technicians.length === 0 ? (
              <p>No technicians found.</p>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead onClick={() => toggleSort("name")} className="cursor-pointer">
                        Name {renderSortIcon("name")}
                      </TableHead>
                      <TableHead onClick={() => toggleSort("technicianLevel")} className="cursor-pointer">
                        Skill Level {renderSortIcon("technicianLevel")}
                      </TableHead>
                      <TableHead onClick={() => toggleSort("workload")} className="cursor-pointer">
                        Workload {renderSortIcon("workload")}
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead onClick={() => toggleSort("currentTickets")} className="cursor-pointer">
                        Current Tickets {renderSortIcon("currentTickets")}
                      </TableHead>
                      <TableHead>Resolved</TableHead>
                      <TableHead>Total Tickets</TableHead>
                      <TableHead>Experience</TableHead>
                      <TableHead>Skills</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {technicians.map((tech) => (
                      <TableRow key={tech.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {tech.name
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{tech.name}</p>
                              <p className="text-sm text-muted-foreground">{tech.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getLevelColor(tech.technicianLevel)}>{tech.technicianLevel}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Progress value={tech.workload} className="w-16" />
                            <span className="text-sm">{tech.workload}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getAvailabilityColor(tech.availabilityStatus)}>
                            {tech.availabilityStatus?.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>{tech.currentTickets || 0}</TableCell>
                        <TableCell>{tech.resolvedTickets || 0}</TableCell>
                        <TableCell>{tech.totalTickets || 0}</TableCell>
                        <TableCell>{tech.experience}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {tech.technicianSkills?.slice(0, 2).map((ts: any, idx: number) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {ts.skill.name}
                              </Badge>
                            ))}
                            {tech.technicianSkills?.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{tech.technicianSkills.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination controls */}
                <div className="flex justify-end items-center mt-4">
                  <Button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1}>
                    Previous
                  </Button>
                  <span className="mx-4 my-auto">
                    Page {page} of {totalPages}
                  </span>
                  <Button onClick={() => setPage((p) => Math.min(p + 1, totalPages))} disabled={page === totalPages}>
                    Next
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
