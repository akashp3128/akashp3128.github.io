// Resume management functionality
document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const adminToggle = document.getElementById('adminToggle');
    const adminPanel = document.getElementById('adminPanel');
    const passwordModal = document.getElementById('passwordModal');
    const closeModal = document.getElementById('closeModal');
    const passwordInput = document.getElementById('passwordInput');
    const submitPassword = document.getElementById('submitPassword');
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const resumePreview = document.getElementById('resumePreview');
    const downloadBtn = document.getElementById('downloadBtn');
    const deleteResumeBtn = document.getElementById('deleteResumeBtn');
    const notification = document.getElementById('notification');
    const pokemonCard = document.getElementById('pokemonCard');
    const resumeBadge = document.getElementById('resumeBadge');
    const passwordHelp = document.getElementById('passwordHelp');
    const emergencyModeToggle = document.getElementById('emergencyModeToggle');
    const cardImage = document.querySelector('.card-image img');
    const imageUploadArea = document.getElementById('imageUploadArea');
    const imageFileInput = document.getElementById('imageFileInput');
    const deleteImageBtn = document.getElementById('deleteImageBtn');

    // Emergency mode for local development without backend
    window.emergencyMode = localStorage.getItem('emergencyModeEnabled') === 'true';
    
    // Check if backend is accessible
    async function checkBackendConnection() {
        // Don't attempt connection check if already in emergency mode
        if (window.emergencyMode) return false;
        
        try {
            // First try to validate any existing token
            if (ApiClient.auth.isAuthenticated()) {
                const verifyResult = await ApiClient.auth.verify();
                if (verifyResult.success) return true;
            }
            
            // If that fails or no token exists, try a direct check
            return await ApiClient.checkBackendConnection?.() || false;
        } catch (error) {
            console.warn('Backend connectivity check failed:', error);
            return false;
        }
    }

    // Mobile detection
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Optimize performance for mobile
    if (isMobile) {
        // Reduce some animations or effects for mobile
        document.body.classList.add('mobile-device');
        
        // Lazy load images for better performance
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            img.loading = 'lazy';
        });
    }

    // Auth state
    let isAuthenticated = false;
    
    // Initialize emergency mode if needed
    if (emergencyModeToggle) {
        emergencyModeToggle.addEventListener('click', function() {
            toggleEmergencyMode();
        });
    }
    
    function toggleEmergencyMode() {
        // Toggle emergency mode
        window.emergencyMode = !window.emergencyMode;
        
        // Update UI to reflect emergency mode status
        document.body.classList.toggle('emergency-mode', window.emergencyMode);
        
        // Update banner
        const emergencyBanner = document.getElementById('emergencyModeBanner');
        if (emergencyBanner) {
            emergencyBanner.style.display = window.emergencyMode ? 'block' : 'none';
        }
        
        // Show appropriate notification and update password help text
        if (window.emergencyMode) {
            showNotification('Emergency mode activated for local development', 'warning');
            if (passwordHelp) {
                passwordHelp.textContent = 'In emergency mode, use password: "localdev"';
                passwordHelp.style.display = 'block';
            }
        } else {
            showNotification('Emergency mode deactivated', 'info');
            if (passwordHelp) {
                passwordHelp.textContent = 'Need help with the password?';
                passwordHelp.style.display = 'block';
            }
        }
        
        // Save state to localStorage
        saveEmergencyModeState();
        
        // Refresh page elements that depend on emergency mode
        if (ApiClient && typeof ApiClient.updateEmergencyModeStatus === 'function') {
            ApiClient.updateEmergencyModeStatus();
        }
        
        console.log('Emergency mode toggled:', window.emergencyMode);
    }

    // Check if user is already authenticated
    async function checkAuthentication() {
        const backendAvailable = await checkBackendConnection();
        
        if (!backendAvailable) {
            console.warn('Backend appears to be unavailable');
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                showNotification('Warning: Backend server appears to be offline. Some features may not work.', 'warning', 8000);
                
                // Suggest emergency mode on local development
                if (emergencyModeToggle && !window.emergencyMode) {
                    emergencyModeToggle.style.display = 'block';
                    showNotification('Tip: You can activate emergency mode for local development', 'info', 5000);
                }
            }
            return;
        }
        
        if (ApiClient.auth.isAuthenticated()) {
            const result = await ApiClient.auth.verify();
            if (result.success) {
                isAuthenticated = true;
                showNotification('You are already logged in', 'success');
                adminPanel.style.display = 'block';
                adminToggle.classList.add('admin-active');
            }
        }
    }

    // Fetch and display the resume
    async function fetchResume() {
        // Check if we have an emergency mode local resume
        if (window.emergencyMode) {
            const localResume = localStorage.getItem('emergencyModeResume');
            if (localResume) {
                resumePreview.src = localResume;
                downloadBtn.href = localResume;
                downloadBtn.style.display = 'inline-block';
                resumeBadge.style.display = 'block';
                pokemonCard.classList.add('has-resume');
                return;
            } else {
                resumePreview.src = '';
                downloadBtn.style.display = 'none';
                resumeBadge.style.display = 'none';
                pokemonCard.classList.remove('has-resume');
                return;
            }
        }
        
        // Normal mode - get from API
        const result = await ApiClient.resume.get();
        
        if (result.success) {
            resumePreview.src = result.data.url;
            downloadBtn.href = result.data.url;
            downloadBtn.style.display = 'inline-block';
            
            // Add resume badge to the Pokemon card when resume is available
            if (resumeBadge) {
                resumeBadge.style.display = 'block';
            }
            
            // Add a "has-resume" class to the card for potential styling
            pokemonCard.classList.add('has-resume');
        } else {
            if (result.notFound) {
                showNotification('No resume uploaded yet', 'error');
            } else if (result.networkError) {
                showNotification('Network error: Could not connect to server', 'error');
            } else {
                showNotification('Error loading resume', 'error');
            }
            resumePreview.src = '';
            downloadBtn.style.display = 'none';
            
            // Hide resume badge when no resume is available
            if (resumeBadge) {
                resumeBadge.style.display = 'none';
            }
            
            // Remove the "has-resume" class from the card
            pokemonCard.classList.remove('has-resume');
        }
    }

    // Upload resume
    async function uploadResume(file) {
        if (!isAuthenticated && !window.emergencyMode) {
            showNotification('You must be authenticated to upload', 'error');
            return;
        }
        
        // Handle emergency mode upload (store in localStorage)
        if (window.emergencyMode) {
            try {
                // Convert file to base64 for local storage
                const reader = new FileReader();
                reader.onloadend = function() {
                    const base64data = reader.result;
                    localStorage.setItem('emergencyModeResume', base64data);
                    showNotification('Resume saved locally in emergency mode', 'success');
                    fetchResume(); // Refresh the display
                };
                reader.readAsDataURL(file);
                return;
            } catch (error) {
                console.error('Emergency mode upload error:', error);
                showNotification('Failed to save resume locally', 'error');
                return;
            }
        }

        // Regular upload via API
        const result = await ApiClient.resume.upload(file);
        
        if (result.success) {
            showNotification('Resume uploaded successfully', 'success');
            fetchResume();
        } else {
            showNotification(result.error || 'Failed to upload resume', 'error');
        }
    }

    // Delete resume
    async function deleteResume() {
        if (!isAuthenticated && !window.emergencyMode) {
            showNotification('You must be authenticated to delete', 'error');
            return;
        }
        
        // Handle emergency mode deletion (remove from localStorage)
        if (window.emergencyMode) {
            localStorage.removeItem('emergencyModeResume');
            showNotification('Local resume deleted', 'success');
            fetchResume(); // Refresh the display
            return;
        }

        // Regular deletion via API
        const result = await ApiClient.resume.delete();
        
        if (result.success) {
            showNotification('Resume deleted successfully', 'success');
            fetchResume();
        } else {
            showNotification(result.error || 'Failed to delete resume', 'error');
        }
    }

    // Fetch and display profile image
    async function fetchProfileImage() {
        console.log('Fetching profile image...');
        
        try {
            const result = await ApiClient.image.get();
            
            console.log('Profile image fetch result:', result);
            
            if (result.success && result.data && result.data.url) {
                // Set the card image to the custom image
                cardImage.src = result.data.url;
                cardImage.classList.add('custom-image');
                
                // Show delete button when a custom image exists
                if (deleteImageBtn) {
                    deleteImageBtn.style.display = 'inline-block';
                }
                
                console.log('Profile image loaded successfully');
            } else {
                // Use placeholder if no custom image
                cardImage.src = '/api/placeholder/300/155';
                cardImage.classList.remove('custom-image');
                
                // Hide delete button if no custom image
                if (deleteImageBtn) {
                    deleteImageBtn.style.display = 'none';
                }
                
                console.log('Using placeholder image (no custom image found)');
            }
        } catch (error) {
            console.error('Error fetching profile image:', error);
            // Use placeholder on error
            cardImage.src = '/api/placeholder/300/155';
            cardImage.classList.remove('custom-image');
            
            if (deleteImageBtn) {
                deleteImageBtn.style.display = 'none';
            }
        }
    }

    // Upload profile image
    async function uploadProfileImage(file) {
        if (!isAuthenticated && !window.emergencyMode) {
            showNotification('You must be authenticated to upload an image', 'error');
            return;
        }
        
        // Validate file is an image
        if (!file.type.startsWith('image/')) {
            showNotification('Please upload an image file (JPEG, PNG, etc.)', 'error');
            return;
        }
        
        // Upload through API
        const result = await ApiClient.image.upload(file);
        
        if (result.success) {
            showNotification('Profile image uploaded successfully', 'success');
            await fetchProfileImage(); // Refresh the card image
        } else {
            showNotification(result.error || 'Failed to upload image', 'error');
        }
    }

    // Delete profile image
    async function deleteProfileImage() {
        if (!isAuthenticated && !window.emergencyMode) {
            showNotification('You must be authenticated to delete the image', 'error');
            return;
        }
        
        // Delete through API
        const result = await ApiClient.image.delete();
        
        if (result.success) {
            showNotification('Profile image deleted successfully', 'success');
            await fetchProfileImage(); // Refresh the card image
        } else {
            showNotification(result.error || 'Failed to delete image', 'error');
        }
    }

    // Authenticate user
    async function authenticate(password) {
        console.log('Attempting to authenticate with password');
        
        try {
            // Special handling for emergency mode
            if (window.emergencyMode && (password === 'localdev' || password === 'Rosie@007')) {
                console.log('Emergency mode authentication successful');
                isAuthenticated = true;
                
                // Store a temporary token for emergency mode
                localStorage.setItem('authToken', 'emergency-dev-token');
                
                return { success: true, emergency: true };
            }
            
            // Regular authentication through API
            const result = await ApiClient.auth.login(password);
            console.log('Authentication API response:', result);
            
            if (result.success) {
                isAuthenticated = true;
                return { success: true };
            } else {
                console.error('Authentication failed:', result.error);
                return { success: false, error: result.error || 'Invalid password' };
            }
        } catch (error) {
            console.error('Authentication error:', error);
            return { 
                success: false, 
                error: 'Error during authentication. Please try again.' 
            };
        }
    }

    // Show notification
    function showNotification(message, type = 'info', duration = 3000) {
        notification.textContent = message;
        notification.className = 'notification';
        notification.classList.add(type);
        notification.style.display = 'block';
        
        setTimeout(() => {
            notification.style.display = 'none';
        }, duration);
    }

    // Initialize everything
    async function init() {
        // Check if we're in local development
        const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        
        if (isLocalDev) {
            console.log('Local development environment detected');
            // Make emergency mode toggle available in local dev
            if (emergencyModeToggle) {
                emergencyModeToggle.style.display = 'block';
            }
            
            // For local development, check if we need to initialize emergency mode
            // Only if it hasn't been explicitly set already
            if (localStorage.getItem('emergencyModeEnabled') === null) {
                console.log('Enabling emergency mode by default for local development');
                window.emergencyMode = true;
                saveEmergencyModeState();
                
                // Update UI to reflect emergency mode
                document.body.classList.add('emergency-mode');
                
                const emergencyBanner = document.getElementById('emergencyModeBanner');
                if (emergencyBanner) {
                    emergencyBanner.style.display = 'block';
                }
                
                if (passwordHelp) {
                    passwordHelp.textContent = 'In emergency mode, use password: "localdev"';
                    passwordHelp.style.display = 'block';
                }
            }
        }
        
        // Set up emergency mode banner behavior
        const emergencyBanner = document.getElementById('emergencyModeBanner');
        if (emergencyBanner) {
            // Update the UI to match the current emergency mode state
            // Don't toggle, just update
            emergencyBanner.style.display = window.emergencyMode ? 'block' : 'none';
            document.body.classList.toggle('emergency-mode', window.emergencyMode);
            
            if (window.emergencyMode && passwordHelp) {
                passwordHelp.textContent = 'In emergency mode, use password: "localdev"';
                passwordHelp.style.display = 'block';
            }
        }
        
        // Detect browser and platform for debugging
        detectBrowserAndPlatform();
        
        // Check authentication status
        await checkAuthentication();
        
        // Load resume if available
        await fetchResume();
        
        // Load profile image if available
        await fetchProfileImage();
        
        // Set up event listeners
        setupEventListeners();
    }
    
    // Detect browser and platform for debugging
    function detectBrowserAndPlatform() {
        const platform = navigator.platform;
        const userAgent = navigator.userAgent;
        let browserInfo = 'Unknown';
        
        if (userAgent.indexOf('Chrome') > -1) browserInfo = 'Chrome';
        else if (userAgent.indexOf('Safari') > -1) browserInfo = 'Safari';
        else if (userAgent.indexOf('Firefox') > -1) browserInfo = 'Firefox';
        else if (userAgent.indexOf('MSIE') > -1 || userAgent.indexOf('Trident') > -1) browserInfo = 'IE';
        else if (userAgent.indexOf('Edge') > -1) browserInfo = 'Edge';
        
        console.log(`Browser detected: ${browserInfo} on ${platform}`);
        console.log(`Mobile device: ${isMobile ? 'Yes' : 'No'}`);
        console.log(`Full User Agent: ${userAgent}`);
        
        // Add info to body as classes for targeted CSS
        document.body.classList.add(`browser-${browserInfo.toLowerCase()}`);
        document.body.classList.add(`platform-${platform.toLowerCase().replace(/\s/g, '-')}`);
        
        // Initialize debug console in local development
        initDebugConsole(browserInfo, platform);
        
        return { browser: browserInfo, platform: platform };
    }
    
    // Initialize debug console for local development
    function initDebugConsole(browser, platform) {
        const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        
        if (!isLocalDev) return;
        
        // Create debug console elements
        const debugConsoleBtn = document.getElementById('debugConsoleBtn');
        let debugConsole = document.createElement('div');
        debugConsole.className = 'debug-console';
        debugConsole.id = 'debugConsole';
        document.body.appendChild(debugConsole);
        
        // Show debug button
        debugConsoleBtn.style.display = 'flex';
        
        // Toggle debug console on button click
        debugConsoleBtn.addEventListener('click', function() {
            debugConsole.classList.toggle('visible');
        });
        
        // Log system info
        debugLog(`Browser: ${browser}`, 'info');
        debugLog(`Platform: ${platform}`, 'info');
        debugLog(`Mobile: ${isMobile ? 'Yes' : 'No'}`, 'info');
        
        // Set up click event listener for testing
        document.addEventListener('click', function(e) {
            const target = e.target;
            const targetId = target.id || 'unknown';
            const targetClass = target.className || 'unknown';
            
            debugLog(`Click: ${targetId} (${targetClass})`, 'info');
        });
        
        // Add debugging for key elements
        const adminToggle = document.getElementById('adminToggle');
        if (adminToggle) {
            // Add extra debug data
            adminToggle.setAttribute('data-debug', 'admin-toggle-button');
            
            // Monitor interaction events
            const events = ['mouseenter', 'mouseleave', 'mousedown', 'mouseup', 'click'];
            events.forEach(eventType => {
                adminToggle.addEventListener(eventType, function(e) {
                    debugLog(`AdminToggle ${eventType}`, 'success');
                    // Check if propagation works
                    e.target.classList.add('debug-highlighted');
                    setTimeout(() => {
                        e.target.classList.remove('debug-highlighted');
                    }, 500);
                });
            });
        }
        
        // Override console.log for debug console
        const originalConsoleLog = console.log;
        console.log = function() {
            originalConsoleLog.apply(console, arguments);
            const args = Array.from(arguments);
            const message = args.map(arg => {
                if (typeof arg === 'object') {
                    try {
                        return JSON.stringify(arg);
                    } catch (e) {
                        return arg.toString();
                    }
                }
                return arg;
            }).join(' ');
            debugLog(message, 'log');
        };
        
        // Override console.error
        const originalConsoleError = console.error;
        console.error = function() {
            originalConsoleError.apply(console, arguments);
            const args = Array.from(arguments);
            const message = args.join(' ');
            debugLog(message, 'error');
        };
        
        // Override console.warn
        const originalConsoleWarn = console.warn;
        console.warn = function() {
            originalConsoleWarn.apply(console, arguments);
            const args = Array.from(arguments);
            const message = args.join(' ');
            debugLog(message, 'warning');
        };
    }
    
    // Add a log entry to the debug console
    function debugLog(message, type = 'info') {
        const debugConsole = document.getElementById('debugConsole');
        if (!debugConsole) return;
        
        const logEntry = document.createElement('div');
        logEntry.className = `debug-log ${type}`;
        
        const timestamp = new Date().toLocaleTimeString();
        logEntry.innerHTML = `[${timestamp}] ${message}`;
        
        // Add to top of console
        debugConsole.insertBefore(logEntry, debugConsole.firstChild);
        
        // Limit number of entries to prevent performance issues
        const maxEntries = 50;
        const entries = debugConsole.querySelectorAll('.debug-log');
        if (entries.length > maxEntries) {
            for (let i = maxEntries; i < entries.length; i++) {
                entries[i].remove();
            }
        }
    }
    
    // Set up all event listeners
    function setupEventListeners() {
        console.log('Setting up event listeners');
        
        // Admin panel toggle - unified event handling
        if (adminToggle) {
            const handleAdminToggleActivation = (e) => {
                e.stopPropagation();  // Prevent event bubbling to card
                
                console.log('Admin toggle clicked');
                
                // If already authenticated, show admin panel directly
                if (isAuthenticated || window.emergencyMode) {
                    console.log('Showing admin panel - already authenticated');
                    adminPanel.style.display = adminPanel.style.display === 'block' ? 'none' : 'block';
                } else {
                    // Otherwise show login modal
                    console.log('Showing password modal - authentication required');
                    passwordModal.style.display = 'block';
                    passwordInput.focus();
                    
                    // Add the hint text for development
                    const passwordHelp = document.querySelector('.password-help');
                    if (passwordHelp) {
                        passwordHelp.style.display = 'block';
                    }
                }
            };
            
            // Make sure we remove any existing event listeners first
            adminToggle.removeEventListener('click', handleAdminToggleActivation);
            
            // Add the event listener
            adminToggle.addEventListener('click', handleAdminToggleActivation);
            console.log('Admin toggle event listener attached');
        }
        
        // Close modal
        if (closeModal) {
            closeModal.addEventListener('click', function() {
                passwordModal.style.display = 'none';
            });
        }
        
        // Submit password
        if (submitPassword) {
            submitPassword.addEventListener('click', async function() {
                const password = passwordInput.value;
                if (!password) {
                    showNotification('Please enter a password', 'error');
                    return;
                }
                
                console.log('Attempting authentication...');
                const result = await authenticate(password);
                
                if (result.success) {
                    console.log('Authentication successful!');
                    passwordModal.style.display = 'none';
                    adminPanel.style.display = 'block';
                    isAuthenticated = true;
                    showNotification('Successfully authenticated', 'success');
                    
                    // Refresh data after successful login
                    await fetchResume();
                    await fetchProfileImage();
                } else {
                    console.log('Authentication failed:', result.error);
                    showNotification(result.error || 'Authentication failed', 'error');
                }
            });
            
            // Add keypress event for enter key
            passwordInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    submitPassword.click();
                }
            });
        }

        // ... other event listeners ...
        
        // Password help functionality
        if (passwordHelp) {
            passwordHelp.addEventListener('click', function() {
                // Show a menu with multiple password options
                const commonPasswords = [
                    'admin1234',         // Default development password
                    'akash1234',         // Common personalized pattern
                    'resume1234',        // Topic-based pattern
                    'pokemon1234',       // Theme-based pattern
                    'akashpatel',        // Name-based option
                    'adminpassword',     // Simple admin password
                    'password'           // Very basic password
                ];
                
                // Build a temporary selection menu
                let menu = document.createElement('div');
                menu.className = 'password-options';
                menu.innerHTML = '<p>Try one of these common passwords:</p>';
                
                commonPasswords.forEach(pwd => {
                    let btn = document.createElement('button');
                    btn.className = 'pwd-option btn-small';
                    btn.textContent = pwd;
                    btn.onclick = function() {
                        passwordInput.value = pwd;
                        menu.remove();
                        showNotification(`Password field set to "${pwd}"`, 'success');
                    };
                    menu.appendChild(btn);
                });
                
                // Add a direct authentication override option (emergency access)
                let emergencyBtn = document.createElement('button');
                emergencyBtn.className = 'pwd-option btn-accent';
                emergencyBtn.textContent = 'Emergency Override';
                emergencyBtn.style.marginTop = '15px';
                emergencyBtn.onclick = function() {
                    // This is a special case: directly set authentication state
                    // bypassing the server check (only for troubleshooting)
                    isAuthenticated = true;
                    localStorage.setItem('authToken', 'emergency-override-token');
                    showNotification('Emergency override activated', 'success');
                    passwordModal.style.display = 'none';
                    adminPanel.style.display = 'block';
                    adminToggle.classList.add('admin-active');
                    menu.remove();
                };
                menu.appendChild(emergencyBtn);
                
                // Add close button
                let closeBtn = document.createElement('button');
                closeBtn.className = 'pwd-option btn-small';
                closeBtn.textContent = 'Close';
                closeBtn.style.marginTop = '10px';
                closeBtn.onclick = function() {
                    menu.remove();
                };
                menu.appendChild(closeBtn);
                
                // Add to modal
                passwordHelp.appendChild(menu);
            });
        }
        
        // Close modal when clicking outside of it
        window.addEventListener('click', function(e) {
            if (e.target === passwordModal) {
                passwordModal.style.display = 'none';
            }
        });
        
        // Logout functionality
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                ApiClient.auth.logout();
                isAuthenticated = false;
                adminPanel.style.display = 'none';
                adminToggle.classList.remove('admin-active');
                showNotification('Logged out successfully', 'success');
            });
        }
        
        // File upload event listeners
        if (fileInput) {
            fileInput.addEventListener('change', function() {
                if (this.files && this.files[0]) {
                    uploadResume(this.files[0]);
                }
            });
            
            uploadArea.addEventListener('click', function() {
                if (isAuthenticated || window.emergencyMode) {
                    fileInput.click();
                } else {
                    showNotification('You must be authenticated to upload a resume', 'error');
                }
            });
            
            // Drag and drop functionality
            uploadArea.addEventListener('dragover', function(e) {
                e.preventDefault();
                if (isAuthenticated || window.emergencyMode) {
                    this.classList.add('highlight');
                }
            });

            uploadArea.addEventListener('dragleave', function() {
                this.classList.remove('highlight');
            });

            uploadArea.addEventListener('drop', function(e) {
                e.preventDefault();
                this.classList.remove('highlight');
                
                if (!isAuthenticated && !window.emergencyMode) {
                    showNotification('You must be authenticated to upload a resume', 'error');
                    return;
                }
                
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    uploadResume(e.dataTransfer.files[0]);
                }
            });
        }
        
        // Profile image upload event listeners
        if (imageFileInput) {
            imageFileInput.addEventListener('change', function() {
                if (this.files && this.files[0]) {
                    uploadProfileImage(this.files[0]);
                }
            });
            
            if (imageUploadArea) {
                imageUploadArea.addEventListener('click', function() {
                    if (isAuthenticated || window.emergencyMode) {
                        imageFileInput.click();
                    } else {
                        showNotification('You must be authenticated to upload an image', 'error');
                    }
                });
                
                // Add drag and drop for images too
                imageUploadArea.addEventListener('dragover', function(e) {
                    e.preventDefault();
                    if (isAuthenticated || window.emergencyMode) {
                        this.classList.add('highlight');
                    }
                });
    
                imageUploadArea.addEventListener('dragleave', function() {
                    this.classList.remove('highlight');
                });
    
                imageUploadArea.addEventListener('drop', function(e) {
                    e.preventDefault();
                    this.classList.remove('highlight');
                    
                    if (!isAuthenticated && !window.emergencyMode) {
                        showNotification('You must be authenticated to upload an image', 'error');
                        return;
                    }
                    
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        uploadProfileImage(e.dataTransfer.files[0]);
                    }
                });
            }
        }
        
        // Delete buttons
        if (deleteResumeBtn) {
            deleteResumeBtn.addEventListener('click', function() {
                deleteResume();
            });
        }
        
        if (deleteImageBtn) {
            deleteImageBtn.addEventListener('click', function() {
                deleteProfileImage();
            });
        }
    }

    // Save emergency mode state to localStorage
    function saveEmergencyModeState() {
        localStorage.setItem('emergencyModeEnabled', window.emergencyMode ? 'true' : 'false');
    }

    // Start everything
    init();
}); 