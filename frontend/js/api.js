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
            const frontendPort = window.location.port;
            const backendPort = frontendPort.startsWith('808') ? '3000' : frontendPort;
            const apiUrl = `http://localhost:${backendPort}`;
            debugLog('Using local API URL:', apiUrl);
            return apiUrl;
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
        IMAGE: `${API_URL}/api/image`
    };

    // Check if a backend connection is available
    const checkBackendConnection = async () => {
        if (window.emergencyMode) {
            debugLog('Skipping backend check in emergency mode');
            return false;
        }
        
        try {
            debugLog('Checking backend connection...');
            const response = await fetch(`${API_URL}/api/health`, { 
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
        if (window.emergencyMode && !token) {
            return 'emergency-override-token';
        }
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
            console.log('Attempting login with API endpoint:', API_ENDPOINTS.AUTH + '/login');
            
            // First check if backend is reachable
            const isBackendAvailable = await checkBackendConnection();
            if (!isBackendAvailable) {
                console.warn('Backend server appears to be unreachable');
                // If we detect we're in development mode and local backend is unavailable
                if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                    // Check if in emergency mode
                    if (window.emergencyMode && (password === 'localdev' || password === 'Rosie@007')) {
                        // Allow "localdev" or permanent password in emergency mode for local development
                        const mockToken = 'emergency-dev-token';
                        setAuthToken(mockToken);
                        return { success: true, token: mockToken, emergency: true };
                    }
                }
                
                return { 
                    success: false,
                    error: 'Could not connect to the authentication server. Is your backend running?',
                    networkError: true
                };
            }
            
            try {
                const response = await fetch(`${API_ENDPOINTS.AUTH}/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ password })
                });

                console.log('Login response status:', response.status);
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Login error response:', errorText);
                    throw new Error(`Authentication failed: ${response.status} ${errorText}`);
                }

                const data = await response.json();
                setAuthToken(data.token);
                return { success: true, token: data.token };
            } catch (error) {
                console.error('Login error details:', error);
                
                // If it's a network error, provide clearer message
                if (error.message.includes('Failed to fetch') || error.message.includes('Network Error')) {
                    return { 
                        success: false, 
                        error: 'Could not connect to the authentication server. Is your backend running?',
                        details: error.message,
                        networkError: true
                    };
                }
                
                return { success: false, error: error.message };
            }
        },

        // Verify the token
        verify: async function() {
            const token = getAuthToken();
            if (!token) {
                return { success: false, error: 'No token found' };
            }

            try {
                const response = await fetch(`${API_ENDPOINTS.AUTH}/verify`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    setAuthToken(null);
                    throw new Error('Token verification failed');
                }

                return { success: true };
            } catch (error) {
                console.error('Token verification error:', error);
                return { success: false, error: error.message };
            }
        },

        // Logout
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
        // Get the resume
        get: async function() {
            try {
                // Check for emergency override mode
                const token = getAuthToken();
                if (token === 'emergency-override-token') {
                    console.log('Using emergency mode for resume retrieval');
                    const fileUrl = localStorage.getItem('resumeFileUrl');
                    
                    if (fileUrl) {
                        return { 
                            success: true, 
                            data: {
                                url: fileUrl,
                                filename: localStorage.getItem('resumeFileName') || 'resume.pdf'
                            }
                        };
                    } else {
                        return { success: false, error: 'No resume found in emergency mode', notFound: true };
                    }
                }
                
                // Normal server fetch
                const response = await fetch(API_ENDPOINTS.RESUME);
                
                if (response.status === 404) {
                    return { success: false, error: 'No resume found', notFound: true };
                }
                
                if (!response.ok) {
                    throw new Error('Failed to fetch resume');
                }
                
                const blob = await response.blob();
                return { 
                    success: true, 
                    data: {
                        blob,
                        url: URL.createObjectURL(blob)
                    }
                };
            } catch (error) {
                console.error('Error fetching resume:', error);
                return { success: false, error: error.message };
            }
        },

        // Upload a new resume
        upload: async function(file) {
            const token = getAuthToken();
            if (!token) {
                return { success: false, error: 'Authentication required' };
            }

            if (!file || file.type !== 'application/pdf') {
                return { success: false, error: 'Invalid file type. Please upload a PDF.' };
            }

            const formData = new FormData();
            formData.append('resume', file);

            try {
                // For emergency override token, create a local file URL instead
                if (token === 'emergency-override-token') {
                    console.log('Using emergency mode for file upload');
                    // Create a temporary object URL for the file
                    const fileUrl = URL.createObjectURL(file);
                    
                    // Store filename in localStorage for reference
                    localStorage.setItem('resumeFileName', file.name);
                    localStorage.setItem('resumeFileUrl', fileUrl);
                    
                    return { 
                        success: true, 
                        message: 'Resume uploaded in emergency mode (locally only)' 
                    };
                }
                
                // Normal upload to server
                const response = await fetch(API_ENDPOINTS.RESUME, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });

                if (!response.ok) {
                    throw new Error('Failed to upload resume');
                }

                return { success: true };
            } catch (error) {
                console.error('Upload error:', error);
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

    // Return the public API
    return {
        auth,
        resume,
        image,
        getApiUrl: () => API_URL,
        updateEmergencyModeStatus: updateEmergencyModeStatus
    };
})();

// Export the API client for use in other files
if (typeof module !== 'undefined') {
    module.exports = ApiClient;
} 