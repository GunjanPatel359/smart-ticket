"use server"

import { getUserToken } from "@/lib/authmiddleware";
import prisma from "@/lib/db";
import axios from "axios";

export const evaluateTechnician = async (ticketId: number, feedback: string, satisfactionRating: number): Promise<{
  success: boolean;
  message: string;
  evaluation?: any;
}> => {
  try {
    const user = await getUserToken();
    if (!user) {
      return { success: false, message: "Unauthorized" };
    }
    
    // First, get the ticket to verify ownership
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        requiredSkills: true,
        workLogs: true,
        tasks: true,
        assignedTechnician: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });
    
    if (!ticket) {
      return { success: false, message: "Ticket not found" };
    }
    
    if (ticket.requesterId !== user.id) {
      return { success: false, message: "Forbidden: You can only evaluate your own tickets" };
    }

    // Update the ticket with feedback and satisfaction rating in the database
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        feedback: feedback,
        satisfactionRating: satisfactionRating
      },
      include: {
        requiredSkills: true,
        workLogs: true,
        tasks: true,
        assignedTechnician: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });
    
    if (updatedTicket.status !== 'resolved' && updatedTicket.status !== 'closed') {
      return { success: false, message: "Ticket must be resolved before evaluation" };
    }

    if (!feedback || feedback.trim() === "") {
      return { success: false, message: "Feedback is required for evaluation" };
    }

    if (!updatedTicket.assignedTechnicianId) {
      return { success: false, message: "No technician assigned to this ticket" };
    }

    // Call AI backend evaluation endpoint
    const aiBackendUrl = process.env.AI_BACKEND_URL || 'http://localhost:5000';
    
    console.log(`[Evaluation] Attempting to connect to AI backend at: ${aiBackendUrl}/api/evaluate-technician`);
    console.log(`[Evaluation] Ticket ID: ${updatedTicket.id}, Technician ID: ${updatedTicket.assignedTechnicianId}`);
    console.log(`[Evaluation] Feedback: ${feedback}, Rating: ${satisfactionRating}`);
    
    try {
      const evaluationResponse = await axios.post(
        `${aiBackendUrl}/api/evaluate-technician`,
        {
          ticket: {
            id: updatedTicket.id,
            subject: updatedTicket.subject,
            description: updatedTicket.description,
            priority: updatedTicket.priority,
            status: updatedTicket.status,
            feedback: feedback,
            satisfaction_rating: satisfactionRating,
            assigned_technician_id: updatedTicket.assignedTechnicianId,
            created_at: updatedTicket.createdAt,
            resolved_at: updatedTicket.resolvedAt,
            required_skills: updatedTicket.requiredSkills || [],
            work_logs: updatedTicket.workLogs || [],
            tasks: updatedTicket.tasks || []
          }
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 100000 
        }
      );

      console.log(`[Evaluation] AI backend response received:`, evaluationResponse.data);
      const evaluation = evaluationResponse.data;
      
      return {
        success: true,
        message: "Technician evaluated successfully",
        evaluation
      };
    } catch (fetchError: any) {
      // AI service not available - return graceful message
      console.error("[Evaluation] AI evaluation service error:", {
        message: fetchError.message,
        code: fetchError.code,
        response: fetchError.response?.data,
        url: `${aiBackendUrl}/api/evaluate-technician`
      });
      
      return {
        success: false,
        message: `AI evaluation service is currently unavailable: ${fetchError.message}. Please ensure the AI backend is running.`
      };
    }

  } catch (error: any) {
    console.log("Error evaluating technician:", error);
    return { 
      success: false, 
      message: error?.message || "Failed to evaluate technician" 
    };
  }
};
