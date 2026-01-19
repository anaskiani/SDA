// ============================================
// Update Sample Data with Proper Password Hashes
// This script generates bcrypt hashes and updates sample_data.sql
// Run: node scripts/update-sample-passwords.js
// ============================================

const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

async function updateSampleData() {
    const defaultPassword = 'password123';
    
    console.log('🔐 Generating password hash...');
    const hash = await bcrypt.hash(defaultPassword, 10);
    console.log('✅ Hash generated:', hash);
    console.log('\n📝 Default password for all accounts: password123\n');

    // Read sample_data.sql
    const sampleDataPath = path.join(__dirname, '..', 'database', 'sample_data.sql');
    let content = fs.readFileSync(sampleDataPath, 'utf8');

    // Replace all placeholder hashes with the real hash
    const placeholderHash = '$2b$10$rOzJqZqZqZqZqZqZqZqZqOqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZq';
    content = content.split(placeholderHash).join(hash);

    // Write back to file
    fs.writeFileSync(sampleDataPath, content, 'utf8');

    console.log('✅ Updated sample_data.sql with proper password hashes!');
    console.log('\n📋 All sample accounts use password: password123');
    console.log('\n👥 Sample Accounts:');
    console.log('\n🔴 Admin:');
    console.log('   Email: admin@fooddelivery.com');
    console.log('   Username: admin');
    console.log('   Password: password123');
    console.log('\n🟢 Customers:');
    console.log('   1. Email: john@example.com | Username: john_doe');
    console.log('   2. Email: jane@example.com | Username: jane_smith');
    console.log('   3. Email: bob@example.com | Username: bob_wilson');
    console.log('\n🟡 Restaurants:');
    console.log('   1. Email: pizza@restaurant.com | Username: pizza_place');
    console.log('   2. Email: burger@restaurant.com | Username: burger_joint');
    console.log('   3. Email: sushi@restaurant.com | Username: sushi_bar');
    console.log('\n🔵 Riders:');
    console.log('   1. Email: rider1@delivery.com | Username: rider1');
    console.log('   2. Email: rider2@delivery.com | Username: rider2');
    console.log('\n💡 Next Steps:');
    console.log('   1. Import the updated sample_data.sql into your database');
    console.log('   2. Or re-run: node scripts/setup-database.js (with IMPORT_SAMPLE_DATA=true)\n');
}

updateSampleData().catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
