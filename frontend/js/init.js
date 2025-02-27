// Initialize the Pokemon Card Website
console.log('Initializing Pokemon Card Website...');

// Globals for the application
window.ApiClient = {};  // Will be populated in api.js

// Initialize settings and variables
document.addEventListener('DOMContentLoaded', function() {
    // Set API base URL 
    window.API_BASE_URL = determineApiBaseUrl();
    
    // Set emergency mode to always be false
    window.emergencyMode = false;
    localStorage.setItem('emergencyModeEnabled', 'false');
    
    // Initialize card
    initializeCard();
});

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