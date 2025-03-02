// Initialize the Pokemon Card Website
console.log('Initializing Pokemon Card Website...');

// Globals for the application
window.ApiClient = window.ApiClient || {};  // Will be populated in api.js

// Create promise to track ApiClient initialization
window.apiClientReady = new Promise((resolve) => {
    window.resolveApiClient = resolve;
});

// Global auth state management
window.AuthManager = {
    isAuthenticated: function() {
        return localStorage.getItem('admin_authenticated') === 'true';
    },
    
    login: function(password) {
        return new Promise((resolve, reject) => {
            // This is a placeholder - in production you should use a secure method
            // For demo/development only - do not use in production
            if (password === 'supersecret') {
                localStorage.setItem('admin_authenticated', 'true');
                document.body.classList.add('authenticated');
                this.notifyAuthStateChange(true);
                resolve(true);
            } else {
                reject(new Error('Invalid password'));
            }
        });
    },
    
    logout: function() {
        localStorage.removeItem('admin_authenticated');
        document.body.classList.remove('authenticated');
        this.notifyAuthStateChange(false);
    },
    
    notifyAuthStateChange: function(isAuthenticated) {
        // Dispatch an event that other components can listen for
        const event = new CustomEvent('authStateChanged', {
            detail: { isAuthenticated }
        });
        document.dispatchEvent(event);
    },
    
    initialize: function() {
        // Set initial auth state
        if (this.isAuthenticated()) {
            document.body.classList.add('authenticated');
        } else {
            document.body.classList.remove('authenticated');
        }
        
        // Listen for clicks on logout buttons across the site
        document.querySelectorAll('.logout-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
                window.SettingsManager.closeSettings();
            });
        });
    }
};

// Global settings panel management
window.SettingsManager = {
    settingsPanel: null,
    
    initialize: function() {
        // Find settings panel across site
        this.settingsPanel = document.querySelector('.settings-panel') || 
                            document.querySelector('.admin-panel');
        
        // Setup toggle buttons
        document.querySelectorAll('.settings-toggle').forEach(toggle => {
            toggle.addEventListener('click', () => this.toggleSettings());
        });
        
        // Add close button listener
        const closeBtn = document.querySelector('.settings-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeSettings());
        }
        
        // Listen for auth state changes
        document.addEventListener('authStateChanged', (event) => {
            if (!event.detail.isAuthenticated) {
                this.closeSettings();
            }
        });
    },
    
    toggleSettings: function() {
        if (!window.AuthManager.isAuthenticated()) {
            // Show login modal if not authenticated
            if (window.ModalManager) {
                const loginModal = document.getElementById('passwordModal');
                if (loginModal) {
                    window.ModalManager.openModal(loginModal);
                    setTimeout(() => {
                        const passwordInput = document.getElementById('passwordInput');
                        if (passwordInput) passwordInput.focus();
                    }, 100);
                }
            }
        } else {
            // Toggle settings panel
            if (this.settingsPanel) {
                if (this.settingsPanel.classList.contains('open')) {
                    this.closeSettings();
                } else {
                    this.openSettings();
                }
            }
        }
    },
    
    openSettings: function() {
        if (this.settingsPanel) {
            this.settingsPanel.classList.add('open');
        }
    },
    
    closeSettings: function() {
        if (this.settingsPanel) {
            this.settingsPanel.classList.remove('open');
        }
    }
};

// Initialize global managers on DOM content loaded
document.addEventListener('DOMContentLoaded', function() {
    window.AuthManager.initialize();
    window.SettingsManager.initialize();
    
    // Add classes to common admin toggle buttons for consistency
    document.querySelectorAll('#adminToggle, .admin-toggle').forEach(toggle => {
        toggle.classList.add('settings-toggle');
    });
    
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