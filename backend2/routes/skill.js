const express = require('express');
const {
  getAllSkills,
  getAllSkillsSimple,
  getSkillById,
  createSkill,
  updateSkill,
  deleteSkill,
  permanentDeleteSkill,
  reactivateSkill
} = require('../controllers/skill');

const router = express.Router();

/**
 * @route   GET /api/v1/skills/all
 * @desc    Get all skills without pagination (simple list)
 * @access  Public (should be protected in real app)
 */
router.get('/all', getAllSkillsSimple);

/**
 * @route   GET /api/v1/skills
 * @desc    Get all skills with comprehensive filtering, pagination, and sorting
 * @access  Public (should be protected in real app)
 */
router.get('/', getAllSkills);

/**
 * @route   GET /api/v1/skills/:id
 * @desc    Get skill by ID
 * @access  Public (should be protected in real app)
 */
router.get('/:id', getSkillById);

/**
 * @route   POST /api/v1/skills
 * @desc    Create new skill
 * @access  Public (should be protected - admin only)
 */
router.post('/', createSkill);

/**
 * @route   PUT /api/v1/skills/:id
 * @desc    Update skill
 * @access  Public (should be protected)
 */
router.put('/:id', updateSkill);

/**
 * @route   DELETE /api/v1/skills/:id
 * @desc    Soft delete skill (deactivate)
 * @access  Public (should be protected - admin only)
 */
router.delete('/:id', deleteSkill);

/**
 * @route   DELETE /api/v1/skills/:id/permanent
 * @desc    Permanently delete skill
 * @access  Public (should be protected - admin only)
 */
router.delete('/:id/permanent', permanentDeleteSkill);

/**
 * @route   PATCH /api/v1/skills/:id/reactivate
 * @desc    Reactivate skill
 * @access  Public (should be protected - admin only)
 */
router.patch('/:id/reactivate', reactivateSkill);

module.exports = router;
