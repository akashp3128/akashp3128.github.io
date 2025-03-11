/**
 * Debug and Error Handling Utilities
 * 
 * This file contains functions for better error handling and debugging,
 * which is especially useful for the emergency mode and mobile devices.
 */

// Global error handler
window.onerror = function(message, source, lineno, colno, error) {
    console.error('Global error caught:', message);
    console.error('Source:', source);
    console.error('Line:', lineno, 'Column:', colno);
    console.error('Error object:', error);
    
    // In emergency mode, display errors to the user
    if (document.body.classList.contains('emergency-mode')) {
        showDebugNotification(`Error: ${message}`, 'error');
    }
    
    // Return false to allow the default error handling as well
    return false;
};

// Promise rejection handler
window.onunhandledrejection = function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    
    // In emergency mode, display promise errors to the user
    if (document.body.classList.contains('emergency-mode')) {
        showDebugNotification(`Promise Error: ${event.reason.message || 'Unknown promise error'}`, 'error');
    }
};

// Debug notification function (only used in emergency mode)
function showDebugNotification(message, type = 'info') {
    // Check if we're in emergency mode
    if (!document.body.classList.contains('emergency-mode')) {
        return;
    }
    
    console.log(`Debug: ${message}`);
    
    // If showNotification exists (from main app), use it
    if (typeof showNotification === 'function') {
        showNotification(message, type);
        return;
    }
    
    // Fallback notification implementation
    const notification = document.getElementById('notification');
    if (!notification) {
        console.error('Notification element not found!');
        alert(message); // Fallback to alert
        return;
    }
    
    notification.textContent = message;
    notification.className = 'notification';
    notification.classList.add(type);
    notification.classList.add('visible');
    
    // Hide after a few seconds
    setTimeout(() => {
        notification.classList.remove('visible');
    }, type === 'error' ? 8000 : 5000);
}

// Log wrapper that can be enabled/disabled
const DEBUG = true;
function debugLog(...args) {
    if (DEBUG) {
        console.log('[DEBUG]', ...args);
    }
}

// Function to check browser compatibility
function checkBrowserCompatibility() {
    const issues = [];
    
    // Check for localStorage
    try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
    } catch (e) {
        issues.push('localStorage is not available');
    }
    
    // Check for modern JS features
    if (typeof Promise === 'undefined') {
        issues.push('Promises are not supported');
    }
    
    if (typeof fetch === 'undefined') {
        issues.push('Fetch API is not supported');
    }
    
    // Check CSS features
    const docStyle = document.documentElement.style;
    if (typeof docStyle.transform === 'undefined' && 
        typeof docStyle.webkitTransform === 'undefined') {
        issues.push('CSS transforms are not supported');
    }
    
    // Report issues in console
    if (issues.length > 0) {
        console.warn('Browser compatibility issues:', issues);
        
        // In emergency mode, show to the user
        if (document.body.classList.contains('emergency-mode')) {
            showDebugNotification('Browser compatibility issues: ' + issues.join(', '), 'warning');
        }
        
        return false;
    }
    
    return true;
}

// Run browser compatibility check on load
document.addEventListener('DOMContentLoaded', function() {
    checkBrowserCompatibility();
});

// Debug helper for development
(function() {
    // Create debug console if it doesn't exist
    if (!document.getElementById('debugConsole')) {
        const debugConsole = document.createElement('div');
        debugConsole.id = 'debugConsole';
        debugConsole.className = 'debug-console';
        document.body.appendChild(debugConsole);
    }

    // Create debug button if it doesn't exist
    if (!document.getElementById('debugConsoleBtn')) {
        const debugBtn = document.createElement('div');
        debugBtn.id = 'debugConsoleBtn';
        debugBtn.className = 'debug-console-btn';
        debugBtn.innerHTML = '🐞';
        debugBtn.title = 'Toggle Debug Console';
        debugBtn.onclick = function() {
            const console = document.getElementById('debugConsole');
            if (console) {
                console.classList.toggle('visible');
                checkAndLogElementStates(); // Log states when opened
            }
        };
        document.body.appendChild(debugBtn);
    }

    // Global debug log function
    window.debugLog = function(message, type = 'info') {
        const debugConsole = document.getElementById('debugConsole');
        if (!debugConsole) return;
        
        const logEntry = document.createElement('div');
        logEntry.className = `debug-log ${type}`;
        
        const timestamp = new Date().toLocaleTimeString();
        logEntry.innerHTML = `[${timestamp}] ${message}`;
        
        // Add to top of console
        debugConsole.insertBefore(logEntry, debugConsole.firstChild);
        
        // Limit number of entries
        const maxEntries = 50;
        const entries = debugConsole.querySelectorAll('.debug-log');
        if (entries.length > maxEntries) {
            for (let i = maxEntries; i < entries.length; i++) {
                entries[i].remove();
            }
        }
    };

    // Check critical elements and log their state
    function checkAndLogElementStates() {
        // Check admin toggle
        const adminToggle = document.getElementById('adminToggle');
        debugLog(`Admin toggle: ${adminToggle ? 'Found' : 'Not found'}`, adminToggle ? 'success' : 'error');
        if (adminToggle) {
            debugLog(`Admin toggle display: ${getComputedStyle(adminToggle).display}`, 'info');
            debugLog(`Admin toggle classes: ${adminToggle.className}`, 'info');
        }
        
        // Check admin panel
        const adminPanel = document.getElementById('adminPanel');
        debugLog(`Admin panel: ${adminPanel ? 'Found' : 'Not found'}`, adminPanel ? 'success' : 'error');
        if (adminPanel) {
            debugLog(`Admin panel display: ${adminPanel.style.display || getComputedStyle(adminPanel).display}`, 'info');
        }
        
        // Check Pokemon card
        const pokemonCard = document.getElementById('pokemonCard');
        debugLog(`Pokemon card: ${pokemonCard ? 'Found' : 'Not found'}`, pokemonCard ? 'success' : 'error');
        if (pokemonCard) {
            debugLog(`Card flipped: ${pokemonCard.classList.contains('card-flipped')}`, 'info');
            
            // Add unflip button to debug console if card is flipped
            if (pokemonCard.classList.contains('card-flipped')) {
                const unflipBtn = document.createElement('button');
                unflipBtn.textContent = 'Unflip Card';
                unflipBtn.className = 'debug-action-btn';
                unflipBtn.onclick = function() {
                    pokemonCard.classList.remove('card-flipped');
                    debugLog('Card manually unflipped', 'success');
                    this.remove();
                };
                document.getElementById('debugConsole').insertBefore(unflipBtn, document.getElementById('debugConsole').firstChild);
            }
        }
        
        // Check authentication
        const authenticated = !!localStorage.getItem('authToken');
        debugLog(`Authentication: ${authenticated ? 'Authenticated' : 'Not authenticated'}`, 'info');
    }

    // Run initial check
    setTimeout(checkAndLogElementStates, 500);
    
    // Log initialization
    debugLog('Debug helpers initialized', 'success');
    
    // Add window error handler
    window.addEventListener('error', function(e) {
        debugLog(`ERROR: ${e.message} at ${e.filename}:${e.lineno}`, 'error');
    });
    
    // Set up click monitoring for admin toggle
    document.addEventListener('click', function(e) {
        if (e.target.id === 'adminToggle' || e.target.closest('#adminToggle')) {
            debugLog('Click detected on admin toggle', 'success');
        }
    });
    
    // Log initialization
    debugLog('Debug helpers initialized', 'success');
    
    // Make the checker available globally
    window.checkElementStates = checkAndLogElementStates;
})(); 