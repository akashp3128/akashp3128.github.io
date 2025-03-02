/**
 * Simple emergency fixes for navigation and settings button
 */

// Execute when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('[EMERGENCY] Initializing simple fixes');
    
    // Fix settings button
    setupSettingsButton();
    
    // Setup login modal
    setupLoginModal();
    
    // Setup navigation
    fixNavigation();
});

// Fix the settings button functionality
function setupSettingsButton() {
    const settingsBtn = document.getElementById('adminToggle');
    
    if (!settingsBtn) {
        console.error('[EMERGENCY] Settings button not found');
        
        // Create one if missing
        const newBtn = document.createElement('button');
        newBtn.id = 'adminToggle';
        newBtn.className = 'settings-toggle';
        newBtn.innerHTML = '⚙️';
        newBtn.style.position = 'fixed';
        newBtn.style.bottom = '20px';
        newBtn.style.right = '20px';
        newBtn.style.zIndex = '9999';
        document.body.appendChild(newBtn);
        
        newBtn.addEventListener('click', toggleSettings);
        console.log('[EMERGENCY] Created settings button');
    } else {
        // Make sure the existing button works
        settingsBtn.style.display = 'flex';
        settingsBtn.style.zIndex = '9999';
        settingsBtn.addEventListener('click', toggleSettings);
        console.log('[EMERGENCY] Enhanced existing settings button');
    }
    
    // Also fix settings panel close button
    const closeBtn = document.querySelector('.settings-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeSettings);
        console.log('[EMERGENCY] Added settings close handler');
    }
    
    // Fix logout buttons
    document.querySelectorAll('.logout-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    });
}

// Handle settings toggle click
function toggleSettings(e) {
    if (e) e.preventDefault();
    
    console.log('[EMERGENCY] Settings button clicked');
    
    // Check if logged in
    const isLoggedIn = localStorage.getItem('admin_authenticated') === 'true';
    
    if (!isLoggedIn) {
        console.log('[EMERGENCY] User not logged in, showing login modal');
        showLoginModal();
    } else {
        console.log('[EMERGENCY] User is logged in, toggling settings panel');
        const panel = document.querySelector('.settings-panel');
        if (panel) {
            panel.classList.toggle('open');
        } else {
            console.error('[EMERGENCY] Settings panel not found');
        }
    }
}

function closeSettings() {
    const panel = document.querySelector('.settings-panel');
    if (panel) {
        panel.classList.remove('open');
    }
}

// Setup login modal
function setupLoginModal() {
    console.log('[EMERGENCY] Setting up login modal');
    
    // Handle login form submission for navy-career.html
    const passwordModal = document.getElementById('passwordModal');
    if (passwordModal) {
        console.log('[EMERGENCY] Found old password modal');
        
        const submitBtn = document.getElementById('submitPassword');
        if (submitBtn) {
            submitBtn.addEventListener('click', function() {
                const passwordInput = document.getElementById('passwordInput');
                if (passwordInput && passwordInput.value === 'admin1234') {
                    localStorage.setItem('admin_authenticated', 'true');
                    document.body.classList.add('authenticated');
                    
                    // Update UI
                    updateAuthUI(true);
                    
                    // Hide modal
                    passwordModal.style.display = 'none';
                    
                    // Show settings panel
                    const panel = document.querySelector('.settings-panel');
                    if (panel) {
                        panel.classList.add('open');
                    }
                    
                    showNotification('Login successful!', 'success');
                } else {
                    showNotification('Invalid password!', 'error');
                }
            });
        }
        
        // Close button for password modal
        const closeBtn = passwordModal.querySelector('.close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                passwordModal.style.display = 'none';
            });
        }
    }
    
    // Handle login form for index.html
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        console.log('[EMERGENCY] Found login modal');
        
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const passwordInput = document.getElementById('adminPassword');
                if (passwordInput && passwordInput.value === 'admin1234') {
                    localStorage.setItem('admin_authenticated', 'true');
                    document.body.classList.add('authenticated');
                    
                    // Update UI
                    updateAuthUI(true);
                    
                    // Hide modal
                    loginModal.style.display = 'none';
                    
                    // Show settings panel
                    const panel = document.querySelector('.settings-panel');
                    if (panel) {
                        panel.classList.add('open');
                    }
                    
                    showNotification('Login successful!', 'success');
                } else {
                    showNotification('Invalid password!', 'error');
                }
            });
        }
        
        // Close button for login modal
        const closeBtn = loginModal.querySelector('.close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                loginModal.style.display = 'none';
            });
        }
    }
    
    // Check initial authentication state
    const isLoggedIn = localStorage.getItem('admin_authenticated') === 'true';
    updateAuthUI(isLoggedIn);
}

// Show login modal
function showLoginModal() {
    // Try to find the right login modal (differs between pages)
    const loginModal = document.getElementById('loginModal');
    const passwordModal = document.getElementById('passwordModal');
    
    if (loginModal) {
        loginModal.style.display = 'flex';
        
        // Focus the password field
        const passwordInput = document.getElementById('adminPassword');
        if (passwordInput) setTimeout(() => passwordInput.focus(), 100);
    } else if (passwordModal) {
        passwordModal.style.display = 'flex';
        
        // Focus the password field
        const passwordInput = document.getElementById('passwordInput');
        if (passwordInput) setTimeout(() => passwordInput.focus(), 100);
    } else {
        alert('Login required. Password: admin1234');
    }
}

// Update UI based on authentication state
function updateAuthUI(isAuthenticated) {
    console.log('[EMERGENCY] Updating UI for auth state:', isAuthenticated);
    
    if (isAuthenticated) {
        document.body.classList.add('authenticated');
        
        // Show authenticated elements
        document.querySelectorAll('.authenticated-only').forEach(el => {
            el.style.display = '';
        });
        
        // Hide non-authenticated elements
        document.querySelectorAll('.non-authenticated-only').forEach(el => {
            el.style.display = 'none';
        });
        
        // Admin-only elements (for backward compatibility)
        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = '';
        });
    } else {
        document.body.classList.remove('authenticated');
        
        // Hide authenticated elements
        document.querySelectorAll('.authenticated-only, .admin-only').forEach(el => {
            el.style.display = 'none';
        });
        
        // Show non-authenticated elements
        document.querySelectorAll('.non-authenticated-only').forEach(el => {
            el.style.display = '';
        });
    }
}

// Logout function
function logout() {
    console.log('[EMERGENCY] Logging out');
    localStorage.removeItem('admin_authenticated');
    document.body.classList.remove('authenticated');
    
    // Update UI
    updateAuthUI(false);
    
    // Close settings panel
    closeSettings();
    
    showNotification('Logged out successfully', 'success');
}

// Fix navigation links to use relative paths
function fixNavigation() {
    // No JS fixes needed since we updated the HTML directly
}

// Show notification
function showNotification(message, type = 'info', duration = 3000) {
    console.log(`[EMERGENCY] Notification: ${message} (${type})`);
    
    let notification = document.getElementById('notification');
    
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.className = 'notification';
        document.body.appendChild(notification);
    }
    
    notification.textContent = message;
    notification.className = `notification ${type}`;
    
    // Force reflow
    notification.offsetHeight;
    
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, duration);
} 