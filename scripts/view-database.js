// ============================================
// View Database Data Script
// Run: node scripts/view-database.js
// ============================================

require('dotenv').config();
const mysql = require('mysql2/promise');

async function viewDatabase() {
    let connection;
    
    try {
        console.log('🔌 Connecting to MySQL...');
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'food_delivery_db'
        });
        console.log('✅ Connected!\n');

        // View Users
        console.log('👥 USERS:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        const [users] = await connection.execute('SELECT user_id, username, email, role, full_name FROM users LIMIT 10');
        console.table(users);
        console.log(`Total users: ${(await connection.execute('SELECT COUNT(*) as count FROM users'))[0][0].count}\n`);

        // View Restaurants
        console.log('🍕 RESTAURANTS:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        const [restaurants] = await connection.execute(
            `SELECT r.restaurant_id, r.restaurant_name, r.cuisine_type, r.is_active, u.email 
             FROM restaurants r 
             JOIN users u ON r.user_id = u.user_id`
        );
        console.table(restaurants);
        console.log(`Total restaurants: ${restaurants.length}\n`);

        // View Riders
        console.log('🚴 RIDERS:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        const [riders] = await connection.execute(
            `SELECT ri.rider_id, u.full_name, u.email, ri.vehicle_type, ri.is_available 
             FROM riders ri 
             JOIN users u ON ri.user_id = u.user_id`
        );
        console.table(riders);
        console.log(`Total riders: ${riders.length}\n`);

        // View Orders
        console.log('📦 ORDERS:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        const [orders] = await connection.execute(
            `SELECT o.order_id, o.order_status, o.total_amount, 
                    u.full_name as customer, r.restaurant_name,
                    o.created_at
             FROM orders o
             JOIN users u ON o.customer_id = u.user_id
             JOIN restaurants r ON o.restaurant_id = r.restaurant_id
             ORDER BY o.created_at DESC
             LIMIT 10`
        );
        console.table(orders);
        console.log(`Total orders: ${(await connection.execute('SELECT COUNT(*) as count FROM orders'))[0][0].count}\n`);

        // View Orders by Status
        console.log('📊 ORDERS BY STATUS:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        const [statusCounts] = await connection.execute(
            `SELECT order_status, COUNT(*) as count 
             FROM orders 
             GROUP BY order_status`
        );
        console.table(statusCounts);
        console.log('');

        // View Menu Items
        console.log('🍔 MENU ITEMS:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        const [menuItems] = await connection.execute(
            `SELECT mi.item_id, mi.item_name, mi.price, mi.category, r.restaurant_name 
             FROM menu_items mi 
             JOIN restaurants r ON mi.restaurant_id = r.restaurant_id
             LIMIT 10`
        );
        console.table(menuItems);
        console.log(`Total menu items: ${(await connection.execute('SELECT COUNT(*) as count FROM menu_items'))[0][0].count}\n`);

        console.log('✅ Database view complete!\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.code === 'ER_BAD_DB_ERROR') {
            console.error('   Database does not exist!');
        } else if (error.code === 'ECONNREFUSED') {
            console.error('   MySQL is not running! Start MySQL in XAMPP');
        }
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

viewDatabase();
