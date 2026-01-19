// ============================================
// Rider Routes
// All rider-related routes
// ============================================

const express = require('express');
const router = express.Router();
const riderController = require('../controllers/riderController');

// Dashboard
router.get('/dashboard', riderController.dashboard);

// Order management
router.get('/orders', riderController.viewOrders);
router.get('/orders/available', riderController.viewAvailableOrders);
router.get('/orders/:id', riderController.viewOrder);
router.post('/orders/:id/pickup', riderController.pickupOrder);
router.post('/orders/:id/delivered', riderController.markDelivered);

// Availability
router.post('/availability/toggle', riderController.toggleAvailability);

module.exports = router;
