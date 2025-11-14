"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ArrowLeftIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline"
import { 
  getTechnician, 
  updateTechnician, 
  getAllSkills,
  addTechnicianSkill,
  updateTechnicianSkillScore,
  removeTechnicianSkill
} from "@/actions/technician"
import { SkillLevel, AvailabilityStatus } from "@prisma/client"

export default function TechnicianEditPage() {
  const router = useRouter()
  const params = useParams()
  const technicianId = parseInt(params.id as string)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [technician, setTechnician] = useState<any>(null)
  const [allSkills, setAllSkills] = useState<any[]>([])
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contactNo: "",
    department: "",
    technicianLevel: "junior" as SkillLevel,
    availabilityStatus: "available" as AvailabilityStatus,
    isActive: true,
    experience: 0,
  })
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [saveError, setSaveError] = useState("")
  const [saveSuccess, setSaveSuccess] = useState(false)
  
  // Skill management
  const [isAddSkillOpen, setIsAddSkillOpen] = useState(false)
  const [selectedSkillId, setSelectedSkillId] = useState<string>("")
  const [skillScore, setSkillScore] = useState(50)
  const [skillError, setSkillError] = useState("")
  
  // Edit skill modal
  const [isEditSkillOpen, setIsEditSkillOpen] = useState(false)
  const [editingSkill, setEditingSkill] = useState<any>(null)
  const [editSkillScore, setEditSkillScore] = useState(50)

  useEffect(() => {
    fetchData()
  }, [technicianId])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [techRes, skillsRes] = await Promise.all([
        getTechnician(technicianId),
        getAllSkills()
      ])

      if (techRes.success && techRes.technician) {
        setTechnician(techRes.technician)
        setFormData({
          name: techRes.technician.name,
          email: techRes.technician.email,
          contactNo: techRes.technician.contactNo || "",
          department: techRes.technician.department || "",
          technicianLevel: techRes.technician.technicianLevel as SkillLevel,
          availabilityStatus: techRes.technician.availabilityStatus as AvailabilityStatus,
          isActive: techRes.technician.isActive,
          experience: techRes.technician.experience,
        })
      }

      if (skillsRes.success && skillsRes.skills) {
        setAllSkills(skillsRes.skills)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      errors.name = "Name is required"
    } else if (formData.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters"
    }
    
    if (!formData.email.trim()) {
      errors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address"
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: "" }))
    }
    setSaveError("")
    setSaveSuccess(false)
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setSaving(true)
    setSaveError("")
    setSaveSuccess(false)

    try {
      const result = await updateTechnician(technicianId, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        contactNo: formData.contactNo.trim() || null,
        department: formData.department.trim() || null,
        technicianLevel: formData.technicianLevel,
        availabilityStatus: formData.availabilityStatus,
        isActive: formData.isActive,
        experience: formData.experience,
      })

      if (result.success) {
        setSaveSuccess(true)
        setTechnician(result.technician)
        setTimeout(() => setSaveSuccess(false), 3000)
      } else {
        setSaveError(result.message)
      }
    } catch (error) {
      setSaveError("An unexpected error occurred")
    } finally {
      setSaving(false)
    }
  }

  const handleAddSkill = async () => {
    if (!selectedSkillId) {
      setSkillError("Please select a skill")
      return
    }

    setSkillError("")
    try {
      const result = await addTechnicianSkill(technicianId, parseInt(selectedSkillId), skillScore)
      
      if (result.success) {
        setIsAddSkillOpen(false)
        setSelectedSkillId("")
        setSkillScore(50)
        await fetchData()
      } else {
        setSkillError(result.message)
      }
    } catch (error) {
      setSkillError("Failed to add skill")
    }
  }

  const handleOpenEditSkill = (skill: any) => {
    setEditingSkill(skill)
    setEditSkillScore(skill.score)
    setIsEditSkillOpen(true)
  }

  const handleUpdateSkillScore = async () => {
    if (!editingSkill) return

    try {
      const result = await updateTechnicianSkillScore(technicianId, editingSkill.skillId, editSkillScore)
      if (result.success) {
        setIsEditSkillOpen(false)
        setEditingSkill(null)
        await fetchData()
      }
    } catch (error) {
      console.error("Error updating skill score:", error)
    }
  }

  const handleRemoveSkill = async (skillId: number) => {
    if (!confirm("Are you sure you want to remove this skill?")) return

    try {
      const result = await removeTechnicianSkill(technicianId, skillId)
      if (result.success) {
        await fetchData()
      }
    } catch (error) {
      console.error("Error removing skill:", error)
    }
  }

  const availableSkills = allSkills.filter(
    skill => !technician?.technicianSkills?.some((ts: any) => ts.skillId === skill.id)
  )

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!technician) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Technician not found</p>
            <div className="flex justify-center mt-4">
              <Button onClick={() => router.push("/admin/technicians")}>
                Back to Technicians
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/technicians")}
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Edit Technician</h1>
            <p className="text-sm text-muted-foreground">
              Manage technician details and skills
            </p>
          </div>
        </div>
        <Button
          onClick={() => router.push(`/tech/${technicianId}`)}
          variant="outline"
        >
          View Public Profile
        </Button>
      </div>

      {saveSuccess && (
        <div className="bg-green-50 text-green-800 p-4 rounded-md">
          Changes saved successfully!
        </div>
      )}

      {saveError && (
        <div className="bg-red-50 text-red-800 p-4 rounded-md">
          {saveError}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Update technician personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                aria-invalid={!!formErrors.name}
              />
              {formErrors.name && (
                <p className="text-sm text-red-600">{formErrors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                aria-invalid={!!formErrors.email}
              />
              {formErrors.email && (
                <p className="text-sm text-red-600">{formErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactNo">Contact Number</Label>
              <Input
                id="contactNo"
                value={formData.contactNo}
                onChange={(e) => handleInputChange("contactNo", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => handleInputChange("department", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Professional Details */}
        <Card>
          <CardHeader>
            <CardTitle>Professional Details</CardTitle>
            <CardDescription>Manage level, status, and experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="technicianLevel">Skill Level</Label>
              <Select
                value={formData.technicianLevel}
                onValueChange={(value) => handleInputChange("technicianLevel", value)}
              >
                <SelectTrigger id="technicianLevel">
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

            <div className="space-y-2">
              <Label htmlFor="availabilityStatus">Availability Status</Label>
              <Select
                value={formData.availabilityStatus}
                onValueChange={(value) => handleInputChange("availabilityStatus", value)}
              >
                <SelectTrigger id="availabilityStatus">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="busy">Busy</SelectItem>
                  <SelectItem value="in_meeting">In Meeting</SelectItem>
                  <SelectItem value="on_break">On Break</SelectItem>
                  <SelectItem value="end_of_shift">End of Shift</SelectItem>
                  <SelectItem value="focus_mode">Focus Mode</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">Experience (years)</Label>
              <Input
                id="experience"
                type="number"
                step="0.1"
                min="0"
                value={formData.experience}
                onChange={(e) => handleInputChange("experience", parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => handleInputChange("isActive", e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                Active Technician
              </Label>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Statistics</CardTitle>
          <CardDescription>Ticket and performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Current Tickets</p>
              <p className="text-2xl font-bold">{technician.currentTickets}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Resolved Tickets</p>
              <p className="text-2xl font-bold">{technician.resolvedTickets}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Tickets</p>
              <p className="text-2xl font-bold">{technician.totalTickets}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Workload</p>
              <p className="text-2xl font-bold">{technician.workload}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Skills</CardTitle>
              <CardDescription>Manage technician skills and proficiency levels</CardDescription>
            </div>
            <Dialog open={isAddSkillOpen} onOpenChange={setIsAddSkillOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Skill
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Skill</DialogTitle>
                  <DialogDescription>
                    Select a skill and set the proficiency level (0-100)
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {skillError && (
                    <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                      {skillError}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="skill">Skill</Label>
                    <Select value={selectedSkillId} onValueChange={setSelectedSkillId}>
                      <SelectTrigger id="skill">
                        <SelectValue placeholder="Select a skill" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSkills.map((skill) => (
                          <SelectItem key={skill.id} value={skill.id.toString()}>
                            {skill.name} ({skill.category})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="score">Proficiency Score: {skillScore}</Label>
                    <Input
                      id="score"
                      type="range"
                      min="0"
                      max="100"
                      value={skillScore}
                      onChange={(e) => setSkillScore(parseInt(e.target.value))}
                    />
                    <p className="text-xs text-muted-foreground">
                      0 = Beginner, 50 = Intermediate, 100 = Expert
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddSkillOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddSkill}>Add Skill</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {technician.technicianSkills?.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No skills assigned yet. Click "Add Skill" to get started.
            </p>
          ) : (
            <div className="space-y-3">
              {technician.technicianSkills?.map((ts: any) => (
                <div key={ts.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-medium">{ts.skill.name}</p>
                      <Badge variant="secondary" className="text-xs">
                        {ts.skill.category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={ts.score} className="flex-1 h-2" />
                      <span className="text-sm font-medium w-12 text-right">{ts.score}%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEditSkill(ts)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSkill(ts.skillId)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Skill Modal */}
      <Dialog open={isEditSkillOpen} onOpenChange={setIsEditSkillOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Skill Proficiency</DialogTitle>
            <DialogDescription>
              Adjust the proficiency level for {editingSkill?.skill?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="editScore">Proficiency Score</Label>
                <span className="text-2xl font-bold">{editSkillScore}%</span>
              </div>
              <Input
                id="editScore"
                type="range"
                min="0"
                max="100"
                value={editSkillScore}
                onChange={(e) => setEditSkillScore(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Beginner (0)</span>
                <span>Intermediate (50)</span>
                <span>Expert (100)</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <p className="font-medium">{editingSkill?.skill?.name}</p>
                  <Badge variant="secondary" className="text-xs">
                    {editingSkill?.skill?.category}
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={editSkillScore} className="flex-1 h-2" />
                  <span className="text-sm font-medium">{editSkillScore}%</span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditSkillOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateSkillScore}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={() => router.push("/admin/technicians")}
        >
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  )
}
