import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const technicianId = parseInt(params.id);
    
    if (isNaN(technicianId)) {
      return NextResponse.json(
        { error: "Invalid technician ID" },
        { status: 400 }
      );
    }

    const technician = await prisma.technician.findUnique({
      where: { id: technicianId },
      include: {
        technicianSkills: {
          include: {
            skill: true
          }
        }
      }
    });

    if (!technician) {
      return NextResponse.json(
        { error: "Technician not found" },
        { status: 404 }
      );
    }

    // Format the response to match what the AI backend expects
    const formattedTechnician = {
      id: technician.id,
      name: technician.name,
      email: technician.email,
      department: technician.department,
      technicianLevel: technician.technicianLevel,
      currentTickets: technician.currentTickets,
      resolvedTickets: technician.resolvedTickets,
      totalTickets: technician.totalTickets,
      workload: technician.workload,
      isActive: technician.isActive,
      skills: technician.technicianSkills.map(ts => ({
        id: ts.skill.id,
        name: ts.skill.name,
        category: ts.skill.category,
        score: ts.score,
        percentage: ts.score // Some systems might expect 'percentage' instead of 'score'
      }))
    };

    return NextResponse.json({
      success: true,
      data: {
        technician: formattedTechnician
      }
    });

  } catch (error) {
    console.error("Error fetching technician:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}