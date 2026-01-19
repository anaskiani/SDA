// ============================================
// Customer Controller
// Handles all customer-related operations
// ============================================

const Restaurant = require('../models/restaurant');
const MenuItem = require('../models/menuItem');
const Order = require('../models/order');
const Rating = require('../models/rating');
const { wrapAsync } = require('../middleware/errorHandler');

/**
 * Customer Dashboard
 */
const dashboard = wrapAsync(async (req, res) => {
    const customerId = req.session.user.user_id;
    
    // Get recent orders
    const orders = await Order.findByCustomerId(customerId);
    const recentOrders = orders.slice(0, 5);

    res.render('customer/dashboard', {
        title: 'Customer Dashboard',
        user: req.session.user,
        recentOrders
    });
});

/**
 * Browse all restaurants
 */
const browseRestaurants = wrapAsync(async (req, res) => {
    const restaurants = await Restaurant.findAll();
    
    res.render('customer/restaurants', {
        title: 'Browse Restaurants',
        user: req.session.user,
        restaurants
    });
});

/**
 * View restaurant menu
 */
const viewMenu = wrapAsync(async (req, res) => {
    const { id } = req.params;
    
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
        return res.status(404).render('error', {
            title: 'Restaurant Not Found',
            error: { status: 404, message: 'Restaurant not found' },
            user: req.session.user
        });
    }

    const menuItems = await MenuItem.findByRestaurantId(id);
    
    // Group items by category
    const itemsByCategory = {};
    menuItems.forEach(item => {
        const category = item.category || 'Other';
        if (!itemsByCategory[category]) {
            itemsByCategory[category] = [];
        }
        itemsByCategory[category].push(item);
    });

    res.render('customer/menu', {
        title: `${restaurant.restaurant_name} - Menu`,
        user: req.session.user,
        restaurant,
        itemsByCategory,
        menuItems
    });
});

/**
 * View cart
 */
const viewCart = (req, res) => {
    const cart = req.session.cart || [];
    let total = 0;
    
    cart.forEach(item => {
        total += parseFloat(item.subtotal);
    });

    res.render('customer/cart', {
        title: 'Shopping Cart',
        user: req.session.user,
        cart,
        total: total.toFixed(2)
    });
};

/**
 * Add item to cart
 */
const addToCart = wrapAsync(async (req, res) => {
    const { item_id, quantity } = req.body;
    const qty = parseInt(quantity) || 1;

    const item = await MenuItem.findById(item_id);
    if (!item) {
        return res.status(404).json({ error: 'Item not found' });
    }

    if (!item.is_available) {
        return res.status(400).json({ error: 'Item is not available' });
    }

    // Initialize cart if it doesn't exist
    if (!req.session.cart) {
        req.session.cart = [];
    }

    // Check if item already in cart
    const existingItemIndex = req.session.cart.findIndex(
        cartItem => cartItem.item_id === parseInt(item_id)
    );

    if (existingItemIndex >= 0) {
        // Update quantity
        req.session.cart[existingItemIndex].quantity += qty;
        req.session.cart[existingItemIndex].subtotal = 
            req.session.cart[existingItemIndex].quantity * parseFloat(item.price);
    } else {
        // Add new item
        req.session.cart.push({
            item_id: item.item_id,
            item_name: item.item_name,
            price: parseFloat(item.price),
            quantity: qty,
            subtotal: parseFloat(item.price) * qty,
            restaurant_id: item.restaurant_id
        });
    }

    res.json({ success: true, cart: req.session.cart });
});

/**
 * Update cart item quantity
 */
const updateCartItem = (req, res) => {
    const { item_id, quantity } = req.body;
    const qty = parseInt(quantity);

    if (!req.session.cart) {
        return res.status(400).json({ error: 'Cart is empty' });
    }

    const itemIndex = req.session.cart.findIndex(
        item => item.item_id === parseInt(item_id)
    );

    if (itemIndex === -1) {
        return res.status(404).json({ error: 'Item not found in cart' });
    }

    if (qty <= 0) {
        req.session.cart.splice(itemIndex, 1);
    } else {
        req.session.cart[itemIndex].quantity = qty;
        req.session.cart[itemIndex].subtotal = 
            req.session.cart[itemIndex].price * qty;
    }

    res.json({ success: true, cart: req.session.cart });
};

/**
 * Remove item from cart
 */
const removeFromCart = (req, res) => {
    const { item_id } = req.params;

    if (!req.session.cart) {
        return res.status(400).json({ error: 'Cart is empty' });
    }

    req.session.cart = req.session.cart.filter(
        item => item.item_id !== parseInt(item_id)
    );

    res.json({ success: true, cart: req.session.cart });
};

/**
 * Show checkout page
 */
const checkout = wrapAsync(async (req, res) => {
    const cart = req.session.cart || [];

    if (cart.length === 0) {
        req.session.error = 'Your cart is empty';
        return res.redirect('/customer/cart');
    }

    // Check if all items are from the same restaurant
    const restaurantIds = [...new Set(cart.map(item => item.restaurant_id))];
    if (restaurantIds.length > 1) {
        req.session.error = 'All items must be from the same restaurant';
        return res.redirect('/customer/cart');
    }

    const restaurant = await Restaurant.findById(restaurantIds[0]);
    let total = 0;
    cart.forEach(item => {
        total += parseFloat(item.subtotal);
    });

    res.render('customer/checkout', {
        title: 'Checkout',
        user: req.session.user,
        cart,
        restaurant,
        total: total.toFixed(2)
    });
});

/**
 * Place order
 */
const placeOrder = wrapAsync(async (req, res) => {
    const cart = req.session.cart || [];
    const customerId = req.session.user.user_id;

    if (cart.length === 0) {
        return res.status(400).json({ error: 'Cart is empty' });
    }

    const restaurantIds = [...new Set(cart.map(item => item.restaurant_id))];
    if (restaurantIds.length > 1) {
        return res.status(400).json({ error: 'All items must be from the same restaurant' });
    }

    const { delivery_address, special_instructions, payment_method } = req.body;

    if (!delivery_address) {
        return res.status(400).json({ error: 'Delivery address is required' });
    }

    let total = 0;
    const orderItems = cart.map(item => {
        total += parseFloat(item.subtotal);
        return {
            item_id: item.item_id,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.subtotal
        };
    });

    const orderData = {
        customer_id: customerId,
        restaurant_id: restaurantIds[0],
        total_amount: total,
        delivery_address,
        special_instructions,
        payment_method: payment_method || 'cash',
        items: orderItems
    };

    const order = await Order.create(orderData);

    // Clear cart
    req.session.cart = [];

    // Set success message
    req.session.success = 'Order placed successfully!';

    if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
        return res.json({ 
            success: true, 
            redirect: `/customer/orders/${order.order_id}` 
        });
    }

    res.redirect(`/customer/orders/${order.order_id}`);
});

/**
 * View all orders
 */
const viewOrders = wrapAsync(async (req, res) => {
    const customerId = req.session.user.user_id;
    const orders = await Order.findByCustomerId(customerId);

    res.render('customer/orders', {
        title: 'My Orders',
        user: req.session.user,
        orders
    });
});

/**
 * View single order details
 */
const viewOrder = wrapAsync(async (req, res) => {
    const { id } = req.params;
    const customerId = req.session.user.user_id;

    const order = await Order.findById(id);

    if (!order || order.customer_id !== customerId) {
        return res.status(404).render('error', {
            title: 'Order Not Found',
            error: { status: 404, message: 'Order not found' },
            user: req.session.user
        });
    }

    // Check if order can be cancelled
    const canCancel = order && ['pending', 'accepted', 'preparing'].includes(order.order_status);
    
    // Check if order can be rated
    const canRate = order && order.order_status === 'delivered';
    
    // Check if customer can mark as received
    const canMarkReceived = order && order.order_status === 'picked_up';
    const hasRating = order ? await Rating.existsForOrder(id) : false;

    res.render('customer/order-details', {
        title: `Order #${order.order_id}`,
        user: req.session.user,
        order,
        canCancel,
        canRate,
        canMarkReceived,
        hasRating
    });
});

/**
 * Mark order as received (delivered)
 */
const markReceived = wrapAsync(async (req, res) => {
    const { id } = req.params;
    const customerId = req.session.user.user_id;

    const order = await Order.findById(id);

    if (!order || order.customer_id !== customerId) {
        return res.status(404).json({ error: 'Order not found' });
    }

    if (order.order_status !== 'picked_up') {
        return res.status(400).json({ error: 'Order is not out for delivery' });
    }

    const success = await Order.updateStatus(id, 'delivered');

    if (success) {
        req.session.success = 'Order marked as received!';
        res.json({ success: true, message: 'Order marked as received' });
    } else {
        res.status(400).json({ error: 'Failed to update order status' });
    }
});

/**
 * Cancel order
 */
const cancelOrder = wrapAsync(async (req, res) => {
    const { id } = req.params;
    const customerId = req.session.user.user_id;

    const success = await Order.cancel(id, customerId);

    if (success) {
        req.session.success = 'Order cancelled successfully';
    } else {
        req.session.error = 'Order cannot be cancelled at this stage';
    }

    res.redirect(`/customer/orders/${id}`);
});

/**
 * Show rating form
 */
const showRating = wrapAsync(async (req, res) => {
    const { id } = req.params;
    const customerId = req.session.user.user_id;

    const order = await Order.findById(id);

    if (!order || order.customer_id !== customerId) {
        return res.status(404).render('error', {
            title: 'Order Not Found',
            error: { status: 404, message: 'Order not found' },
            user: req.session.user
        });
    }

    if (order.order_status !== 'delivered') {
        req.session.error = 'You can only rate delivered orders';
        return res.redirect(`/customer/orders/${id}`);
    }

    const hasRating = await Rating.existsForOrder(id);
    if (hasRating) {
        req.session.error = 'You have already rated this order';
        return res.redirect(`/customer/orders/${id}`);
    }

    res.render('customer/rating', {
        title: 'Rate Your Order',
        user: req.session.user,
        order
    });
});

/**
 * Submit rating
 */
const submitRating = wrapAsync(async (req, res) => {
    const { id } = req.params;
    const customerId = req.session.user.user_id;
    const { restaurant_rating, rider_rating, feedback } = req.body;

    const order = await Order.findById(id);

    if (!order || order.customer_id !== customerId) {
        return res.status(404).json({ error: 'Order not found' });
    }

    if (order.order_status !== 'delivered') {
        return res.status(400).json({ error: 'You can only rate delivered orders' });
    }

    const hasRating = await Rating.existsForOrder(id);
    if (hasRating) {
        return res.status(400).json({ error: 'You have already rated this order' });
    }

    const ratingData = {
        order_id: id,
        customer_id: customerId,
        restaurant_id: order.restaurant_id,
        rider_id: order.rider_id,
        restaurant_rating: restaurant_rating ? parseInt(restaurant_rating) : null,
        rider_rating: rider_rating ? parseInt(rider_rating) : null,
        feedback: feedback || null
    };

    await Rating.create(ratingData);

    req.session.success = 'Thank you for your feedback!';
    res.json({ success: true });
});

module.exports = {
    dashboard,
    browseRestaurants,
    viewMenu,
    viewCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    checkout,
    placeOrder,
    viewOrders,
    viewOrder,
    cancelOrder,
    markReceived,
    showRating,
    submitRating
};
