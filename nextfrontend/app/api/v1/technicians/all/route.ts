"use server";

import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest) {
  try {
    const technicians = await prisma.technician.findMany({
        where: { isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
        isActive: true,
        currentTickets: true,
        resolvedTickets: true,
        totalTickets: true,
        workload: true,
        technicianSkills:{
            select:{
                score: true,
                skill:{
                    select:{
                        id:true,
                        name:true
                    }
                }
            }
        },
        technicianLevel: true,
        availabilityStatus: true,
        experience: true
      },
    });

    if (technicians.length === 0) {
        return NextResponse.json(
            { success: false, message: "No technicians found" },
            { status: 404 }
        )
    }

    return NextResponse.json({
        success: true,
        data: {
            technicians:technicians,
            total: technicians.length,
        }
    })
  }catch (error:any){
        console.error("Get all Technician error:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching Technician", error: error.message },
      { status: 500 }
    );
  }
}