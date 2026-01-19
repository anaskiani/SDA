// ============================================
// Restaurant Routes
// All restaurant-related routes
// ============================================

const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');

// Dashboard
router.get('/dashboard', restaurantController.dashboard);

// Order management
router.get('/orders', restaurantController.viewOrders);
router.get('/orders/:id', restaurantController.viewOrder);
router.post('/orders/:id/accept', restaurantController.acceptOrder);
router.post('/orders/:id/reject', restaurantController.rejectOrder);
router.post('/orders/:id/preparing', restaurantController.markPreparing);
router.post('/orders/:id/ready', restaurantController.markReady);

// Menu management
router.get('/menu', restaurantController.viewMenu);
router.get('/menu/add', restaurantController.showAddMenuItem);
router.get('/menu/edit/:id', restaurantController.showEditMenuItem);
router.post('/menu/add', restaurantController.createMenuItem);
router.post('/menu/edit/:id', restaurantController.updateMenuItem);
router.delete('/menu/delete/:id', restaurantController.deleteMenuItem);

module.exports = router;
