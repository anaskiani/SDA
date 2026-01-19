// ============================================
// Restaurant Model
// Handles database operations for restaurants
// ============================================

const pool = require('../db');

class Restaurant {
    /**
     * Get all active restaurants
     * @returns {Promise<Array>} Array of restaurants
     */
    static async findAll() {
        try {
            const [rows] = await pool.execute(
                `SELECT r.*, u.email, u.phone as user_phone 
                 FROM restaurants r 
                 JOIN users u ON r.user_id = u.user_id 
                 WHERE r.is_active = TRUE 
                 ORDER BY r.restaurant_name`
            );
            return rows;
        } catch (error) {
            console.error('Error finding restaurants:', error);
            throw error;
        }
    }

    /**
     * Find restaurant by ID
     * @param {number} restaurantId - Restaurant ID
     * @returns {Promise<Object|null>} Restaurant object or null
     */
    static async findById(restaurantId) {
        try {
            const [rows] = await pool.execute(
                `SELECT r.*, u.email, u.phone as user_phone 
                 FROM restaurants r 
                 JOIN users u ON r.user_id = u.user_id 
                 WHERE r.restaurant_id = ? AND r.is_active = TRUE`,
                [restaurantId]
            );
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error('Error finding restaurant by ID:', error);
            throw error;
        }
    }

    /**
     * Find restaurant by user ID
     * @param {number} userId - User ID
     * @returns {Promise<Object|null>} Restaurant object or null
     */
    static async findByUserId(userId) {
        try {
            const [rows] = await pool.execute(
                `SELECT r.*, u.email, u.phone as user_phone 
                 FROM restaurants r 
                 JOIN users u ON r.user_id = u.user_id 
                 WHERE r.user_id = ?`,
                [userId]
            );
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error('Error finding restaurant by user ID:', error);
            throw error;
        }
    }

    /**
     * Get all restaurants (including inactive) - Admin function
     * @returns {Promise<Array>} Array of restaurants
     */
    static async findAllAdmin() {
        try {
            const [rows] = await pool.execute(
                `SELECT r.*, u.email, u.phone as user_phone, u.full_name as owner_name
                 FROM restaurants r 
                 JOIN users u ON r.user_id = u.user_id 
                 ORDER BY r.restaurant_name`
            );
            return rows;
        } catch (error) {
            console.error('Error finding all restaurants:', error);
            throw error;
        }
    }

    /**
     * Update restaurant active status - Admin function
     * @param {number} restaurantId - Restaurant ID
     * @param {boolean} isActive - Active status
     * @returns {Promise<boolean>} Success status
     */
    static async updateActiveStatus(restaurantId, isActive) {
        try {
            const [result] = await pool.execute(
                'UPDATE restaurants SET is_active = ? WHERE restaurant_id = ?',
                [isActive, restaurantId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error updating restaurant status:', error);
            throw error;
        }
    }
}

module.exports = Restaurant;
