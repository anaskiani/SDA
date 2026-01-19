// ============================================
// Order Model
// Handles database operations for orders
// ============================================

const pool = require('../db');

class Order {
    /**
     * Create a new order
     * @param {Object} orderData - Order data
     * @returns {Promise<Object>} Created order
     */
    static async create(orderData) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Insert order
            const [orderResult] = await connection.execute(
                `INSERT INTO orders (customer_id, restaurant_id, total_amount, delivery_address, special_instructions, order_status) 
                 VALUES (?, ?, ?, ?, ?, 'pending')`,
                [
                    orderData.customer_id,
                    orderData.restaurant_id,
                    orderData.total_amount,
                    orderData.delivery_address,
                    orderData.special_instructions || null
                ]
            );

            const orderId = orderResult.insertId;

            // Insert order items
            for (const item of orderData.items) {
                await connection.execute(
                    `INSERT INTO order_items (order_id, item_id, quantity, price, subtotal) 
                     VALUES (?, ?, ?, ?, ?)`,
                    [
                        orderId,
                        item.item_id,
                        item.quantity,
                        item.price,
                        item.subtotal
                    ]
                );
            }

            // Create payment record
            await connection.execute(
                `INSERT INTO payments (order_id, payment_method, payment_status, amount) 
                 VALUES (?, ?, 'completed', ?)`,
                [orderId, orderData.payment_method || 'cash', orderData.total_amount]
            );

            await connection.commit();

            // Return the created order with items
            return await this.findById(orderId);
        } catch (error) {
            await connection.rollback();
            console.error('Error creating order:', error);
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Find order by ID with full details
     * @param {number} orderId - Order ID
     * @returns {Promise<Object|null>} Order object with items or null
     */
    static async findById(orderId) {
        try {
            // Get order details
            const [orderRows] = await pool.execute(
                `SELECT o.*, 
                        r.restaurant_name, r.address as restaurant_address,
                        u.full_name as customer_name, u.phone as customer_phone,
                        rd.full_name as rider_name, rd.phone as rider_phone
                 FROM orders o
                 JOIN restaurants r ON o.restaurant_id = r.restaurant_id
                 JOIN users u ON o.customer_id = u.user_id
                 LEFT JOIN riders ri ON o.rider_id = ri.rider_id
                 LEFT JOIN users rd ON ri.user_id = rd.user_id
                 WHERE o.order_id = ?`,
                [orderId]
            );

            if (orderRows.length === 0) return null;

            const order = orderRows[0];

            // Get order items
            const [itemRows] = await pool.execute(
                `SELECT oi.*, mi.item_name, mi.description 
                 FROM order_items oi
                 JOIN menu_items mi ON oi.item_id = mi.item_id
                 WHERE oi.order_id = ?`,
                [orderId]
            );

            order.items = itemRows;

            // Get payment info
            const [paymentRows] = await pool.execute(
                'SELECT * FROM payments WHERE order_id = ?',
                [orderId]
            );

            order.payment = paymentRows[0] || null;

            return order;
        } catch (error) {
            console.error('Error finding order by ID:', error);
            throw error;
        }
    }

    /**
     * Get all orders for a customer
     * @param {number} customerId - Customer ID
     * @returns {Promise<Array>} Array of orders
     */
    static async findByCustomerId(customerId) {
        try {
            const [rows] = await pool.execute(
                `SELECT o.*, r.restaurant_name 
                 FROM orders o
                 JOIN restaurants r ON o.restaurant_id = r.restaurant_id
                 WHERE o.customer_id = ?
                 ORDER BY o.created_at DESC`,
                [customerId]
            );
            return rows;
        } catch (error) {
            console.error('Error finding orders by customer ID:', error);
            throw error;
        }
    }

    /**
     * Update order status
     * @param {number} orderId - Order ID
     * @param {string} status - New status
     * @returns {Promise<boolean>} Success status
     */
    static async updateStatus(orderId, status) {
        try {
            const [result] = await pool.execute(
                'UPDATE orders SET order_status = ? WHERE order_id = ?',
                [status, orderId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error updating order status:', error);
            throw error;
        }
    }

    /**
     * Cancel order (only if status allows)
     * @param {number} orderId - Order ID
     * @param {number} customerId - Customer ID (for verification)
     * @returns {Promise<boolean>} Success status
     */
    static async cancel(orderId, customerId) {
        try {
            // Check if order can be cancelled (only before pickup)
            const [orderRows] = await pool.execute(
                'SELECT * FROM orders WHERE order_id = ? AND customer_id = ?',
                [orderId, customerId]
            );

            if (orderRows.length === 0) return false;

            const order = orderRows[0];
            const cancellableStatuses = ['pending', 'accepted', 'preparing'];
            
            if (!cancellableStatuses.includes(order.order_status)) {
                return false;
            }

            const [result] = await pool.execute(
                'UPDATE orders SET order_status = "cancelled" WHERE order_id = ?',
                [orderId]
            );

            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error cancelling order:', error);
            throw error;
        }
    }

    /**
     * Get all orders for a restaurant
     * @param {number} restaurantId - Restaurant ID
     * @returns {Promise<Array>} Array of orders
     */
    static async findByRestaurantId(restaurantId) {
        try {
            const [rows] = await pool.execute(
                `SELECT o.*, u.full_name as customer_name, u.phone as customer_phone 
                 FROM orders o
                 JOIN users u ON o.customer_id = u.user_id
                 WHERE o.restaurant_id = ?
                 ORDER BY o.created_at DESC`,
                [restaurantId]
            );
            return rows;
        } catch (error) {
            console.error('Error finding orders by restaurant ID:', error);
            throw error;
        }
    }

    /**
     * Update order status (with restaurant verification)
     * @param {number} orderId - Order ID
     * @param {number} restaurantId - Restaurant ID (for verification)
     * @param {string} status - New status
     * @returns {Promise<boolean>} Success status
     */
    static async updateStatusByRestaurant(orderId, restaurantId, status) {
        try {
            const [result] = await pool.execute(
                'UPDATE orders SET order_status = ? WHERE order_id = ? AND restaurant_id = ?',
                [status, orderId, restaurantId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error updating order status:', error);
            throw error;
        }
    }

    /**
     * Get orders assigned to a rider
     * @param {number} riderId - Rider ID
     * @returns {Promise<Array>} Array of orders
     */
    static async findByRiderId(riderId) {
        try {
            const [rows] = await pool.execute(
                `SELECT o.*, r.restaurant_name, r.address as restaurant_address,
                        u.full_name as customer_name, u.phone as customer_phone
                 FROM orders o
                 JOIN restaurants r ON o.restaurant_id = r.restaurant_id
                 JOIN users u ON o.customer_id = u.user_id
                 WHERE o.rider_id = ?
                 ORDER BY o.created_at DESC`,
                [riderId]
            );
            return rows;
        } catch (error) {
            console.error('Error finding orders by rider ID:', error);
            throw error;
        }
    }

    /**
     * Get ready orders (available for pickup)
     * @returns {Promise<Array>} Array of ready orders
     */
    static async findReadyOrders() {
        try {
            const [rows] = await pool.execute(
                `SELECT o.*, r.restaurant_name, r.address as restaurant_address,
                        u.full_name as customer_name, u.phone as customer_phone
                 FROM orders o
                 JOIN restaurants r ON o.restaurant_id = r.restaurant_id
                 JOIN users u ON o.customer_id = u.user_id
                 WHERE o.order_status = 'ready' AND o.rider_id IS NULL
                 ORDER BY o.created_at ASC`,
                []
            );
            return rows;
        } catch (error) {
            console.error('Error finding ready orders:', error);
            throw error;
        }
    }

    /**
     * Update order status (with rider verification)
     * @param {number} orderId - Order ID
     * @param {number} riderId - Rider ID (for verification)
     * @param {string} status - New status
     * @returns {Promise<boolean>} Success status
     */
    static async updateStatusByRider(orderId, riderId, status) {
        try {
            const [result] = await pool.execute(
                'UPDATE orders SET order_status = ? WHERE order_id = ? AND rider_id = ?',
                [status, orderId, riderId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error updating order status:', error);
            throw error;
        }
    }

    /**
     * Get all orders (admin function)
     * @returns {Promise<Array>} Array of orders
     */
    static async findAll() {
        try {
            const [rows] = await pool.execute(
                `SELECT o.*, 
                        r.restaurant_name,
                        u.full_name as customer_name,
                        rd.full_name as rider_name
                 FROM orders o
                 JOIN restaurants r ON o.restaurant_id = r.restaurant_id
                 JOIN users u ON o.customer_id = u.user_id
                 LEFT JOIN riders ri ON o.rider_id = ri.rider_id
                 LEFT JOIN users rd ON ri.user_id = rd.user_id
                 ORDER BY o.created_at DESC`
            );
            return rows;
        } catch (error) {
            console.error('Error finding all orders:', error);
            throw error;
        }
    }
}

module.exports = Order;
