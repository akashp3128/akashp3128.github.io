// Initialize the Pokemon Card Website
console.log('Initializing Pokemon Card Website...');

// Globals for the application
window.ApiClient = {};  // Will be populated in api.js

// Initialize settings and variables
document.addEventListener('DOMContentLoaded', function() {
    // Set API base URL 
    window.API_BASE_URL = determineApiBaseUrl();
    
    // Check for mobile devices
    detectMobileDevice();
    
    // Initialize card
    initializeCard();
});

// Determine the API base URL based on environment
function determineApiBaseUrl() {
    const isLocalhost = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1';
    
    return window.location.origin; // Use same origin for both local and production
}

// Check if user is on a mobile device and set appropriate classes
function detectMobileDevice() {
    // Check for touch device
    const isTouchDevice = 'ontouchstart' in window || 
                        navigator.maxTouchPoints > 0 || 
                        navigator.msMaxTouchPoints > 0;
    
    // Check for mobile browser
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isTouchDevice || isMobile) {
        document.body.classList.add('mobile-device');
        console.log('Mobile device detected, adding mobile-device class');
    }
    
    // Specifically detect iOS for special handling
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIOS) {
        document.body.classList.add('ios-device');
        console.log('iOS device detected, adding ios-device class');
    }
    
    // Detect Safari browser
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (isSafari) {
        document.body.classList.add('safari-browser');
        console.log('Safari browser detected, adding safari-browser class');
    }
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