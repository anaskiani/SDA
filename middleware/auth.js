// ============================================
// Authentication Middleware
// Handles user authentication and authorization
// ============================================

/**
 * Middleware to check if user is authenticated
 * Redirects to login if not authenticated
 */
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    }
    
    // Store the original URL for redirect after login
    req.session.returnTo = req.originalUrl;
    res.redirect('/auth/login');
};

/**
 * Middleware to require specific role(s)
 * Usage: requireRole('admin') or requireRole(['admin', 'restaurant'])
 */
const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.session || !req.session.user) {
            return res.redirect('/auth/login');
        }

        const userRole = req.session.user.role;
        const roles = allowedRoles.flat(); // Flatten array if nested

        if (roles.includes(userRole)) {
            return next();
        }

        // User doesn't have required role
        res.status(403).render('error', {
            title: 'Access Denied',
            error: {
                status: 403,
                message: 'You do not have permission to access this page.'
            },
            user: req.session.user
        });
    };
};

/**
 * Middleware to check if user owns a resource
 * Used for operations like customers viewing their own orders
 */
const isOwner = (req, res, next) => {
    // This will be implemented in specific routes as needed
    next();
};

module.exports = {
    isAuthenticated,
    requireRole,
    isOwner
};
