# Quick Setup Guide - XAMPP & Localhost

## 🚀 Quick Start (5 Minutes)

### 1. Start XAMPP MySQL
- Open **XAMPP Control Panel**
- Click **Start** next to **MySQL**
- Wait for green indicator

### 2. Create Database
- Open browser: http://localhost/phpmyadmin
- Click **"New"** (left sidebar)
- Database name: `food_delivery_db`
- Click **"Create"**

### 3. Import Database Files
- Select `food_delivery_db` database
- Click **"Import"** tab
- Click **"Choose File"**
- Select: `database/schema.sql`
- Click **"Go"** ✅
- Repeat for `database/sample_data.sql` (optional)

### 4. Configure Environment
Create `.env` file in project root:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=food_delivery_db
PORT=3000
NODE_ENV=development
SESSION_SECRET=my-secret-key-12345
```

**Important:** 
- Leave `DB_PASSWORD` empty if MySQL root has no password (XAMPP default)
- If you set a MySQL password, enter it here

### 5. Install & Run
```bash
# Install dependencies
npm install

# Start server
npm start
```

### 6. Access Application
Open browser: **http://localhost:3000**

## 🔐 Default Login (After Setup)

If you imported sample data, you need to generate password hashes first:

```bash
node scripts/hashPassword.js password123
```

Then update `database/sample_data.sql` with the generated hash and re-import.

**OR** simply register new users through the web interface!

## ✅ Verification Checklist

- [ ] XAMPP MySQL is running (green in XAMPP)
- [ ] Database `food_delivery_db` exists
- [ ] Tables created (users, restaurants, orders, etc.)
- [ ] `.env` file created with correct settings
- [ ] `npm install` completed successfully
- [ ] Server starts without errors
- [ ] Can access http://localhost:3000

## 🐛 Common Issues

### MySQL Won't Start
- Check if port 3306 is already in use
- Restart XAMPP
- Check XAMPP error logs

### Database Connection Failed
- Verify MySQL is running
- Check `.env` file exists and has correct values
- Verify database name: `food_delivery_db`
- Check MySQL username/password

### Port 3000 Already in Use
- Change PORT in `.env` to 3001 or another port
- Or stop the application using port 3000

### Module Not Found
```bash
npm install
```

## 📝 Next Steps

1. Register a new user or use sample data
2. Explore different user roles
3. Test order flow: Browse → Cart → Checkout → Order
4. Test restaurant order management
5. Test rider order pickup and delivery

Happy coding! 🎉
