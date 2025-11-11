const express = require('express');
const {
  getAllTickets,
  getAllTicketsSimple,
  getTicketById,
  getTicketsByUserId,
  getTicketsByTechnicianId,
  createTicket,
  updateTicket,
  deleteTicket,
  permanentDeleteTicket,
  reactivateTicket,
  getTicketsBySkills,
  processSkillsAndUpdateTicket,
  debugAIBackend,
  closeTicket
} = require('../controllers/ticket');

const router = express.Router();

/**
 * @route   GET /api/v1/tickets/debug-ai
 * @desc    Debug AI backend connection and test ticket assignment
 * @access  Public (for debugging purposes)
 */
router.get('/debug-ai', debugAIBackend);

/**
 * @route   GET /api/v1/tickets/all
 * @desc    Get all tickets without pagination (simple list)
 * @access  Public (should be protected in real app)
 */
router.get('/all', getAllTicketsSimple);

/**
 * @route   GET /api/v1/tickets/by-skills
 * @desc    Get tickets by required skills (union filter)
 * @access  Public (should be protected in real app)
 */
router.get('/by-skills', getTicketsBySkills);

/**
 * @route   GET /api/v1/tickets/user/:userId
 * @desc    Get tickets by user ID (requester)
 * @access  Public (should be protected in real app)
 */
router.get('/user/:userId', getTicketsByUserId);

/**
 * @route   GET /api/v1/tickets/technician/:technicianId
 * @desc    Get tickets by technician ID (assigned)
 * @access  Public (should be protected in real app)
 */
router.get('/technician/:technicianId', getTicketsByTechnicianId);

/**
 * @route   POST /api/v1/tickets/process-skills
 * @desc    Process skills array and update ticket with skill IDs
 * @access  Public (should be protected)
 */
router.post('/process-skills', processSkillsAndUpdateTicket);

/**
 * @route   PUT /api/v1/tickets/:id/close
 * @desc    Close ticket with feedback, rating, resolution notes
 * @access  Public (should be protected)
 */
router.put('/:id/close', closeTicket);

/**
 * @route   PATCH /api/v1/tickets/:id/reactivate
 * @desc    Reactivate ticket
 * @access  Public (should be protected)
 */
router.patch('/:id/reactivate', reactivateTicket);

/**
 * @route   DELETE /api/v1/tickets/:id/permanent
 * @desc    Permanently delete ticket
 * @access  Public (should be protected - admin only)
 */
router.delete('/:id/permanent', permanentDeleteTicket);

/**
 * @route   GET /api/v1/tickets
 * @desc    Get all tickets with filtering, pagination, sorting
 * @access  Public (should be protected in real app)
 */
router.get('/', getAllTickets);

/**
 * @route   POST /api/v1/tickets
 * @desc    Create new ticket
 * @access  Public (should be protected)
 */
router.post('/', createTicket);

/**
 * @route   GET /api/v1/tickets/:id
 * @desc    Get ticket by ID
 * @access  Public (should be protected in real app)
 */
router.get('/:id', getTicketById);

/**
 * @route   PUT /api/v1/tickets/:id
 * @desc    Update ticket
 * @access  Public (should be protected)
 */
router.put('/:id', updateTicket);

/**
 * @route   DELETE /api/v1/tickets/:id
 * @desc    Soft delete ticket (cancel)
 * @access  Public (should be protected)
 */
router.delete('/:id', deleteTicket);

module.exports = router;
