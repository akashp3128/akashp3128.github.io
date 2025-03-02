/**
 * EMERGENCY AUTH SYSTEM
 * This file provides a bare-minimum auth system that works regardless of other scripts
 * It uses direct DOM manipulation and localstorage
 */

// Execute immediately when script loads
(function() {
    console.log('[EMERGENCY-AUTH] Loading emergency authentication...');
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initEmergencyAuth);
    } else {
        initEmergencyAuth();
    }
    
    // Also run on window load to be extra sure
    window.addEventListener('load', initEmergencyAuth);
})();

function initEmergencyAuth() {
    console.log('[EMERGENCY-AUTH] Initializing emergency authentication');
    
    // Check if already authenticated
    if (localStorage.getItem('emergency_auth') === 'true') {
        console.log('[EMERGENCY-AUTH] User is already authenticated');
        showAuthenticatedUI();
    } else {
        console.log('[EMERGENCY-AUTH] User is not authenticated');
        hideAuthenticatedUI();
    }
    
    // Apply instant fixes
    fixGearButton();
    setupLoginHandlers();
    setupLogoutHandlers();
}

function fixGearButton() {
    // Make sure gear button is visible and working
    let gearButton = document.getElementById('adminToggle');
    
    if (!gearButton) {
        console.log('[EMERGENCY-AUTH] Creating new gear button');
        gearButton = document.createElement('button');
        gearButton.id = 'adminToggle';
        gearButton.className = 'settings-toggle';
        gearButton.innerHTML = '⚙️';
        gearButton.style.position = 'fixed';
        gearButton.style.bottom = '20px';
        gearButton.style.right = '20px';
        gearButton.style.width = '50px';
        gearButton.style.height = '50px';
        gearButton.style.borderRadius = '50%';
        gearButton.style.backgroundColor = '#3a3a3a';
        gearButton.style.color = 'white';
        gearButton.style.fontSize = '24px';
        gearButton.style.border = 'none';
        gearButton.style.cursor = 'pointer';
        gearButton.style.zIndex = '99999';
        gearButton.style.display = 'flex';
        gearButton.style.alignItems = 'center';
        gearButton.style.justifyContent = 'center';
        document.body.appendChild(gearButton);
    }
    
    // Override any existing click handlers
    gearButton.onclick = null;
    gearButton.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        if (localStorage.getItem('emergency_auth') === 'true') {
            // Toggle settings panel if logged in
            const panel = document.querySelector('.settings-panel');
            if (panel) {
                if (panel.classList.contains('open')) {
                    panel.classList.remove('open');
                } else {
                    panel.classList.add('open');
                }
            } else {
                // If no settings panel, just alert
                alert("Authenticated! Settings panel not found, but you're logged in.");
            }
        } else {
            // Show login if not logged in
            showLoginModal();
        }
        
        return false;
    }, true);
    
    console.log('[EMERGENCY-AUTH] Gear button fixed');
}

function setupLoginHandlers() {
    // Handle both types of login modals
    
    // For navy-career.html
    const passwordModal = document.getElementById('passwordModal');
    if (passwordModal) {
        // Make sure it's visible in DOM
        passwordModal.style.display = 'none';
        
        // Fix close button
        const closeBtn = passwordModal.querySelector('.close-modal');
        if (closeBtn) {
            closeBtn.onclick = function() {
                passwordModal.style.display = 'none';
            };
        }
        
        // Fix submit button
        const submitBtn = document.getElementById('submitPassword');
        if (submitBtn) {
            submitBtn.onclick = function() {
                const passwordInput = document.getElementById('passwordInput');
                if (passwordInput && passwordInput.value === 'admin1234') {
                    localStorage.setItem('emergency_auth', 'true');
                    passwordModal.style.display = 'none';
                    showAuthenticatedUI();
                    alert('Login successful!');
                } else {
                    alert('Wrong password! Try admin1234');
                }
            };
        }
    }
    
    // For index.html
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        // Make sure it's visible in DOM
        loginModal.style.display = 'none';
        
        // Fix close button
        const closeBtn = loginModal.querySelector('.close-modal');
        if (closeBtn) {
            closeBtn.onclick = function() {
                loginModal.style.display = 'none';
            };
        }
        
        // Fix login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.onsubmit = function(e) {
                e.preventDefault();
                
                const passwordInput = document.getElementById('adminPassword');
                if (passwordInput && passwordInput.value === 'admin1234') {
                    localStorage.setItem('emergency_auth', 'true');
                    loginModal.style.display = 'none';
                    showAuthenticatedUI();
                    alert('Login successful!');
                } else {
                    alert('Wrong password! Try admin1234');
                }
                
                return false;
            };
        }
    }
    
    console.log('[EMERGENCY-AUTH] Login handlers set up');
}

function setupLogoutHandlers() {
    // Set up logout button handlers
    document.querySelectorAll('.logout-btn, #logoutBtn').forEach(function(btn) {
        if (btn) {
            btn.onclick = function(e) {
                e.preventDefault();
                localStorage.removeItem('emergency_auth');
                hideAuthenticatedUI();
                alert('Logged out successfully');
                return false;
            };
        }
    });
    
    console.log('[EMERGENCY-AUTH] Logout handlers set up');
}

function showLoginModal() {
    // Find the right modal for this page
    const passwordModal = document.getElementById('passwordModal');
    const loginModal = document.getElementById('loginModal');
    
    if (passwordModal) {
        passwordModal.style.display = 'block';
        
        // Focus password field
        const passwordInput = document.getElementById('passwordInput');
        if (passwordInput) {
            passwordInput.focus();
            passwordInput.value = ''; // Clear it
        }
    } else if (loginModal) {
        loginModal.style.display = 'block';
        
        // Focus password field
        const passwordInput = document.getElementById('adminPassword');
        if (passwordInput) {
            passwordInput.focus();
            passwordInput.value = ''; // Clear it
        }
    } else {
        // Last resort - just use a prompt
        const password = prompt('Enter admin password (admin1234):');
        if (password === 'admin1234') {
            localStorage.setItem('emergency_auth', 'true');
            showAuthenticatedUI();
            alert('Login successful!');
        } else {
            alert('Wrong password! Try admin1234');
        }
    }
}

function showAuthenticatedUI() {
    // Add authenticated class to body
    document.body.classList.add('authenticated');
    
    // Show admin-only elements
    document.querySelectorAll('.admin-only, .authenticated-only').forEach(function(el) {
        el.style.display = '';
    });
    
    // Hide non-authenticated elements
    document.querySelectorAll('.non-authenticated-only').forEach(function(el) {
        el.style.display = 'none';
    });
    
    console.log('[EMERGENCY-AUTH] Showing authenticated UI');
}

function hideAuthenticatedUI() {
    // Remove authenticated class from body
    document.body.classList.remove('authenticated');
    
    // Hide admin-only elements
    document.querySelectorAll('.admin-only, .authenticated-only').forEach(function(el) {
        el.style.display = 'none';
    });
    
    // Show non-authenticated elements
    document.querySelectorAll('.non-authenticated-only').forEach(function(el) {
        el.style.display = '';
    });
    
    console.log('[EMERGENCY-AUTH] Hiding authenticated UI');
} 