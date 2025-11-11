const express = require('express');
const { register, login, getProfile } = require('../controllers/auth');

const router = express.Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', register);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   GET /api/v1/auth/profile/:userId
 * @desc    Get user profile
 * @access  Public (should be protected in real app)
 */
router.get('/profile/:userId', getProfile);

module.exports = router;
