-- Specific SQL Updates Based on Your Current Ticket Data
-- This will update technician statistics to match the actual tickets in your database

-- ============================================
-- TECHNICIAN 1 (John Doe)
-- ============================================
-- Tickets: 3, 7, 9, 15, 17, 21, 23, 27, 29, 33, 35, 44, 45
-- Current (assigned/in_progress): 3, 7, 9, 15, 17, 21, 23, 27, 29, 33, 35, 44, 45 = 13 tickets
-- Resolved: 0 tickets
-- Total: 13 tickets

UPDATE technicians 
SET 
  current_tickets = 13,
  resolved_tickets = 0,
  total_tickets = 13,
  workload = 100  -- 13 active tickets = over 100% workload
WHERE id = 1;

-- ============================================
-- TECHNICIAN 2 (Jane Smith)
-- ============================================
-- Tickets: 5, 6, 8, 11, 12, 16, 19, 20, 22, 25, 26, 28, 31, 32, 34, 37, 38
-- Current (on_hold/in_progress): 5, 6, 11, 12, 19, 20, 25, 26, 31, 32, 37, 38 = 12 tickets
-- Resolved: 8, 16, 22, 28, 34 = 5 tickets
-- Total: 17 tickets

UPDATE technicians 
SET 
  current_tickets = 12,
  resolved_tickets = 5,
  total_tickets = 17,
  workload = 100  -- 12 active tickets = over 100% workload
WHERE id = 2;

-- ============================================
-- TECHNICIAN 3 (Mike Johnson)
-- ============================================
-- Tickets: 1, 2
-- Current (in_progress/assigned): 1, 2 = 2 tickets
-- Resolved: 0 tickets
-- Total: 2 tickets

UPDATE technicians 
SET 
  current_tickets = 2,
  resolved_tickets = 0,
  total_tickets = 2,
  workload = 20  -- 2 active tickets = 20% workload
WHERE id = 3;

-- ============================================
-- VERIFICATION QUERY
-- ============================================
-- Run this to verify the updates
SELECT 
  t.id,
  t.name,
  t.email,
  t.current_tickets,
  t.resolved_tickets,
  t.total_tickets,
  t.workload,
  COUNT(tk.id) as actual_total_tickets,
  SUM(CASE WHEN tk.status IN ('assigned', 'in_progress', 'on_hold') THEN 1 ELSE 0 END) as actual_current_tickets,
  SUM(CASE WHEN tk.status IN ('resolved', 'closed') THEN 1 ELSE 0 END) as actual_resolved_tickets
FROM technicians t
LEFT JOIN tickets tk ON tk.assigned_technician_id = t.id
GROUP BY t.id, t.name, t.email, t.current_tickets, t.resolved_tickets, t.total_tickets, t.workload
ORDER BY t.id;

-- ============================================
-- DETAILED TICKET BREAKDOWN BY TECHNICIAN
-- ============================================
SELECT 
  assigned_technician_id as tech_id,
  status,
  COUNT(*) as count,
  GROUP_CONCAT(id ORDER BY id) as ticket_ids
FROM tickets
WHERE assigned_technician_id IS NOT NULL
GROUP BY assigned_technician_id, status
ORDER BY assigned_technician_id, status;
