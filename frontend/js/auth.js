import CryptoJS from 'crypto-js';

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
        return response.success;
    },

    logout() {
        window.ApiClient.auth.logout();
    },

    isAuthenticated() {
        return window.ApiClient.auth.isAuthenticated();
    }
}; 