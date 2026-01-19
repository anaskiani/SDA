// ============================================
// Authentication Routes
// Handles login, register, logout
// ============================================

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateLogin, validateRegister } = require('../middleware/validation');

// Login routes
router.get('/login', authController.showLogin);
router.post('/login', validateLogin, authController.login);

// Registration routes
router.get('/register', authController.showRegister);
router.post('/register', validateRegister, authController.register);

// Logout route
router.get('/logout', authController.logout);

module.exports = router;
