# Setup Guide - Without phpMyAdmin

## Option 1: Use MySQL Command Line (Recommended)

### Step 1: Start XAMPP MySQL
- Open XAMPP Control Panel
- Start **MySQL** service

### Step 2: Open MySQL Command Line
- Open **Command Prompt** or **PowerShell**
- Navigate to XAMPP MySQL bin directory:
```bash
cd C:\xampp\mysql\bin
```

### Step 3: Connect to MySQL
```bash
mysql -u root -p
```
- Press Enter (if no password) or enter your MySQL root password

### Step 4: Create Database
```sql
CREATE DATABASE food_delivery_db CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE food_delivery_db;
```

### Step 5: Import Schema
Exit MySQL (type `exit`), then run:
```bash
mysql -u root -p food_delivery_db < "D:\Sem 5\SDA\database\schema.sql"
```

Or if you're already in MySQL:
```sql
SOURCE D:/Sem 5/SDA/database/schema.sql;
```

### Step 6: Import Sample Data (Optional)
```bash
mysql -u root -p food_delivery_db < "D:\Sem 5\SDA\database\sample_data.sql"
```

---

## Option 2: Use MySQL Workbench

1. **Download MySQL Workbench** (if not installed)
2. **Connect to MySQL:**
   - Host: `localhost`
   - Port: `3306`
   - Username: `root`
   - Password: (leave empty or your MySQL password)

3. **Create Database:**
   - Right-click → Create Schema
   - Name: `food_delivery_db`
   - Collation: `utf8mb4_general_ci`
   - Click Apply

4. **Import Schema:**
   - Select `food_delivery_db` schema
   - File → Run SQL Script
   - Select `database/schema.sql`
   - Click Run

5. **Import Sample Data (Optional):**
   - File → Run SQL Script
   - Select `database/sample_data.sql`
   - Click Run

---

## Option 3: Use Node.js Setup Script (Easiest!)

I've created an automated setup script for you:

### Step 1: Create .env file
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

### Step 2: Install dependencies
```bash
npm install
```

### Step 3: Run setup script
```bash
node scripts/setup-database.js
```

This will automatically:
- ✅ Connect to MySQL
- ✅ Create database `food_delivery_db`
- ✅ Import schema
- ✅ Optionally import sample data

**Note:** To import sample data automatically, add this to `.env`:
```env
IMPORT_SAMPLE_DATA=true
```

---

## After Database Setup

### 1. Verify Database
Check if tables were created:
```bash
mysql -u root -p -e "USE food_delivery_db; SHOW TABLES;"
```

You should see:
- users
- restaurants
- riders
- menu_items
- orders
- order_items
- payments
- ratings

### 2. Start the Application
```bash
npm start
```

### 3. Access Application
Open browser: **http://localhost:3000**

---

## Troubleshooting

### MySQL Command Not Found
- Use full path: `C:\xampp\mysql\bin\mysql.exe -u root`
- Or add MySQL to system PATH

### Access Denied Error
- Check MySQL username/password in `.env`
- Default XAMPP: username `root`, password empty

### Database Already Exists
- Drop and recreate: `DROP DATABASE food_delivery_db;`
- Or use existing database by updating `.env`

### Import Errors
- Check file paths are correct
- Ensure MySQL is running
- Verify file encoding is UTF-8

---

## Quick Verification

After setup, verify everything works:

1. ✅ MySQL is running (green in XAMPP)
2. ✅ Database `food_delivery_db` exists
3. ✅ Tables are created (8 tables)
4. ✅ `.env` file exists with correct settings
5. ✅ `npm start` runs without errors
6. ✅ Can access http://localhost:3000

---

**Need Help?** Check `README.md` for detailed documentation.
