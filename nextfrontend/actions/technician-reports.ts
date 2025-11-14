"use server"

import { getTechnicianToken } from "@/lib/authmiddleware";
import prisma from "@/lib/db";

export const getTechnicianReport = async (startDate?: Date, endDate?: Date) => {
  try {
    const technician = await getTechnicianToken();
    if (!technician) {
      return { success: false, message: "Unauthorized" };
    }

    const technicianId = technician.id;

    const now = new Date();
    const start = startDate || new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate || now;

    // Get technician details
    const technicianData = await prisma.technician.findUnique({
      where: { id: technicianId },
      include: {
        technicianSkills: {
          include: {
            skill: true,
          },
        },
      },
    });

    if (!technicianData) {
      return { success: false, message: "Technician not found" };
    }

    // Ticket statistics for this technician
    const [
      totalAssignedTickets,
      resolvedTickets,
      inProgressTickets,
      onHoldTickets,
      closedTickets,
      slaViolatedTickets,
      ticketsWithFeedback,
      reopenedTickets,
    ] = await Promise.all([
      prisma.ticket.count({
        where: {
          assignedTechnicianId: technicianId,
          createdAt: { gte: start, lte: end },
        },
      }),
      prisma.ticket.count({
        where: {
          assignedTechnicianId: technicianId,
          status: "resolved",
          createdAt: { gte: start, lte: end },
        },
      }),
      prisma.ticket.count({
        where: {
          assignedTechnicianId: technicianId,
          status: "in_progress",
          createdAt: { gte: start, lte: end },
        },
      }),
      prisma.ticket.count({
        where: {
          assignedTechnicianId: technicianId,
          status: "on_hold",
          createdAt: { gte: start, lte: end },
        },
      }),
      prisma.ticket.count({
        where: {
          assignedTechnicianId: technicianId,
          status: "closed",
          createdAt: { gte: start, lte: end },
        },
      }),
      prisma.ticket.count({
        where: {
          assignedTechnicianId: technicianId,
          slaViolated: true,
          createdAt: { gte: start, lte: end },
        },
      }),
      prisma.ticket.count({
        where: {
          assignedTechnicianId: technicianId,
          feedback: { not: null },
          createdAt: { gte: start, lte: end },
        },
      }),
      prisma.ticket.count({
        where: {
          assignedTechnicianId: technicianId,
          reopenedCount: { gt: 0 },
          createdAt: { gte: start, lte: end },
        },
      }),
    ]);

    // Priority distribution
    const [lowPriority, normalPriority, highPriority, criticalPriority] = await Promise.all([
      prisma.ticket.count({
        where: {
          assignedTechnicianId: technicianId,
          priority: "low",
          createdAt: { gte: start, lte: end },
        },
      }),
      prisma.ticket.count({
        where: {
          assignedTechnicianId: technicianId,
          priority: "normal",
          createdAt: { gte: start, lte: end },
        },
      }),
      prisma.ticket.count({
        where: {
          assignedTechnicianId: technicianId,
          priority: "high",
          createdAt: { gte: start, lte: end },
        },
      }),
      prisma.ticket.count({
        where: {
          assignedTechnicianId: technicianId,
          priority: "critical",
          createdAt: { gte: start, lte: end },
        },
      }),
    ]);

    // Average satisfaction rating
    const satisfactionData = await prisma.ticket.aggregate({
      where: {
        assignedTechnicianId: technicianId,
        satisfactionRating: { not: null },
        createdAt: { gte: start, lte: end },
      },
      _avg: { satisfactionRating: true },
      _count: { satisfactionRating: true },
    });

    // Resolution time statistics
    const resolutionTimeData = await prisma.ticket.findMany({
      where: {
        assignedTechnicianId: technicianId,
        resolutionTime: { not: null },
        createdAt: { gte: start, lte: end },
      },
      select: {
        createdAt: true,
        resolutionTime: true,
      },
    });

    const resolutionTimes = resolutionTimeData.map((ticket) => {
      const created = new Date(ticket.createdAt).getTime();
      const resolved = new Date(ticket.resolutionTime!).getTime();
      return (resolved - created) / (1000 * 60 * 60); // hours
    });

    const avgResolutionTime =
      resolutionTimes.length > 0
        ? resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length
        : 0;

    // First response time statistics
    const firstResponseData = await prisma.ticket.findMany({
      where: {
        assignedTechnicianId: technicianId,
        firstResponseTime: { not: null },
        createdAt: { gte: start, lte: end },
      },
      select: {
        createdAt: true,
        firstResponseTime: true,
      },
    });

    const firstResponseTimes = firstResponseData.map((ticket) => {
      const created = new Date(ticket.createdAt).getTime();
      const responded = new Date(ticket.firstResponseTime!).getTime();
      return (responded - created) / (1000 * 60 * 60); // hours
    });

    const avgFirstResponseTime =
      firstResponseTimes.length > 0
        ? firstResponseTimes.reduce((a, b) => a + b, 0) / firstResponseTimes.length
        : 0;

    // Work logs statistics
    const workLogs = await prisma.workLog.aggregate({
      where: {
        technicianId: technicianId,
        createdAt: { gte: start, lte: end },
      },
      _sum: { timeSpentMinutes: true },
      _count: true,
    });

    const totalTimeSpent = workLogs._sum.timeSpentMinutes || 0;
    const totalWorkLogs = workLogs._count || 0;

    return {
      success: true,
      data: {
        period: {
          start: start.toISOString(),
          end: end.toISOString(),
        },
        technician: {
          id: technicianData.id,
          name: technicianData.name,
          email: technicianData.email,
          level: technicianData.technicianLevel,
          department: technicianData.department,
          currentTickets: technicianData.currentTickets,
          resolvedTickets: technicianData.resolvedTickets,
          totalTickets: technicianData.totalTickets,
          workload: technicianData.workload,
          experience: technicianData.experience,
          skills: technicianData.technicianSkills.map((ts) => ({
            name: ts.skill.name,
            category: ts.skill.category,
            score: ts.score,
          })),
        },
        tickets: {
          total: totalAssignedTickets,
          resolved: resolvedTickets,
          inProgress: inProgressTickets,
          onHold: onHoldTickets,
          closed: closedTickets,
          byPriority: {
            low: lowPriority,
            normal: normalPriority,
            high: highPriority,
            critical: criticalPriority,
          },
          slaViolated: slaViolatedTickets,
          reopened: reopenedTickets,
          withFeedback: ticketsWithFeedback,
        },
        performance: {
          avgResolutionTimeHours: parseFloat(avgResolutionTime.toFixed(2)),
          avgFirstResponseTimeHours: parseFloat(avgFirstResponseTime.toFixed(2)),
          resolutionRate:
            totalAssignedTickets > 0
              ? parseFloat((((resolvedTickets + closedTickets) / totalAssignedTickets) * 100).toFixed(2))
              : 0,
          slaCompliance:
            totalAssignedTickets > 0
              ? parseFloat((((totalAssignedTickets - slaViolatedTickets) / totalAssignedTickets) * 100).toFixed(2))
              : 0,
          avgSatisfactionRating: satisfactionData._avg.satisfactionRating
            ? parseFloat(satisfactionData._avg.satisfactionRating.toFixed(2))
            : null,
          satisfactionResponseCount: satisfactionData._count.satisfactionRating,
        },
        workLogs: {
          total: totalWorkLogs,
          totalTimeSpentHours: parseFloat((totalTimeSpent / 60).toFixed(2)),
          avgTimePerLogMinutes: totalWorkLogs > 0 ? parseFloat((totalTimeSpent / totalWorkLogs).toFixed(2)) : 0,
        },
      },
    };
  } catch (error: any) {
    console.error("Error generating technician report:", error);
    return { success: false, message: error?.message || "Failed to generate report" };
  }
};
