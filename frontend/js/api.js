// API client for communicating with the backend
const ApiClient = (function() {
    // Debuggable flag - set to true for more verbose console logs
    const DEBUG = true;
    
    // Log debug messages if debug is enabled
    function debugLog(...args) {
        if (DEBUG) {
            console.log('[API Client]', ...args);
        }
    }
    
    // Initialize emergency mode flag - ensure we read the latest value
    function updateEmergencyModeStatus() {
        const wasInEmergencyMode = window.emergencyMode;
        window.emergencyMode = localStorage.getItem('emergencyModeEnabled') === 'true';
        
        // Log only if there was a change in status
        if (wasInEmergencyMode !== window.emergencyMode) {
            debugLog('Emergency mode updated:', window.emergencyMode);
        }
    }
    
    // Initial check
    updateEmergencyModeStatus();
    debugLog('Emergency mode on startup:', window.emergencyMode);
    
    // Determine the API URL based on the current environment
    const determineApiUrl = () => {
        // Always check the latest emergency mode status before making a decision
        updateEmergencyModeStatus();
        
        // For emergency mode, just use a placeholder
        if (window.emergencyMode) {
            debugLog('Using placeholder API URL for emergency mode');
            return '/api';
        }
        
        // Check if we're in a local development environment
        const isLocalhost = window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1';
        
        if (isLocalhost) {
            // For local development without emergency mode
            return 'http://localhost:3000';
        } else {
            // In production, use the same domain
            debugLog('Using production API URL:', window.location.origin);
            return window.location.origin;
        }
    };
    
    const API_URL = determineApiUrl();
    debugLog('API URL configured as:', API_URL);
    
    const API_ENDPOINTS = {
        RESUME: `${API_URL}/api/resume`,
        AUTH: `${API_URL}/api/auth`,
        IMAGE: `${API_URL}/api/image`,
        PLACEHOLDER: `${API_URL}/api/placeholder`
    };

    // Check if a backend connection is available
    const checkBackendConnection = async () => {
        if (window.emergencyMode) {
            debugLog('Skipping backend check in emergency mode');
            return false;
        }
        
        try {
            debugLog('Checking backend connection...');
            const response = await fetch(`${API_URL}/health`, { 
                method: 'GET',
                headers: { 'Accept': 'application/json' },
                // Set a timeout to prevent long waiting
                signal: AbortSignal.timeout(3000)
            });
            
            const result = response.ok;
            debugLog('Backend connection:', result ? 'AVAILABLE' : 'UNAVAILABLE');
            return result;
        } catch (error) {
            debugLog('Backend connectivity check failed:', error);
            return false;
        }
    };

    // Get the authentication token from localStorage
    function getAuthToken() {
        const token = localStorage.getItem('authToken');
        return token;
    }

    // Set the authentication token to localStorage
    function setAuthToken(token) {
        if (token) {
            localStorage.setItem('authToken', token);
            debugLog('Auth token set');
        } else {
            localStorage.removeItem('authToken');
            debugLog('Auth token removed');
        }
    }

    // Authentication API
    const auth = {
        // Login with password
        login: async function(password) {
            console.log('Attempting login with ApiClient', password ? '********' : 'empty password');
            
            // Emergency mode login bypass
            if (window.emergencyMode) {
                debugLog('Emergency mode login bypass - success');
                
                // Create and store a mock token
                const mockToken = 'emergency-mode-token-' + Date.now();
                setAuthToken(mockToken);
                
                return { success: true, token: mockToken };
            }
            
            try {
                // Simple localStorage direct authentication (for demo)
                if (password === 'Rosie@007') {
                    console.log('Password matched, authentication successful');
                    const token = 'demo-token-' + Date.now();
                    setAuthToken(token);
                    return { success: true, token: token };
                }
                
                console.log('Password did not match');
                return { 
                    success: false, 
                    error: 'Invalid password'
                };
            } catch (error) {
                console.error('Login error:', error);
                return { 
                    success: false, 
                    error: error.message || 'Authentication failed' 
                };
            }
        },
        
        // Logout - clear the token
        logout: function() {
            setAuthToken(null);
            return { success: true };
        },
        
        // Check if user is authenticated
        isAuthenticated: function() {
            return !!getAuthToken();
        }
    };

    // Resume API
    const resume = {
        // Get the resume PDF
        get: async function() {
            // First check if we're in emergency mode
            updateEmergencyModeStatus();
            
            if (window.emergencyMode) {
                const resumeBase64 = localStorage.getItem('emergencyModeResume');
                if (resumeBase64) {
                    return { 
                        success: true, 
                        data: { url: resumeBase64 },
                        isEmergencyMode: true
                    };
                } else {
                    return { 
                        success: false, 
                        error: 'No resume available in emergency mode' 
                    };
                }
            }
            
            // Otherwise make API request
            try {
                debugLog('Getting resume from API');
                const response = await fetch(API_ENDPOINTS.RESUME, {
                    method: 'GET'
                });
                
                if (response.ok) {
                    const blob = await response.blob();
                    const url = URL.createObjectURL(blob);
                    return { success: true, data: { url, filename: 'resume.pdf' } };
                } else {
                    return { success: false, error: 'Resume not found' };
                }
            } catch (error) {
                debugLog('Error getting resume:', error);
                return { success: false, error: error.message };
            }
        },
        
        // Upload a new resume
        upload: async function(file) {
            debugLog('Uploading resume...');
            updateEmergencyModeStatus();
            
            // In emergency mode, save to localStorage
            if (window.emergencyMode) {
                debugLog('In emergency mode, saving resume to localStorage');
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = function() {
                        localStorage.setItem('emergencyModeResume', reader.result);
                        resolve({ 
                            success: true, 
                            message: 'Resume saved in local storage for emergency mode',
                            isEmergencyMode: true
                        });
                    };
                    reader.readAsDataURL(file);
                });
            }
            
            // Regular API upload
            const token = getAuthToken();
            if (!token) {
                return { success: false, error: 'Authentication required' };
            }
            
            try {
                debugLog('Uploading resume via API');
                const formData = new FormData();
                formData.append('resume', file);
                
                const response = await fetch(API_ENDPOINTS.RESUME, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });
                
                if (response.ok) {
                    const data = await response.json();
                    return { success: true, data };
                } else {
                    const error = await response.json();
                    return { success: false, error: error.message || 'Upload failed' };
                }
            } catch (error) {
                debugLog('Resume upload error:', error);
                return { success: false, error: error.message };
            }
        },

        // Delete the resume
        delete: async function() {
            const token = getAuthToken();
            if (!token) {
                return { success: false, error: 'Authentication required' };
            }

            try {
                // For emergency mode, just clear localStorage
                if (token === 'emergency-override-token') {
                    console.log('Using emergency mode for resume deletion');
                    localStorage.removeItem('resumeFileName');
                    localStorage.removeItem('resumeFileUrl');
                    return { success: true };
                }
                
                // Normal server deletion
                const response = await fetch(API_ENDPOINTS.RESUME, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to delete resume');
                }

                return { success: true };
            } catch (error) {
                console.error('Delete error:', error);
                return { success: false, error: error.message };
            }
        }
    };

    // Profile Image API
    const image = {
        // Get the profile image
        get: async function() {
            try {
                // Check for emergency mode or local storage
                if (window.emergencyMode || localStorage.getItem('profileImageUrl')) {
                    console.log('Using local storage for profile image');
                    const imageUrl = localStorage.getItem('profileImageUrl');
                    
                    if (imageUrl) {
                        return { 
                            success: true, 
                            data: {
                                url: imageUrl
                            }
                        };
                    } else {
                        // Return the default placeholder if no image is saved
                        return { success: false, notFound: true };
                    }
                }
                
                // Normal server fetch would go here in a full implementation
                // For now, let's return false to use placeholder
                return { success: false, notFound: true };
            } catch (error) {
                console.error('Error fetching profile image:', error);
                return { success: false, error: error.message };
            }
        },

        // Upload a new profile image
        upload: async function(file) {
            const token = getAuthToken();
            if (!token && !window.emergencyMode) {
                return { success: false, error: 'Authentication required' };
            }

            // Validate that the file is an image
            if (!file || !file.type.startsWith('image/')) {
                return { success: false, error: 'Invalid file type. Please upload an image.' };
            }

            try {
                // For local storage or emergency mode
                console.log('Saving profile image to local storage');
                
                // Create a file reader to get base64 data
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = function() {
                        const imageUrl = reader.result;
                        localStorage.setItem('profileImageUrl', imageUrl);
                        
                        // Resolve the promise with success data
                        resolve({
                            success: true, 
                            data: { url: imageUrl },
                            message: 'Profile image saved'
                        });
                    };
                    reader.readAsDataURL(file);
                });
                
                // In a full implementation, you would add API call to server here
            } catch (error) {
                console.error('Profile image upload error:', error);
                return { success: false, error: error.message };
            }
        },

        // Delete the profile image
        delete: async function() {
            const token = getAuthToken();
            if (!token && !window.emergencyMode) {
                return { success: false, error: 'Authentication required' };
            }

            try {
                // Remove from local storage
                localStorage.removeItem('profileImageUrl');
                return { success: true, message: 'Profile image removed' };
                
                // In a full implementation, you would add API call to server here
            } catch (error) {
                console.error('Delete profile image error:', error);
                return { success: false, error: error.message };
            }
        }
    };

    // Initialize the ApiClient module
    function initialize() {
        console.log('ApiClient initialized');
        updateEmergencyModeStatus();
        checkBackendConnection();
    }

    // Run initialization
    initialize();

    // Return the public API
    return {
        auth: auth,
        pokemon: pokemon,
        resume: resume,
        profiles: profiles,
        debug: {
            getDebugInfo
        }
    };
})();

// Expose the API client to the window for use by other scripts
window.ApiClient = ApiClient;

console.log('API client loaded and initialized');

// Export the API client for use in other files
if (typeof module !== 'undefined') {
    module.exports = ApiClient;
} 