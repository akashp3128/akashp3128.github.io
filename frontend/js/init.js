// Initialize the Pokemon Card Website
console.log('Initializing Pokemon Card Website...');

// Globals for the application
window.ApiClient = window.ApiClient || {};  // Will be populated in api.js

// Create promise to track ApiClient initialization
window.apiClientReady = new Promise((resolve) => {
    window.resolveApiClient = resolve;
});

// Initialize settings and variables
document.addEventListener('DOMContentLoaded', function() {
    // Set API base URL 
    window.API_BASE_URL = determineApiBaseUrl();
    
    // Initialize card
    initializeCard();
    
    // Check for ApiClient initialization
    checkApiClientInitialization();
});

// Check if ApiClient is initialized, with retry logic
function checkApiClientInitialization() {
    const maxAttempts = 10;
    let attempts = 0;
    const intervalTime = 200; // 200ms
    
    const checkInterval = setInterval(() => {
        attempts++;
        
        // Check if ApiClient is available and has required properties
        if (window.ApiClient && window.ApiClient.auth && typeof window.ApiClient.auth.isAuthenticated === 'function') {
            console.log('ApiClient successfully initialized');
            clearInterval(checkInterval);
            
            // Resolve the promise to signal ApiClient is ready
            if (window.resolveApiClient) {
                window.resolveApiClient(window.ApiClient);
            }
            
            // Trigger an event for components that need to know when ApiClient is ready
            document.dispatchEvent(new CustomEvent('apiClientReady', { detail: window.ApiClient }));
            return;
        }
        
        if (attempts >= maxAttempts) {
            console.error('Failed to initialize ApiClient after multiple attempts');
            clearInterval(checkInterval);
            
            // Create a fallback version for emergency mode
            if (!window.ApiClient || !window.ApiClient.auth) {
                console.warn('Creating emergency fallback for ApiClient');
                createFallbackApiClient();
            }
        }
    }, intervalTime);
}

// Create emergency fallback ApiClient
function createFallbackApiClient() {
    // Enable emergency mode
    localStorage.setItem('emergency_mode', 'true');
    
    // Create a basic fallback ApiClient
    window.ApiClient = window.ApiClient || {};
    window.ApiClient.auth = window.ApiClient.auth || {
        isAuthenticated: function() { return false; },
        login: async function(password) {
            console.log('Using fallback login');
            
            // Only accept dev passwords
            if (password === 'Rosie@007' || password === 'localdev') {
                localStorage.setItem('authToken', 'fallback-emergency-token');
                return { success: true, token: 'fallback-emergency-token' };
            }
            
            return { success: false, error: 'Invalid password' };
        },
        logout: function() {
            localStorage.removeItem('authToken');
            return { success: true };
        }
    };
    
    // Resolve the promise to signal ApiClient is ready
    if (window.resolveApiClient) {
        window.resolveApiClient(window.ApiClient);
    }
    
    // Trigger an event
    document.dispatchEvent(new CustomEvent('apiClientReady', { detail: window.ApiClient }));
}

// Determine the API base URL based on environment
function determineApiBaseUrl() {
    const isLocalhost = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1';
    
    return window.location.origin; // Use same origin for both local and production
}

// Initialize the Pokemon card
function initializeCard() {
    const card = document.getElementById('pokemonCard');
    if (!card) {
        console.error('Pokemon card element not found!');
        return;
    }
    
    // Use setupCardFlipping if available
    if (typeof setupCardFlipping === 'function') {
        setupCardFlipping();
    }
} 