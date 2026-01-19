// ============================================
// Admin Routes
// All admin-related routes
// ============================================

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Dashboard
router.get('/dashboard', adminController.dashboard);

// User management
router.get('/users', adminController.viewUsers);

// Order management
router.get('/orders', adminController.viewOrders);
router.get('/orders/:id', adminController.viewOrder);
router.post('/orders/:id/assign-rider', adminController.assignRider);

// Restaurant management
router.get('/restaurants', adminController.viewRestaurants);
router.post('/restaurants/:id/toggle-status', adminController.toggleRestaurantStatus);

// Rider management
router.get('/riders', adminController.viewRiders);
router.post('/riders/:id/toggle-status', adminController.toggleRiderStatus);

module.exports = router;
