// ============================================
// Verify and Fix User Accounts
// Checks if accounts exist and fixes password hashes
// Run: node scripts/verify-accounts.js
// ============================================

require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function verifyAndFixAccounts() {
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
        console.log('🔐 Generated password hash:', hash);
        console.log('📝 Password for all accounts: password123\n');

        // List of accounts to verify/fix
        const accounts = [
            { email: 'admin@fooddelivery.com', username: 'admin', role: 'admin', full_name: 'System Administrator' },
            { email: 'john@example.com', username: 'john_doe', role: 'customer', full_name: 'John Doe' },
            { email: 'pizza@restaurant.com', username: 'pizza_place', role: 'restaurant', full_name: 'Pizza Place Owner' },
            { email: 'burger@restaurant.com', username: 'burger_joint', role: 'restaurant', full_name: 'Burger Joint Owner' },
            { email: 'sushi@restaurant.com', username: 'sushi_bar', role: 'restaurant', full_name: 'Sushi Bar Owner' },
            { email: 'rider1@delivery.com', username: 'rider1', role: 'rider', full_name: 'Mike Rider' }
        ];

        console.log('🔍 Checking accounts...\n');

        for (const account of accounts) {
            const [users] = await connection.execute(
                'SELECT * FROM users WHERE email = ?',
                [account.email]
            );

            if (users.length === 0) {
                console.log(`❌ ${account.email} - NOT FOUND, creating...`);
                await connection.execute(
                    `INSERT INTO users (username, email, password, role, full_name) 
                     VALUES (?, ?, ?, ?, ?)`,
                    [account.username, account.email, hash, account.role, account.full_name]
                );
                console.log(`✅ Created: ${account.email}\n`);
            } else {
                console.log(`✅ ${account.email} - EXISTS`);
                // Update password hash
                await connection.execute(
                    'UPDATE users SET password = ? WHERE email = ?',
                    [hash, account.email]
                );
                console.log(`   Updated password hash\n`);
            }
        }

        console.log('🎉 All accounts verified and fixed!');
        console.log('\n📋 Login Credentials:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔴 Admin:');
        console.log('   Email: admin@fooddelivery.com');
        console.log('   Password: password123');
        console.log('\n🟢 Customer:');
        console.log('   Email: john@example.com');
        console.log('   Password: password123');
        console.log('\n🟡 Restaurant:');
        console.log('   Email: pizza@restaurant.com');
        console.log('   Password: password123');
        console.log('\n🔵 Rider:');
        console.log('   Email: rider1@delivery.com');
        console.log('   Password: password123');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    } catch (error) {
        if (error.code === 'ER_BAD_DB_ERROR') {
            console.error('❌ Database does not exist!');
            console.error('   Please run: node scripts/setup-database.js');
        } else if (error.code === 'ECONNREFUSED') {
            console.error('❌ Cannot connect to MySQL!');
            console.error('   Please make sure MySQL is running in XAMPP');
        } else {
            console.error('❌ Error:', error.message);
        }
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

verifyAndFixAccounts();
