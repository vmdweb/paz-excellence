/**
 * Authentication Module
 * Simple client-side authentication for dashboard access
 * Credentials: userdiogo / diogopaz
 */

const AUTH_CREDENTIALS = {
    username: 'userdiogo',
    password: 'diogopaz'
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
function isAuthenticated() {
    try {
        const auth = localStorage.getItem('dashboardAuth');
        return auth === 'true';
    } catch (error) {
        console.error('Error checking authentication:', error);
        return false;
    }
}

/**
 * Authenticate user with credentials
 * @param {string} username
 * @param {string} password
 * @returns {boolean}
 */
function authenticate(username, password) {
    if (username === AUTH_CREDENTIALS.username && password === AUTH_CREDENTIALS.password) {
        try {
            localStorage.setItem('dashboardAuth', 'true');
            return true;
        } catch (error) {
            console.error('Error saving authentication:', error);
            return false;
        }
    }
    return false;
}

/**
 * Logout user
 */
function logout() {
    try {
        localStorage.removeItem('dashboardAuth');
    } catch (error) {
        console.error('Error during logout:', error);
    }
}

/**
 * Require authentication - redirects to login if not authenticated
 */
function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = 'dashboard.html';
        return false;
    }
    return true;
}
