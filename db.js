// ============================================
// Database Connection Module
// MySQL connection setup using mysql2
// ============================================

const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'food_delivery_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
pool.getConnection()
    .then(connection => {
        console.log('✅ Database connected successfully!');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Database connection error:', err.message);
        console.log('Please ensure MySQL is running and database credentials are correct.');
    });

// Export pool for use in other modules
module.exports = pool;
