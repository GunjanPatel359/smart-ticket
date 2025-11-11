"use server"

import { getAdminToken } from "@/lib/authmiddleware";
import prisma from "@/lib/db";
import { AvailabilityStatus, SkillLevel } from "@prisma/client";

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
          currentTickets: true,
          resolvedTickets: true,
          totalTickets: true,
          experience: true,
        },
      }),
      prisma.technician.count(),
    ]);

    return {
      success: true,
      message: "all the technicians",
      technicians,
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
          workload: true,
          currentTickets: true,
          resolvedTickets: true,
          totalTickets: true,
          experience: true,
        },
      })

    return {
      success: true,
      message: "all the technicians",
      technicians
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