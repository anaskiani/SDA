// ============================================
// Error Handling Middleware
// Centralized error handling
// ============================================

/**
 * Async handler wrapper to catch errors in async routes
 * Usage: wrapAsync(async (req, res) => { ... })
 */
const wrapAsync = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/**
 * Custom error class for application errors
 */
class AppError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Validation error handler
 */
const handleValidationError = (errors) => {
    const messages = errors.array().map(err => err.msg);
    return new AppError(400, messages.join(', '));
};

/**
 * Database error handler
 */
const handleDatabaseError = (err) => {
    if (err.code === 'ER_DUP_ENTRY') {
        return new AppError(400, 'Duplicate entry. This record already exists.');
    }
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        return new AppError(400, 'Referenced record does not exist.');
    }
    return new AppError(500, 'Database error occurred.');
};

module.exports = {
    wrapAsync,
    AppError,
    handleValidationError,
    handleDatabaseError
};
