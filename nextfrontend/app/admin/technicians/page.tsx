"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusIcon, ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline"
import { getAllTechnicians, createTechnician } from "@/actions/technician"
import { SkillLevel, AvailabilityStatus } from "@prisma/client"

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
  const router = useRouter()
  const [technicians, setTechnicians] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [sortField, setSortField] = useState("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    contactNo: "",
    department: "",
    technicianLevel: "junior" as SkillLevel,
    availabilityStatus: "available" as AvailabilityStatus,
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState("")

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

  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      errors.name = "Name is required"
    } else if (formData.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters"
    } else if (formData.name.length > 255) {
      errors.name = "Name must not exceed 255 characters"
    }
    
    if (!formData.email.trim()) {
      errors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address"
    }
    
    if (!formData.password.trim()) {
      errors.password = "Password is required"
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters"
    }
    
    if (formData.contactNo && formData.contactNo.length > 20) {
      errors.contactNo = "Contact number must not exceed 20 characters"
    }
    
    if (formData.department && formData.department.length > 100) {
      errors.department = "Department must not exceed 100 characters"
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: "" }))
    }
    setSubmitError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    setSubmitError("")
    
    try {
      const result = await createTechnician({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        contactNo: formData.contactNo.trim() || undefined,
        department: formData.department.trim() || undefined,
        technicianLevel: formData.technicianLevel,
        availabilityStatus: formData.availabilityStatus,
      })
      
      if (result.success) {
        // Reset form and close modal
        setFormData({
          name: "",
          email: "",
          password: "",
          contactNo: "",
          department: "",
          technicianLevel: "junior" as SkillLevel,
          availabilityStatus: "available" as AvailabilityStatus,
        })
        setIsModalOpen(false)
        // Refresh technician list
        const res = await getAllTechnicians(page, 5, sortField, sortOrder)
        if (res.success && res.technicians) {
          setTechnicians(res.technicians)
          setTotalPages(res.totalPages || 1)
        }
      } else {
        setSubmitError(result.message)
      }
    } catch (error) {
      setSubmitError("An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleModalClose = (open: boolean) => {
    if (!isSubmitting) {
      setIsModalOpen(open)
      if (!open) {
        // Reset form when closing
        setFormData({
          name: "",
          email: "",
          password: "",
          contactNo: "",
          department: "",
          technicianLevel: "junior" as SkillLevel,
          availabilityStatus: "available" as AvailabilityStatus,
        })
        setFormErrors({})
        setSubmitError("")
      }
    }
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
              <Dialog open={isModalOpen} onOpenChange={handleModalClose}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Technician
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <form onSubmit={handleSubmit}>
                    <DialogHeader>
                      <DialogTitle>Add New Technician</DialogTitle>
                      <DialogDescription>
                        Enter the details of the new technician. Fields marked with * are required.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                      {submitError && (
                        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                          {submitError}
                        </div>
                      )}
                      
                      <div className="grid gap-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          placeholder="John Doe"
                          disabled={isSubmitting}
                          aria-invalid={!!formErrors.name}
                        />
                        {formErrors.name && (
                          <p className="text-sm text-red-600">{formErrors.name}</p>
                        )}
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          placeholder="john.doe@example.com"
                          disabled={isSubmitting}
                          aria-invalid={!!formErrors.email}
                        />
                        {formErrors.email && (
                          <p className="text-sm text-red-600">{formErrors.email}</p>
                        )}
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="password">Password *</Label>
                        <Input
                          id="password"
                          type="password"
                          value={formData.password}
                          onChange={(e) => handleInputChange("password", e.target.value)}
                          placeholder="Enter password"
                          disabled={isSubmitting}
                          aria-invalid={!!formErrors.password}
                        />
                        {formErrors.password && (
                          <p className="text-sm text-red-600">{formErrors.password}</p>
                        )}
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="contactNo">Contact Number</Label>
                        <Input
                          id="contactNo"
                          value={formData.contactNo}
                          onChange={(e) => handleInputChange("contactNo", e.target.value)}
                          placeholder="+1234567890"
                          disabled={isSubmitting}
                          aria-invalid={!!formErrors.contactNo}
                        />
                        {formErrors.contactNo && (
                          <p className="text-sm text-red-600">{formErrors.contactNo}</p>
                        )}
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="department">Department</Label>
                        <Input
                          id="department"
                          value={formData.department}
                          onChange={(e) => handleInputChange("department", e.target.value)}
                          placeholder="IT Support"
                          disabled={isSubmitting}
                          aria-invalid={!!formErrors.department}
                        />
                        {formErrors.department && (
                          <p className="text-sm text-red-600">{formErrors.department}</p>
                        )}
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="technicianLevel">Skill Level *</Label>
                        <Select
                          value={formData.technicianLevel}
                          onValueChange={(value) => handleInputChange("technicianLevel", value)}
                          disabled={isSubmitting}
                        >
                          <SelectTrigger id="technicianLevel" className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="junior">Junior</SelectItem>
                            <SelectItem value="mid">Mid</SelectItem>
                            <SelectItem value="senior">Senior</SelectItem>
                            <SelectItem value="expert">Expert</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="availabilityStatus">Availability Status *</Label>
                        <Select
                          value={formData.availabilityStatus}
                          onValueChange={(value) => handleInputChange("availabilityStatus", value)}
                          disabled={isSubmitting}
                        >
                          <SelectTrigger id="availabilityStatus" className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="available">Available</SelectItem>
                            <SelectItem value="busy">Busy</SelectItem>
                            <SelectItem value="in_meeting">In Meeting</SelectItem>
                            <SelectItem value="on_break">On Break</SelectItem>
                            <SelectItem value="focus_mode">Focus Mode</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleModalClose(false)}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Creating..." : "Create Technician"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
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
                      <TableRow 
                        key={tech.id} 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => router.push(`/admin/technicians/${tech.id}`)}
                      >
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
