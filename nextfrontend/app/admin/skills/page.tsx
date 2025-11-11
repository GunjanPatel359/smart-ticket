"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline"

import { getAllSkills, createSkill, updateSkill, deleteSkill } from "@/actions/skill"
import { Switch } from "@/components/ui/switch"

type Skill = {
  id: number
  name: string
  category: string
  description?: string | null
  isActive: boolean
}

export default function SkillsManager() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)

  // Create form state
  const [name, setName] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [isActive,setIsActive] = useState(true)

  // Edit dialog state
  const [editing, setEditing] = useState<Skill | null>(null)
  const [editName, setEditName] = useState("")
  const [editCategory, setEditCategory] = useState("")
  const [editIsActive,setEditIsActive] = useState(true)
  const [editDescription, setEditDescription] = useState("")

  const [editDialogOpen, setEditDialogOpen] = useState(false)


  const canCreate = useMemo(() => name.trim().length > 1 && category.trim().length > 1, [name, category])

  useEffect(()=>{
    refreshSkills()
  },[])

  async function refreshSkills() {
    try {
      setLoading(true)
      const response = await getAllSkills()
      if (response.success && response.skills) {
        setSkills(response.skills)
      }
    } catch (error) {
      console.error("Failed to fetch skills:", error)
    } finally {
      setLoading(false)
    }
  }

  function resetCreateForm() {
    setName("")
    setCategory("")
    setDescription("")
    setIsActive(true)
  }

  // ✅ Create
  async function handleCreate() {
    if (!canCreate) return
    try {
      const result = await createSkill({
        name: name.trim(),
        category: category.trim(),
        description: description.trim() || undefined,
        isActive,
      })
      if (result.success) {
        await refreshSkills()
        resetCreateForm()
      } else {
        alert(result.message)
      }
    } catch (error) {
      console.error("Error creating skill:", error)
    }
  }

  // ✅ Edit
  function startEdit(skill: Skill) {
    setEditing(skill)
    setEditName(skill.name)
    setEditCategory(skill.category)
    setEditDescription(skill.description || "")
    setEditIsActive(skill.isActive)
      setEditDialogOpen(true)
  }

  async function applyEdit() {
    if (!editing) return
    try {
      const result = await updateSkill(editing.id, {
        name: editName.trim(),
        category: editCategory.trim(),
        description: editDescription.trim() || undefined,
        isActive: editIsActive,
      })
      if (result.success) {
        await refreshSkills()
        setEditing(null)
        setEditDialogOpen(false)
      } else {
        alert(result.message)
      }
    } catch (error) {
      console.error("Error updating skill:", error)
    }
  }

  // ✅ Delete
  async function handleDelete(id: number) {
    try {
      const result = await deleteSkill(id)
      if (result.success) {
        await refreshSkills()
      } else {
        alert(result.message)
      }
    } catch (error) {
      console.error("Error deleting skill:", error)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Skills</CardTitle>
          <CardDescription>Create, edit, and remove technician skills</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="skill-name">Name</Label>
                <Input
                  id="skill-name"
                  placeholder="e.g., Networking"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="skill-category">Category</Label>
                <Input
                  id="skill-category"
                  placeholder="e.g., Infrastructure"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="skill-description">Description</Label>
                <textarea
                  id="skill-description"
                  className="w-full min-h-[40px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Optional details"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch
                  id="skill-isactive"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
                <Label htmlFor="skill-isactive">Active</Label>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <Button onClick={handleCreate} disabled={!canCreate}>
              Add Skill
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Skill Catalog</CardTitle>
          <CardDescription>Manage the list of available skills</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <div className="space-y-2">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="flex items-center gap-4 py-3 border-b">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="h-4 w-16" />
                    <div className="flex gap-2 ml-auto">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {skills.map((skill) => (
                <TableRow key={skill.id}>
                  <TableCell className="font-medium">{skill.name}</TableCell>
                  <TableCell>{skill.category}</TableCell>
                  <TableCell className="max-w-[420px] truncate text-muted-foreground">
                    {skill.description || "-"}
                  </TableCell>
                  <TableCell>
                    {skill.isActive ? (
                      <span className="text-green-600">Active</span>
                    ) : (
                      <span className="text-red-600">Inactive</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Dialog onOpenChange={setEditDialogOpen} open={editDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => startEdit(skill)}>
                            <PencilIcon className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[525px]">
                          <DialogHeader>
                            <DialogTitle>Edit Skill</DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-3">
                            <div className="space-y-1">
                              <Label htmlFor="edit-name">Name</Label>
                              <Input id="edit-name" value={editName} onChange={(e) => setEditName(e.target.value)} />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor="edit-category">Category</Label>
                              <Input
                                id="edit-category"
                                value={editCategory}
                                onChange={(e) => setEditCategory(e.target.value)}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor="edit-description">Description</Label>
                              <textarea
                                id="edit-description"
                                className="w-full min-h-[40px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="edit-isactive"
                                checked={editIsActive}
                                onCheckedChange={setEditIsActive}
                              />
                              <Label htmlFor="edit-isactive">Active</Label>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button onClick={applyEdit} disabled={!editName.trim() || !editCategory.trim()}>
                              Save Changes
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <TrashIcon className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete “{skill.name}”?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently remove the skill from the catalog.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(skill.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
                ))}
                {skills.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No skills yet. Use the form above to add your first skill.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
