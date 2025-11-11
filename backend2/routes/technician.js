const express = require('express');
const {
  getAllTechnicians,
  getAllTechniciansSimple,
  getTechnicianById,
  createTechnician,
  updateTechnician,
  deleteTechnician,
  permanentDeleteTechnician,
  reactivateTechnician,
  getTechniciansBySkills,
  debugTechniciansSkills,
  getAverageTechnicianPerformance
} = require('../controllers/technician');

const router = express.Router();

/**
 * @route   GET /api/v1/technicians/debug-skills
 * @desc    Debug endpoint to see all technicians and their skills structure
 * @access  Public (should be protected in real app)
 */
router.get('/debug-skills', debugTechniciansSkills);

/**
 * @route   GET /api/v1/technicians/all
 * @desc    Get all technicians without pagination (simple list)
 * @access  Public (should be protected in real app)
 */
router.get('/all', getAllTechniciansSimple);

/**
 * @route   GET /api/v1/technicians/by-skills
 * @desc    Get technicians by skills (union filter)
 * @access  Public (should be protected in real app)
 */
router.get('/by-skills', getTechniciansBySkills);

/**
 * @route   GET /api/v1/technicians
 * @desc    Get all technicians with comprehensive filtering, pagination, and sorting
 * @access  Public (should be protected in real app)
 */
router.get('/', getAllTechnicians);

/**
 * @route   GET /api/v1/technicians/:id
 * @desc    Get technician by ID
 * @access  Public (should be protected in real app)
 */
router.get('/:id', getTechnicianById);

/**
 * @route   POST /api/v1/technicians
 * @desc    Create new technician
 * @access  Public (should be protected - admin only)
 */
router.post('/', createTechnician);

/**
 * @route   PUT /api/v1/technicians/:id
 * @desc    Update technician
 * @access  Public (should be protected)
 */
router.put('/:id', updateTechnician);

/**
 * @route   DELETE /api/v1/technicians/:id
 * @desc    Soft delete technician (deactivate)
 * @access  Public (should be protected - admin only)
 */
router.delete('/:id', deleteTechnician);

/**
 * @route   DELETE /api/v1/technicians/:id/permanent
 * @desc    Permanently delete technician
 * @access  Public (should be protected - admin only)
 */
router.delete('/:id/permanent', permanentDeleteTechnician);

/**
 * @route   PATCH /api/v1/technicians/:id/reactivate
 * @desc    Reactivate technician
 * @access  Public (should be protected - admin only)
 */
router.patch('/:id/reactivate', reactivateTechnician);

/**
 * @route   GET /api/v1/technicians/avg_performance/all_technician
 * @desc    Get average performance of all technicians based on solved tickets
 * @access  Public (should be protected in real app)
 */
router.get('/avg_performance/all_technician', getAverageTechnicianPerformance);

module.exports = router;
