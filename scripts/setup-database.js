// ============================================
// Database Setup Script
// Automatically creates database and imports schema
// Run: node scripts/setup-database.js
// ============================================

require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
};

async function setupDatabase() {
    let connection;
    
    try {
        console.log('🔌 Connecting to MySQL...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to MySQL successfully!\n');

        const dbName = process.env.DB_NAME || 'food_delivery_db';
        
        // Create database if it doesn't exist
        console.log(`📦 Creating database: ${dbName}...`);
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci`);
        console.log(`✅ Database '${dbName}' created/verified!\n`);

        // Use the database
        await connection.query(`USE \`${dbName}\``);

        // Read and execute schema.sql
        console.log('📄 Reading schema.sql...');
        const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
        
        if (!fs.existsSync(schemaPath)) {
            throw new Error(`Schema file not found: ${schemaPath}`);
        }

        const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
        
        console.log('⚙️  Executing schema...');
        await connection.query(schemaSQL);
        console.log('✅ Schema imported successfully!\n');

        // Check if should import sample data
        const importSample = process.env.IMPORT_SAMPLE_DATA === 'true';
        
        if (importSample) {
            const sampleDataPath = path.join(__dirname, '..', 'database', 'sample_data.sql');
            
            if (fs.existsSync(sampleDataPath)) {
                console.log('📄 Reading sample_data.sql...');
                const sampleSQL = fs.readFileSync(sampleDataPath, 'utf8');
                
                console.log('⚙️  Executing sample data...');
                await connection.query(sampleSQL);
                console.log('✅ Sample data imported successfully!\n');
                console.log('⚠️  Note: Sample data uses placeholder password hashes.');
                console.log('   Generate hashes with: node scripts/hashPassword.js password123');
                console.log('   Or register new users through the web interface.\n');
            } else {
                console.log('⚠️  Sample data file not found, skipping...\n');
            }
        } else {
            console.log('⏭️  Skipping sample data import.');
            console.log('   To import sample data, set IMPORT_SAMPLE_DATA=true in .env\n');
        }

        console.log('🎉 Database setup completed successfully!');
        console.log(`\n📊 Database: ${dbName}`);
        console.log('🚀 You can now start the server with: npm start\n');

    } catch (error) {
        console.error('❌ Error setting up database:', error.message);
        console.error('\nTroubleshooting:');
        console.error('1. Make sure MySQL is running in XAMPP');
        console.error('2. Check your .env file has correct database credentials');
        console.error('3. Verify MySQL username and password');
        console.error('4. Ensure you have permission to create databases');
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Run setup
setupDatabase();
