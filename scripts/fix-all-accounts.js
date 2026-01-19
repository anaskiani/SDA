// ============================================
// Fix All User Accounts - Complete Setup
// Ensures all accounts exist with proper passwords and related data
// Run: node scripts/fix-all-accounts.js
// ============================================

require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function fixAllAccounts() {
    let connection;
    
    try {
        console.log('🔌 Connecting to MySQL...');
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'food_delivery_db'
        });
        console.log('✅ Connected to database!\n');

        const password = 'password123';
        const hash = await bcrypt.hash(password, 10);
        console.log('🔐 Generated password hash');
        console.log('📝 Password for all accounts: password123\n');

        // ============================================
        // 1. ADMIN ACCOUNT
        // ============================================
        console.log('🔴 Setting up Admin account...');
        let [users] = await connection.execute(
            'SELECT * FROM users WHERE email = ?',
            ['admin@fooddelivery.com']
        );
        
        let adminUserId;
        if (users.length === 0) {
            const [result] = await connection.execute(
                `INSERT INTO users (username, email, password, role, full_name, phone) 
                 VALUES (?, ?, ?, 'admin', ?, ?)`,
                ['admin', 'admin@fooddelivery.com', hash, 'System Administrator', '1234567890']
            );
            adminUserId = result.insertId;
            console.log('   ✅ Created admin account');
        } else {
            adminUserId = users[0].user_id;
            await connection.execute(
                'UPDATE users SET password = ? WHERE email = ?',
                [hash, 'admin@fooddelivery.com']
            );
            console.log('   ✅ Updated admin password');
        }

        // ============================================
        // 2. CUSTOMER ACCOUNTS
        // ============================================
        console.log('\n🟢 Setting up Customer accounts...');
        const customers = [
            { email: 'john@example.com', username: 'john_doe', name: 'John Doe', phone: '9876543210', address: '123 Main Street, City' },
            { email: 'jane@example.com', username: 'jane_smith', name: 'Jane Smith', phone: '9876543211', address: '456 Oak Avenue, City' },
            { email: 'bob@example.com', username: 'bob_wilson', name: 'Bob Wilson', phone: '9876543212', address: '789 Pine Road, City' }
        ];

        for (const customer of customers) {
            [users] = await connection.execute('SELECT * FROM users WHERE email = ?', [customer.email]);
            if (users.length === 0) {
                await connection.execute(
                    `INSERT INTO users (username, email, password, role, full_name, phone, address) 
                     VALUES (?, ?, ?, 'customer', ?, ?, ?)`,
                    [customer.username, customer.email, hash, customer.name, customer.phone, customer.address]
                );
                console.log(`   ✅ Created: ${customer.email}`);
            } else {
                await connection.execute(
                    'UPDATE users SET password = ? WHERE email = ?',
                    [hash, customer.email]
                );
                console.log(`   ✅ Updated: ${customer.email}`);
            }
        }

        // ============================================
        // 3. RESTAURANT ACCOUNTS
        // ============================================
        console.log('\n🟡 Setting up Restaurant accounts...');
        const restaurants = [
            { 
                email: 'pizza@restaurant.com', 
                username: 'pizza_place', 
                name: 'Pizza Place Owner',
                restaurantName: 'Pizza Place',
                description: 'Best pizza in town! Fresh ingredients, authentic Italian recipes.',
                address: '100 Food Street, City',
                phone: '1111111111',
                cuisine: 'Italian',
                opening: '10:00:00',
                closing: '22:00:00'
            },
            { 
                email: 'burger@restaurant.com', 
                username: 'burger_joint', 
                name: 'Burger Joint Owner',
                restaurantName: 'Burger Joint',
                description: 'Juicy burgers made with premium beef. Fast and delicious!',
                address: '200 Food Street, City',
                phone: '2222222222',
                cuisine: 'American',
                opening: '11:00:00',
                closing: '23:00:00'
            },
            { 
                email: 'sushi@restaurant.com', 
                username: 'sushi_bar', 
                name: 'Sushi Bar Owner',
                restaurantName: 'Sushi Bar',
                description: 'Fresh sushi and Japanese cuisine. Traditional recipes with modern twist.',
                address: '300 Food Street, City',
                phone: '3333333333',
                cuisine: 'Japanese',
                opening: '12:00:00',
                closing: '22:00:00'
            }
        ];

        for (const rest of restaurants) {
            [users] = await connection.execute('SELECT * FROM users WHERE email = ?', [rest.email]);
            let userId;
            
            if (users.length === 0) {
                const [result] = await connection.execute(
                    `INSERT INTO users (username, email, password, role, full_name, phone) 
                     VALUES (?, ?, ?, 'restaurant', ?, ?)`,
                    [rest.username, rest.email, hash, rest.name, rest.phone]
                );
                userId = result.insertId;
                console.log(`   ✅ Created user: ${rest.email}`);
            } else {
                userId = users[0].user_id;
                await connection.execute(
                    'UPDATE users SET password = ? WHERE email = ?',
                    [hash, rest.email]
                );
                console.log(`   ✅ Updated user: ${rest.email}`);
            }

            // Check if restaurant entry exists
            const [restaurantsData] = await connection.execute(
                'SELECT * FROM restaurants WHERE user_id = ?',
                [userId]
            );

            if (restaurantsData.length === 0) {
                await connection.execute(
                    `INSERT INTO restaurants (user_id, restaurant_name, description, address, phone, cuisine_type, opening_time, closing_time, is_active) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
                    [userId, rest.restaurantName, rest.description, rest.address, rest.phone, rest.cuisine, rest.opening, rest.closing]
                );
                console.log(`   ✅ Created restaurant entry: ${rest.restaurantName}`);
            } else {
                console.log(`   ✅ Restaurant entry exists: ${rest.restaurantName}`);
            }
        }

        // ============================================
        // 4. RIDER ACCOUNTS
        // ============================================
        console.log('\n🔵 Setting up Rider accounts...');
        const riders = [
            { 
                email: 'rider1@delivery.com', 
                username: 'rider1', 
                name: 'Mike Rider',
                phone: '4444444444',
                vehicle: 'Motorcycle',
                license: 'LIC001'
            },
            { 
                email: 'rider2@delivery.com', 
                username: 'rider2', 
                name: 'Sarah Rider',
                phone: '5555555555',
                vehicle: 'Bicycle',
                license: 'LIC002'
            }
        ];

        for (const rider of riders) {
            [users] = await connection.execute('SELECT * FROM users WHERE email = ?', [rider.email]);
            let userId;
            
            if (users.length === 0) {
                const [result] = await connection.execute(
                    `INSERT INTO users (username, email, password, role, full_name, phone) 
                     VALUES (?, ?, ?, 'rider', ?, ?)`,
                    [rider.username, rider.email, hash, rider.name, rider.phone]
                );
                userId = result.insertId;
                console.log(`   ✅ Created user: ${rider.email}`);
            } else {
                userId = users[0].user_id;
                await connection.execute(
                    'UPDATE users SET password = ? WHERE email = ?',
                    [hash, rider.email]
                );
                console.log(`   ✅ Updated user: ${rider.email}`);
            }

            // Check if rider entry exists
            const [ridersData] = await connection.execute(
                'SELECT * FROM riders WHERE user_id = ?',
                [userId]
            );

            if (ridersData.length === 0) {
                await connection.execute(
                    `INSERT INTO riders (user_id, vehicle_type, license_number, is_available, is_active) 
                     VALUES (?, ?, ?, TRUE, TRUE)`,
                    [userId, rider.vehicle, rider.license]
                );
                console.log(`   ✅ Created rider entry: ${rider.name}`);
            } else {
                console.log(`   ✅ Rider entry exists: ${rider.name}`);
            }
        }

        console.log('\n🎉 All accounts fixed and ready!\n');
        console.log('📋 Login Credentials (Password: password123):');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔴 Admin:');
        console.log('   Email: admin@fooddelivery.com');
        console.log('\n🟢 Customer:');
        console.log('   Email: john@example.com');
        console.log('\n🟡 Restaurant:');
        console.log('   Email: pizza@restaurant.com');
        console.log('   Email: burger@restaurant.com');
        console.log('   Email: sushi@restaurant.com');
        console.log('\n🔵 Rider:');
        console.log('   Email: rider1@delivery.com');
        console.log('   Email: rider2@delivery.com');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.code === 'ER_BAD_DB_ERROR') {
            console.error('   Database does not exist! Run: node scripts/setup-database.js');
        } else if (error.code === 'ECONNREFUSED') {
            console.error('   MySQL is not running! Start MySQL in XAMPP');
        } else {
            console.error('   Full error:', error);
        }
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

fixAllAccounts();
