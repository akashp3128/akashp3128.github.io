// Script to ensure emergency mode is enabled if the backend is unreachable
console.log('Running emergency mode check...');

document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Check if backend is reachable
        const isBackendReachable = await checkBackendReachability();
        
        if (!isBackendReachable) {
            console.log('Backend unreachable, enabling emergency mode');
            localStorage.setItem('emergency_mode', 'true');
            document.documentElement.classList.add('emergency-mode');
            
            // Show a notification if possible
            const notificationElement = document.getElementById('notification');
            if (notificationElement) {
                notificationElement.textContent = 'Backend API unavailable. Emergency mode enabled.';
                notificationElement.classList.add('show', 'warning');
                
                // Keep notification visible longer in emergency mode
                setTimeout(() => {
                    notificationElement.classList.remove('show');
                }, 10000);
            }
            
            // Create a floating indicator for emergency mode if it doesn't exist
            if (!document.getElementById('emergency-indicator')) {
                const indicator = document.createElement('div');
                indicator.id = 'emergency-indicator';
                indicator.innerHTML = '⚠️ Emergency Mode';
                indicator.style.position = 'fixed';
                indicator.style.top = '10px';
                indicator.style.right = '10px';
                indicator.style.backgroundColor = 'rgba(255, 165, 0, 0.8)';
                indicator.style.color = 'white';
                indicator.style.padding = '5px 10px';
                indicator.style.borderRadius = '5px';
                indicator.style.zIndex = '9999';
                indicator.style.fontSize = '12px';
                indicator.style.fontWeight = 'bold';
                document.body.appendChild(indicator);
            }
        } else {
            console.log('Backend is reachable, emergency mode not needed');
            // Explicitly disable emergency mode if backend is reachable
            localStorage.removeItem('emergency_mode');
            document.documentElement.classList.remove('emergency-mode');
            
            // Remove emergency indicator if it exists
            const indicator = document.getElementById('emergency-indicator');
            if (indicator) {
                indicator.remove();
            }
        }
    } catch (error) {
        console.error('Error checking backend reachability:', error);
        // Enable emergency mode in case of any error
        localStorage.setItem('emergency_mode', 'true');
        document.documentElement.classList.add('emergency-mode');
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
        
        // Create a controller for the timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
        
        try {
            const response = await fetch(`${backendUrl}/api/health`, {
                method: 'GET',
                headers: { 'Accept': 'application/json' },
                signal: controller.signal
            });
            
            // Clear the timeout as the request completed
            clearTimeout(timeoutId);
            
            console.log('Backend response status:', response.status);
            return response.ok;
        } catch (fetchError) {
            // Clear the timeout if there was an error
            clearTimeout(timeoutId);
            
            console.warn('Backend health check failed:', fetchError);
            return false;
        }
    } catch (error) {
        console.warn('Backend connectivity check failed:', error);
        return false;
    }
} 