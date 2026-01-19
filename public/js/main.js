// ============================================
// Main JavaScript Utilities
// Food Delivery System
// ============================================

/**
 * Toast Notification System
 */
const Toast = {
    container: null,

    init() {
        // Create toast container if it doesn't exist
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        }
    },

    show(message, type = 'info', duration = 3000) {
        this.init();

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icon = this.getIcon(type);
        toast.innerHTML = `
            <span style="font-size: 1.2rem;">${icon}</span>
            <span style="flex: 1;">${message}</span>
            <button class="toast-close" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: var(--medium-gray);">&times;</button>
        `;

        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => this.remove(toast));

        this.container.appendChild(toast);

        // Auto remove after duration
        setTimeout(() => {
            this.remove(toast);
        }, duration);

        return toast;
    },

    success(message, duration) {
        return this.show(message, 'success', duration);
    },

    error(message, duration) {
        return this.show(message, 'error', duration);
    },

    warning(message, duration) {
        return this.show(message, 'warning', duration);
    },

    info(message, duration) {
        return this.show(message, 'info', duration);
    },

    remove(toast) {
        if (toast && toast.parentNode) {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }
    },

    getIcon(type) {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || icons.info;
    }
};

/**
 * Form Validation Helper
 */
const FormValidator = {
    validate(form) {
        const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        return isValid;
    },

    validateField(field) {
        const value = field.value.trim();
        const type = field.type;
        let isValid = true;
        let errorMessage = '';

        // Remove previous error
        this.removeError(field);

        // Required validation
        if (field.hasAttribute('required') && !value) {
            errorMessage = 'This field is required';
            isValid = false;
        }

        // Email validation
        if (type === 'email' && value && !this.isValidEmail(value)) {
            errorMessage = 'Please enter a valid email address';
            isValid = false;
        }

        // Number validation
        if (type === 'number' && value) {
            const num = parseFloat(value);
            if (isNaN(num)) {
                errorMessage = 'Please enter a valid number';
                isValid = false;
            }
            if (field.hasAttribute('min') && num < parseFloat(field.getAttribute('min'))) {
                errorMessage = `Minimum value is ${field.getAttribute('min')}`;
                isValid = false;
            }
        }

        // Show error if invalid
        if (!isValid) {
            this.showError(field, errorMessage);
        }

        return isValid;
    },

    showError(field, message) {
        field.classList.add('is-invalid');
        const error = document.createElement('span');
        error.className = 'form-error';
        error.textContent = message;
        field.parentNode.appendChild(error);
    },

    removeError(field) {
        field.classList.remove('is-invalid');
        const error = field.parentNode.querySelector('.form-error');
        if (error) {
            error.remove();
        }
    },

    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
};

/**
 * Loading State Helper
 */
const Loading = {
    setLoading(button, isLoading) {
        if (isLoading) {
            button.classList.add('loading');
            button.disabled = true;
        } else {
            button.classList.remove('loading');
            button.disabled = false;
        }
    }
};

/**
 * API Request Helper
 */
const API = {
    async request(url, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            }
        };

        const config = { ...defaultOptions, ...options };
        
        if (config.body && typeof config.body === 'object') {
            config.body = JSON.stringify(config.body);
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    async get(url) {
        return this.request(url, { method: 'GET' });
    },

    async post(url, data) {
        return this.request(url, { method: 'POST', body: data });
    },

    async put(url, data) {
        return this.request(url, { method: 'PUT', body: data });
    },

    async delete(url) {
        return this.request(url, { method: 'DELETE' });
    }
};

/**
 * Confirmation Dialog Helper
 */
const Confirm = {
    async show(message) {
        return new Promise((resolve) => {
            const confirmed = window.confirm(message);
            resolve(confirmed);
        });
    }
};

/**
 * Format Currency
 */
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
};

/**
 * Format Date
 */
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
};

/**
 * Initialize on DOM Load
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize toast system
    Toast.init();

    // Add form validation to all forms
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            if (!FormValidator.validate(form)) {
                e.preventDefault();
                Toast.error('Please fix the errors in the form');
            }
        });

        // Real-time validation
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                FormValidator.validateField(input);
            });
        });
    });

    // Show session messages if any
    const successMessage = document.querySelector('[data-success]');
    const errorMessage = document.querySelector('[data-error]');
    
    if (successMessage) {
        Toast.success(successMessage.textContent);
    }
    if (errorMessage) {
        Toast.error(errorMessage.textContent);
    }
});

// Export for use in other scripts
window.Toast = Toast;
window.FormValidator = FormValidator;
window.Loading = Loading;
window.API = API;
window.Confirm = Confirm;
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
