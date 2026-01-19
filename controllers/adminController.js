// ============================================
// Admin Controller
// Handles all admin-related operations
// ============================================

const User = require('../models/user');
const Restaurant = require('../models/restaurant');
const Rider = require('../models/rider');
const Order = require('../models/order');
const { wrapAsync } = require('../middleware/errorHandler');

/**
 * Admin Dashboard
 */
const dashboard = wrapAsync(async (req, res) => {
    // Get statistics
    const allUsers = await User.findAll();
    const allRestaurants = await Restaurant.findAllAdmin();
    const allRiders = await Rider.findAllAdmin();
    const allOrders = await Order.findAll();

    // Calculate statistics
    const totalUsers = allUsers.length;
    const totalCustomers = allUsers.filter(u => u.role === 'customer').length;
    const totalRestaurants = allRestaurants.length;
    const activeRestaurants = allRestaurants.filter(r => r.is_active).length;
    const totalRiders = allRiders.length;
    const activeRiders = allRiders.filter(r => r.is_active).length;
    const totalOrders = allOrders.length;
    const pendingOrders = allOrders.filter(o => o.order_status === 'pending').length;
    const completedOrders = allOrders.filter(o => o.order_status === 'delivered').length;
    const totalRevenue = allOrders
        .filter(o => o.order_status === 'delivered')
        .reduce((sum, o) => sum + parseFloat(o.total_amount), 0);

    // Get recent orders
    const recentOrders = allOrders.slice(0, 10);

    res.render('admin/dashboard', {
        title: 'Admin Dashboard',
        user: req.session.user,
        stats: {
            totalUsers,
            totalCustomers,
            totalRestaurants,
            activeRestaurants,
            totalRiders,
            activeRiders,
            totalOrders,
            pendingOrders,
            completedOrders,
            totalRevenue: totalRevenue.toFixed(2)
        },
        recentOrders
    });
});

/**
 * View all users
 */
const viewUsers = wrapAsync(async (req, res) => {
    const roleFilter = req.query.role || 'all';
    const allUsers = await User.findAll();
    
    let filteredUsers = allUsers;
    if (roleFilter !== 'all') {
        filteredUsers = allUsers.filter(u => u.role === roleFilter);
    }

    res.render('admin/users', {
        title: 'User Management',
        user: req.session.user,
        users: filteredUsers,
        roleFilter
    });
});

/**
 * View all orders
 */
const viewOrders = wrapAsync(async (req, res) => {
    const statusFilter = req.query.status || 'all';
    const allOrders = await Order.findAll();
    
    let filteredOrders = allOrders;
    if (statusFilter !== 'all') {
        filteredOrders = allOrders.filter(o => o.order_status === statusFilter);
    }

    res.render('admin/orders', {
        title: 'Order Management',
        user: req.session.user,
        orders: filteredOrders,
        statusFilter
    });
});

/**
 * View order details
 */
const viewOrder = wrapAsync(async (req, res) => {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
        return res.status(404).render('error', {
            title: 'Order Not Found',
            error: { status: 404, message: 'Order not found' },
            user: req.session.user
        });
    }

    // Get available riders for assignment
    const Rider = require('../models/rider');
    const availableRiders = await Rider.findAvailable();

    res.render('admin/order-details', {
        title: `Order #${order.order_id}`,
        user: req.session.user,
        order,
        availableRiders
    });
});

/**
 * Assign rider to order
 */
const assignRider = wrapAsync(async (req, res) => {
    const { id } = req.params;
    const { rider_id } = req.body;

    if (!rider_id) {
        return res.status(400).json({ error: 'Rider ID is required' });
    }

    const order = await Order.findById(id);
    if (!order) {
        return res.status(404).json({ error: 'Order not found' });
    }

    if (order.order_status !== 'ready') {
        return res.status(400).json({ error: 'Order must be ready before assigning rider' });
    }

    const Rider = require('../models/rider');
    await Rider.assignToOrder(id, rider_id);
    
    // Update order status to picked_up
    await Order.updateStatus(id, 'picked_up');

    res.json({ 
        success: true, 
        message: 'Rider assigned successfully' 
    });
});

/**
 * View all restaurants
 */
const viewRestaurants = wrapAsync(async (req, res) => {
    const restaurants = await Restaurant.findAllAdmin();

    res.render('admin/restaurants', {
        title: 'Restaurant Management',
        user: req.session.user,
        restaurants
    });
});

/**
 * Toggle restaurant active status
 */
const toggleRestaurantStatus = wrapAsync(async (req, res) => {
    const { id } = req.params;
    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
    }

    const newStatus = !restaurant.is_active;
    const success = await Restaurant.updateActiveStatus(id, newStatus);

    if (success) {
        res.json({ 
            success: true, 
            is_active: newStatus,
            message: `Restaurant ${newStatus ? 'activated' : 'deactivated'} successfully`
        });
    } else {
        res.status(400).json({ error: 'Failed to update restaurant status' });
    }
});

/**
 * View all riders
 */
const viewRiders = wrapAsync(async (req, res) => {
    const riders = await Rider.findAllAdmin();

    res.render('admin/riders', {
        title: 'Rider Management',
        user: req.session.user,
        riders
    });
});

/**
 * Toggle rider active status
 */
const toggleRiderStatus = wrapAsync(async (req, res) => {
    const { id } = req.params;
    const rider = await Rider.findById(id);

    if (!rider) {
        return res.status(404).json({ error: 'Rider not found' });
    }

    const newStatus = !rider.is_active;
    const success = await Rider.updateActiveStatus(id, newStatus);

    if (success) {
        res.json({ 
            success: true, 
            is_active: newStatus,
            message: `Rider ${newStatus ? 'activated' : 'deactivated'} successfully`
        });
    } else {
        res.status(400).json({ error: 'Failed to update rider status' });
    }
});

module.exports = {
    assignRider,
    dashboard,
    viewUsers,
    viewOrders,
    viewOrder,
    viewRestaurants,
    toggleRestaurantStatus,
    viewRiders,
    toggleRiderStatus
};
