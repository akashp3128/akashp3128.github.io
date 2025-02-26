// Initialize the Pokemon Card Website
console.log('Initializing Pokemon Card Website...');

// Main initialization function
function initializeWebsite() {
    // Enable emergency mode by default for local development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        // Only set emergency mode if it hasn't been explicitly set already
        if (localStorage.getItem('emergencyModeEnabled') === null) {
            console.log('Local development detected - enabling emergency mode by default');
            localStorage.setItem('emergencyModeEnabled', 'true');
            window.emergencyMode = true;
            
            // Show the emergency mode banner
            const banner = document.getElementById('emergencyModeBanner');
            if (banner) {
                banner.style.display = 'block';
            }
            
            // Add emergency mode class to body
            document.body.classList.add('emergency-mode');
        } else {
            // Read the existing setting
            window.emergencyMode = localStorage.getItem('emergencyModeEnabled') === 'true';
            console.log('Using existing emergency mode setting:', window.emergencyMode);
        }
    }
    
    // Ensure global flag is set
    window.pokemonCardInitialized = true;
    
    console.log('Website initialization complete');
}

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWebsite);
} else {
    // DOM already loaded
    initializeWebsite();
} 