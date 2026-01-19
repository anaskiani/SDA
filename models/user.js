// ============================================
// User Model
// Handles all database operations for users
// ============================================

const pool = require('../db');
const bcrypt = require('bcryptjs');

class User {
    /**
     * Find user by email
     * @param {string} email - User email
     * @returns {Promise<Object|null>} User object or null
     */
    static async findByEmail(email) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM users WHERE email = ?',
                [email]
            );
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error('Error finding user by email:', error);
            throw error;
        }
    }

    /**
     * Find user by username
     * @param {string} username - Username
     * @returns {Promise<Object|null>} User object or null
     */
    static async findByUsername(username) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM users WHERE username = ?',
                [username]
            );
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error('Error finding user by username:', error);
            throw error;
        }
    }

    /**
     * Find user by ID
     * @param {number} userId - User ID
     * @returns {Promise<Object|null>} User object or null
     */
    static async findById(userId) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM users WHERE user_id = ?',
                [userId]
            );
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error('Error finding user by ID:', error);
            throw error;
        }
    }

    /**
     * Create a new user
     * @param {Object} userData - User data (username, email, password, role, full_name, phone, address)
     * @returns {Promise<Object>} Created user object
     */
    static async create(userData) {
        try {
            // Hash password
            const hashedPassword = await bcrypt.hash(userData.password, 10);

            const [result] = await pool.execute(
                `INSERT INTO users (username, email, password, role, full_name, phone, address) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    userData.username,
                    userData.email,
                    hashedPassword,
                    userData.role,
                    userData.full_name,
                    userData.phone || null,
                    userData.address || null
                ]
            );

            // Return the created user (without password)
            const user = await this.findById(result.insertId);
            delete user.password;
            return user;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    /**
     * Verify password
     * @param {string} plainPassword - Plain text password
     * @param {string} hashedPassword - Hashed password from database
     * @returns {Promise<boolean>} True if password matches
     */
    static async verifyPassword(plainPassword, hashedPassword) {
        try {
            return await bcrypt.compare(plainPassword, hashedPassword);
        } catch (error) {
            console.error('Error verifying password:', error);
            throw error;
        }
    }

    /**
     * Get user without password
     * @param {Object} user - User object from database
     * @returns {Object} User object without password
     */
    static sanitize(user) {
        if (!user) return null;
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    /**
     * Check if email exists
     * @param {string} email - Email to check
     * @returns {Promise<boolean>} True if email exists
     */
    static async emailExists(email) {
        try {
            const user = await this.findByEmail(email);
            return user !== null;
        } catch (error) {
            console.error('Error checking email existence:', error);
            throw error;
        }
    }

    /**
     * Check if username exists
     * @param {string} username - Username to check
     * @returns {Promise<boolean>} True if username exists
     */
    static async usernameExists(username) {
        try {
            const user = await this.findByUsername(username);
            return user !== null;
        } catch (error) {
            console.error('Error checking username existence:', error);
            throw error;
        }
    }

    /**
     * Get all users (admin function)
     * @param {string} role - Optional role filter
     * @returns {Promise<Array>} Array of users
     */
    static async findAll(role = null) {
        try {
            let query = 'SELECT * FROM users';
            let params = [];
            
            if (role) {
                query += ' WHERE role = ?';
                params.push(role);
            }
            
            query += ' ORDER BY created_at DESC';
            
            const [rows] = await pool.execute(query, params);
            return rows.map(user => this.sanitize(user));
        } catch (error) {
            console.error('Error finding all users:', error);
            throw error;
        }
    }
}

module.exports = User;
