# Online Food Ordering and Delivery System

A complete full-stack food delivery system built with Node.js, Express, MySQL, and vanilla JavaScript.

## Features

- **4 User Roles**: Customer, Restaurant, Rider, Admin
- **Complete Order Management**: Order lifecycle from placement to delivery
- **Role-based Authentication**: Secure login and authorization
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Professional UI**: Modern and consistent design

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **XAMPP** (for MySQL database) - [Download](https://www.apachefriends.org/)
- **Git** (optional) - [Download](https://git-scm.com/)

## Installation & Setup

### Step 1: Install Dependencies

Open terminal/command prompt in the project directory and run:

```bash
npm install
```

This will install all required packages:
- express
- mysql2
- bcryptjs
- express-session
- express-validator
- dotenv
- body-parser
- ejs

### Step 2: Setup XAMPP MySQL Database

1. **Start XAMPP**
   - Open XAMPP Control Panel
   - Start **Apache** (optional, not required for this project)
   - Start **MySQL** (required)

2. **Create Database**
   - Open phpMyAdmin: http://localhost/phpmyadmin
   - Click on "New" in the left sidebar
   - Database name: `food_delivery_db`
   - Collation: `utf8mb4_general_ci`
   - Click "Create"

3. **Import Schema**
   - Select the `food_delivery_db` database
   - Click on "Import" tab
   - Click "Choose File" and select `database/schema.sql`
   - Click "Go" to import the schema

4. **Import Sample Data** (Optional)
   - Still in `food_delivery_db` database
   - Click "Import" tab again
   - Click "Choose File" and select `database/sample_data.sql`
   - Click "Go" to import sample data

### Step 3: Configure Environment Variables

1. **Create `.env` file** in the root directory (copy from `.env.example`):

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=food_delivery_db

# Server Configuration
PORT=3000
NODE_ENV=development

# Session Secret (Change this in production!)
SESSION_SECRET=your-super-secret-key-change-this-in-production
```

**Important Notes:**
- `DB_PASSWORD`: Leave empty if MySQL root has no password (default XAMPP)
- If you set a MySQL root password, enter it here
- `SESSION_SECRET`: Change to a random string for security

### Step 4: Generate Password Hashes (For Sample Data)

If you imported sample data, you need to generate proper password hashes:

```bash
npm install
node scripts/hashPassword.js password123
```

Copy the generated hash and replace all password hashes in `database/sample_data.sql` with the new hash, then re-import the file.

**OR** simply register new users through the web interface - passwords will be hashed automatically.

### Step 5: Run the Application

Start the server:

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

The application will start on: **http://localhost:3000**

## Default Login Credentials

If you imported sample data, you can use these credentials (after generating password hashes):

**Admin:**
- Email: `admin@fooddelivery.com`
- Password: `password123`

**Customer:**
- Email: `john@example.com`
- Password: `password123`

**Restaurant:**
- Email: `pizza@restaurant.com`
- Password: `password123`

**Rider:**
- Email: `rider1@delivery.com`
- Password: `password123`

**Note:** Remember to generate password hashes first, or register new users through the interface.

## Project Structure

```
SDA/
├── app.js                 # Main application entry point
├── db.js                  # Database connection
├── package.json           # Dependencies
├── .env                   # Environment variables (create this)
├── .env.example           # Environment variables template
├── database/
│   ├── schema.sql         # Database schema
│   └── sample_data.sql    # Sample data
├── controllers/          # Business logic
│   ├── authController.js
│   ├── customerController.js
│   ├── restaurantController.js
│   ├── riderController.js
│   └── adminController.js
├── models/               # Database models
│   ├── user.js
│   ├── restaurant.js
│   ├── menuItem.js
│   ├── order.js
│   ├── rating.js
│   └── rider.js
├── routes/               # Route definitions
│   ├── auth.js
│   ├── customer.js
│   ├── restaurant.js
│   ├── rider.js
│   └── admin.js
├── middleware/           # Custom middleware
│   ├── auth.js
│   ├── validation.js
│   └── errorHandler.js
├── views/                # EJS templates
│   ├── auth/
│   ├── customer/
│   ├── restaurant/
│   ├── rider/
│   ├── admin/
│   ├── index.ejs
│   └── error.ejs
├── public/               # Static files
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── main.js
└── scripts/              # Utility scripts
    └── hashPassword.js
```

## Troubleshooting

### Database Connection Error

**Error:** `Database connection error`

**Solutions:**
1. Make sure MySQL is running in XAMPP
2. Check database credentials in `.env` file
3. Verify database name exists: `food_delivery_db`
4. Check if MySQL port is 3306 (default)

### Port Already in Use

**Error:** `Port 3000 is already in use`

**Solutions:**
1. Change PORT in `.env` file to another port (e.g., 3001)
2. Or stop the application using port 3000

### Module Not Found

**Error:** `Cannot find module 'xxx'`

**Solution:**
```bash
npm install
```

### Password Hash Error

**Error:** Login fails even with correct password

**Solution:**
1. Generate new password hash: `node scripts/hashPassword.js password123`
2. Update `database/sample_data.sql` with new hash
3. Re-import sample data in phpMyAdmin

## Development

### Running in Development Mode

```bash
npm run dev
```

This uses `nodemon` to automatically restart the server on file changes.

### Database Management

- **View Database:** http://localhost/phpmyadmin
- **Database Name:** `food_delivery_db`
- **Default MySQL User:** `root`
- **Default MySQL Password:** (empty)

## Production Deployment

Before deploying to production:

1. Change `SESSION_SECRET` to a strong random string
2. Set `NODE_ENV=production` in `.env`
3. Use a strong MySQL password
4. Enable HTTPS
5. Set `secure: true` in session cookie settings (app.js)

## Support

For issues or questions, check:
- Database connection settings in `.env`
- XAMPP MySQL service status
- Node.js version compatibility
- All dependencies installed correctly

## License

This project is for educational purposes.
