"use server"

import { getAdminToken, getUserToken } from "@/lib/authmiddleware";
import prisma from "@/lib/db";

export const getDetailedReport = async (startDate?: Date, endDate?: Date) => {
  try {
    const admin = await getAdminToken();
    if (!admin) {
      return { success: false, message: "Unauthorized" };
    }

    const now = new Date();
    const start = startDate || new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate || now;

    // Ticket Statistics
    const [
      totalTickets,
      newTickets,
      assignedTickets,
      inProgressTickets,
      onHoldTickets,
      resolvedTickets,
      closedTickets,
      cancelledTickets,
      slaViolatedTickets,
      ticketsWithFeedback,
      reopenedTickets,
    ] = await Promise.all([
      prisma.ticket.count({ where: { createdAt: { gte: start, lte: end } } }),
      prisma.ticket.count({ where: { status: "new", createdAt: { gte: start, lte: end } } }),
      prisma.ticket.count({ where: { status: "assigned", createdAt: { gte: start, lte: end } } }),
      prisma.ticket.count({ where: { status: "in_progress", createdAt: { gte: start, lte: end } } }),
      prisma.ticket.count({ where: { status: "on_hold", createdAt: { gte: start, lte: end } } }),
      prisma.ticket.count({ where: { status: "resolved", createdAt: { gte: start, lte: end } } }),
      prisma.ticket.count({ where: { status: "closed", createdAt: { gte: start, lte: end } } }),
      prisma.ticket.count({ where: { status: "cancelled", createdAt: { gte: start, lte: end } } }),
      prisma.ticket.count({ where: { slaViolated: true, createdAt: { gte: start, lte: end } } }),
      prisma.ticket.count({ where: { feedback: { not: null }, createdAt: { gte: start, lte: end } } }),
      prisma.ticket.count({ where: { reopenedCount: { gt: 0 }, createdAt: { gte: start, lte: end } } }),
    ]);

    // Priority Distribution
    const [lowPriority, normalPriority, highPriority, criticalPriority] = await Promise.all([
      prisma.ticket.count({ where: { priority: "low", createdAt: { gte: start, lte: end } } }),
      prisma.ticket.count({ where: { priority: "normal", createdAt: { gte: start, lte: end } } }),
      prisma.ticket.count({ where: { priority: "high", createdAt: { gte: start, lte: end } } }),
      prisma.ticket.count({ where: { priority: "critical", createdAt: { gte: start, lte: end } } }),
    ]);

    // Average satisfaction rating
    const satisfactionData = await prisma.ticket.aggregate({
      where: { satisfactionRating: { not: null }, createdAt: { gte: start, lte: end } },
      _avg: { satisfactionRating: true },
      _count: { satisfactionRating: true },
    });

    // Resolution time statistics
    const resolutionTimeData = await prisma.ticket.findMany({
      where: {
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

    // Technician Statistics
    const [totalTechnicians, activeTechnicians, technicianStats] = await Promise.all([
      prisma.technician.count(),
      prisma.technician.count({ where: { isActive: true } }),
      prisma.technician.findMany({
        select: {
          id: true,
          name: true,
          currentTickets: true,
          resolvedTickets: true,
          totalTickets: true,
          workload: true,
          technicianLevel: true,
          isActive: true,
        },
      }),
    ]);

    const totalWorkload = technicianStats.reduce((sum, tech) => sum + tech.workload, 0);
    const avgWorkload = activeTechnicians > 0 ? totalWorkload / activeTechnicians : 0;

    const totalResolvedByTechs = technicianStats.reduce((sum, tech) => sum + tech.resolvedTickets, 0);

    // User Statistics
    const [totalUsers, activeUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          requestedTickets: {
            some: {
              createdAt: { gte: start, lte: end },
            },
          },
        },
      }),
    ]);

    // Skills Statistics
    const totalSkills = await prisma.skill.count({ where: { isActive: true } });

    // Work logs statistics
    const workLogs = await prisma.workLog.aggregate({
      where: {
        createdAt: { gte: start, lte: end },
      },
      _sum: { timeSpentMinutes: true },
      _count: true,
    });

    const totalTimeSpent = workLogs._sum.timeSpentMinutes || 0;
    const totalWorkLogs = workLogs._count || 0;

    // Escalation statistics
    const escalatedTickets = await prisma.ticket.count({
      where: {
        escalationCount: { gt: 0 },
        createdAt: { gte: start, lte: end },
      },
    });

    // Top performing technicians
    const topTechnicians = technicianStats
      .filter((t) => t.isActive)
      .sort((a, b) => b.resolvedTickets - a.resolvedTickets)
      .slice(0, 5);

    return {
      success: true,
      data: {
        period: {
          start: start.toISOString(),
          end: end.toISOString(),
        },
        tickets: {
          total: totalTickets,
          byStatus: {
            new: newTickets,
            assigned: assignedTickets,
            inProgress: inProgressTickets,
            onHold: onHoldTickets,
            resolved: resolvedTickets,
            closed: closedTickets,
            cancelled: cancelledTickets,
          },
          byPriority: {
            low: lowPriority,
            normal: normalPriority,
            high: highPriority,
            critical: criticalPriority,
          },
          slaViolated: slaViolatedTickets,
          reopened: reopenedTickets,
          escalated: escalatedTickets,
          withFeedback: ticketsWithFeedback,
        },
        performance: {
          avgResolutionTimeHours: parseFloat(avgResolutionTime.toFixed(2)),
          avgFirstResponseTimeHours: parseFloat(avgFirstResponseTime.toFixed(2)),
          resolutionRate: totalTickets > 0 ? parseFloat(((resolvedTickets + closedTickets) / totalTickets * 100).toFixed(2)) : 0,
          slaCompliance: totalTickets > 0 ? parseFloat(((totalTickets - slaViolatedTickets) / totalTickets * 100).toFixed(2)) : 0,
          avgSatisfactionRating: satisfactionData._avg.satisfactionRating
            ? parseFloat(satisfactionData._avg.satisfactionRating.toFixed(2))
            : null,
          satisfactionResponseCount: satisfactionData._count.satisfactionRating,
        },
        technicians: {
          total: totalTechnicians,
          active: activeTechnicians,
          avgWorkload: parseFloat(avgWorkload.toFixed(2)),
          totalResolved: totalResolvedByTechs,
          topPerformers: topTechnicians.map((t) => ({
            id: t.id,
            name: t.name,
            resolvedTickets: t.resolvedTickets,
            currentTickets: t.currentTickets,
            level: t.technicianLevel,
          })),
        },
        users: {
          total: totalUsers,
          activeInPeriod: activeUsers,
        },
        skills: {
          total: totalSkills,
        },
        workLogs: {
          total: totalWorkLogs,
          totalTimeSpentHours: parseFloat((totalTimeSpent / 60).toFixed(2)),
          avgTimePerLogMinutes: totalWorkLogs > 0 ? parseFloat((totalTimeSpent / totalWorkLogs).toFixed(2)) : 0,
        },
      },
    };
  } catch (error: any) {
    console.error("Error generating report:", error);
    return { success: false, message: error?.message || "Failed to generate report" };
  }
};

export const getUserReport = async (days: number = 30) => {
  try {
    const user = await getUserToken();
    if (!user) {
      return { success: false, message: "Unauthorized" };
    }

    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    // Get user's tickets within the selected timeframe
    const tickets = await prisma.ticket.findMany({
      where: {
        requesterId: user.id,
        createdAt: { gte: startDate, lte: now },
      },
      include: {
        requiredSkills: true,
      },
    });

    // Calculate statistics
    const total = tickets.length;
    const open = tickets.filter(t => t.status === "new").length;
    const inProgress = tickets.filter(t => t.status === "in_progress" || t.status === "assigned").length;
    const resolved = tickets.filter(t => t.status === "resolved").length;
    const closed = tickets.filter(t => t.status === "closed").length;

    // Calculate average resolution time
    const resolvedTickets = tickets.filter(t => t.resolutionTime);
    const resolutionTimes = resolvedTickets.map(ticket => {
      const created = new Date(ticket.createdAt).getTime();
      const resolved = new Date(ticket.resolutionTime!).getTime();
      return (resolved - created) / (1000 * 60 * 60); // hours
    });
    const avgResolutionTime = resolutionTimes.length > 0
      ? resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length
      : 0;

    // Calculate satisfaction score
    const ratedTickets = tickets.filter(t => t.satisfactionRating !== null);
    const avgSatisfaction = ratedTickets.length > 0
      ? ratedTickets.reduce((sum, t) => sum + (t.satisfactionRating || 0), 0) / ratedTickets.length
      : 0;

    // Category distribution (based on required skills)
    const categoryMap = new Map<string, number>();
    tickets.forEach(ticket => {
      ticket.requiredSkills.forEach(skill => {
        const category = skill.category || "Other";
        categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
      });
    });

    const categories = Array.from(categoryMap.entries()).map(([name, count]) => ({
      name,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }));

    // Priority distribution
    const priorityMap = new Map<string, number>();
    tickets.forEach(ticket => {
      const priority = ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1);
      priorityMap.set(priority, (priorityMap.get(priority) || 0) + 1);
    });

    const priorities = Array.from(priorityMap.entries()).map(([name, count]) => ({
      name,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }));

    // Trends (daily ticket creation and resolution)
    const trendDays = Math.min(days, 30);
    const trends = [];
    for (let i = trendDays - 1; i >= 0; i--) {
      const dayStart = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const dayTickets = tickets.filter(t => {
        const created = new Date(t.createdAt);
        return created >= dayStart && created <= dayEnd;
      });

      const dayResolved = tickets.filter(t => {
        if (!t.resolutionTime) return false;
        const resolved = new Date(t.resolutionTime);
        return resolved >= dayStart && resolved <= dayEnd;
      });

      trends.push({
        period: dayStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        tickets: dayTickets.length,
        resolved: dayResolved.length,
      });
    }

    return {
      success: true,
      data: {
        stats: {
          total,
          open,
          inProgress,
          resolved,
          closed,
          avgResolutionTime: parseFloat(avgResolutionTime.toFixed(2)),
          satisfactionScore: parseFloat(avgSatisfaction.toFixed(2)),
        },
        categories,
        priorities,
        trends,
      },
    };
  } catch (error: any) {
    console.error("Error generating user report:", error);
    return { success: false, message: error?.message || "Failed to generate report" };
  }
};
