const express = require('express');
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  permanentDeleteUser,
  reactivateUser
} = require('../controllers/user');

const router = express.Router();

/**
 * @route   GET /api/v1/users
 * @desc    Get all users with filtering, pagination, and sorting
 * @access  Public (should be protected in real app)
 */
router.get('/', getAllUsers);

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get user by ID
 * @access  Public (should be protected in real app)
 */
router.get('/:id', getUserById);

/**
 * @route   POST /api/v1/users
 * @desc    Create new user
 * @access  Public (should be protected - admin only)
 */
router.post('/', createUser);

/**
 * @route   PUT /api/v1/users/:id
 * @desc    Update user
 * @access  Public (should be protected)
 */
router.put('/:id', updateUser);

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Soft delete user (deactivate)
 * @access  Public (should be protected - admin only)
 */
router.delete('/:id', deleteUser);

/**
 * @route   DELETE /api/v1/users/:id/permanent
 * @desc    Permanently delete user
 * @access  Public (should be protected - admin only)
 */
router.delete('/:id/permanent', permanentDeleteUser);

/**
 * @route   PATCH /api/v1/users/:id/reactivate
 * @desc    Reactivate user
 * @access  Public (should be protected - admin only)
 */
router.patch('/:id/reactivate', reactivateUser);

module.exports = router;
