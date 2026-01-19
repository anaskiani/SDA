// ============================================
// Authentication Controller
// Handles registration, login, and logout
// ============================================

const User = require('../models/user');
const { wrapAsync, AppError } = require('../middleware/errorHandler');
const { validationResult } = require('express-validator');

/**
 * Render login page
 */
const showLogin = (req, res) => {
    // Redirect if already logged in
    if (req.session.user) {
        const role = req.session.user.role;
        return res.redirect(`/${role}/dashboard`);
    }
    res.render('auth/login', {
        title: 'Login',
        error: null,
        success: null,
        formData: null
    });
};

/**
 * Handle login
 */
const login = wrapAsync(async (req, res) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.render('auth/login', {
            title: 'Login',
            error: errors.array()[0].msg,
            success: null,
            formData: req.body
        });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findByEmail(email);
    
    if (!user) {
        return res.render('auth/login', {
            title: 'Login',
            error: 'Invalid email or password',
            success: null,
            formData: req.body
        });
    }

    // Verify password
    const isPasswordValid = await User.verifyPassword(password, user.password);
    
    if (!isPasswordValid) {
        return res.render('auth/login', {
            title: 'Login',
            error: 'Invalid email or password',
            success: null,
            formData: req.body
        });
    }

    // Create session
    req.session.user = User.sanitize(user);

    // Redirect based on role
    const returnTo = req.session.returnTo || `/${user.role}/dashboard`;
    delete req.session.returnTo;
    
    res.redirect(returnTo);
});

/**
 * Render registration page
 */
const showRegister = (req, res) => {
    // Redirect if already logged in
    if (req.session.user) {
        const role = req.session.user.role;
        return res.redirect(`/${role}/dashboard`);
    }
    res.render('auth/register', {
        title: 'Register',
        error: null,
        success: null,
        roles: ['customer', 'restaurant', 'rider'],
        formData: null
    });
};

/**
 * Handle registration
 */
const register = wrapAsync(async (req, res) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.render('auth/register', {
            title: 'Register',
            error: errors.array()[0].msg,
            success: null,
            formData: req.body,
            roles: ['customer', 'restaurant', 'rider']
        });
    }

    const { username, email, password, role, full_name, phone, address } = req.body;

    // Check if email already exists
    if (await User.emailExists(email)) {
        return res.render('auth/register', {
            title: 'Register',
            error: 'Email already registered',
            success: null,
            formData: req.body,
            roles: ['customer', 'restaurant', 'rider']
        });
    }

    // Check if username already exists
    if (await User.usernameExists(username)) {
        return res.render('auth/register', {
            title: 'Register',
            error: 'Username already taken',
            success: null,
            formData: req.body,
            roles: ['customer', 'restaurant', 'rider']
        });
    }

    try {
        // Create user
        const user = await User.create({
            username,
            email,
            password,
            role,
            full_name,
            phone,
            address
        });

        // Auto-login after registration
        req.session.user = user;

        // Redirect based on role
        res.redirect(`/${role}/dashboard`);
    } catch (error) {
        console.error('Registration error:', error);
        return res.render('auth/register', {
            title: 'Register',
            error: 'Registration failed. Please try again.',
            success: null,
            formData: req.body,
            roles: ['customer', 'restaurant', 'rider']
        });
    }
});

/**
 * Handle logout
 */
const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.redirect('/');
        }
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
};

module.exports = {
    showLogin,
    login,
    showRegister,
    register,
    logout
};
