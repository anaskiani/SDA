// ============================================
// Rider Model
// Handles database operations for riders
// ============================================

const pool = require('../db');

class Rider {
    /**
     * Find rider by user ID
     * @param {number} userId - User ID
     * @returns {Promise<Object|null>} Rider object or null
     */
    static async findByUserId(userId) {
        try {
            const [rows] = await pool.execute(
                `SELECT r.*, u.email, u.phone as user_phone, u.full_name 
                 FROM riders r 
                 JOIN users u ON r.user_id = u.user_id 
                 WHERE r.user_id = ?`,
                [userId]
            );
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error('Error finding rider by user ID:', error);
            throw error;
        }
    }

    /**
     * Find rider by rider ID
     * @param {number} riderId - Rider ID
     * @returns {Promise<Object|null>} Rider object or null
     */
    static async findById(riderId) {
        try {
            const [rows] = await pool.execute(
                `SELECT r.*, u.email, u.phone as user_phone, u.full_name 
                 FROM riders r 
                 JOIN users u ON r.user_id = u.user_id 
                 WHERE r.rider_id = ?`,
                [riderId]
            );
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error('Error finding rider by ID:', error);
            throw error;
        }
    }

    /**
     * Get all available riders
     * @returns {Promise<Array>} Array of available riders
     */
    static async findAvailable() {
        try {
            const [rows] = await pool.execute(
                `SELECT r.*, u.full_name, u.phone 
                 FROM riders r 
                 JOIN users u ON r.user_id = u.user_id 
                 WHERE r.is_available = TRUE AND r.is_active = TRUE`
            );
            return rows;
        } catch (error) {
            console.error('Error finding available riders:', error);
            throw error;
        }
    }

    /**
     * Update rider availability
     * @param {number} riderId - Rider ID
     * @param {boolean} isAvailable - Availability status
     * @returns {Promise<boolean>} Success status
     */
    static async updateAvailability(riderId, isAvailable) {
        try {
            const [result] = await pool.execute(
                'UPDATE riders SET is_available = ? WHERE rider_id = ?',
                [isAvailable, riderId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error updating rider availability:', error);
            throw error;
        }
    }

    /**
     * Assign rider to order (admin or automatic assignment)
     * @param {number} orderId - Order ID
     * @param {number} riderId - Rider ID
     * @returns {Promise<boolean>} Success status
     */
    static async assignToOrder(orderId, riderId) {
        try {
            const [result] = await pool.execute(
                'UPDATE orders SET rider_id = ? WHERE order_id = ?',
                [riderId, orderId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error assigning rider to order:', error);
            throw error;
        }
    }

    /**
     * Get all riders (including inactive) - Admin function
     * @returns {Promise<Array>} Array of riders
     */
    static async findAllAdmin() {
        try {
            const [rows] = await pool.execute(
                `SELECT r.*, u.email, u.phone as user_phone, u.full_name 
                 FROM riders r 
                 JOIN users u ON r.user_id = u.user_id 
                 ORDER BY u.full_name`
            );
            return rows;
        } catch (error) {
            console.error('Error finding all riders:', error);
            throw error;
        }
    }

    /**
     * Update rider active status - Admin function
     * @param {number} riderId - Rider ID
     * @param {boolean} isActive - Active status
     * @returns {Promise<boolean>} Success status
     */
    static async updateActiveStatus(riderId, isActive) {
        try {
            const [result] = await pool.execute(
                'UPDATE riders SET is_active = ? WHERE rider_id = ?',
                [isActive, riderId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error updating rider status:', error);
            throw error;
        }
    }
}

module.exports = Rider;
