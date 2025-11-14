-- SQL Query to Update Technician Statistics Based on Actual Ticket Data
-- Run this query to sync technician stats with real ticket counts

-- Update statistics for each technician based on their assigned tickets
UPDATE technicians t
SET 
  current_tickets = (
    SELECT COUNT(*) 
    FROM tickets 
    WHERE assigned_technician_id = t.id 
    AND status IN ('assigned', 'in_progress', 'on_hold')
  ),
  resolved_tickets = (
    SELECT COUNT(*) 
    FROM tickets 
    WHERE assigned_technician_id = t.id 
    AND status IN ('resolved', 'closed')
  ),
  total_tickets = (
    SELECT COUNT(*) 
    FROM tickets 
    WHERE assigned_technician_id = t.id
  );

-- Verify the results
SELECT 
  id,
  name,
  email,
  current_tickets,
  resolved_tickets,
  total_tickets,
  workload
FROM technicians
ORDER BY id;

-- Optional: Update workload based on current tickets (simple calculation)
-- This assumes 10 active tickets = 100% workload
UPDATE technicians
SET workload = LEAST(ROUND((current_tickets / 10.0) * 100), 100);

-- Detailed breakdown by technician (for verification)
SELECT 
  t.id as technician_id,
  t.name as technician_name,
  COUNT(CASE WHEN tk.status IN ('assigned', 'in_progress', 'on_hold') THEN 1 END) as current_tickets,
  COUNT(CASE WHEN tk.status IN ('resolved', 'closed') THEN 1 END) as resolved_tickets,
  COUNT(tk.id) as total_tickets,
  GROUP_CONCAT(CONCAT(tk.id, ':', tk.status) SEPARATOR ', ') as ticket_details
FROM technicians t
LEFT JOIN tickets tk ON tk.assigned_technician_id = t.id
GROUP BY t.id, t.name
ORDER BY t.id;
