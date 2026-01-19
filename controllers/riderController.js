// ============================================
// Rider Controller
// Handles all rider-related operations
// ============================================

const Rider = require('../models/rider');
const Order = require('../models/order');
const { wrapAsync } = require('../middleware/errorHandler');

/**
 * Rider Dashboard
 */
const dashboard = wrapAsync(async (req, res) => {
    const userId = req.session.user.user_id;
    const rider = await Rider.findByUserId(userId);

    if (!rider) {
        return res.status(404).render('error', {
            title: 'Rider Not Found',
            error: { status: 404, message: 'Rider profile not found' },
            user: req.session.user
        });
    }

    // Get assigned orders
    const assignedOrders = await Order.findByRiderId(rider.rider_id);
    
    // Calculate statistics
    const activeOrders = assignedOrders.filter(o => 
        ['picked_up'].includes(o.order_status)
    ).length;
    const completedOrders = assignedOrders.filter(o => 
        o.order_status === 'delivered'
    ).length;
    const readyOrders = await Order.findReadyOrders();

    // Get recent assigned orders
    const recentOrders = assignedOrders.slice(0, 5);

    res.render('rider/dashboard', {
        title: 'Rider Dashboard',
        user: req.session.user,
        rider,
        activeOrders,
        completedOrders,
        readyOrdersCount: readyOrders.length,
        recentOrders
    });
});

/**
 * View assigned orders
 */
const viewOrders = wrapAsync(async (req, res) => {
    const userId = req.session.user.user_id;
    const rider = await Rider.findByUserId(userId);

    if (!rider) {
        return res.status(404).render('error', {
            title: 'Rider Not Found',
            error: { status: 404, message: 'Rider profile not found' },
            user: req.session.user
        });
    }

    const orders = await Order.findByRiderId(rider.rider_id);
    const statusFilter = req.query.status || 'all';

    let filteredOrders = orders;
    if (statusFilter !== 'all') {
        filteredOrders = orders.filter(o => o.order_status === statusFilter);
    }

    res.render('rider/orders', {
        title: 'My Orders',
        user: req.session.user,
        rider,
        orders: filteredOrders,
        statusFilter
    });
});

/**
 * View available orders (ready for pickup)
 */
const viewAvailableOrders = wrapAsync(async (req, res) => {
    const userId = req.session.user.user_id;
    const rider = await Rider.findByUserId(userId);

    if (!rider) {
        return res.status(404).render('error', {
            title: 'Rider Not Found',
            error: { status: 404, message: 'Rider profile not found' },
            user: req.session.user
        });
    }

    if (!rider.is_available) {
        req.session.error = 'You must be available to view available orders';
        return res.redirect('/rider/dashboard');
    }

    const readyOrders = await Order.findReadyOrders();

    res.render('rider/available-orders', {
        title: 'Available Orders',
        user: req.session.user,
        rider,
        readyOrders
    });
});

/**
 * View order details
 */
const viewOrder = wrapAsync(async (req, res) => {
    const { id } = req.params;
    const userId = req.session.user.user_id;
    const rider = await Rider.findByUserId(userId);

    if (!rider) {
        return res.status(404).render('error', {
            title: 'Rider Not Found',
            error: { status: 404, message: 'Rider profile not found' },
            user: req.session.user
        });
    }

    const order = await Order.findById(id);

    if (!order) {
        return res.status(404).render('error', {
            title: 'Order Not Found',
            error: { status: 404, message: 'Order not found' },
            user: req.session.user
        });
    }

    // Check if order is assigned to this rider or is available
    const isAssigned = order.rider_id === rider.rider_id;
    const isAvailable = order.order_status === 'ready' && !order.rider_id;

    if (!isAssigned && !isAvailable) {
        return res.status(403).render('error', {
            title: 'Access Denied',
            error: { status: 403, message: 'You do not have access to this order' },
            user: req.session.user
        });
    }

    // Determine available actions
    const canPickup = isAvailable && rider.is_available;
    const canMarkDelivered = isAssigned && order.order_status === 'picked_up';

    res.render('rider/order-details', {
        title: `Order #${order.order_id}`,
        user: req.session.user,
        rider,
        order,
        isAssigned,
        isAvailable,
        canPickup,
        canMarkDelivered
    });
});

/**
 * Pick up order (assign rider and change status to picked_up)
 */
const pickupOrder = wrapAsync(async (req, res) => {
    const { id } = req.params;
    const userId = req.session.user.user_id;
    const rider = await Rider.findByUserId(userId);

    if (!rider) {
        return res.status(404).json({ error: 'Rider not found' });
    }

    if (!rider.is_available) {
        return res.status(400).json({ error: 'You must be available to pick up orders' });
    }

    const order = await Order.findById(id);

    if (!order) {
        return res.status(404).json({ error: 'Order not found' });
    }

    if (order.order_status !== 'ready') {
        return res.status(400).json({ error: 'Order is not ready for pickup' });
    }

    if (order.rider_id) {
        return res.status(400).json({ error: 'Order is already assigned to another rider' });
    }

    try {
        // Assign rider and update status
        await Rider.assignToOrder(id, rider.rider_id);
        const success = await Order.updateStatusByRider(id, rider.rider_id, 'picked_up');

        if (success) {
            // Mark rider as unavailable
            await Rider.updateAvailability(rider.rider_id, false);
            req.session.success = 'Order picked up successfully';
            res.json({ success: true });
        } else {
            res.status(400).json({ error: 'Failed to pick up order' });
        }
    } catch (error) {
        console.error('Error picking up order:', error);
        res.status(500).json({ error: 'Failed to pick up order' });
    }
});

/**
 * Mark order as delivered
 */
const markDelivered = wrapAsync(async (req, res) => {
    const { id } = req.params;
    const userId = req.session.user.user_id;
    const rider = await Rider.findByUserId(userId);

    if (!rider) {
        return res.status(404).json({ error: 'Rider not found' });
    }

    const success = await Order.updateStatusByRider(id, rider.rider_id, 'delivered');

    if (success) {
        // Mark rider as available again
        await Rider.updateAvailability(rider.rider_id, true);
        req.session.success = 'Order marked as delivered';
        res.json({ success: true });
    } else {
        res.status(400).json({ error: 'Failed to mark order as delivered' });
    }
});

/**
 * Toggle availability
 */
const toggleAvailability = wrapAsync(async (req, res) => {
    const userId = req.session.user.user_id;
    const rider = await Rider.findByUserId(userId);

    if (!rider) {
        return res.status(404).json({ error: 'Rider not found' });
    }

    // Check if rider has active orders
    const assignedOrders = await Order.findByRiderId(rider.rider_id);
    const hasActiveOrders = assignedOrders.some(o => 
        ['picked_up'].includes(o.order_status)
    );

    if (hasActiveOrders && rider.is_available) {
        return res.status(400).json({ error: 'Cannot set unavailable while you have active orders' });
    }

    const newAvailability = !rider.is_available;
    const success = await Rider.updateAvailability(rider.rider_id, newAvailability);

    if (success) {
        res.json({ 
            success: true, 
            is_available: newAvailability,
            message: newAvailability ? 'You are now available' : 'You are now unavailable'
        });
    } else {
        res.status(400).json({ error: 'Failed to update availability' });
    }
});

module.exports = {
    dashboard,
    viewOrders,
    viewAvailableOrders,
    viewOrder,
    pickupOrder,
    markDelivered,
    toggleAvailability
};
