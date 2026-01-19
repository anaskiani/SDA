// ============================================
// Menu Item Model
// Handles database operations for menu items
// ============================================

const pool = require('../db');

class MenuItem {
    /**
     * Get all menu items for a restaurant
     * @param {number} restaurantId - Restaurant ID
     * @returns {Promise<Array>} Array of menu items
     */
    static async findByRestaurantId(restaurantId) {
        try {
            const [rows] = await pool.execute(
                `SELECT * FROM menu_items 
                 WHERE restaurant_id = ? AND is_available = TRUE 
                 ORDER BY category, item_name`,
                [restaurantId]
            );
            return rows;
        } catch (error) {
            console.error('Error finding menu items:', error);
            throw error;
        }
    }

    /**
     * Find menu item by ID
     * @param {number} itemId - Menu item ID
     * @returns {Promise<Object|null>} Menu item object or null
     */
    static async findById(itemId) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM menu_items WHERE item_id = ? AND is_available = TRUE',
                [itemId]
            );
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error('Error finding menu item by ID:', error);
            throw error;
        }
    }

    /**
     * Get menu items by IDs (for cart/order)
     * @param {Array<number>} itemIds - Array of item IDs
     * @returns {Promise<Array>} Array of menu items
     */
    static async findByIds(itemIds) {
        try {
            if (!itemIds || itemIds.length === 0) return [];
            
            const placeholders = itemIds.map(() => '?').join(',');
            const [rows] = await pool.execute(
                `SELECT * FROM menu_items 
                 WHERE item_id IN (${placeholders}) AND is_available = TRUE`,
                itemIds
            );
            return rows;
        } catch (error) {
            console.error('Error finding menu items by IDs:', error);
            throw error;
        }
    }

    /**
     * Get all menu items for a restaurant (including unavailable)
     * @param {number} restaurantId - Restaurant ID
     * @returns {Promise<Array>} Array of menu items
     */
    static async findAllByRestaurantId(restaurantId) {
        try {
            const [rows] = await pool.execute(
                `SELECT * FROM menu_items 
                 WHERE restaurant_id = ? 
                 ORDER BY category, item_name`,
                [restaurantId]
            );
            return rows;
        } catch (error) {
            console.error('Error finding all menu items:', error);
            throw error;
        }
    }

    /**
     * Create a new menu item
     * @param {Object} itemData - Menu item data
     * @returns {Promise<Object>} Created menu item
     */
    static async create(itemData) {
        try {
            const [result] = await pool.execute(
                `INSERT INTO menu_items (restaurant_id, item_name, description, price, category, image_url, is_available) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    itemData.restaurant_id,
                    itemData.item_name,
                    itemData.description || null,
                    itemData.price,
                    itemData.category || null,
                    itemData.image_url || null,
                    itemData.is_available !== undefined ? itemData.is_available : true
                ]
            );

            return await this.findById(result.insertId);
        } catch (error) {
            console.error('Error creating menu item:', error);
            throw error;
        }
    }

    /**
     * Update a menu item
     * @param {number} itemId - Menu item ID
     * @param {Object} itemData - Updated menu item data
     * @returns {Promise<boolean>} Success status
     */
    static async update(itemId, itemData) {
        try {
            const [result] = await pool.execute(
                `UPDATE menu_items 
                 SET item_name = ?, description = ?, price = ?, category = ?, image_url = ?, is_available = ? 
                 WHERE item_id = ?`,
                [
                    itemData.item_name,
                    itemData.description || null,
                    itemData.price,
                    itemData.category || null,
                    itemData.image_url || null,
                    itemData.is_available !== undefined ? itemData.is_available : true,
                    itemId
                ]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error updating menu item:', error);
            throw error;
        }
    }

    /**
     * Delete a menu item (soft delete by setting is_available to false)
     * @param {number} itemId - Menu item ID
     * @param {number} restaurantId - Restaurant ID (for verification)
     * @returns {Promise<boolean>} Success status
     */
    static async delete(itemId, restaurantId) {
        try {
            const [result] = await pool.execute(
                'UPDATE menu_items SET is_available = FALSE WHERE item_id = ? AND restaurant_id = ?',
                [itemId, restaurantId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error deleting menu item:', error);
            throw error;
        }
    }
}

module.exports = MenuItem;
