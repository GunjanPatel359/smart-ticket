"use server";

import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {

    const skills = await prisma.skill.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (skills.length === 0) {
      return NextResponse.json(
        { success: false, message: "No skills found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        skills:skills,
        total: skills.length,
      },
    });
  } catch (error: any) {
    console.error("Get all skills simple error:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching skills", error: error.message },
      { status: 500 }
    );
  }
}
