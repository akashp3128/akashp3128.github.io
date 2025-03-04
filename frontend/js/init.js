/**
 * Init.js - Core initialization script for the portfolio site
 * Handles authentication, settings, and site-wide functionality
 */

(function() {
    'use strict';
    
    // Site-wide authentication & settings
    const Auth = {
        // Check if user is authenticated
        isAuthenticated: function() {
            return localStorage.getItem('admin_authenticated') === 'true';
        },
        
        // Login with password
        login: function(password) {
            // Simple password check with the original password
            if (password === 'Rosie@007') {
                localStorage.setItem('admin_authenticated', 'true');
                return true;
            }
            return false;
        },
        
        // Logout
        logout: function() {
            localStorage.removeItem('admin_authenticated');
            document.body.classList.remove('authenticated');
            
            // Hide admin elements
            document.querySelectorAll('.admin-only').forEach(el => {
                el.style.display = 'none';
            });
            
            return true;
        },
        
        // Update UI based on authentication status
        updateUI: function() {
            const isAuthenticated = this.isAuthenticated();
            
            if (isAuthenticated) {
                document.body.classList.add('authenticated');
                
                // Show admin elements
                document.querySelectorAll('.admin-only').forEach(el => {
                    el.style.display = el.tagName.toLowerCase() === 'button' || 
                                     el.tagName.toLowerCase() === 'a' ? 
                                     'inline-block' : 'block';
                });
                
                // Update admin toggle button if it exists
                const adminToggle = document.getElementById('adminToggle');
                if (adminToggle) {
                    adminToggle.classList.add('admin-active');
                }
            } else {
                document.body.classList.remove('authenticated');
                
                // Hide admin elements
                document.querySelectorAll('.admin-only').forEach(el => {
                    el.style.display = 'none';
                });
                
                // Update admin toggle button if it exists
                const adminToggle = document.getElementById('adminToggle');
                if (adminToggle) {
                    adminToggle.classList.remove('admin-active');
                }
            }
        }
    };
    
    // Notifications
    const Notifications = {
        show: function(message, type = 'success', duration = 3000) {
            const notification = document.getElementById('notification');
            const notificationMessage = document.getElementById('notificationMessage');
            
            if (!notification || !notificationMessage) {
                // If notification elements don't exist, create them
                this.createNotificationElement();
                return this.show(message, type, duration);
            }
            
            // Set message and style
            notificationMessage.textContent = message;
            notification.className = 'notification';
            notification.classList.add(type);
            notification.classList.add('visible');
            
            // Auto-hide after duration
            setTimeout(() => {
                notification.classList.remove('visible');
            }, duration);
        },
        
        createNotificationElement: function() {
            // Only create if it doesn't exist
            if (document.getElementById('notification')) return;
            
            const notification = document.createElement('div');
            notification.id = 'notification';
            notification.className = 'notification';
            
            const content = document.createElement('div');
            content.className = 'notification-content';
            
            const message = document.createElement('span');
            message.id = 'notificationMessage';
            
            content.appendChild(message);
            notification.appendChild(content);
            document.body.appendChild(notification);
        }
    };
    
    // Make Notifications available globally
    window.Notifications = Notifications;
    
    // Settings Panel Manager
    const SettingsManager = {
        init: function() {
            // Get elements
            this.adminToggle = document.getElementById('adminToggle');
            this.settingsPanel = document.getElementById('settingsPanel');
            this.closeSettings = document.getElementById('closeSettings');
            
            // Setup event listeners if elements exist
            if (this.adminToggle) {
                this.adminToggle.addEventListener('click', () => {
                    if (Auth.isAuthenticated()) {
                        this.togglePanel();
                    } else {
                        this.showLoginModal();
                    }
                });
            }
            
            if (this.closeSettings) {
                this.closeSettings.addEventListener('click', () => this.togglePanel());
            }
            
            // Setup settings button handlers
            this.setupSettingsButtons();
            
            // Create settings panel if it doesn't exist
            if (!this.settingsPanel) {
                this.createSettingsPanel();
            }
        },
        
        togglePanel: function() {
            if (this.settingsPanel) {
                this.settingsPanel.classList.toggle('visible');
            }
        },
        
        showLoginModal: function() {
            const passwordModal = document.getElementById('passwordModal');
            if (passwordModal) {
                passwordModal.style.display = 'block';
                const passwordInput = document.getElementById('passwordInput');
                if (passwordInput) passwordInput.focus();
            }
        },
        
        setupSettingsButtons: function() {
            // Edit About
            const editAboutBtn = document.getElementById('settingsEditAbout');
            if (editAboutBtn) {
                editAboutBtn.addEventListener('click', () => {
                    const editAboutModal = document.getElementById('editAboutModal');
                    if (editAboutModal) {
                        // Load content into editor if it's the navy page
                        const aboutTextEditor = document.getElementById('aboutTextEditor');
                        const navyAboutContent = document.getElementById('navyAboutContent');
                        
                        if (aboutTextEditor && navyAboutContent) {
                            aboutTextEditor.innerHTML = navyAboutContent.innerHTML;
                        }
                        
                        editAboutModal.style.display = 'block';
                        this.togglePanel();
                    }
                });
            }
            
            // Upload Profile
            const uploadProfileBtn = document.getElementById('settingsUploadProfile');
            if (uploadProfileBtn) {
                uploadProfileBtn.addEventListener('click', () => {
                    const profileImageModal = document.getElementById('profileImageModal');
                    if (profileImageModal) {
                        profileImageModal.style.display = 'block';
                        this.togglePanel();
                    }
                });
            }
            
            // Upload Evaluation
            const uploadEvalBtn = document.getElementById('settingsUploadEval');
            if (uploadEvalBtn) {
                uploadEvalBtn.addEventListener('click', () => {
                    const uploadEvalModal = document.getElementById('uploadEvalModal');
                    if (uploadEvalModal) {
                        uploadEvalModal.style.display = 'block';
                        this.togglePanel();
                    }
                });
            }
            
            // Logout
            const logoutBtn = document.getElementById('settingsLogout');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => {
                    Auth.logout();
                    this.togglePanel();
                    Notifications.show('You have been logged out', 'success');
                });
            }
        },
        
        createSettingsPanel: function() {
            // Only create if it doesn't exist
            if (document.getElementById('settingsPanel')) return;
            
            const panel = document.createElement('div');
            panel.id = 'settingsPanel';
            panel.className = 'settings-panel';
            
            panel.innerHTML = `
                <div class="settings-header">
                    <h3>Admin Settings</h3>
                    <button id="closeSettings" class="close-settings">&times;</button>
                </div>
                <div class="settings-content">
                    <div class="settings-section">
                        <h4>Content</h4>
                        <button id="settingsEditAbout" class="settings-btn">Edit About Section</button>
                        <button id="settingsUploadProfile" class="settings-btn">Upload Profile Photo</button>
                    </div>
                    <div class="settings-section">
                        <h4>Account</h4>
                        <button id="settingsLogout" class="settings-btn logout-btn">Logout</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(panel);
            
            // Re-initialize after creating
            this.settingsPanel = panel;
            this.closeSettings = panel.querySelector('#closeSettings');
            
            if (this.closeSettings) {
                this.closeSettings.addEventListener('click', () => this.togglePanel());
            }
            
            // Setup the buttons in the newly created panel
            this.setupSettingsButtons();
        }
    };
    
    // Modal Manager
    const ModalManager = {
        init: function() {
            // Setup close buttons
            document.querySelectorAll('.close-modal').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const modal = e.target.closest('.modal');
                    if (modal) {
                        modal.style.display = 'none';
                    }
                });
            });
            
            // Close on outside click
            window.addEventListener('click', (e) => {
                if (e.target.classList.contains('modal')) {
                    e.target.style.display = 'none';
                }
            });
            
            // Initialize login modal handlers
            this.setupLoginModal();
        },
        
        setupLoginModal: function() {
            const submitPassword = document.getElementById('submitPassword');
            const passwordInput = document.getElementById('passwordInput');
            const passwordModal = document.getElementById('passwordModal');
            
            if (submitPassword && passwordInput) {
                // Login button click handler
                submitPassword.addEventListener('click', () => {
                    this.handleLogin(passwordInput, passwordModal);
                });
                
                // Enter key handler
                passwordInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.handleLogin(passwordInput, passwordModal);
                    }
                });
            }
        },
        
        handleLogin: function(passwordInput, passwordModal) {
            if (!passwordInput) return;
            
            const password = passwordInput.value;
            
            if (!password) {
                Notifications.show('Please enter a password', 'error');
                return;
            }
            
            if (Auth.login(password)) {
                // Success
                if (passwordModal) passwordModal.style.display = 'none';
                if (passwordInput) passwordInput.value = '';
                
                // Update UI
                Auth.updateUI();
                
                Notifications.show('Login successful!', 'success');
            } else {
                // Failed
                Notifications.show('Incorrect password', 'error');
            }
        }
    };
    
    // Initialize everything when the DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Initializing site core functionality');
        
        // Initialize notifications first so they're available
        Notifications.createNotificationElement();
        
        // Check authentication status and update UI
        Auth.updateUI();
        
        // Initialize settings panel
        SettingsManager.init();
        
        // Initialize modals
        ModalManager.init();
        
        console.log('Core initialization complete');
    });
})(); 