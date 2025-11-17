"use client"

import { useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { addTechnicianWorkLog, deleteTechnicianTask, updateTechnicianTask, updateTicket } from "@/actions/ticket"
import { AssignmentJustificationModal } from "../modal/justificationmodal"
import { getTechnician } from "@/actions/technician"
import { evaluateTechnician } from "@/actions/evaluation"

// --- TYPES TO MATCH PRISMA SCHEMA ---

type TicketStatus = "new" | "assigned" | "in_progress" | "on_hold" | "resolved" | "closed" | "cancelled"
type Priority = "low" | "normal" | "high" | "critical"
type Impact = "low" | "medium" | "high" | "critical"
type Urgency = "low" | "normal" | "high" | "critical"

// type Technician = { id: number; name: string }
type Skill = { id: number; name: string }

type Task = {
    id: number
    title: string
    description?: string | null
    status: string // could also be narrowed later if you define an enum (e.g., "pending" | "in_progress" | "done")
    assignedTo?: number | null
    dueDate?: string | null
    completedAt?: string | null
    createdAt: string
    ticketId: number
}

// 🟢 Matches model WorkLog in Prisma
type WorkLog = {
    id: number
    technicianId: number
    description: string
    timeSpentMinutes: number
    createdAt: string
    ticketId: number
}

// 🟢 Matches model AuditTrail in Prisma
type AuditTrail = {
    id: number
    action: string
    oldValue?: string | null
    newValue?: string | null
    comment?: string | null
    performedBy: string
    timestamp: string
    ticketId: number
}

type Ticket = {
    id: number
    subject: string
    description: string
    status: TicketStatus
    tags: string[]
    priority: Priority
    impact: Impact
    urgency: Urgency
    slaViolated: boolean
    escalationCount: number
    requesterId: number
    assignedTechnicianId?: number | null
    requiredSkills: Skill[]
    reopenedCount: number
    justification?: string | null
    satisfactionRating?: number | null
    score?: number | null
    feedback?: string | null
    firstResponseTime?: string | null
    resolutionTime?: string | null
    resolutionDue?: string | null
    resolvedAt?: string | null
    closedAt?: string | null
    createdAt: string
    updatedAt: string
    tasks: Task[]
    workLogs: WorkLog[]
    auditTrail: AuditTrail[]
}

type Technician = {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    email: string;
    department: string | null;
    currentTickets: number;
    resolvedTickets: number;
    totalTickets: number;
    workload: number;
    technicianLevel: string;
    availabilityStatus: string;
    isActive: boolean;
    experience: number;
    technicianSkills: { skill: { id: number; name: string } }[];
}

// --- MAIN COMPONENT ---
export default function TicketDetail({
    initialTicket,
    technicians,
    user,
    technician,
    admin,
}: {
    initialTicket: Ticket
    technicians: Technician[]
    user: boolean
    technician: boolean
    admin: boolean
}) {
    const [ticket, setTicket] = useState<Ticket>(initialTicket)
    const [tasks, setTasks] = useState<Task[]>(initialTicket.tasks || [])
    const [workLogs, setWorkLogs] = useState<WorkLog[]>(initialTicket.workLogs || [])
    const [auditTrail, setAuditTrail] = useState<AuditTrail[]>(initialTicket.auditTrail || [])
    const [newTag, setNewTag] = useState("")
    const [assignTechId, setAssignTechId] = useState<string | undefined>(
        initialTicket.assignedTechnicianId ? String(initialTicket.assignedTechnicianId) : undefined
    )
    const [technicianDetails, setTechnicianDetails] = useState<Technician>()
    const [justificationOpen, setJustificationOpen] = useState(false);
    const [taskDialogOpen, setTaskDialogOpen] = useState(false)
    const [taskDraft, setTaskDraft] = useState<Partial<Task>>({ status: "pending" })
    const [workDesc, setWorkDesc] = useState("")
    const [workMinutes, setWorkMinutes] = useState<number>(30)
    const [successMessage, setSuccessMessage] = useState<string>("")
    const [isEvaluating, setIsEvaluating] = useState(false)
    const [evaluationMessage, setEvaluationMessage] = useState<string>("")


    const allStatuses: TicketStatus[] = ["new", "assigned", "in_progress", "on_hold", "resolved", "closed", "cancelled"]

    // Determine status options based on role
    const statusOptions = (() => {
        if (admin) {
            // Admin can change to any status
            return allStatuses
        } else if (technician) {
            // Technician can change to most statuses except 'new'
            return allStatuses.filter(s => s !== "new")
        } else if (user) {
            // User can only close resolved tickets or keep current status
            return ticket.status === "resolved" ? ["resolved", "closed"] : [ticket.status]
        }
        return [ticket.status] // Fallback
    })()


    const canManageAssignment = admin
    const canEditCoreDetails = admin
    const canManageTasks = technician
    const canAddWorkLog = technician

    const canChangeStatus = admin || technician || user
    const canUpdateDescription = admin || technician || user
    const canManageTags = admin || technician || user
    const canGiveFeedback = user

    const statusTone: Record<TicketStatus, string> = {
        new: "bg-blue-100 text-blue-800",
        assigned: "bg-purple-100 text-purple-800",
        in_progress: "bg-emerald-100 text-emerald-800",
        on_hold: "bg-amber-100 text-amber-900",
        resolved: "bg-cyan-100 text-cyan-900",
        closed: "bg-zinc-200 text-zinc-900",
        cancelled: "bg-red-100 text-red-800",
    }


    useEffect(() => {
        const initiatePage = async () => {
            try {
                if (ticket.assignedTechnicianId == null) {
                    setTechnicianDetails(undefined);
                    setAssignTechId(undefined);
                    return;
                }

                // Sync dropdown with assigned technician
                setAssignTechId(String(ticket.assignedTechnicianId));

                // Fetch technician details
                const result = await getTechnician(ticket.assignedTechnicianId);

                if (result.success && result.technician) {
                    setTechnicianDetails(result.technician);
                }

            } catch (error) {
                console.error("Failed to fetch technician info:", error);
            }
        };

        initiatePage();
    }, [ticket.assignedTechnicianId]);

    function openJustificationModal() {
        setJustificationOpen(true);
    }

    function closeJustificationModal() {
        setJustificationOpen(false);
    }

    function addAudit(action: string, oldValue?: string | null, newValue?: string | null, comment?: string | null) {
        const entry: AuditTrail = {
            id: Date.now() + Math.random(),
            action,
            oldValue,
            newValue,
            comment,
            performedBy: "none",
            timestamp: new Date().toISOString(),
            ticketId: ticket.id,
        }
        setAuditTrail((prev) => [entry, ...prev])
    }

    async function handleAssignTechnician() {
        if (!canManageAssignment || !assignTechId) return
        
        const old = ticket.assignedTechnicianId?.toString()
        const newTechId = Number(assignTechId)
        
        // Check if it's the same technician
        if (old === assignTechId) {
            setSuccessMessage("Technician is already assigned to this ticket")
            setTimeout(() => setSuccessMessage(""), 3000)
            return
        }
        
        try {
            // Update ticket with new technician and clear justification
            const result = await updateTicket({
                id: ticket.id,
                assignedTechnicianId: newTechId,
                justification: "Assigned by admin" // Clear AI justification when admin manually assigns
            })
            
            if (result.success && result.ticket) {
                setTicket(result.ticket)
                
                // Fetch new technician details
                const techResult = await getTechnician(newTechId)
                if (techResult.success && techResult.technician) {
                    setTechnicianDetails(techResult.technician)
                }
                
                // Add audit trail if provided
                if (result.audit && Array.isArray(result.audit)) {
                    setAuditTrail((prev) => [
                        ...prev,
                        ...result.audit.map((auditItem: any) => ({
                            ...auditItem,
                            timestamp: typeof auditItem.timestamp === 'string' 
                                ? auditItem.timestamp 
                                : new Date(auditItem.timestamp).toISOString(),
                        }))
                    ])
                }
                
                addAudit("assigned_technician", old, assignTechId, "Technician manually assigned by admin")
                
                // Show success message
                setSuccessMessage("Technician assigned successfully!")
                setTimeout(() => setSuccessMessage(""), 3000)
                
                // Keep the dropdown value as the newly assigned technician
                setAssignTechId(assignTechId)
            } else {
                alert(result.message || "Failed to assign technician")
            }
        } catch (error) {
            console.error("Error assigning technician:", error)
            alert("Something went wrong while assigning technician")
        }
    }

    async function handleRemoveTechnician() {
        if (!canManageAssignment) return
        
        const old = ticket.assignedTechnicianId?.toString()
        
        try {
            // Update ticket to remove technician and clear justification
            const result = await updateTicket({
                id: ticket.id,
                assignedTechnicianId: null,
                justification: null // Clear justification when removing technician
            })
            
            if (result.success && result.ticket) {
                setTicket(result.ticket)
                setTechnicianDetails(undefined)
                setAssignTechId(undefined) // Clear dropdown selection
                
                // Add audit trail if provided
                if (result.audit && Array.isArray(result.audit)) {
                    setAuditTrail((prev) => [
                        ...prev,
                        ...result.audit.map((auditItem: any) => ({
                            ...auditItem,
                            timestamp: typeof auditItem.timestamp === 'string' 
                                ? auditItem.timestamp 
                                : new Date(auditItem.timestamp).toISOString(),
                        }))
                    ])
                }
                
                addAudit("removed_technician", old, undefined, "Technician removed by admin")
                
                // Show success message
                setSuccessMessage("Technician removed successfully!")
                setTimeout(() => setSuccessMessage(""), 3000)
            } else {
                alert(result.message || "Failed to remove technician")
            }
        } catch (error) {
            console.error("Error removing technician:", error)
            alert("Something went wrong while removing technician")
        }
    }

    function updateDetail<K extends keyof Ticket>(key: K, value: Ticket[K]) {
        const old = String(ticket[key] ?? "")
        setTicket((t) => ({ ...t, [key]: value, updatedAt: new Date().toISOString() }))
    }

    function addTag() {
        const trimmedTag = newTag.trim()
        if (!canManageTags || !trimmedTag || ticket.tags.includes(trimmedTag)) {
            setNewTag("")
            return
        }
        const next = [...ticket.tags, trimmedTag]
        setTicket((t) => ({ ...t, tags: next }))
        setNewTag("")
    }

    function removeTag(tag: string) {
        if (!canManageTags) return
        const next = ticket.tags.filter((t) => t !== tag)
        setTicket((t) => ({ ...t, tags: next }))
    }

    const saveTask = async () => {
        if (!canManageTasks || !taskDraft.title?.trim()) return;

        try {
            if (taskDraft.id) {
                // 🔹 Local update (editing task)
                const result = await updateTechnicianTask(taskDraft.id, {
                    title: taskDraft.title!,
                    description: taskDraft.description || "",
                    status: taskDraft.status || "pending",
                });

                if (!result.success) {
                    console.error("Task update failed:", result.message);
                    alert(result.message);
                    return;
                }

                if (result.task) {
                    const newTask: Task = {
                        id: Date.now(),
                        title: taskDraft.title!,
                        description: taskDraft.description ?? null,
                        status: taskDraft.status ?? "pending",
                        assignedTo: taskDraft.assignedTo ?? null,
                        dueDate: taskDraft.dueDate ? new Date(taskDraft.dueDate).toISOString() : null,
                        completedAt: null,
                        createdAt: new Date().toISOString(),
                        ticketId: ticket.id,
                    };
                    setTasks((prev) => [...prev, newTask]);

                    // ✅ Add audit only if it exists
                    if (result.audit) {
                        setAuditTrail((prev) => [
                            ...prev,
                            {
                                ...result.audit,
                                // @ts-ignore
                                timestamp: new Date(result.audit.timestamp).toISOString(),
                            } as AuditTrail,
                        ]);
                    }
                }
            } else {
                // 🔹 Create on server and also add audit trail
                const result = await addTechnicianWorkLog(
                    ticket.id,
                    taskDraft.title,
                    taskDraft.description || "",
                    Date.now()
                );

                if (!result.success) {
                    console.error("Task creation failed:", result.message);
                    alert(result.message);
                    return;
                }

                if (result.task) {
                    const newTask: Task = {
                        id: Date.now(),
                        title: taskDraft.title!,
                        description: taskDraft.description ?? null,
                        status: taskDraft.status ?? "pending",
                        assignedTo: taskDraft.assignedTo ?? null,
                        dueDate: taskDraft.dueDate ? new Date(taskDraft.dueDate).toISOString() : null,
                        completedAt: null,
                        createdAt: new Date().toISOString(),
                        ticketId: ticket.id,
                    };
                    setTasks((prev) => [...prev, newTask]);

                    // ✅ Add audit only if it exists
                    if (result.audit) {
                        setAuditTrail((prev) => [
                            ...prev,
                            {
                                ...result.audit,
                                timestamp: new Date(result.audit.timestamp).toISOString(),
                            } as AuditTrail,
                        ]);
                    }
                }
            }
        } catch (error) {
            console.error("Error saving task:", error);
            alert("Something went wrong while saving the task.");
        } finally {
            setTaskDialogOpen(false);
        }
    }

    const deleteTask = async (id: number) => {
        if (!canManageTasks) return;

        try {
            // Call server function to delete task and create audit
            const result = await deleteTechnicianTask(id);

            if (!result.success) {
                console.error("Failed to delete task:", result.message);
                alert(result.message);
                return;
            }

            // 🔹 Update local state
            setTasks((prev) => prev.filter((t) => t.id !== id));

            // 🔹 Add audit entry if it exists
            if (result.audit) {
                setAuditTrail((prev) => [
                    ...prev,
                    {
                        ...result.audit,
                        // @ts-ignore
                        timestamp: new Date(result.audit.timestamp).toISOString(), // convert to string for type safety
                    } as AuditTrail,
                ]);
            }
        } catch (error) {
            console.error("Error deleting task:", error);
            alert("Something went wrong while deleting the task.");
        }
    }

    function addWorkLog() {
        if (!canAddWorkLog || !workDesc.trim() || workMinutes <= 0) return

        const techIdForLog = ticket.assignedTechnicianId

        if (!techIdForLog) {
            console.error("Cannot add worklog: No technician is assigned to the ticket.")
            return
        }

        const newLog: WorkLog = {
            id: Date.now() + Math.random(),
            technicianId: techIdForLog,
            description: workDesc.trim(),
            timeSpentMinutes: workMinutes,
            createdAt: new Date().toISOString(),
            ticketId: ticket.id,
        }
        setWorkLogs((prev) => [newLog, ...prev])
        addAudit("added_worklog", undefined, `${workMinutes}m - ${workDesc.trim()}`)
        setWorkDesc("")
        setWorkMinutes(30)
    }

    const updateTicketData = async () => {
        try {
            const result = await updateTicket(ticket)

            if (result.success) {
                setTicket(result.ticket)
                if (result.audit && Array.isArray(result.audit)) {
                    setAuditTrail((prev) => [
                        ...prev,
                        // @ts-ignore
                        ...result.audit.map((auditItem) => ({
                            ...auditItem,
                            timestamp: new Date(auditItem.timestamp).toISOString(),
                        })) as AuditTrail[],
                    ]);
                }

            }
        } catch (error) {
            console.error("Error updating ticket:", error);
            alert("Something went wrong while updating ticket.");
        }
    }

    const handleSubmitFeedback = async () => {
        if (!canGiveFeedback) return
        
        // First validate feedback and rating
        try {
            setIsEvaluating(true)
            setEvaluationMessage("")
            
            if (!ticket.feedback || ticket.feedback === "" || !ticket.satisfactionRating || typeof ticket.satisfactionRating !== "number") {
                alert("Please provide both feedback and satisfaction rating before submitting")
                return
            }
            
            // Then evaluate the technician
            const evaluationResult = await evaluateTechnician(ticket.id,ticket.feedback,ticket.satisfactionRating)
            
            if (evaluationResult.success) {
                setEvaluationMessage("✓ Feedback submitted and technician evaluated successfully!")
                setTimeout(() => setEvaluationMessage(""), 5000)
            } else {
                setEvaluationMessage(`⚠ Feedback submitted, but evaluation failed: ${evaluationResult.message}`)
                setTimeout(() => setEvaluationMessage(""), 5000)
            }
        } catch (error) {
            console.log("Error submitting feedback:", error)
            alert("Something went wrong while submitting feedback")
        } finally {
            setIsEvaluating(false)
        }
    }


    return (
        <div className="flex flex-col gap-6">
            {justificationOpen && technicianDetails && (
                <AssignmentJustificationModal
                    ticketJustification={ticket?.justification || ""}
                    technician={technicianDetails}
                    onClose={closeJustificationModal}
                />
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                    <h3 className="text-balance font-bold text-gray-500 text-lg">Ticket ID: {ticket.id}</h3>
                    <h1 className="text-balance text-2xl font-semibold">{ticket.subject}</h1>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Badge className={statusTone[ticket.status]}>Status: {ticket.status}</Badge>
                        <Badge variant="secondary">Priority: {ticket.priority}</Badge>
                        <Badge variant="secondary">Impact: {ticket.impact}</Badge>
                        <Badge variant="secondary">Urgency: {ticket.urgency}</Badge>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {technicianDetails ? (
                        <>
                            <span className="text-sm text-muted-foreground">Assigned:</span>
                            <Badge className="bg-zinc-900 text-white">{technicianDetails.name}</Badge>
                            {canManageAssignment && (
                                <Button variant="outline" size="sm" onClick={handleRemoveTechnician}>
                                    Remove
                                </Button>
                            )}
                        </>
                    ) : (
                        <span className="text-sm text-muted-foreground">Unassigned</span>
                    )}
                </div>
            </div>

            {/* Assignment Card */}
            {canManageAssignment && (
                <Card>
                    <CardHeader>
                        <CardTitle>Technician Assignment</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                        {successMessage && (
                            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md text-sm">
                                ✓ {successMessage}
                            </div>
                        )}
                        <div className="flex flex-col gap-3 md:flex-row md:items-end">
                            <div className="w-full md:w-80">
                                <Label className="mb-1 block">Select Technician</Label>
                                <Select value={assignTechId} onValueChange={setAssignTechId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose a technician" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Technicians</SelectLabel>
                                            {technicians.map((t) => (
                                                <SelectItem value={String(t.id)} key={t.id}>
                                                    {t.name}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={handleAssignTechnician} disabled={!assignTechId}>
                                Assign
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Details Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Details</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Subject</Label>
                        <Input
                            value={ticket.subject}
                            onChange={(e) => updateDetail("subject", e.target.value)}
                            readOnly={!canEditCoreDetails}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Status</Label>
                        <Select
                            value={ticket.status}
                            onValueChange={(v) => updateDetail("status", v as TicketStatus)}
                            disabled={!canChangeStatus}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {statusOptions.map((s) => (
                                    <SelectItem key={s} value={s}>
                                        {s}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Description */}
                    <div className="space-y-2 md:col-span-2">
                        <Label>Description</Label>
                        <Textarea
                            value={ticket.description}
                            onChange={(e) => updateDetail("description", e.target.value)}
                            readOnly={!canUpdateDescription}
                            rows={4}
                        />
                    </div>

                    {/* Priority, Impact, Urgency */}
                    <div className="space-y-2">
                        <Label>Priority</Label>
                        <Select
                            value={ticket.priority}
                            onValueChange={(v) => updateDetail("priority", v as Priority)}
                            disabled={!canEditCoreDetails}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {["low", "normal", "high", "critical"].map((p) => (
                                    <SelectItem key={p} value={p}>
                                        {p}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Impact</Label>
                        <Select
                            value={ticket.impact}
                            onValueChange={(v) => updateDetail("impact", v as Impact)}
                            disabled={!canEditCoreDetails}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {["low", "medium", "high", "critical"].map((i) => (
                                    <SelectItem key={i} value={i}>
                                        {i}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Urgency</Label>
                        <Select
                            value={ticket.urgency}
                            onValueChange={(v) => updateDetail("urgency", v as Urgency)}
                            disabled={!canEditCoreDetails}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {["low", "normal", "high", "critical"].map((u) => (
                                    <SelectItem key={u} value={u}>
                                        {u}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Assigned Technician */}
                    <div className="space-y-2 md:col-span-2">
                        <Label>Assigned Technician</Label>
                        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-3">
                                {/* Avatar / Initials */}
                                <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-semibold uppercase">
                                    {technicianDetails?.name?.[0] || "T"}
                                </div>
                                <div>
                                    <p className="text-gray-900 font-medium">{technicianDetails?.name || "N/A"}</p>
                                    <p className="text-gray-500 text-sm">ID: {technicianDetails?.id}</p>
                                    <p className="text-gray-500 text-sm">Level: {technicianDetails?.technicianLevel}</p>
                                </div>
                            </div>
                            <Button size="sm" variant="outline" onClick={openJustificationModal}>
                                Why this technician?
                            </Button>
                        </div>
                    </div>


                    {/* Tags */}
                    <div className="space-y-2 md:col-span-2">
                        <Label>Tags</Label>
                        <div className="flex flex-wrap gap-2">
                            {ticket.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="flex items-center gap-2">
                                    <span>{tag}</span>
                                    {canManageTags && (
                                        <button
                                            type="button"
                                            className="text-xs text-muted-foreground hover:text-foreground"
                                            onClick={() => removeTag(tag)}
                                            aria-label={`Remove tag ${tag}`}
                                        >
                                            ×
                                        </button>
                                    )}
                                </Badge>
                            ))}
                        </div>
                        {canManageTags && (
                            <div className="mt-2 flex items-center gap-2">
                                <Input
                                    placeholder="Add tag"
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                                    className="max-w-xs"
                                />
                                <Button variant="outline" onClick={addTag}>
                                    Add
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>

                {/* Submit & Justification Buttons */}
                <CardFooter className="flex justify-between mt-4">
                    <Button onClick={updateTicketData} disabled={!canEditCoreDetails && !canChangeStatus}>
                        Update Ticket
                    </Button>
                </CardFooter>
            </Card>


            {/* User Feedback Card */}
            {canGiveFeedback && (
                <Card>
                    <CardHeader>
                        <CardTitle>Feedback & Satisfaction</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {evaluationMessage && (
                            <div className={`px-4 py-3 rounded-md text-sm ${
                                evaluationMessage.startsWith('✓') 
                                    ? 'bg-green-50 border border-green-200 text-green-800'
                                    : 'bg-yellow-50 border border-yellow-200 text-yellow-800'
                            }`}>
                                {evaluationMessage}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label>Satisfaction Rating (1-5)</Label>
                            <Select
                                value={ticket.satisfactionRating?.toString()}
                                onValueChange={(v) => updateDetail("satisfactionRating", v ? Number(v) : null)}
                                disabled={ticket.status !== 'resolved' && ticket.status !== 'closed'}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Rate your experience" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5">5 - Very Satisfied</SelectItem>
                                    <SelectItem value="4">4 - Satisfied</SelectItem>
                                    <SelectItem value="3">3 - Neutral</SelectItem>
                                    <SelectItem value="2">2 - Unsatisfied</SelectItem>
                                    <SelectItem value="1">1 - Very Unsatisfied</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Feedback</Label>
                            <Textarea
                                placeholder="Share your feedback on the service you received..."
                                value={ticket.feedback || ""}
                                onChange={(e) => updateDetail("feedback", e.target.value)}
                                readOnly={ticket.status !== 'resolved' && ticket.status !== 'closed'}
                                rows={4}
                            />
                            {(ticket.status !== 'resolved' && ticket.status !== 'closed') ? (
                                <p className="text-xs text-muted-foreground">You can provide feedback once the ticket is resolved.</p>
                            ) : (
                                <div className="flex justify-end mt-2">
                                    <Button 
                                        onClick={handleSubmitFeedback}
                                        disabled={isEvaluating || !ticket.feedback || !ticket.satisfactionRating}
                                    >
                                        {isEvaluating ? "Submitting..." : "Submit Feedback"}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Tasks Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Tasks</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Track subtasks for this ticket.</span>
                        {canManageTasks && (
                            <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button onClick={() => setTaskDraft({ status: "pending" })}>Add Task</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>{taskDraft.id ? "Edit Task" : "Add Task"}</DialogTitle>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <Input placeholder="Title" value={taskDraft.title || ""} onChange={(e) => setTaskDraft((d) => ({ ...d, title: e.target.value }))} />
                                        <Textarea placeholder="Description" value={taskDraft.description || ""} onChange={(e) => setTaskDraft((d) => ({ ...d, description: e.target.value }))} />
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setTaskDialogOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button onClick={saveTask}>Save</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tasks.map((t) => (
                                <TableRow key={t.id}>
                                    <TableCell>{t.title}</TableCell>
                                    <TableCell>{t.status}</TableCell>
                                    <TableCell className="text-right">
                                        {canManageTasks && (
                                            <div className="flex justify-end gap-2">
                                                <Button variant="outline" size="sm" onClick={() => { setTaskDraft(t); setTaskDialogOpen(true); }}>
                                                    Edit
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="destructive" size="sm">
                                                            Delete
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Delete this task?</AlertDialogTitle>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => deleteTask(t.id)}>Delete</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        {tasks.length === 0 && <TableCaption>No tasks yet.</TableCaption>}
                    </Table>
                </CardContent>
            </Card>

            {/* Work Logs Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Work Logs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {canAddWorkLog && (
                        <div className="grid gap-3 md:grid-cols-[1fr_160px_120px]">
                            <Input placeholder="What did you work on?" value={workDesc} onChange={(e) => setWorkDesc(e.target.value)} />
                            <Input type="number" min={1} value={workMinutes} onChange={(e) => setWorkMinutes(Number(e.target.value || 0))} />
                            <div className="flex items-end">
                                <Button onClick={addWorkLog}>Add Log</Button>
                            </div>
                        </div>
                    )}
                    <div className="divide-y rounded-md border">
                        {workLogs.length === 0 ? (
                            <div className="p-4 text-sm text-muted-foreground">No work logs yet.</div>
                        ) : (
                            workLogs.map((w) => (
                                <div key={w.id} className="flex items-start justify-between gap-3 p-4">
                                    <div>
                                        <div className="text-sm font-medium">{w.description}</div>
                                        <div className="text-xs text-muted-foreground">
                                            Logged by Tech #{w.technicianId} &bull; {new Date(w.createdAt).toLocaleString()}
                                        </div>
                                    </div>
                                    <Badge variant="secondary">{w.timeSpentMinutes}m</Badge>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Audit Trail */}
            <Card>
                <CardHeader>
                    <CardTitle>Audit Trail</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {auditTrail.length === 0 ? (
                            <div className="text-sm text-muted-foreground">No audit entries yet.</div>
                        ) : (
                            auditTrail.map((a) => (
                                <div key={a.id} className="flex items-start gap-3 rounded-md border p-3">
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Badge variant="outline">{new Date(a.timestamp).toLocaleString()}</Badge>
                                            <span className="font-medium">{a.action.replace(/_/g, " ")}</span>
                                            <span className="text-xs text-muted-foreground">by {a.performedBy}</span>
                                        </div>
                                        <div className="mt-1 text-sm text-muted-foreground">{a.comment || `Value: ${a.newValue || a.oldValue || "N/A"}`}</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

