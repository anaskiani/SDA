// ============================================
// Restaurant Controller
// Handles all restaurant-related operations
// ============================================

const Restaurant = require('../models/restaurant');
const MenuItem = require('../models/menuItem');
const Order = require('../models/order');
const { wrapAsync } = require('../middleware/errorHandler');

/**
 * Restaurant Dashboard
 */
const dashboard = wrapAsync(async (req, res) => {
    const userId = req.session.user.user_id;
    const restaurant = await Restaurant.findByUserId(userId);

    if (!restaurant) {
        return res.status(404).render('error', {
            title: 'Restaurant Not Found',
            error: { status: 404, message: 'Restaurant profile not found' },
            user: req.session.user
        });
    }

    // Get orders for this restaurant
    const orders = await Order.findByRestaurantId(restaurant.restaurant_id);
    
    // Calculate statistics
    const pendingOrders = orders.filter(o => o.order_status === 'pending').length;
    const preparingOrders = orders.filter(o => o.order_status === 'preparing').length;
    const readyOrders = orders.filter(o => o.order_status === 'ready').length;
    const totalRevenue = orders
        .filter(o => o.order_status === 'delivered')
        .reduce((sum, o) => sum + parseFloat(o.total_amount), 0);

    // Get recent orders
    const recentOrders = orders.slice(0, 5);

    res.render('restaurant/dashboard', {
        title: 'Restaurant Dashboard',
        user: req.session.user,
        restaurant,
        pendingOrders,
        preparingOrders,
        readyOrders,
        totalRevenue: totalRevenue.toFixed(2),
        recentOrders
    });
});

/**
 * View incoming orders
 */
const viewOrders = wrapAsync(async (req, res) => {
    const userId = req.session.user.user_id;
    const restaurant = await Restaurant.findByUserId(userId);

    if (!restaurant) {
        return res.status(404).render('error', {
            title: 'Restaurant Not Found',
            error: { status: 404, message: 'Restaurant profile not found' },
            user: req.session.user
        });
    }

    const orders = await Order.findByRestaurantId(restaurant.restaurant_id);
    const statusFilter = req.query.status || 'all';

    let filteredOrders = orders;
    if (statusFilter !== 'all') {
        filteredOrders = orders.filter(o => o.order_status === statusFilter);
    }

    res.render('restaurant/orders', {
        title: 'Incoming Orders',
        user: req.session.user,
        restaurant,
        orders: filteredOrders,
        statusFilter
    });
});

/**
 * View order details
 */
const viewOrder = wrapAsync(async (req, res) => {
    const { id } = req.params;
    const userId = req.session.user.user_id;
    const restaurant = await Restaurant.findByUserId(userId);

    if (!restaurant) {
        return res.status(404).render('error', {
            title: 'Restaurant Not Found',
            error: { status: 404, message: 'Restaurant profile not found' },
            user: req.session.user
        });
    }

    const order = await Order.findById(id);

    if (!order || order.restaurant_id !== restaurant.restaurant_id) {
        return res.status(404).render('error', {
            title: 'Order Not Found',
            error: { status: 404, message: 'Order not found' },
            user: req.session.user
        });
    }

    // Determine available actions based on order status
    const canAccept = order.order_status === 'pending';
    const canReject = order.order_status === 'pending';
    const canPrepare = ['accepted', 'preparing'].includes(order.order_status);
    const canMarkReady = order.order_status === 'preparing';

    res.render('restaurant/order-details', {
        title: `Order #${order.order_id}`,
        user: req.session.user,
        restaurant,
        order,
        canAccept,
        canReject,
        canPrepare,
        canMarkReady
    });
});

/**
 * Accept order - Automatically moves to preparing status
 */
const acceptOrder = wrapAsync(async (req, res) => {
    const { id } = req.params;
    const userId = req.session.user.user_id;
    const restaurant = await Restaurant.findByUserId(userId);

    if (!restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
    }

    // Accept order and immediately move to preparing
    const success = await Order.updateStatusByRestaurant(id, restaurant.restaurant_id, 'preparing');

    if (success) {
        // Schedule automatic move to ready after 1 minute (60000 ms)
        setTimeout(async () => {
            try {
                const order = await Order.findById(id);
                if (order && order.order_status === 'preparing') {
                    await Order.updateStatusByRestaurant(id, restaurant.restaurant_id, 'ready');
                    console.log(`Order #${id} automatically moved to ready status`);
                }
            } catch (error) {
                console.error(`Error auto-moving order #${id} to ready:`, error);
            }
        }, 60000); // 1 minute

        req.session.success = 'Order accepted and moved to preparing';
        res.json({ success: true, message: 'Order accepted and moved to preparing. Will be ready in 1 minute.' });
    } else {
        res.status(400).json({ error: 'Failed to accept order' });
    }
});

/**
 * Reject order
 */
const rejectOrder = wrapAsync(async (req, res) => {
    const { id } = req.params;
    const userId = req.session.user.user_id;
    const restaurant = await Restaurant.findByUserId(userId);

    if (!restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
    }

    const success = await Order.updateStatusByRestaurant(id, restaurant.restaurant_id, 'rejected');

    if (success) {
        req.session.success = 'Order rejected';
        res.json({ success: true });
    } else {
        res.status(400).json({ error: 'Failed to reject order' });
    }
});

/**
 * Mark order as preparing
 */
const markPreparing = wrapAsync(async (req, res) => {
    const { id } = req.params;
    const userId = req.session.user.user_id;
    const restaurant = await Restaurant.findByUserId(userId);

    if (!restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
    }

    const success = await Order.updateStatusByRestaurant(id, restaurant.restaurant_id, 'preparing');

    if (success) {
        req.session.success = 'Order marked as preparing';
        res.json({ success: true });
    } else {
        res.status(400).json({ error: 'Failed to update order status' });
    }
});

/**
 * Mark order as ready
 */
const markReady = wrapAsync(async (req, res) => {
    const { id } = req.params;
    const userId = req.session.user.user_id;
    const restaurant = await Restaurant.findByUserId(userId);

    if (!restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
    }

    const success = await Order.updateStatusByRestaurant(id, restaurant.restaurant_id, 'ready');

    if (success) {
        req.session.success = 'Order marked as ready for pickup';
        res.json({ success: true });
    } else {
        res.status(400).json({ error: 'Failed to update order status' });
    }
});

/**
 * View menu items
 */
const viewMenu = wrapAsync(async (req, res) => {
    const userId = req.session.user.user_id;
    const restaurant = await Restaurant.findByUserId(userId);

    if (!restaurant) {
        return res.status(404).render('error', {
            title: 'Restaurant Not Found',
            error: { status: 404, message: 'Restaurant profile not found' },
            user: req.session.user
        });
    }

    const menuItems = await MenuItem.findAllByRestaurantId(restaurant.restaurant_id);

    // Group items by category
    const itemsByCategory = {};
    menuItems.forEach(item => {
        const category = item.category || 'Other';
        if (!itemsByCategory[category]) {
            itemsByCategory[category] = [];
        }
        itemsByCategory[category].push(item);
    });

    res.render('restaurant/menu', {
        title: 'Menu Management',
        user: req.session.user,
        restaurant,
        menuItems,
        itemsByCategory
    });
});

/**
 * Show add menu item form
 */
const showAddMenuItem = wrapAsync(async (req, res) => {
    const userId = req.session.user.user_id;
    const restaurant = await Restaurant.findByUserId(userId);

    if (!restaurant) {
        return res.status(404).render('error', {
            title: 'Restaurant Not Found',
            error: { status: 404, message: 'Restaurant profile not found' },
            user: req.session.user
        });
    }

    res.render('restaurant/menu-item-form', {
        title: 'Add Menu Item',
        user: req.session.user,
        restaurant,
        menuItem: null,
        isEdit: false
    });
});

/**
 * Show edit menu item form
 */
const showEditMenuItem = wrapAsync(async (req, res) => {
    const { id } = req.params;
    const userId = req.session.user.user_id;
    const restaurant = await Restaurant.findByUserId(userId);

    if (!restaurant) {
        return res.status(404).render('error', {
            title: 'Restaurant Not Found',
            error: { status: 404, message: 'Restaurant profile not found' },
            user: req.session.user
        });
    }

    const menuItem = await MenuItem.findById(id);

    if (!menuItem || menuItem.restaurant_id !== restaurant.restaurant_id) {
        return res.status(404).render('error', {
            title: 'Menu Item Not Found',
            error: { status: 404, message: 'Menu item not found' },
            user: req.session.user
        });
    }

    res.render('restaurant/menu-item-form', {
        title: 'Edit Menu Item',
        user: req.session.user,
        restaurant,
        menuItem,
        isEdit: true
    });
});

/**
 * Create menu item
 */
const createMenuItem = wrapAsync(async (req, res) => {
    const userId = req.session.user.user_id;
    const restaurant = await Restaurant.findByUserId(userId);

    if (!restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
    }

    const { item_name, description, price, category, image_url, is_available } = req.body;

    if (!item_name || !price) {
        return res.status(400).json({ error: 'Item name and price are required' });
    }

    try {
        const menuItem = await MenuItem.create({
            restaurant_id: restaurant.restaurant_id,
            item_name,
            description,
            price: parseFloat(price),
            category,
            image_url,
            is_available: is_available === 'true' || is_available === true
        });

        req.session.success = 'Menu item added successfully';
        res.json({ success: true, menuItem });
    } catch (error) {
        console.error('Error creating menu item:', error);
        res.status(500).json({ error: 'Failed to create menu item' });
    }
});

/**
 * Update menu item
 */
const updateMenuItem = wrapAsync(async (req, res) => {
    const { id } = req.params;
    const userId = req.session.user.user_id;
    const restaurant = await Restaurant.findByUserId(userId);

    if (!restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
    }

    const menuItem = await MenuItem.findById(id);
    if (!menuItem || menuItem.restaurant_id !== restaurant.restaurant_id) {
        return res.status(404).json({ error: 'Menu item not found' });
    }

    const { item_name, description, price, category, image_url, is_available } = req.body;

    if (!item_name || !price) {
        return res.status(400).json({ error: 'Item name and price are required' });
    }

    try {
        const success = await MenuItem.update(id, {
            item_name,
            description,
            price: parseFloat(price),
            category,
            image_url,
            is_available: is_available === 'true' || is_available === true
        });

        if (success) {
            req.session.success = 'Menu item updated successfully';
            res.json({ success: true });
        } else {
            res.status(400).json({ error: 'Failed to update menu item' });
        }
    } catch (error) {
        console.error('Error updating menu item:', error);
        res.status(500).json({ error: 'Failed to update menu item' });
    }
});

/**
 * Delete menu item
 */
const deleteMenuItem = wrapAsync(async (req, res) => {
    const { id } = req.params;
    const userId = req.session.user.user_id;
    const restaurant = await Restaurant.findByUserId(userId);

    if (!restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
    }

    try {
        const success = await MenuItem.delete(id, restaurant.restaurant_id);

        if (success) {
            req.session.success = 'Menu item deleted successfully';
            res.json({ success: true });
        } else {
            res.status(400).json({ error: 'Failed to delete menu item' });
        }
    } catch (error) {
        console.error('Error deleting menu item:', error);
        res.status(500).json({ error: 'Failed to delete menu item' });
    }
});

module.exports = {
    dashboard,
    viewOrders,
    viewOrder,
    acceptOrder,
    rejectOrder,
    markPreparing,
    markReady,
    viewMenu,
    showAddMenuItem,
    showEditMenuItem,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem
};
