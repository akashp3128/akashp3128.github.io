// DOM is ready event handling - improved to ensure it runs
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeComponents);
} else {
    // DOMContentLoaded has already fired
    initializeComponents();
}

function initializeComponents() {
    console.log('[akash] Initializing components immediately...');
    
    // Initialize SettingsManager
    if (SettingsManager && typeof SettingsManager.init === 'function') {
        SettingsManager.init();
    } else {
        console.error('[akash] SettingsManager not available');
        // Emergency fallback
        setupEmergencySettingsButton();
    }
    
    // Initialize API
    if (window.API) {
        console.log('[akash] Dispatching api-ready event');
        document.dispatchEvent(new CustomEvent('api-ready', { detail: window.API }));
    } else {
        console.log('[akash] API not available yet');
    }
}

function setupEmergencySettingsButton() {
    console.log('[akash] Setting up emergency settings button');
    
    // Find or create settings button
    let settingsBtn = document.querySelector('.settings-toggle');
    if (!settingsBtn) {
        settingsBtn = document.createElement('button');
        settingsBtn.className = 'settings-toggle';
        settingsBtn.setAttribute('aria-label', 'Settings');
        settingsBtn.innerHTML = '⚙️';
        document.body.appendChild(settingsBtn);
    }
    
    // Force visible
    settingsBtn.style.display = 'flex';
    settingsBtn.style.position = 'fixed';
    settingsBtn.style.bottom = '20px';
    settingsBtn.style.right = '20px';
    settingsBtn.style.zIndex = '9999';
    
    // Add click handler
    settingsBtn.addEventListener('click', function(e) {
        console.log('[akash] Emergency settings button clicked');
        e.preventDefault();
        
        // Check auth
        const isAuthenticated = localStorage.getItem('authenticated') === 'true';
        
        if (!isAuthenticated) {
            // Show login form
            const loginModal = document.getElementById('loginModal');
            if (loginModal) {
                loginModal.style.display = 'flex';
                loginModal.classList.add('show');
            } else {
                alert('Please login with password: admin1234');
            }
        } else {
            // Toggle settings panel
            const panel = document.querySelector('.settings-panel');
            if (panel) {
                panel.classList.toggle('open');
            } else {
                alert('Settings panel is not available');
            }
        }
    });
    
    // Set up login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const passwordInput = document.getElementById('adminPassword');
            if (passwordInput && passwordInput.value === 'admin1234') {
                localStorage.setItem('authenticated', 'true');
                document.body.classList.add('authenticated');
                
                // Close login modal
                const loginModal = document.getElementById('loginModal');
                if (loginModal) {
                    loginModal.style.display = 'none';
                    loginModal.classList.remove('show');
                }
                
                // Update UI
                document.querySelectorAll('.authenticated-only').forEach(el => {
                    el.style.display = '';
                });
                
                document.querySelectorAll('.non-authenticated-only').forEach(el => {
                    el.style.display = 'none';
                });
                
                // Show settings panel
                const panel = document.querySelector('.settings-panel');
                if (panel) {
                    panel.classList.add('open');
                }
                
                // Show notification
                showSimpleNotification('Login successful!', 'success');
            } else {
                showSimpleNotification('Invalid password!', 'error');
            }
        });
    }
    
    // Setup settings panel button handlers
    document.querySelectorAll('#settingsEditCard, #settingsUploadImage, #settingsUploadResume').forEach(btn => {
        if (btn) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Close settings panel
                const panel = document.querySelector('.settings-panel');
                if (panel) {
                    panel.classList.remove('open');
                }
                
                // Scroll to appropriate section
                if (this.id === 'settingsEditCard') {
                    scrollToSectionEmergency('#adminPanel');
                } else if (this.id === 'settingsUploadImage') {
                    scrollToSectionEmergency('#imageUploadArea');
                } else if (this.id === 'settingsUploadResume') {
                    scrollToSectionEmergency('#uploadArea');
                }
            });
        }
    });
    
    // Logout button handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            localStorage.removeItem('authenticated');
            document.body.classList.remove('authenticated');
            
            // Update UI
            document.querySelectorAll('.authenticated-only').forEach(el => {
                el.style.display = 'none';
            });
            
            document.querySelectorAll('.non-authenticated-only').forEach(el => {
                el.style.display = '';
            });
            
            // Close settings panel
            const panel = document.querySelector('.settings-panel');
            if (panel) {
                panel.classList.remove('open');
            }
            
            showSimpleNotification('Logged out successfully', 'success');
        });
    }
    
    // Close settings panel button
    const closeBtn = document.querySelector('.settings-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            const panel = document.querySelector('.settings-panel');
            if (panel) {
                panel.classList.remove('open');
            }
        });
    }
}

function scrollToSectionEmergency(selector) {
    const element = document.querySelector(selector);
    if (element) {
        const offset = -100; // Adjust based on UI needs
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset + offset;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

function showSimpleNotification(message, type = 'info', duration = 3000) {
    console.log(`[akash] Notification: ${message} (${type})`);
    
    // Find or create notification element
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.className = 'notification';
        document.body.appendChild(notification);
    }
    
    // Setup notification
    notification.textContent = message;
    notification.className = `notification ${type}`;
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Hide after duration
    setTimeout(() => {
        notification.classList.remove('show');
    }, duration);
} 