// ============================================
// Password Hash Generator
// Run this script to generate bcrypt hash for passwords
// Usage: node scripts/hashPassword.js <password>
// ============================================

const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password) {
    console.log('Usage: node scripts/hashPassword.js <password>');
    process.exit(1);
}

bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
        console.error('Error hashing password:', err);
        process.exit(1);
    }
    console.log('Password:', password);
    console.log('Hash:', hash);
});
