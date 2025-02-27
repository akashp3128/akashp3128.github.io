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
        const origin = window.location.origin;
        const response = await fetch(`${origin}/api/health`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            signal: AbortSignal.timeout(3000) // 3 second timeout
        });
        return response.ok;
    } catch (error) {
        console.warn('Backend connectivity check failed:', error);
        return false;
    }
} 