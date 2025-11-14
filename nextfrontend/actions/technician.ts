"use server"

import { getAdminToken } from "@/lib/authmiddleware";
import prisma from "@/lib/db";
import { AvailabilityStatus, SkillLevel } from "@prisma/client";
import { calculateWorkloadScore } from "@/lib/score";

export const getAllTechnicians = async (
  page: number = 1,
  limit: number = 10,
  sortField: string = "name",
  sortOrder: "asc" | "desc" = "asc"
): Promise<{
  success: boolean;
  message: string;
  technicians?: {
    id: number;
    name: string;
    email: string;
    technicianLevel: SkillLevel;
    availabilityStatus: AvailabilityStatus;
    department: string | null;
    workload: number;
    currentTickets: number;
    resolvedTickets: number;
    totalTickets: number;
    experience: number;
    technicianSkills: { skill: { name: string } }[];
  }[];
  total?: number;
  totalPages?: number;
}> => {
  try {
    const admin = await getAdminToken();
    if (!admin) {
      return { success: false, message: "Unauthorized" };
    }

    const skip = (page - 1) * limit;

    const [technicians, total] = await Promise.all([
      prisma.technician.findMany({
        skip,
        take: limit,
        orderBy: {
          [sortField]: sortOrder,
        },
        select: {
          id: true,
          name: true,
          email: true,
          technicianLevel: true,
          availabilityStatus: true,
          technicianSkills: {
            select: {
              skill: {
                select: { name: true },
              },
            },
          },
          department: true,
          workload: true,
          experience: true,
          assignedTickets: {
            select: {
              id: true,
              status: true,
              priority: true,
              impact: true,
              urgency: true,
            },
          },
        },
      }),
      prisma.technician.count(),
    ]);

    // Calculate real-time statistics from actual ticket data
    const techniciansWithStats = technicians.map((tech) => {
      const activeTickets = tech.assignedTickets.filter(
        (ticket) => 
          ticket.status === "assigned" || 
          ticket.status === "in_progress" || 
          ticket.status === "on_hold"
      );

      const currentTickets = activeTickets.length;

      const resolvedTickets = tech.assignedTickets.filter(
        (ticket) => ticket.status === "resolved" || ticket.status === "closed"
      ).length;

      const totalTickets = tech.assignedTickets.length;

      // Calculate workload based on ticket complexity scores
      const totalWorkloadScore = activeTickets.reduce((sum, ticket) => {
        return sum + calculateWorkloadScore(ticket as any);
      }, 0);

      // Normalize workload to percentage (assuming max score of 200 = 100% workload)
      // Max score per ticket is ~20 (8+6+6), so 10 complex tickets = 200
      const workload = Math.min(Math.round((totalWorkloadScore / 200) * 100), 100);

      return {
        id: tech.id,
        name: tech.name,
        email: tech.email,
        technicianLevel: tech.technicianLevel,
        availabilityStatus: tech.availabilityStatus,
        department: tech.department,
        workload,
        currentTickets,
        resolvedTickets,
        totalTickets,
        experience: tech.experience,
        technicianSkills: tech.technicianSkills,
      };
    });

    return {
      success: true,
      message: "all the technicians",
      technicians: techniciansWithStats,
      total,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error: any) {
    console.error("Error fetching technicians:", error);
    return { success: false, message: error?.message || "Failed to get all the technician data" };
  }
};

export const getAllTechniciansWithoutPagination = async (): Promise<{
  success: boolean;
  message: string;
  technicians?: {
    id: number;
    name: string;
    email: string;
    technicianLevel: SkillLevel;
    availabilityStatus: AvailabilityStatus;
    department: string | null;
    workload: number;
    currentTickets: number;
    resolvedTickets: number;
    totalTickets: number;
    experience: number;
    technicianSkills: { skill: { name: string } }[];
  }[];
}> => {
  try {
    const admin = await getAdminToken();
    if (!admin) {
      return { success: false, message: "Unauthorized" };
    }

    const technicians = await prisma.technician.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          technicianLevel: true,
          availabilityStatus: true,
          technicianSkills: {
            select: {
              skill: {
                select: { name: true },
              },
            },
          },
          department: true,
          experience: true,
          assignedTickets: {
            select: {
              id: true,
              status: true,
              priority: true,
              impact: true,
              urgency: true,
            },
          },
        },
      })

    // Calculate real-time statistics from actual ticket data
    const techniciansWithStats = technicians.map((tech) => {
      const activeTickets = tech.assignedTickets.filter(
        (ticket) => 
          ticket.status === "assigned" || 
          ticket.status === "in_progress" || 
          ticket.status === "on_hold"
      );

      const currentTickets = activeTickets.length;

      const resolvedTickets = tech.assignedTickets.filter(
        (ticket) => ticket.status === "resolved" || ticket.status === "closed"
      ).length;

      const totalTickets = tech.assignedTickets.length;

      // Calculate workload based on ticket complexity scores
      const totalWorkloadScore = activeTickets.reduce((sum, ticket) => {
        return sum + calculateWorkloadScore(ticket as any);
      }, 0);

      // Normalize workload to percentage (assuming max score of 200 = 100% workload)
      // Max score per ticket is ~20 (8+6+6), so 10 complex tickets = 200
      const workload = Math.min(Math.round((totalWorkloadScore / 200) * 100), 100);

      return {
        id: tech.id,
        name: tech.name,
        email: tech.email,
        technicianLevel: tech.technicianLevel,
        availabilityStatus: tech.availabilityStatus,
        department: tech.department,
        workload,
        currentTickets,
        resolvedTickets,
        totalTickets,
        experience: tech.experience,
        technicianSkills: tech.technicianSkills,
      };
    });

    return {
      success: true,
      message: "all the technicians",
      technicians: techniciansWithStats
    };
  } catch (error: any) {
    console.error("Error fetching technicians without pagination:", error);
    return { success: false, message: error?.message || "Failed to get all the technician data without pagination" };
  }
}

export const getTechnician = async (technicianId: number): Promise<{
  success: boolean,
  message: string,
  technician?: {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    email: string;
    contactNo: string | null;
    department: string | null;
    currentTickets: number;
    resolvedTickets: number;
    totalTickets: number;
    workload: number;
    technicianLevel: string;
    availabilityStatus: string;
    isActive: boolean;
    experience: number;
    technicianSkills: { id: number; skillId: number; score: number; skill: { id: number; name: string; category: string } }[];
  }
}> =>{
  try {
    if (!technicianId){
      return {success:false,message:"provide technician Id"}
    }

    const technician = await prisma.technician.findUnique({
      where:{
        id: technicianId
      },
      include:{
        technicianSkills:{
          include:{
            skill: true
          }
        }
      }
    })

    if (!technician){
      return {success:false, message:"could not find the technician"}
    }

    return {success:true, message:"successfully fetched the technician", technician}
  } catch (error: any) {
    console.error("Error fetching technician", error);
    return { success: false, message: error?.message || "Failed to get the technician data" };
  }
}

export const createTechnician = async (data: {
  name: string;
  email: string;
  password: string;
  contactNo?: string;
  department?: string;
  technicianLevel: SkillLevel;
  availabilityStatus: AvailabilityStatus;
}): Promise<{
  success: boolean;
  message: string;
  technician?: any;
}> => {
  try {
    const admin = await getAdminToken();
    if (!admin) {
      return { success: false, message: "Unauthorized" };
    }

    // Check if email already exists
    const existingTechnician = await prisma.technician.findUnique({
      where: { email: data.email }
    });

    if (existingTechnician) {
      return { success: false, message: "A technician with this email already exists" };
    }

    const technician = await prisma.technician.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        contactNo: data.contactNo || null,
        department: data.department || null,
        technicianLevel: data.technicianLevel,
        availabilityStatus: data.availabilityStatus,
        currentTickets: 0,
        resolvedTickets: 0,
        totalTickets: 0,
        workload: 0,
        experience: 0,
        isActive: true,
      },
    });

    return {
      success: true,
      message: "Technician created successfully",
      technician,
    };
  } catch (error: any) {
    console.error("Error creating technician:", error);
    return { success: false, message: error?.message || "Failed to create technician" };
  }
};

export const updateTechnician = async (
  technicianId: number,
  data: {
    name?: string;
    email?: string;
    contactNo?: string | null;
    department?: string | null;
    technicianLevel?: SkillLevel;
    availabilityStatus?: AvailabilityStatus;
    isActive?: boolean;
    experience?: number;
  }
): Promise<{
  success: boolean;
  message: string;
  technician?: any;
}> => {
  try {
    const admin = await getAdminToken();
    if (!admin) {
      return { success: false, message: "Unauthorized" };
    }

    // If email is being updated, check if it's already taken by another technician
    if (data.email) {
      const existingTechnician = await prisma.technician.findUnique({
        where: { email: data.email }
      });

      if (existingTechnician && existingTechnician.id !== technicianId) {
        return { success: false, message: "This email is already in use by another technician" };
      }
    }

    const technician = await prisma.technician.update({
      where: { id: technicianId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.contactNo !== undefined && { contactNo: data.contactNo }),
        ...(data.department !== undefined && { department: data.department }),
        ...(data.technicianLevel !== undefined && { technicianLevel: data.technicianLevel }),
        ...(data.availabilityStatus !== undefined && { availabilityStatus: data.availabilityStatus }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.experience !== undefined && { experience: data.experience }),
      },
      include: {
        technicianSkills: {
          include: {
            skill: true
          }
        }
      }
    });

    return {
      success: true,
      message: "Technician updated successfully",
      technician,
    };
  } catch (error: any) {
    console.error("Error updating technician:", error);
    return { success: false, message: error?.message || "Failed to update technician" };
  }
};

export const getAllSkills = async (): Promise<{
  success: boolean;
  message: string;
  skills?: { id: number; name: string; category: string; description: string | null }[];
}> => {
  try {
    const skills = await prisma.skill.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        category: true,
        description: true,
      },
      orderBy: { name: "asc" }
    });

    return {
      success: true,
      message: "Skills fetched successfully",
      skills,
    };
  } catch (error: any) {
    console.error("Error fetching skills:", error);
    return { success: false, message: error?.message || "Failed to fetch skills" };
  }
};

export const addTechnicianSkill = async (
  technicianId: number,
  skillId: number,
  score: number = 50
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const admin = await getAdminToken();
    if (!admin) {
      return { success: false, message: "Unauthorized" };
    }

    // Check if skill already exists for this technician
    const existing = await prisma.technicianSkill.findUnique({
      where: {
        technicianId_skillId: {
          technicianId,
          skillId
        }
      }
    });

    if (existing) {
      return { success: false, message: "This skill is already assigned to the technician" };
    }

    await prisma.technicianSkill.create({
      data: {
        technicianId,
        skillId,
        score: Math.min(100, Math.max(0, score))
      }
    });

    return {
      success: true,
      message: "Skill added successfully",
    };
  } catch (error: any) {
    console.error("Error adding technician skill:", error);
    return { success: false, message: error?.message || "Failed to add skill" };
  }
};

export const updateTechnicianSkillScore = async (
  technicianId: number,
  skillId: number,
  score: number
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const admin = await getAdminToken();
    if (!admin) {
      return { success: false, message: "Unauthorized" };
    }

    await prisma.technicianSkill.update({
      where: {
        technicianId_skillId: {
          technicianId,
          skillId
        }
      },
      data: {
        score: Math.min(100, Math.max(0, score))
      }
    });

    return {
      success: true,
      message: "Skill score updated successfully",
    };
  } catch (error: any) {
    console.error("Error updating skill score:", error);
    return { success: false, message: error?.message || "Failed to update skill score" };
  }
};

export const removeTechnicianSkill = async (
  technicianId: number,
  skillId: number
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const admin = await getAdminToken();
    if (!admin) {
      return { success: false, message: "Unauthorized" };
    }

    await prisma.technicianSkill.delete({
      where: {
        technicianId_skillId: {
          technicianId,
          skillId
        }
      }
    });

    return {
      success: true,
      message: "Skill removed successfully",
    };
  } catch (error: any) {
    console.error("Error removing technician skill:", error);
    return { success: false, message: error?.message || "Failed to remove skill" };
  }
};
