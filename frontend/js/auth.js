export const AuthManager = {
    async initialize() {
        if (typeof ApiClient === 'undefined') {
            throw new Error('ApiClient not loaded');
        }
        window.ApiClient = ApiClient;
    },

    async login(password) {
        const hashedPassword = CryptoJS.SHA256(password).toString();
        const response = await window.ApiClient.auth.login(hashedPassword);
        if (response.success) {
            console.log('Login successful, storing token:', response.token);
            localStorage.setItem('auth_token', response.token);
        } else {
            console.log('Login failed, no token to store.');
        }
        return response.success;
    },

    logout() {
        console.log('Logging out, removing token from local storage.');
        window.ApiClient.auth.logout();
        localStorage.removeItem('auth_token');
    },

    isAuthenticated() {
        const token = localStorage.getItem('auth_token');
        console.log('Checking authentication, token found:', token);
        return token !== null;
    }
}; 