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
        
        // Check emergency mode
        debugLog(`Emergency mode: ${window.emergencyMode ? 'Active' : 'Inactive'}`, 'info');
        
        // Check authentication
        const authenticated = !!localStorage.getItem('authToken') || window.emergencyMode;
        debugLog(`Authentication: ${authenticated ? 'Authenticated' : 'Not authenticated'}`, 'info');
    }

    // Run initial check
    setTimeout(checkAndLogElementStates, 500);
    
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