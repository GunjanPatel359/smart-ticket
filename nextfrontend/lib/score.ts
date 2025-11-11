import { Ticket, Priority, Impact, Urgency } from "@prisma/client";

export const calculateWorkloadScore = (ticket: Ticket) => {
  let score = 0;

  // Base score from priority
  switch(ticket.priority) {
    case Priority.low: score += 1; break;
    case Priority.normal: score += 3; break;
    case Priority.high: score += 5; break;
    case Priority.critical: score += 8; break;
  }

  // Impact
  switch(ticket.impact) {
    case Impact.low: score += 1; break;
    case Impact.medium: score += 2; break;
    case Impact.high: score += 4; break;
    case Impact.critical: score += 6; break;
  }

  // Urgency
  switch(ticket.urgency) {
    case Urgency.low: score += 1; break;
    case Urgency.normal: score += 2; break;
    case Urgency.high: score += 4; break;
    case Urgency.critical: score += 6; break;
  }

  return score;
};
