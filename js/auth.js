/**
 * Authentication Manager for the Pokemon Card Resume
 * Handles login, logout, and authentication state
 */
const AuthManager = (function() {
    // Check if ApiClient is available
    if (typeof window.ApiClient === 'undefined') {
        console.error('ApiClient not found. Authentication functionality will be limited.');
    }
    
    // Get the authentication token from localStorage
    function getAuthToken() {
        return localStorage.getItem('authToken');
    }
    
    // Set the authentication token to localStorage
    function setAuthToken(token) {
        if (token) {
            localStorage.setItem('authToken', token);
            console.log('Auth token set');
            document.body.classList.add('authenticated');
        } else {
            localStorage.removeItem('authToken');
            console.log('Auth token removed');
            document.body.classList.remove('authenticated');
        }
    }
    
    // Check if user is authenticated
    function isAuthenticated() {
        const token = getAuthToken();
        return !!token;
    }
    
    // Login with password
    async function login(password) {
        console.log('AuthManager: Attempting login');
        
        if (!password) {
            return { success: false, error: 'Password is required' };
        }
        
        try {
            // Use ApiClient if available
            if (window.ApiClient && window.ApiClient.auth) {
                const result = await window.ApiClient.auth.login(password);
                
                if (result.success) {
                    document.body.classList.add('authenticated');
                    console.log('AuthManager: Login successful');
                } else {
                    console.log('AuthManager: Login failed:', result.error);
                }
                
                return result;
            } else {
                // Fallback for local development
                const isLocalhost = window.location.hostname === 'localhost' || 
                                  window.location.hostname === '127.0.0.1';
                
                if (isLocalhost && (password === 'Rosie@007' || password === 'localdev')) {
                    const token = 'dev-token-' + Date.now();
                    setAuthToken(token);
                    document.body.classList.add('authenticated');
                    console.log('AuthManager: Login successful with fallback');
                    return { success: true, token };
                }
                
                return { success: false, error: 'Invalid password' };
            }
        } catch (error) {
            console.error('AuthManager: Login error:', error);
            return { success: false, error: error.message || 'Authentication failed' };
        }
    }
    
    // Logout - clear the token
    function logout() {
        setAuthToken(null);
        document.body.classList.remove('authenticated');
        console.log('AuthManager: Logged out');
        return { success: true };
    }
    
    // Initialize authentication state
    function init() {
        if (isAuthenticated()) {
            document.body.classList.add('authenticated');
            console.log('AuthManager: User is authenticated');
        } else {
            document.body.classList.remove('authenticated');
            console.log('AuthManager: User is not authenticated');
        }
    }
    
    // Initialize on load
    document.addEventListener('DOMContentLoaded', init);
    
    // Public API
    return {
        login,
        logout,
        isAuthenticated,
        getAuthToken
    };
})();

// Make AuthManager available globally
window.AuthManager = AuthManager; 