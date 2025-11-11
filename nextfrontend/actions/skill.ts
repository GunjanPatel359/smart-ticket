"use server"

import { getAdminToken } from "@/lib/authmiddleware"
import prisma from "@/lib/db";


export const getAllSkills = async ():Promise<{
    success: boolean;
    message: string;
    skills?: { id: number; name: string; description: string | null; isActive: boolean; category: string  }[];
}> => {
    try {
        const admin = await getAdminToken()
        if (!admin) {
            return { success: false, message: "Unauthorized" };
        }

        const skills = await prisma.skill.findMany({
            select:{
                name:true,
                id:true,
                category:true,
                description:true,
                isActive:true
            }
        })

        if (skills.length === 0) {
            return { success: false, message: "no skills found" };
        }

        return {
            success: true,
            message: "all the skills",
            skills,
        };

    } catch (error) {
        console.error("Error fetching all the skills", error);
        return { success: false, message: "Failed to fetching all the skills" };
    }
}

export const createSkill = async (
  data: { name: string; category: string; description?: string; isActive?: boolean }
): Promise<{ success: boolean; message: string; skill?: any }> => {
  try {
    const admin = await getAdminToken();
    if (!admin) {
      return { success: false, message: "Unauthorized" };
    }

    const skill = await prisma.skill.create({
      data: {
        name: data.name,
        category: data.category,
        description: data.description ?? null,
        isActive: data.isActive ?? true,
      },
    });

    return { success: true, message: "Skill created successfully", skill };
  } catch (error: any) {
    console.error("Error creating skill:", error);
    return { success: false, message: error?.message || "Failed to create skill" };
  }
};

// ✅ Update Skill
export const updateSkill = async (
  id: number,
  data: { name?: string; category?: string; description?: string; isActive?: boolean }
): Promise<{ success: boolean; message: string; skill?: any }> => {
  try {
    const admin = await getAdminToken();
    if (!admin) {
      return { success: false, message: "Unauthorized" };
    }

    const skill = await prisma.skill.update({
      where: { id },
      data,
    });

    return { success: true, message: "Skill updated successfully", skill };
  } catch (error: any) {
    console.error("Error updating skill:", error);
    return { success: false, message: error?.message || "Failed to update skill" };
  }
};

export const deleteSkill = async (
  id: number
): Promise<{ success: boolean; message: string }> => {
  try {
    const admin = await getAdminToken();
    if (!admin) {
      return { success: false, message: "Unauthorized" };
    }

    await prisma.skill.delete({
      where: { id },
    });

    return { success: true, message: "Skill deleted successfully" };
  } catch (error: any) {
    console.error("Error deleting skill:", error);
    return { success: false, message: error?.message || "Failed to delete skill" };
  }
};