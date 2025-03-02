/**
 * Initialization and Core Utilities
 * Contains global utilities for authentication, notifications, and UI management
 */

// Notification System - provides toast notifications
const NotificationSystem = (() => {
    const log = (message) => {
        console.log(`[akash] NotificationSystem: ${message}`);
    };

    const createNotificationElement = (message, type = 'info') => {
        log(`Creating notification: ${message} (${type})`);
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        return notification;
    };

    const showNotification = (message, type = 'info', duration = 3000) => {
        log(`Showing notification: ${message} (${type})`);
        const notification = createNotificationElement(message, type);
        document.body.appendChild(notification);
        
        // Force reflow for animation
        notification.offsetHeight;
        
        // Show notification
        notification.classList.add('show');
        
        // Auto-hide after duration
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300); // Match transition duration
        }, duration);
    };
    
    return {
        showNotification
    };
})();

// Authentication Manager - handles login, logout, and auth state
const AuthManager = (() => {
    const ADMIN_PASSWORD = 'admin1234';
    const AUTH_KEY = 'authenticated';
    const authListeners = [];
    
    const log = (message) => {
        console.log(`[akash] AuthManager: ${message}`);
    };
    
    const init = () => {
        log('Initializing AuthManager');
        
        // Set initial body class based on authentication
        if (isAuthenticated()) {
            document.body.classList.add('authenticated');
            log('User is authenticated, adding authenticated class to body');
        } else {
            document.body.classList.remove('authenticated');
            log('User is not authenticated, removing authenticated class from body');
        }
        
        // Setup login form handler
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            log('Setting up login form handler');
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const passwordInput = document.getElementById('adminPassword');
                if (passwordInput) {
                    login(passwordInput.value)
                        .then(() => {
                            // Close login modal
                            const loginModal = document.getElementById('loginModal');
                            if (loginModal) {
                                hideModal(loginModal);
                            }
                            
                            // Show settings panel after login
                            if (SettingsManager) {
                                SettingsManager.openSettingsPanel();
                            }
                        })
                        .catch(error => {
                            NotificationSystem.showNotification(error, 'error');
                        });
                }
            });
        } else {
            log('Login form not found');
        }
        
        return {
            isAuthenticated,
            login,
            logout,
            onAuthChange
        };
    };
    
    const isAuthenticated = () => {
        const authState = localStorage.getItem(AUTH_KEY);
        const authenticated = authState === 'true';
        log(`Authentication check: ${authenticated}`);
        return authenticated;
    };
    
    const login = (password) => {
        log('Login attempt');
        return new Promise((resolve, reject) => {
            if (password === ADMIN_PASSWORD) {
                log('Login successful');
                localStorage.setItem(AUTH_KEY, 'true');
                document.body.classList.add('authenticated');
                
                // Update authentication UI
                updateAuthenticatedUI(true);
                
                // Notify listeners
                notifyAuthListeners(true);
                
                NotificationSystem.showNotification('Login successful!', 'success');
                resolve();
            } else {
                log('Login failed - incorrect password');
                reject('Incorrect password. Please try again.');
            }
        });
    };
    
    const logout = () => {
        log('Logging out');
        localStorage.removeItem(AUTH_KEY);
        document.body.classList.remove('authenticated');
        
        // Update authentication UI
        updateAuthenticatedUI(false);
        
        // Notify listeners
        notifyAuthListeners(false);
        
        return true;
    };
    
    const updateAuthenticatedUI = (isAuthenticated) => {
        log(`Updating UI for authentication state: ${isAuthenticated}`);
        
        // Show/hide authenticated-only elements
        const authenticatedElements = document.querySelectorAll('.authenticated-only');
        authenticatedElements.forEach(el => {
            el.style.display = isAuthenticated ? '' : 'none';
        });
        
        // Show/hide non-authenticated-only elements
        const nonAuthenticatedElements = document.querySelectorAll('.non-authenticated-only');
        nonAuthenticatedElements.forEach(el => {
            el.style.display = isAuthenticated ? 'none' : '';
        });
    };
    
    const onAuthChange = (callback) => {
        if (typeof callback === 'function') {
            log('Adding auth change listener');
            authListeners.push(callback);
        }
    };
    
    const notifyAuthListeners = (isAuthenticated) => {
        log(`Notifying ${authListeners.length} auth listeners of state: ${isAuthenticated}`);
        authListeners.forEach(listener => {
            try {
                listener(isAuthenticated);
            } catch (error) {
                console.error('[akash] Error in auth listener:', error);
            }
        });
    };
    
    return {
        init: init(),
        isAuthenticated,
        login,
        logout,
        onAuthChange
    };
})();

// Settings Manager - handles the side panel with settings
const SettingsManager = (() => {
    let settingsPanel = null;
    let toggleButton = null;
    
    const log = (message) => {
        console.log(`[akash] SettingsManager: ${message}`);
    };
    
    const init = () => {
        log('Initializing SettingsManager');
        
        // Get settings panel element
        settingsPanel = document.querySelector('.settings-panel');
        
        // Try to find settings toggle button
        toggleButton = document.querySelector('.settings-toggle');
        
        if (!settingsPanel) {
            log('Settings panel not found, creating fallback');
            createFallbackSettingsPanel();
        }
        
        if (!toggleButton) {
            log('Settings toggle button not found, creating fallback');
            createFallbackToggleButton();
        }
        
        setupEventListeners();
    };
    
    const createFallbackSettingsPanel = () => {
        log('Creating fallback settings panel');
        settingsPanel = document.createElement('div');
        settingsPanel.className = 'settings-panel';
        
        // Create basic panel structure
        settingsPanel.innerHTML = `
            <div class="settings-header">
                <h3>Settings</h3>
                <button class="settings-close">&times;</button>
            </div>
            <div class="settings-content">
                <div class="settings-section authenticated-only">
                    <h4>Card Settings</h4>
                    <ul class="settings-options">
                        <li><button id="settingsEditCard" class="settings-option">Edit Card Content</button></li>
                        <li><button id="settingsUploadImage" class="settings-option">Upload Profile Image</button></li>
                        <li><button id="settingsUploadResume" class="settings-option">Upload Resume</button></li>
                    </ul>
                </div>
                
                <div class="settings-section non-authenticated-only">
                    <p>Please log in to access settings</p>
                </div>
                
                <div class="settings-footer authenticated-only">
                    <button id="logoutBtn" class="settings-option">Logout</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(settingsPanel);
    };
    
    const createFallbackToggleButton = () => {
        log('Creating fallback toggle button');
        toggleButton = document.createElement('button');
        toggleButton.className = 'settings-toggle';
        toggleButton.id = 'adminToggle';
        toggleButton.innerHTML = '<i class="fas fa-cog"></i>';
        document.body.appendChild(toggleButton);
    };
    
    const setupEventListeners = () => {
        if (toggleButton) {
            log('Setting up toggle button click handler');
            toggleButton.addEventListener('click', handleToggleClick);
        }
        
        if (settingsPanel) {
            log('Setting up settings panel close button handler');
            const closeButton = settingsPanel.querySelector('.settings-close');
            if (closeButton) {
                closeButton.addEventListener('click', closeSettingsPanel);
            }
        }
    };
    
    const handleToggleClick = (e) => {
        log('Settings toggle button clicked');
        
        if (!AuthManager.isAuthenticated()) {
            log('User not authenticated, showing login modal');
            const loginModal = document.getElementById('loginModal');
            if (loginModal) {
                showModal(loginModal);
            } else {
                log('Login modal not found');
                NotificationSystem.showNotification('Login required', 'warning');
            }
            return;
        }
        
        toggleSettingsPanel();
    };
    
    const toggleSettingsPanel = () => {
        if (!settingsPanel) {
            log('Cannot toggle settings panel: panel not found');
            return;
        }
        
        log('Toggling settings panel');
        const isOpen = settingsPanel.classList.contains('open');
        
        if (isOpen) {
            closeSettingsPanel();
        } else {
            openSettingsPanel();
        }
    };
    
    const openSettingsPanel = () => {
        if (!settingsPanel) {
            log('Cannot open settings panel: panel not found');
            return;
        }
        
        log('Opening settings panel');
        settingsPanel.classList.add('open');
        
        // Escape key to close
        document.addEventListener('keydown', handlePanelEscapeKey);
        
        // Click outside to close
        setTimeout(() => {
            document.addEventListener('click', handleClickOutside);
        }, 10);
    };
    
    const closeSettingsPanel = () => {
        if (!settingsPanel) {
            log('Cannot close settings panel: panel not found');
            return;
        }
        
        log('Closing settings panel');
        settingsPanel.classList.remove('open');
        
        // Remove event listeners
        document.removeEventListener('keydown', handlePanelEscapeKey);
        document.removeEventListener('click', handleClickOutside);
    };
    
    const handlePanelEscapeKey = (e) => {
        if (e.key === 'Escape') {
            log('Escape key pressed, closing settings panel');
            closeSettingsPanel();
        }
    };
    
    const handleClickOutside = (e) => {
        if (settingsPanel && !settingsPanel.contains(e.target) && e.target !== toggleButton) {
            log('Clicked outside settings panel, closing panel');
            closeSettingsPanel();
        }
    };
    
    return {
        init,
        openSettingsPanel,
        closeSettingsPanel,
        toggleSettingsPanel
    };
})();

// Modal Utilities
function showModal(modal) {
    if (!modal) return;
    console.log('[akash] Showing modal:', modal.id);
    modal.classList.add('show');
    modal.style.display = 'flex';
    
    // Make body unscrollable
    document.body.style.overflow = 'hidden';
    
    // Make modal draggable if it has the draggable class
    const content = modal.querySelector('.modal-content.draggable');
    if (content) {
        enableDragging(content);
    }
    
    // Close button handling
    const closeBtn = modal.querySelector('.close-modal');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => hideModal(modal));
    }
    
    // Close on outer click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            hideModal(modal);
        }
    });
    
    // Close on escape
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            hideModal(modal);
        }
    };
    modal.escHandler = escHandler;
    document.addEventListener('keydown', escHandler);
}

function hideModal(modal) {
    if (!modal) return;
    console.log('[akash] Hiding modal:', modal.id);
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
        
        // Restore body scrolling
        document.body.style.overflow = '';
        
        // Remove escape handler
        if (modal.escHandler) {
            document.removeEventListener('keydown', modal.escHandler);
        }
    }, 300); // Match transition duration
}

function enableDragging(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    
    element.onmousedown = dragMouseDown;
    
    function dragMouseDown(e) {
        e.preventDefault();
        // Get mouse position at startup
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // Call function when mouse moves
        document.onmousemove = elementDrag;
    }
    
    function elementDrag(e) {
        e.preventDefault();
        // Calculate new position
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // Set element's new position
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
    }
    
    function closeDragElement() {
        // Stop moving when mouse button is released
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

// Initialize components when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('[akash] DOM ready, initializing components...');
    
    // Initialize SettingsManager
    SettingsManager.init();
    
    // Initialize API
    if (window.API) {
        console.log('[akash] Dispatching api-ready event');
        document.dispatchEvent(new CustomEvent('api-ready', { detail: window.API }));
    } else {
        console.log('[akash] API not available yet');
    }
}); 