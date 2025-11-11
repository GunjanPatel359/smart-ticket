"use server";

import prisma from "@/lib/db";
import { getAdminToken, getTechnicianToken, getUserToken } from "@/lib/authmiddleware";
import axios from "axios";
import { Ticket, TicketStatus } from "@prisma/client";

// Types
type CreateTicketInput = {
  subject: string;
  description: string;
  priority: "low" | "normal" | "high" | "critical"
  impact: "low" | "medium" | "high" | "critical";
  urgency: "low" | "normal" | "high" | "critical";
  tags?: string[];
};

// Create Ticket
export const createTicket = async (data: CreateTicketInput): Promise<{
  success: boolean;
  message: string;
  ticket?: any;
}> => {
  try {
    // ✅ Verify requester (must be a logged-in user)
    const user = await getUserToken();
    if (!user) {
      return { success: false, message: "Unauthorized" };
    }

    const userExists = await prisma.user.findUnique({
      where: {
        id: user.id,
        email: user.email
      }
    })

    if (!userExists) {
      return { success: false, message: "user does not exists" }
    }

    // ✅ Create ticket in DB along with initial audit trail
    const ticket = await prisma.ticket.create({
      data: {
        subject: data.subject,
        description: data.description,
        requesterId: user.id,
        priority: data.priority || "normal",
        impact: data.impact || "medium",
        urgency: data.urgency || "normal",
        tags: data.tags || [],
        status: "new",

        // Create initial audit trail entry
        auditTrail: {
          create: [
            {
              action: "ticket_created",
              oldValue: null,
              newValue: "Ticket created",
              comment: "Ticket submitted by user",
              performedBy: `user:${user.id}`,
              timestamp: new Date(),
            },
          ],
        },
      },
      include: {
        auditTrail: true,
      },
    });


    const aiResponse = await axios.post(
      `${process.env.AI_BACKEND_URL}/api/ticket-assignment`,
      {
        ticket: ticket,
      },
      { headers: { 'Content-Type': 'application/json' }, timeout: 120000 }
    )

    console.log("AI Response:", aiResponse.data);

    const skillCheck = await prisma.skill.findMany({
      where: {
        name: { in: aiResponse.data.existing_skills }
      }
    })

    let technicianId = aiResponse.data.assigned_technician_id || null;
    let justification = aiResponse.data.justification;

    const updatedTicket = await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        assignedTechnicianId: technicianId,
        justification: justification,
        requiredSkills: {
          set: skillCheck.map((skill: any) => ({ id: skill.id }))
        }
      },
      include: {
        requiredSkills: true
      }
    });

    return {
      success: true,
      message: "Ticket created successfully",
      ticket: updatedTicket,
    };
  } catch (error) {
    console.error("Error creating ticket:", error);
    return { success: false, message: "Failed to create ticket" };
  }
};

interface UpdateTicketInput {
  id: number;
  subject?: string;
  description?: string;
  status?: string;
  priority?: string;
  impact?: string;
  urgency?: string;
  tags?: string[];
  assignedTechnicianId?: number | null;
  justification?: string | null;
}

export const updateTicket = async (data: UpdateTicketInput): Promise<{
  success: boolean;
  message: string;
  ticket?: any;
  audit?: any;
}> => {
  try {
    // ✅ Verify admin or technician
    const admin = await getAdminToken();
    const technician = await getTechnicianToken();

    if (!admin && !technician) {
      return { success: false, message: "Unauthorized" };
    }

    const existingTicket = await prisma.ticket.findUnique({
      where: { id: data.id },
    });

    if (!existingTicket) {
      return { success: false, message: "Ticket not found" };
    }

    // Only assigned technician or admin can update
    if (technician && existingTicket.assignedTechnicianId !== technician.id) {
      return { success: false, message: "Forbidden" };
    }

    // 🔹 Prepare audit trail
    const updates: any = {};
    const auditChanges: { oldValue: string; newValue: string; field: string }[] = [];

    const fields: (keyof UpdateTicketInput)[] = [
      "subject",
      "description",
      "status",
      "priority",
      "impact",
      "urgency",
      "tags",
      "assignedTechnicianId",
      "justification",
    ];

    fields.forEach((field) => {
      const newValue = data[field];
      if (newValue !== undefined && newValue !== existingTicket[field as keyof typeof existingTicket]) {
        updates[field] = newValue;
        auditChanges.push({
          field,
          oldValue: JSON.stringify(existingTicket[field as keyof typeof existingTicket]),
          newValue: JSON.stringify(newValue),
        });
      }
    });

    if (Object.keys(updates).length === 0) {
      return { success: true, message: "No changes detected", ticket: existingTicket };
    }

    // 🔹 Update ticket and create audit in transaction
    const [updatedTicket, auditRecords] = await prisma.$transaction([
      prisma.ticket.update({
        where: { id: data.id },
        data: updates,
      }),
      prisma.auditTrail.createMany({
        data: auditChanges.map((change) => ({
          action: "ticket_updated",
          oldValue: change.oldValue,
          newValue: change.newValue,
          comment: `Field "${change.field}" updated`,
          performedBy: admin ? `admin:${admin.id}` : `technician:${technician!.id}`,
          timestamp: new Date(),
          ticketId: data.id,
        })),
      }),
    ]);

    return { success: true, message: "Ticket updated successfully", ticket: updatedTicket, audit: auditRecords };
  } catch (error) {
    console.error("Error updating ticket:", error);
    return { success: false, message: "Failed to update ticket" };
  }
};

export const getAllTickets = async ({
  page = 1,
  limit = 10,
  sortKey = "createdAt",
  sortOrder = "desc",
}: {
  page?: number;
  limit?: number;
  sortKey?: string;
  sortOrder?: "asc" | "desc";
}): Promise<{
  success: boolean;
  message: string;
  tickets?: any[];
  total?: number;
}> => {
  try {
    const admin = await getAdminToken();
    if (!admin) return { success: false, message: "Unauthorized" };

    const total = await prisma.ticket.count();

    const tickets = await prisma.ticket.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortKey]: sortOrder },
      include: {
        assignedTechnician: { select: { name: true } },
        requiredSkills: { select: { id: true, name: true } },
      },
    });

    return { success: true, message: "Tickets fetched", tickets, total };
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return { success: false, message: "Failed to fetch tickets" };
  }
};

export const getTechnicianCurrentTickets = async (): Promise<{
  success: boolean;
  message: string;
  tickets?: Ticket[];
}> => {
  try {
    const technician = await getTechnicianToken();
    if (!technician) return { success: false, message: "Unauthorized" };

    const tickets = await prisma.technician.findUnique({
      where: {
        id: technician.id
      },
      select: {
        assignedTickets: {
          where: {
            status: {
              in: [
                TicketStatus.assigned,
                TicketStatus.in_progress,
                TicketStatus.on_hold,
              ],
            },
          }
        }
      }
    })

    if (!tickets) {
      return { success: false, message: "No tickets assigned to technician", tickets: [] }
    }

    return { success: true, message: "Technician current tickets fetched", tickets: tickets?.assignedTickets || [] };
  } catch (error) {
    console.error("Error fetching technician open tickets:", error);
    return { success: false, message: "Failed to fetch technician open tickets" };
  }
}

export const getTechnicianAllTickets = async (): Promise<{
  success: boolean;
  message: string;
  tickets?: Ticket[];
}> => {
  try {
    const technician = await getTechnicianToken();
    if (!technician) return { success: false, message: "Unauthorized" };

    const tickets = await prisma.technician.findUnique({
      where: {
        id: technician.id
      },
      select: {
        assignedTickets: {
          orderBy: { createdAt: "desc" }
        }
      }
    })

    if (!tickets) {
      return { success: false, message: "No tickets assigned to technician", tickets: [] }
    }

    return { success: true, message: "All technician tickets fetched", tickets: tickets?.assignedTickets || [] };
  } catch (error) {
    console.error("Error fetching all technician tickets:", error);
    return { success: false, message: "Failed to fetch all technician tickets" };
  }
}

export const getUserSupportTickets = async (): Promise<{
  success: boolean;
  message: string;
  tickets?: Ticket[];
}> => {
  try {
    const user = await getUserToken();
    if (!user) return { success: false, message: "Unauthorized" };

    const tickets = await prisma.user.findUnique({
      where: {
        id: user.id
      },
      select: {
        requestedTickets: {
          orderBy: { createdAt: "desc" }
        },
      }
    })

    if (!tickets) {
      return { success: false, message: "No tickets requested by user", tickets: [] }
    }

    return { success: true, message: "User support tickets fetched", tickets: tickets?.requestedTickets || [] };
  } catch (error) {
    console.error("Error fetching user support tickets:", error);
    return { success: false, message: "Failed to fetch user support tickets" };
  }
}

export const getTicketById = async (id: number): Promise<{
  success: boolean;
  message: string;
  ticket?: any;
}> => {
  try {
    if (!id || isNaN(id) || id <= 0) {
      return { success: false, message: "Invalid ticket ID" };
    }
    const admin = await getAdminToken();
    const technician = await getTechnicianToken();
    const user = await getUserToken();
    if (!admin && !technician && !user) {
      return { success: false, message: "Unauthorized" };
    }
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        tasks: true,
        workLogs: {
          orderBy: { createdAt: "desc" },
        },
        auditTrail: {
          orderBy: { timestamp: "desc" },
        },
        assignedTechnician: { select: { id: true, name: true } },
        requester: { select: { id: true, name: true, email: true } },
        requiredSkills: { select: { id: true, name: true } },
      },
    });
    if (!ticket) {
      return { success: false, message: "Ticket not found" };
    }
    if (admin){
      return { success: true, message: "Ticket fetched", ticket };
    }
    // ✅ Authorization
    if (technician && ticket.assignedTechnicianId !== technician.id) {
      return { success: false, message: "Forbidden" };
    }

    if (user && ticket.requesterId !== user.id) {
      return { success: false, message: "Forbidden" };
    }

    return { success: true, message: "Ticket fetched", ticket };
  } catch (error) {
    console.error("Error fetching ticket by ID:", error);
    return { success: false, message: "Failed to fetch ticket" };
  }
};

type TaskPayload = {
  id: number;
  title: string;
  description?: string | null;
  status: string;
  assignedTo?: number | null;
  dueDate?: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  ticketId: number;
};

type AuditPayload = {
  id: number;
  action: string;
  oldValue?: string | null;
  newValue?: string | null;
  comment?: string | null;
  performedBy: string;
  timestamp: Date;
  ticketId: number;
};

// ✅ Add new task with audit
export const addTechnicianTask = async (
  ticketId: number,
  title: string,
  description?: string,
  dueDateTimestamp?: number
): Promise<{
  success: boolean;
  message: string;
  task?: TaskPayload;
  audit?: AuditPayload;
}> => {
  try {
    const technician = await getTechnicianToken();
    if (!technician) return { success: false, message: "Unauthorized" };

    const dueDate = dueDateTimestamp ? new Date(dueDateTimestamp) : null;

    const [task, audit] = await prisma.$transaction([
      prisma.task.create({
        data: {
          title,
          description: description || null,
          status: "pending",
          dueDate,
          assignedTo: technician.id,
          ticket: { connect: { id: ticketId } },
        },
      }),
      prisma.auditTrail.create({
        data: {
          action: "added_task",
          oldValue: null,
          newValue: title,
          comment: "Task created and assigned",
          performedBy: `technician:${technician.id}`,
          ticket: { connect: { id: ticketId } },
        },
      }),
    ]);

    return { success: true, message: "Task added successfully", task, audit };
  } catch (error) {
    console.error("Error adding task:", error);
    return { success: false, message: "Failed to add task" };
  }
};

// ✅ Update existing task with audit
export const updateTechnicianTask = async (
  taskId: number,
  updates: {
    title?: string;
    description?: string;
    status?: string;
    dueDateTimestamp?: number | null;
  }
): Promise<{
  success: boolean;
  message: string;
  task?: TaskPayload;
  audit?: AuditPayload;
}> => {
  try {
    const technician = await getTechnicianToken();
    if (!technician) return { success: false, message: "Unauthorized" };

    const existingTask = await prisma.task.findUnique({ where: { id: taskId } });
    if (!existingTask) return { success: false, message: "Task not found" };
    if (existingTask.assignedTo !== technician.id) return { success: false, message: "Forbidden" };

    const dueDate = updates.dueDateTimestamp !== undefined
      ? updates.dueDateTimestamp !== null
        ? new Date(updates.dueDateTimestamp)
        : null
      : undefined;

    const [task, audit] = await prisma.$transaction([
      prisma.task.update({
        where: { id: taskId },
        data: {
          title: updates.title ?? existingTask.title,
          description: updates.description ?? existingTask.description,
          status: updates.status ?? existingTask.status,
          dueDate: dueDate !== undefined ? { set: dueDate } : undefined,
        },
      }),
      prisma.auditTrail.create({
        data: {
          action: "edited_task",
          oldValue: existingTask.title,
          newValue: updates.title ?? existingTask.title,
          comment: "Task updated",
          performedBy: `technician:${technician.id}`,
          ticket: { connect: { id: existingTask.ticketId } },
        },
      }),
    ]);

    return { success: true, message: "Task updated successfully", task, audit };
  } catch (error) {
    console.error("Error updating task:", error);
    return { success: false, message: "Failed to update task" };
  }
};


export const deleteTechnicianTask = async (
  taskId: number
): Promise<{ success: boolean; message: string; audit?: { id: number; action: string; performedBy: string; timestamp: Date; ticketId: number } }> => {
  try {
    const technician = await getTechnicianToken();
    if (!technician) return { success: false, message: "Unauthorized" };

    const existingTask = await prisma.task.findUnique({ where: { id: taskId } });
    if (!existingTask) return { success: false, message: "Task not found" };
    if (existingTask.assignedTo !== technician.id) return { success: false, message: "Forbidden" };

    const [_, audit] = await prisma.$transaction([
      prisma.task.delete({ where: { id: taskId } }),
      prisma.auditTrail.create({
        data: {
          action: "deleted_task",
          oldValue: existingTask.title,
          newValue: null,
          comment: "Task deleted",
          performedBy: `technician:${technician.id}`,
          ticket: { connect: { id: existingTask.ticketId } },
        },
      }),
    ]);

    return { success: true, message: "Task deleted successfully", audit };
  } catch (error) {
    console.error("Error deleting task", error);
    return { success: false, message: "Failed to delete task" };
  }
};

export const addTechnicianWorkLog = async (
  ticketId: number,
  title: string,
  description: string,
  dueDate: number
) => {
  try {
    const technician = await getTechnicianToken();
    if (!technician) return { success: false, message: "Unauthorized" };

    // ✅ Use Prisma transaction so both operations succeed or fail together
    const [task, audit] = await prisma.$transaction([
      prisma.task.create({
        data: {
          ticketId,
          title,
          description,
          dueDate: new Date(dueDate),
          assignedTo: technician.id,
        },
      }),

      prisma.auditTrail.create({
        data: {
          action: "task_created",
          oldValue: null,
          newValue: title,
          comment: `Task added by technician ${technician.email}`,
          performedBy: `technician:${technician.id}`,
          ticket: { connect: { id: ticketId } },
        },
      }),
    ]);

    return { success: true, message: "Task added successfully", task, audit };
  } catch (error) {
    console.error("Error adding task", error);
    return { success: false, message: "Failed to add task" };
  }
};

