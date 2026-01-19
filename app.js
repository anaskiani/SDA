// ============================================
// Main Application Entry Point
// Express server setup with middleware
// ============================================

require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const customerRoutes = require('./routes/customer');
const restaurantRoutes = require('./routes/restaurant');
const riderRoutes = require('./routes/rider');
const adminRoutes = require('./routes/admin');

// Import middleware
const { isAuthenticated, requireRole } = require('./middleware/auth');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// Middleware Configuration
// ============================================

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Static files middleware
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Make user data available to all views
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.isAuthenticated = !!req.session.user;
    
    // Flash messages
    res.locals.success = req.session.success || null;
    res.locals.error = req.session.error || null;
    
    // Clear flash messages after use
    delete req.session.success;
    delete req.session.error;
    
    next();
});

// ============================================
// View Engine Configuration
// ============================================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ============================================
// Routes
// ============================================

// Home/Index route
app.get('/', (req, res) => {
    if (req.session.user) {
        // Redirect based on user role
        const role = req.session.user.role;
        switch(role) {
            case 'customer':
                return res.redirect('/customer/dashboard');
            case 'restaurant':
                return res.redirect('/restaurant/dashboard');
            case 'rider':
                return res.redirect('/rider/dashboard');
            case 'admin':
                return res.redirect('/admin/dashboard');
            default:
                return res.redirect('/auth/login');
        }
    }
    res.render('index', { title: 'Food Delivery System' });
});

// Authentication routes (public)
app.use('/auth', authRoutes);

// Protected routes with role-based access
app.use('/customer', isAuthenticated, requireRole('customer'), customerRoutes);
app.use('/restaurant', isAuthenticated, requireRole('restaurant'), restaurantRoutes);
app.use('/rider', isAuthenticated, requireRole('rider'), riderRoutes);
app.use('/admin', isAuthenticated, requireRole('admin'), adminRoutes);

// ============================================
// Error Handling Middleware
// ============================================

// 404 handler
app.use((req, res) => {
    res.status(404).render('error', {
        title: 'Page Not Found',
        error: {
            status: 404,
            message: 'The page you are looking for does not exist.'
        },
        user: req.session.user || null
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).render('error', {
        title: 'Error',
        error: {
            status: err.status || 500,
            message: err.message || 'Internal Server Error'
        },
        user: req.session.user || null
    });
});

// ============================================
// Start Server
// ============================================
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
