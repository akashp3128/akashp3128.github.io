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
    const logoutBtn = document.getElementById('logoutBtn');

    // Check if elements exist
    if (!adminToggle) console.error('Admin toggle button not found');
    if (!passwordModal) console.error('Password modal not found');
    if (!submitPassword) console.error('Submit password button not found');
    if (!closeModal) console.error('Close modal button not found');

    // Global variable to track emergency mode status
    window.emergencyMode = false;

    // Function to update emergency mode status based on localStorage and connectivity
    function updateEmergencyModeStatus() {
        const storedEmergencyMode = localStorage.getItem('emergencyModeEnabled');
        if (storedEmergencyMode === 'true') {
            window.emergencyMode = true;
            console.log('Emergency mode enabled from localStorage');
        }
    }

    // Initialize emergency mode from localStorage on page load
    updateEmergencyModeStatus();

    // Check if the backend connection is working
    async function checkBackendConnection() {
        // Read emergency mode status first
        updateEmergencyModeStatus();
        
        // If we're already in emergency mode, don't bother checking
        if (window.emergencyMode) {
            console.log('Already in emergency mode. Skipping backend connection check.');
            return false;
        }
        
        try {
            // Set a timeout in case the server doesn't respond
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            // Define the API base URL for health check
            const API_BASE_URL = 'http://localhost:3000';
            
            // Attempt to connect to the backend health endpoint
            console.log('Checking backend connection...');
            const response = await fetch(`${API_BASE_URL}/health`, {
                method: 'GET',
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json',
                    'Origin': window.location.origin
                }
            });
            
            // Clear the timeout
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`Backend health check failed with status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Backend connection successful:', data);
            
            // If we successfully connected, we're not in emergency mode
            window.emergencyMode = false;
            localStorage.setItem('emergencyModeEnabled', 'false');
            
            return true;
        } catch (error) {
            console.error('Backend connection check failed:', error);
            
            // Handle CORS errors, timeouts, and network failures by enabling emergency mode
            if (error.name === 'AbortError' || 
                error.message.includes('CORS') || 
                error.message.includes('NetworkError') ||
                error.message.includes('Failed to fetch') ||
                error.message.includes('Network Error') ||
                error.message.includes('Load failed')) {
                
                console.warn('Network error detected. Enabling emergency mode.');
                window.emergencyMode = true;
                localStorage.setItem('emergencyModeEnabled', 'true');
                
                // Show notification about emergency mode (if function exists)
                if (typeof showNotification === 'function') {
                    showNotification('Network error detected. Emergency mode enabled.', 'warning');
                }
            }
            
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
        
        // Show appropriate notification
        if (window.emergencyMode) {
            showNotification('Emergency mode activated for local development', 'warning');
        } else {
            showNotification('Emergency mode deactivated', 'info');
        }
        
        // Hide password help text regardless of mode
        if (passwordHelp) {
            passwordHelp.style.display = 'none';
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
            return { isAuthenticated: false };
        }
        
        if (ApiClient.auth.isAuthenticated()) {
            const result = await ApiClient.auth.verify();
            if (result.success) {
                isAuthenticated = true;
                showNotification('You are already logged in', 'success');
                showAdminFeatures();
                adminToggle.classList.add('admin-active');
                return { isAuthenticated: true };
            }
        }
        return { isAuthenticated: false };
    }

    // Check for the resume and setup the preview
    function checkForResume() {
        const resumePreview = document.getElementById('resumePreview');
        const downloadBtn = document.getElementById('downloadBtn');
        const resumeBadge = document.getElementById('resumeBadge');
        
        // Check if we have a resume in emergency mode
        if (window.emergencyMode) {
            const emergencyResume = localStorage.getItem('emergencyModeResume');
            if (emergencyResume) {
                console.log('Found emergency mode resume:', emergencyResume);
                
                // Update UI to show resume is available
                if (resumePreview) {
                    resumePreview.src = emergencyResume;
                }
                
                if (downloadBtn) {
                    downloadBtn.href = emergencyResume;
                    downloadBtn.style.display = 'inline-block';
                }
                
                if (resumeBadge) {
                    resumeBadge.style.display = 'block';
                }
                
                // Add resume indicator to card
                document.getElementById('pokemonCard').classList.add('has-resume');
            } else {
                console.log('No emergency mode resume found');
                // Hide resume elements
                if (resumePreview) {
                    resumePreview.src = '';
                }
                
                if (downloadBtn) {
                    downloadBtn.href = '#';
                    downloadBtn.style.display = 'none';
                }
                
                if (resumeBadge) {
                    resumeBadge.style.display = 'none';
                }
                
                // Remove resume indicator from card
                document.getElementById('pokemonCard').classList.remove('has-resume');
            }
        } else {
            // In normal mode, fetch resume from API
            ApiClient.resume.get()
                .then(result => {
                    if (result.success && result.url) {
                        console.log('Found resume:', result.url);
                        
                        // Update UI to show resume is available
                        if (resumePreview) {
                            resumePreview.src = result.url;
                        }
                        
                        if (downloadBtn) {
                            downloadBtn.href = result.url;
                            downloadBtn.style.display = 'inline-block';
                        }
                        
                        if (resumeBadge) {
                            resumeBadge.style.display = 'block';
                        }
                        
                        // Add resume indicator to card
                        document.getElementById('pokemonCard').classList.add('has-resume');
                    } else {
                        console.log('No resume found');
                        // Hide resume elements
                        if (resumePreview) {
                            resumePreview.src = '';
                        }
                        
                        if (downloadBtn) {
                            downloadBtn.href = '#';
                            downloadBtn.style.display = 'none';
                        }
                        
                        if (resumeBadge) {
                            resumeBadge.style.display = 'none';
                        }
                        
                        // Remove resume indicator from card
                        document.getElementById('pokemonCard').classList.remove('has-resume');
                    }
                })
                .catch(error => {
                    console.error('Error checking for resume:', error);
                });
        }
    }

    // Handle the resume upload process
    function handleResumeUpload(file) {
        console.log('Handling resume upload:', file);
        if (!file) {
            showNotification('No file selected', 'error');
            return;
        }
        
        // Check file type
        if (file.type !== 'application/pdf') {
            showNotification('Only PDF files are allowed', 'error');
            return;
        }
        
        // Upload the file
        uploadResume(file);
    }

    // Upload resume
    async function uploadResume(file) {
        console.log('Uploading resume:', file);
        
        if (!isAuthenticated && !window.emergencyMode) {
            showNotification('You must be authenticated to upload', 'error');
            return;
        }
        
        // Handle emergency mode upload (store in localStorage)
        if (window.emergencyMode) {
            try {
                console.log('Emergency mode upload - saving to localStorage');
                // Convert file to base64 for local storage
                const reader = new FileReader();
                reader.onloadend = function() {
                    const base64data = reader.result;
                    localStorage.setItem('emergencyModeResume', base64data);
                    showNotification('Resume saved locally in emergency mode', 'success');
                    checkForResume(); // Refresh the display
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
        try {
            console.log('Regular upload via API');
            const result = await ApiClient.resume.upload(file);
            
            if (result.success) {
                showNotification('Resume uploaded successfully', 'success');
                checkForResume();
            } else {
                showNotification(result.error || 'Failed to upload resume', 'error');
            }
        } catch (error) {
            console.error('Resume upload error:', error);
            showNotification('Failed to upload resume: ' + error.message, 'error');
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
            checkForResume(); // Refresh the display
            return;
        }

        // Regular deletion via API
        const result = await ApiClient.resume.delete();
        
        if (result.success) {
            showNotification('Resume deleted successfully', 'success');
            checkForResume();
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
        try {
            console.log('Attempting authentication with:', password ? '********' : 'empty password');
            
            // Clear any previous login errors
            const passwordInput = document.getElementById('passwordInput');
            if (passwordInput) {
                passwordInput.classList.remove('error');
            }
            
            // Validate password isn't empty
            if (!password || password.trim() === '') {
                console.error('Empty password submitted');
                showNotification('Please enter a password', 'error');
                if (passwordInput) {
                    passwordInput.classList.add('error');
                }
                return false;
            }
            
            // Determine which password to accept
            let success = false;
            
            if (window.emergencyMode) {
                // In emergency mode, use a hardcoded password (not displayed in UI)
                const validPassword = "localdev";
                success = (password === validPassword);
                console.log("Using emergency mode password validation, result:", success);
            } else {
                // Try to authenticate with API or use hardcoded password
                try {
                    console.log("Attempting login via ApiClient.auth.login");
                    const result = await ApiClient.auth.login(password);
                    success = result.success;
                    console.log("API login result:", success);
                } catch (error) {
                    console.error('API authentication failed, using fallback password');
                    // Fallback to hardcoded password (not displayed in UI)
                    const validPassword = "Rosie@007";
                    success = (password === validPassword);
                    console.log("Fallback password authentication result:", success);
                }
            }
            
            if (success) {
                console.log('Authentication successful');
                
                // Set authentication state
                isAuthenticated = true;
                
                // Store auth token
                localStorage.setItem('authToken', 'demo-token-123');
                
                // Hide the password modal
                const passwordModal = document.getElementById('passwordModal');
                if (passwordModal) {
                    passwordModal.style.display = 'none';
                }
                
                // Show admin features
                showAdminFeatures();
                
                // Show success notification
                showNotification('Authentication successful!', 'success');
                
                return true;
            } else {
                console.error('Authentication failed');
                showNotification('Authentication failed: Invalid password', 'error');
                
                // Highlight password field
                if (passwordInput) {
                    passwordInput.classList.add('error');
                }
                
                return false;
            }
        } catch (error) {
            console.error('Error during authentication:', error);
            showNotification('Authentication error: ' + error.message, 'error');
            return false;
        }
    }

    // Function to handle logout
    function handleLogout() {
        console.log('Logging out');
        
        // Clear authentication state
        isAuthenticated = false;
        localStorage.removeItem('authToken');
        
        // Hide admin features
        hideAdminFeatures();
        
        // Show notification
        showNotification('Logged out successfully', 'success');
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
        console.log('Initializing application');
        
        // Setup admin functionality
        setupAdminFunctionality();
        
        // Set up login form
        setupLoginForm();
        
        // Check if user is already authenticated
        const token = localStorage.getItem('authToken');
        if (token) {
            console.log('Found existing auth token');
            isAuthenticated = true;
            showAdminFeatures();
        } else {
            console.log('No auth token found, user needs to authenticate');
            hideAdminFeatures();
        }
        
        // Check for the resume
        checkForResume();
        
        // Set up event listeners for file uploads
        setupFileUploads();
        
        // Check if we need to enter emergency mode
        checkEmergencyMode();
    }
    
    // Setup admin functionality including all event listeners
    function setupAdminFunctionality() {
        // Setup event listeners for admin toggle button
        const adminToggle = document.getElementById('adminToggle');
        const passwordModal = document.getElementById('passwordModal');
        
        if (adminToggle) {
            adminToggle.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // If already authenticated, toggle admin panel
                if (isAuthenticated) {
                    // Toggle admin features
                    if (document.body.classList.contains('authenticated')) {
                        hideAdminFeatures();
                    } else {
                        showAdminFeatures();
                    }
                } else {
                    // Show password modal
                    if (passwordModal) {
                        passwordModal.style.display = 'block';
                        
                        // Focus on password input
                        const passwordInput = document.getElementById('passwordInput');
                        if (passwordInput) {
                            passwordInput.focus();
                            passwordInput.value = '';
                        }
                    }
                }
            });
        }
        
        // Check if already authenticated
        const token = localStorage.getItem('authToken');
        if (token) {
            isAuthenticated = true;
            showAdminFeatures();
        }
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
        
        return { browser: browserInfo, platform: platform, isMobile: isMobile };
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
        
        // Admin toggle button
        const adminToggle = document.getElementById('adminToggle');
        const passwordModal = document.getElementById('passwordModal');
        const passwordInput = document.getElementById('passwordInput');
        const submitPassword = document.getElementById('submitPassword');
        const closeModal = document.getElementById('closeModal');
        const logoutBtn = document.getElementById('logoutBtn');
        const adminPanel = document.getElementById('adminPanel');
        
        if (adminToggle) {
            // Clear any existing event listeners to prevent duplicates
            const newAdminToggle = adminToggle.cloneNode(true);
            adminToggle.parentNode.replaceChild(newAdminToggle, adminToggle);
            
            // Add event listener to the new button
            newAdminToggle.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('Admin toggle clicked');
                
                // If already authenticated, toggle admin panel
                if (isAuthenticated) {
                    console.log('User is authenticated, toggling admin features visibility');
                    
                    // Toggle admin features
                    if (document.body.classList.contains('authenticated')) {
                        hideAdminFeatures();
                        showNotification('Admin features hidden', 'info');
                    } else {
                        showAdminFeatures();
                        showNotification('Admin features visible', 'info');
                    }
                } else {
                    // Show password modal
                    console.log('User not authenticated, showing password modal');
                    passwordModal.style.display = 'block';
                    
                    // Focus password input
                    setTimeout(() => {
                        if (passwordInput) {
                            passwordInput.focus();
                            passwordInput.value = ''; // Clear any previous input
                        }
                    }, 100);
                }
            });
            
            console.log('Admin toggle event listener attached');
        }
        
        // Close modal button
        if (closeModal) {
            closeModal.addEventListener('click', function() {
                passwordModal.style.display = 'none';
            });
        }
        
        // Submit password button
        if (submitPassword) {
            // Clear any existing event listeners to prevent duplicates
            const newSubmitPassword = submitPassword.cloneNode(true);
            submitPassword.parentNode.replaceChild(newSubmitPassword, submitPassword);
            
            // Add event listener to the new button
            newSubmitPassword.addEventListener('click', async function() {
                console.log('Submit password button clicked');
                const password = passwordInput.value;
                const success = await authenticate(password);
                
                if (success) {
                    console.log('Authentication successful, hiding modal');
                    passwordModal.style.display = 'none';
                    passwordInput.value = '';
                }
            });
            
            console.log('Submit password event listener attached');
        }
        
        // Password input keydown event
        if (passwordInput) {
            // Clear any existing event listeners to prevent duplicates
            const newPasswordInput = passwordInput.cloneNode(true);
            passwordInput.parentNode.replaceChild(newPasswordInput, passwordInput);
            
            // Add event listener to the new input field
            newPasswordInput.addEventListener('keydown', async function(e) {
                if (e.key === 'Enter') {
                    console.log('Enter key pressed in password input');
                    const password = newPasswordInput.value;
                    const success = await authenticate(password);
                    
                    if (success) {
                        console.log('Authentication successful from keydown, hiding modal');
                        passwordModal.style.display = 'none';
                        newPasswordInput.value = '';
                    }
                }
            });
            
            console.log('Password input keydown event listener attached');
        }
        
        // Logout button
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                handleLogout();
            });
        }
    }

    // Save emergency mode state to localStorage
    function saveEmergencyModeState() {
        localStorage.setItem('emergencyModeEnabled', window.emergencyMode ? 'true' : 'false');
    }

    // Hide all admin-only features (upload sections, delete buttons)
    function hideAdminFeatures() {
        console.log('Hiding admin features');
        
        // Remove authenticated class from body
        document.body.classList.remove('authenticated');
        
        // Update admin toggle button
        if (adminToggle) {
            adminToggle.classList.remove('admin-active');
            adminToggle.setAttribute('aria-expanded', 'false');
        }
        
        // Hide admin-only elements
        const adminElements = document.querySelectorAll('.admin-only');
        adminElements.forEach(element => {
            element.style.display = 'none';
        });
        
        // Clear authentication state
        isAuthenticated = false;
        localStorage.removeItem('authToken');
    }
    
    // Show admin features when user is authenticated
    function showAdminFeatures() {
        console.log('Showing admin features');
        
        // Add authenticated class to body
        document.body.classList.add('authenticated');
        
        // Update admin toggle button
        if (adminToggle) {
            adminToggle.classList.add('admin-active');
            adminToggle.setAttribute('aria-expanded', 'true');
        }
        
        // Show admin-only elements
        const adminElements = document.querySelectorAll('.admin-only');
        adminElements.forEach(element => {
            element.style.display = element.tagName === 'BUTTON' || element.tagName === 'A' ? 'inline-block' : 'block';
        });

        // Show admin panel
        const adminPanel = document.getElementById('adminPanel');
        if (adminPanel) {
            adminPanel.style.display = 'block';
        }
    }

    // Setup login form
    function setupLoginForm() {
        const passwordModal = document.getElementById('passwordModal');
        const passwordInput = document.getElementById('passwordInput');
        const submitButton = document.getElementById('submitPassword');
        const closeModal = document.getElementById('closeModal');
        const logoutBtn = document.getElementById('logoutBtn');
        
        // COMPLETELY Remove password help element from DOM if it exists
        const passwordHelp = document.getElementById('passwordHelp');
        if (passwordHelp && passwordHelp.parentNode) {
            passwordHelp.parentNode.removeChild(passwordHelp);
        }
        
        // Also remove any other password hints or help elements
        const passwordOptionsContainer = document.querySelector('.password-options');
        if (passwordOptionsContainer && passwordOptionsContainer.parentNode) {
            passwordOptionsContainer.parentNode.removeChild(passwordOptionsContainer);
        }
        
        if (submitButton) {
            // Clear any previous event listeners by cloning and replacing
            const newSubmitButton = submitButton.cloneNode(true);
            submitButton.parentNode.replaceChild(newSubmitButton, submitButton);
            
            // Add new event listener
            newSubmitButton.addEventListener('click', async () => {
                console.log('Submit password button clicked');
                const password = passwordInput.value;
                const success = await authenticate(password);
                
                if (success) {
                    // If authentication successful, hide the modal
                    passwordModal.style.display = 'none';
                    
                    // Clear the password field
                    passwordInput.value = '';
                    passwordInput.classList.remove('error');
                    
                    // Refresh emergency mode toggle visibility after authentication
                    checkEmergencyMode();
                }
            });
        }
        
        if (passwordInput) {
            passwordInput.addEventListener('keydown', async (e) => {
                if (e.key === 'Enter') {
                    console.log('Enter key pressed in password input');
                    const password = passwordInput.value;
                    const success = await authenticate(password);
                    
                    if (success) {
                        // If authentication successful, hide the modal
                        passwordModal.style.display = 'none';
                        
                        // Clear the password field
                        passwordInput.value = '';
                        passwordInput.classList.remove('error');
                    }
                }
            });
            
            // Clear error class when typing
            passwordInput.addEventListener('input', () => {
                passwordInput.classList.remove('error');
            });
        }
        
        // Make sure close button works
        if (closeModal) {
            // Clear any previous event listeners
            const newCloseModal = closeModal.cloneNode(true);
            closeModal.parentNode.replaceChild(newCloseModal, closeModal);
            
            newCloseModal.addEventListener('click', () => {
                console.log('Close modal button clicked');
                passwordModal.style.display = 'none';
                // Reset any error state
                if (passwordInput) {
                    passwordInput.classList.remove('error');
                    passwordInput.value = '';
                }
            });
        }
        
        // Close modal when clicking outside of it
        window.addEventListener('click', (e) => {
            if (e.target === passwordModal) {
                passwordModal.style.display = 'none';
                // Reset any error state
                if (passwordInput) {
                    passwordInput.classList.remove('error');
                    passwordInput.value = '';
                }
            }
        });
        
        // Setup logout button
        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogout);
        }
        
        console.log('Login form event listeners setup complete');
    }

    // Check if we need to enable emergency mode
    function checkEmergencyMode() {
        const storedMode = localStorage.getItem('emergencyModeEnabled');
        window.emergencyMode = storedMode === 'true';
        
        // Show emergency banner if in emergency mode
        const banner = document.getElementById('emergencyModeBanner');
        if (banner && window.emergencyMode) {
            banner.style.display = 'block';
        }
        
        // Setup emergency mode toggle for local development - RESTRICT ACCESS
        const emergencyModeToggle = document.getElementById('emergencyModeToggle');
        if (emergencyModeToggle) {
            // Only show toggle if user is authenticated (admin) AND on localhost
            const isLocalDev = window.location.hostname === 'localhost' || 
                               window.location.hostname === '127.0.0.1';
            
            // Restrict emergency mode toggle to authenticated admins only
            emergencyModeToggle.style.display = (isLocalDev && isAuthenticated) ? 'block' : 'none';
            
            emergencyModeToggle.addEventListener('click', function() {
                // Double-check authentication before allowing toggle
                if (!isAuthenticated) {
                    showNotification('You must be authenticated to use emergency mode', 'error');
                    return;
                }
                
                window.emergencyMode = !window.emergencyMode;
                localStorage.setItem('emergencyModeEnabled', window.emergencyMode ? 'true' : 'false');
                
                // Update UI to reflect emergency mode state
                if (banner) {
                    banner.style.display = window.emergencyMode ? 'block' : 'none';
                }
                
                // Reload the page to apply changes
                window.location.reload();
            });
        }
    }

    // Setup file uploads
    function setupFileUploads() {
        // Only allow uploads if user is authenticated
        if (!isAuthenticated) {
            console.log('Not setting up file uploads because user is not authenticated');
            return;
        }
        
        console.log('Setting up file uploads for authenticated user');
        
        // Resume upload area
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        
        if (uploadArea && fileInput) {
            // Drag & drop functionality
            uploadArea.addEventListener('dragover', function(e) {
                e.preventDefault();
                e.stopPropagation();
                this.classList.add('highlight');
            });
            
            uploadArea.addEventListener('dragleave', function(e) {
                e.preventDefault();
                e.stopPropagation();
                this.classList.remove('highlight');
            });
            
            uploadArea.addEventListener('drop', function(e) {
                e.preventDefault();
                e.stopPropagation();
                this.classList.remove('highlight');
                
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    fileInput.files = files;
                    handleResumeUpload(files[0]);
                }
            });
            
            uploadArea.addEventListener('click', function() {
                fileInput.click();
            });
            
            fileInput.addEventListener('change', function() {
                if (this.files.length > 0) {
                    handleResumeUpload(this.files[0]);
                }
            });
        }
        
        // Image upload area
        const imageUploadArea = document.getElementById('imageUploadArea');
        const imageFileInput = document.getElementById('imageFileInput');
        
        if (imageUploadArea && imageFileInput) {
            // Drag & drop functionality
            imageUploadArea.addEventListener('dragover', function(e) {
                e.preventDefault();
                e.stopPropagation();
                this.classList.add('highlight');
            });
            
            imageUploadArea.addEventListener('dragleave', function(e) {
                e.preventDefault();
                e.stopPropagation();
                this.classList.remove('highlight');
            });
            
            imageUploadArea.addEventListener('drop', function(e) {
                e.preventDefault();
                e.stopPropagation();
                this.classList.remove('highlight');
                
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    imageFileInput.files = files;
                    handleImageUpload(files[0]);
                }
            });
            
            imageUploadArea.addEventListener('click', function() {
                imageFileInput.click();
            });
            
            imageFileInput.addEventListener('change', function() {
                if (this.files.length > 0) {
                    handleImageUpload(this.files[0]);
                }
            });
        }
        
        // Delete resume button
        const deleteResumeBtn = document.getElementById('deleteResumeBtn');
        if (deleteResumeBtn) {
            deleteResumeBtn.addEventListener('click', handleDeleteResume);
        }
        
        // Delete image button
        const deleteImageBtn = document.getElementById('deleteImageBtn');
        if (deleteImageBtn) {
            deleteImageBtn.addEventListener('click', handleDeleteImage);
        }
    }

    // Start everything
    init();
}); 