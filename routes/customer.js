// ============================================
// Customer Routes
// All customer-related routes
// ============================================

const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

// Dashboard
router.get('/dashboard', customerController.dashboard);

// Browse restaurants
router.get('/restaurants', customerController.browseRestaurants);

// View restaurant menu
router.get('/restaurants/:id/menu', customerController.viewMenu);

// Cart operations
router.get('/cart', customerController.viewCart);
router.post('/cart/add', customerController.addToCart);
router.put('/cart/update', customerController.updateCartItem);
router.delete('/cart/remove/:item_id', customerController.removeFromCart);

// Checkout and order placement
router.get('/checkout', customerController.checkout);
router.post('/orders/place', customerController.placeOrder);

// Order management
router.get('/orders', customerController.viewOrders);
router.get('/orders/:id', customerController.viewOrder);
router.post('/orders/:id/cancel', customerController.cancelOrder);
router.post('/orders/:id/received', customerController.markReceived);

// Ratings
router.get('/orders/:id/rate', customerController.showRating);
router.post('/orders/:id/rate', customerController.submitRating);

module.exports = router;
