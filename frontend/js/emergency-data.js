/**
 * Emergency Mode Data
 * This file contains fallback data used when the backend is unavailable
 */

// Initialize emergency mode data in localStorage if not already present
(function initializeEmergencyData() {
    // Resume data
    if (!localStorage.getItem('emergencyModeResume')) {
        // Default to a public URL for the resume (update this with your actual resume URL)
        localStorage.setItem('emergencyModeResume', './assets/resume/Akash_Patel_Resume.pdf');
    }
    
    // Check if emergency mode is enabled from a previous session
    if (localStorage.getItem('emergencyModeEnabled') === 'true') {
        console.log('Emergency mode was enabled from a previous session');
        window.emergencyMode = true;
    }
    
    // Add an emergency override token for testing
    if (!localStorage.getItem('emergency-override-token')) {
        localStorage.setItem('emergency-override-token', 'emergency-override-token');
    }
})();

// Function to reset emergency mode
function resetEmergencyMode() {
    window.emergencyMode = false;
    localStorage.setItem('emergencyModeEnabled', 'false');
    console.log('Emergency mode has been reset');
}

// Function to manually enable emergency mode
function enableEmergencyMode() {
    window.emergencyMode = true;
    localStorage.setItem('emergencyModeEnabled', 'true');
    console.log('Emergency mode has been manually enabled');
    
    // Reload the page to apply emergency mode
    window.location.reload();
} 