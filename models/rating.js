// ============================================
// Rating Model
// Handles database operations for ratings
// ============================================

const pool = require('../db');

class Rating {
    /**
     * Create a rating
     * @param {Object} ratingData - Rating data
     * @returns {Promise<Object>} Created rating
     */
    static async create(ratingData) {
        try {
            const [result] = await pool.execute(
                `INSERT INTO ratings (order_id, customer_id, restaurant_id, rider_id, restaurant_rating, rider_rating, feedback) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    ratingData.order_id,
                    ratingData.customer_id,
                    ratingData.restaurant_id,
                    ratingData.rider_id || null,
                    ratingData.restaurant_rating || null,
                    ratingData.rider_rating || null,
                    ratingData.feedback || null
                ]
            );

            const [rows] = await pool.execute(
                'SELECT * FROM ratings WHERE rating_id = ?',
                [result.insertId]
            );

            return rows[0];
        } catch (error) {
            console.error('Error creating rating:', error);
            throw error;
        }
    }

    /**
     * Check if order already has a rating
     * @param {number} orderId - Order ID
     * @returns {Promise<boolean>} True if rating exists
     */
    static async existsForOrder(orderId) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM ratings WHERE order_id = ?',
                [orderId]
            );
            return rows.length > 0;
        } catch (error) {
            console.error('Error checking rating existence:', error);
            throw error;
        }
    }
}

module.exports = Rating;
