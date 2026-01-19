# How to View Database Data

## Method 1: Using MySQL Command Line (Easiest)

### Step 1: Open Command Prompt/PowerShell
Navigate to XAMPP MySQL bin directory:
```bash
cd C:\xampp\mysql\bin
```

### Step 2: Connect to MySQL
```bash
mysql -u root -p
```
- Press Enter (if no password) or enter your MySQL password

### Step 3: Use the Database
```sql
USE food_delivery_db;
```

### Step 4: View Tables
```sql
SHOW TABLES;
```

### Step 5: View Data from Tables

**View all users:**
```sql
SELECT * FROM users;
```

**View all orders:**
```sql
SELECT * FROM orders;
```

**View all restaurants:**
```sql
SELECT * FROM restaurants;
```

**View all riders:**
```sql
SELECT * FROM riders;
```

**View order details with customer and restaurant names:**
```sql
SELECT o.*, u.full_name as customer_name, r.restaurant_name 
FROM orders o 
JOIN users u ON o.customer_id = u.user_id 
JOIN restaurants r ON o.restaurant_id = r.restaurant_id;
```

**View order items:**
```sql
SELECT oi.*, mi.item_name, o.order_status 
FROM order_items oi 
JOIN menu_items mi ON oi.item_id = mi.item_id 
JOIN orders o ON oi.order_id = o.order_id;
```

### Step 6: Exit MySQL
```sql
exit;
```

---

## Method 2: Using phpMyAdmin (If Available)

1. **Open Browser:** http://localhost/phpmyadmin
2. **Select Database:** Click on `food_delivery_db` in left sidebar
3. **View Tables:** Click on any table name (users, orders, restaurants, etc.)
4. **Browse Data:** Click "Browse" tab to see all records

---

## Method 3: Using MySQL Workbench

1. **Open MySQL Workbench**
2. **Connect:** Click on your local connection
3. **Select Database:** Double-click `food_delivery_db` in left sidebar
4. **Run Query:** Type SQL queries in the query window and click Execute

---

## Method 4: Create a Node.js Script to View Data

I'll create a script for you to view data easily.

---

## Quick SQL Queries Reference

**Count records:**
```sql
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM orders;
```

**View recent orders:**
```sql
SELECT * FROM orders ORDER BY created_at DESC LIMIT 10;
```

**View orders by status:**
```sql
SELECT * FROM orders WHERE order_status = 'pending';
SELECT * FROM orders WHERE order_status = 'delivered';
```

**View user with their role:**
```sql
SELECT user_id, username, email, role, full_name FROM users;
```

**View restaurant menu items:**
```sql
SELECT mi.*, r.restaurant_name 
FROM menu_items mi 
JOIN restaurants r ON mi.restaurant_id = r.restaurant_id;
```

**View complete order with items:**
```sql
SELECT o.order_id, o.order_status, o.total_amount, 
       u.full_name as customer, r.restaurant_name,
       GROUP_CONCAT(mi.item_name SEPARATOR ', ') as items
FROM orders o
JOIN users u ON o.customer_id = u.user_id
JOIN restaurants r ON o.restaurant_id = r.restaurant_id
JOIN order_items oi ON o.order_id = oi.order_id
JOIN menu_items mi ON oi.item_id = mi.item_id
GROUP BY o.order_id;
```

---

## Common Tables in Your Database

1. **users** - All user accounts (customers, restaurants, riders, admin)
2. **restaurants** - Restaurant details
3. **riders** - Rider details
4. **menu_items** - Menu items for each restaurant
5. **orders** - All orders
6. **order_items** - Items in each order
7. **payments** - Payment records
8. **ratings** - Customer ratings

---

## Tips

- Use `LIMIT 10` to see only first 10 records
- Use `ORDER BY created_at DESC` to see newest first
- Use `WHERE` clause to filter data
- Use `JOIN` to combine data from multiple tables
