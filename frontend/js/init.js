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
    // The admin password - centralized in one place
    ADMIN_PASSWORD: 'admin1234', // This should match what was used in navy-evaluations.js
    
    isAuthenticated: function() {
        const authState = localStorage.getItem('admin_authenticated') === 'true';
        console.log('[akash] AuthManager.isAuthenticated() called, returned:', authState);
        return authState;
    },
    
    login: function(password) {
        console.log('[akash] AuthManager.login() called');
        return new Promise((resolve, reject) => {
            // This is a placeholder - in production you should use a secure method
            // For demo/development only - do not use in production
            if (password === this.ADMIN_PASSWORD) {
                console.log('[akash] Login successful, setting authenticated state to true');
                localStorage.setItem('admin_authenticated', 'true');
                document.body.classList.add('authenticated');
                this.notifyAuthStateChange(true);
                resolve(true);
            } else {
                console.log('[akash] Login failed, password incorrect');
                reject(new Error('Invalid password'));
            }
        });
    },
    
    logout: function() {
        console.log('[akash] AuthManager.logout() called');
        localStorage.removeItem('admin_authenticated');
        document.body.classList.remove('authenticated');
        this.notifyAuthStateChange(false);
    },
    
    notifyAuthStateChange: function(isAuthenticated) {
        console.log('[akash] AuthManager notifying auth state change:', isAuthenticated);
        // Dispatch an event that other components can listen for
        const event = new CustomEvent('authStateChanged', {
            detail: { isAuthenticated }
        });
        document.dispatchEvent(event);
    },
    
    initialize: function() {
        console.log('[akash] AuthManager initializing');
        // Set initial auth state
        if (this.isAuthenticated()) {
            console.log('[akash] User is authenticated, adding authenticated class to body');
            document.body.classList.add('authenticated');
        } else {
            console.log('[akash] User is not authenticated');
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
        console.log('[akash] AuthManager initialization complete');
    }
};

// Global settings panel management
window.SettingsManager = {
    settingsPanel: null,
    
    initialize: function() {
        console.log('[akash] SettingsManager initializing');
        // Find settings panel across site
        this.settingsPanel = document.querySelector('.settings-panel');
        console.log('[akash] Settings panel found:', this.settingsPanel ? 'yes' : 'no');
        
        // Setup toggle buttons
        const toggleButtons = document.querySelectorAll('.settings-toggle');
        console.log('[akash] Settings toggle buttons found:', toggleButtons.length);
        toggleButtons.forEach(toggle => {
            toggle.addEventListener('click', () => this.toggleSettings());
        });
        
        // Add close button listener
        const closeBtn = document.querySelector('.settings-close');
        console.log('[akash] Settings close button found:', closeBtn ? 'yes' : 'no');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeSettings());
        }
        
        // Listen for auth state changes
        document.addEventListener('authStateChanged', (event) => {
            console.log('[akash] SettingsManager received auth state change:', event.detail.isAuthenticated);
            if (!event.detail.isAuthenticated) {
                this.closeSettings();
            }
        });
        console.log('[akash] SettingsManager initialization complete');
    },
    
    toggleSettings: function() {
        console.log('[akash] SettingsManager.toggleSettings() called');
        if (!window.AuthManager.isAuthenticated()) {
            console.log('[akash] User not authenticated, showing login modal');
            // Show login modal if not authenticated
            if (window.ModalManager) {
                const loginModal = document.getElementById('passwordModal');
                if (loginModal) {
                    console.log('[akash] Opening login modal');
                    window.ModalManager.openModal(loginModal);
                    setTimeout(() => {
                        const passwordInput = document.getElementById('passwordInput');
                        if (passwordInput) passwordInput.focus();
                    }, 100);
                } else {
                    console.log('[akash] Login modal not found');
                }
            } else {
                console.log('[akash] ModalManager not found');
            }
        } else {
            console.log('[akash] User is authenticated, toggling settings panel');
            // Toggle settings panel
            if (this.settingsPanel) {
                if (this.settingsPanel.classList.contains('open')) {
                    this.closeSettings();
                } else {
                    this.openSettings();
                }
            } else {
                console.log('[akash] Settings panel not found');
            }
        }
    },
    
    openSettings: function() {
        console.log('[akash] SettingsManager.openSettings() called');
        if (this.settingsPanel) {
            this.settingsPanel.classList.add('open');
        } else {
            console.log('[akash] Could not open settings panel - not found');
        }
    },
    
    closeSettings: function() {
        console.log('[akash] SettingsManager.closeSettings() called');
        if (this.settingsPanel) {
            this.settingsPanel.classList.remove('open');
        } else {
            console.log('[akash] Could not close settings panel - not found');
        }
    }
};

// Initialize global managers on DOM content loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('[akash] DOM content loaded, initializing global managers');
    
    // Ensure we have consistent settings button styling
    // This must happen before initializing managers
    const adminToggleButtons = document.querySelectorAll('#adminToggle, .admin-toggle');
    console.log('[akash] Admin toggle buttons found for styling:', adminToggleButtons.length);
    adminToggleButtons.forEach(toggle => {
        toggle.classList.add('settings-toggle');
    });
    
    // Initialize managers
    window.AuthManager.initialize();
    window.SettingsManager.initialize();
    
    // Check for common issues
    // If we're on navy page but don't have the settings panel
    if (document.body.classList.contains('navy-page') && 
        !document.querySelector('.settings-panel')) {
        console.error('[akash] ERROR: Navy page is missing settings panel!');
    }
    
    // Log page information
    console.log('[akash] Current page:', window.location.pathname);
    console.log('[akash] Is navy page:', document.body.classList.contains('navy-page'));
    console.log('[akash] Is authenticated:', document.body.classList.contains('authenticated'));
    console.log('[akash] Settings panel exists:', document.querySelector('.settings-panel') ? 'yes' : 'no');
    
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