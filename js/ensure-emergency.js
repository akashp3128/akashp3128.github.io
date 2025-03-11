// Script to ensure emergency mode is enabled if the backend is unreachable
console.log('Running emergency mode check...');

document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Check if backend is reachable
        const isBackendReachable = await checkBackendReachability();
        
        if (!isBackendReachable) {
            console.log('Backend unreachable, enabling emergency mode');
            localStorage.setItem('emergency_mode', 'true');
            
            // Show a notification if possible
            const notificationElement = document.getElementById('notification');
            if (notificationElement) {
                notificationElement.textContent = 'Backend API unavailable. Emergency mode enabled.';
                notificationElement.classList.add('show', 'warning');
                
                setTimeout(() => {
                    notificationElement.classList.remove('show');
                }, 5000);
            }
        } else {
            console.log('Backend is reachable, emergency mode not needed');
            // Explicitly disable emergency mode if backend is reachable
            localStorage.removeItem('emergency_mode');
        }
    } catch (error) {
        console.error('Error checking backend reachability:', error);
        // Enable emergency mode in case of any error
        localStorage.setItem('emergency_mode', 'true');
    }
});

// Function to check if backend is reachable
async function checkBackendReachability() {
    try {
        // Use the actual backend URL instead of window.location.origin
        const isLocalhost = window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1';
        
        // Use the correct backend URL based on environment
        const backendUrl = isLocalhost ? 'http://localhost:3000' : window.location.origin;
        
        console.log('Checking backend reachability at:', backendUrl);
        
        const response = await fetch(`${backendUrl}/api/health`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            signal: AbortSignal.timeout(3000) // 3 second timeout
        });
        
        console.log('Backend response status:', response.status);
        return response.ok;
    } catch (error) {
        console.warn('Backend connectivity check failed:', error);
        return false;
    }
} 