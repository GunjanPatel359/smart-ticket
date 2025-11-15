"use server"

import { getUserToken } from "@/lib/authmiddleware";

export const evaluateTechnician = async (ticketId: number): Promise<{
  success: boolean;
  message: string;
  evaluation?: any;
}> => {
  try {
    const user = await getUserToken();
    if (!user) {
      return { success: false, message: "Unauthorized" };
    }

    // Fetch ticket data from your backend
    const ticketResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/v1/tickets/${ticketId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!ticketResponse.ok) {
      return { success: false, message: "Failed to fetch ticket data" };
    }

    const ticketData = await ticketResponse.json();
    const ticket = ticketData.data?.ticket;

    if (!ticket) {
      return { success: false, message: "Ticket not found" };
    }

    // Check if ticket is resolved and has feedback
    if (ticket.status !== 'resolved' && ticket.status !== 'closed') {
      return { success: false, message: "Ticket must be resolved before evaluation" };
    }

    if (!ticket.feedback) {
      return { success: false, message: "Feedback is required for evaluation" };
    }

    if (!ticket.assignedTechnicianId) {
      return { success: false, message: "No technician assigned to this ticket" };
    }

    // Call AI backend evaluation endpoint
    const aiBackendUrl = process.env.AI_BACKEND_URL || 'http://localhost:5000';
    const evaluationResponse = await fetch(`${aiBackendUrl}/api/evaluate-technician`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ticket: {
          id: ticket.id,
          subject: ticket.subject,
          description: ticket.description,
          priority: ticket.priority,
          status: ticket.status,
          feedback: ticket.feedback,
          satisfaction_rating: ticket.satisfactionRating,
          assigned_technician_id: ticket.assignedTechnicianId,
          created_at: ticket.createdAt,
          resolved_at: ticket.resolvedAt,
          required_skills: ticket.requiredSkills || [],
          work_logs: ticket.workLogs || [],
          tasks: ticket.tasks || []
        }
      }),
    });

    if (!evaluationResponse.ok) {
      const errorData = await evaluationResponse.json();
      return { 
        success: false, 
        message: errorData.error || "Failed to evaluate technician" 
      };
    }

    const evaluation = await evaluationResponse.json();

    return {
      success: true,
      message: "Technician evaluated successfully",
      evaluation
    };

  } catch (error: any) {
    console.error("Error evaluating technician:", error);
    return { 
      success: false, 
      message: error?.message || "Failed to evaluate technician" 
    };
  }
};
