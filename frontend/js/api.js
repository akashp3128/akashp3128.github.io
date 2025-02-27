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
    
    // Determine the API URL based on the current environment
    const determineApiUrl = () => {
        // Check if we're in a local development environment
        const isLocalhost = window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1';
        
        if (isLocalhost) {
            // For local development
            return 'http://localhost:3000';
        } else {
            // In production, use the same origin for API requests
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
        try {
            debugLog('Checking backend connection...');
            const response = await fetch(`${API_URL}/api/health`, { 
                method: 'GET',
                headers: { 'Accept': 'application/json' },
                // Set a timeout to prevent long waiting
                signal: AbortSignal.timeout(5000)
            });
            
            const result = response.ok;
            debugLog('Backend connection check result:', result);
            return result;
        } catch (error) {
            debugLog('Backend connection check failed:', error);
            
            // Enable emergency mode automatically if backend is unreachable
            debugLog('Enabling emergency mode due to backend connection failure');
            localStorage.setItem('emergency_mode', 'true');
            
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
            
            try {
                // Check for development mode with hardcoded password
                const isLocalhost = window.location.hostname === 'localhost' || 
                                   window.location.hostname === '127.0.0.1';
                
                // If we're on localhost, we can use the hardcoded password
                if (isLocalhost && (password === 'Rosie@007' || password === 'localdev')) {
                    console.log('Using hardcoded password for local development');
                    // Even in dev mode, let's use a more realistic token format
                    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlzQWRtaW4iOnRydWV9LCJpYXQiOjE2MTk4OTQ3NTEsImV4cCI6MTYxOTk4MTE1MX0.demo-token-' + Date.now();
                    setAuthToken(token);
                    return { success: true, token: token };
                }
                
                // For production or other passwords, use the real backend authentication
                debugLog('Attempting server authentication');
                const response = await fetch(`${API_ENDPOINTS.AUTH}/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ password })
                });
                
                // Log response status for debugging
                debugLog('Auth response status:', response.status);
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.token) {
                        debugLog('Received auth token from server');
                        setAuthToken(data.token);
                        return { success: true, token: data.token };
                    }
                }
                
                // Try to get detailed error message
                try {
                    const errorData = await response.json();
                    console.log('Login failed:', errorData.message || 'Unknown error');
                    return { 
                        success: false, 
                        error: errorData.message || 'Invalid password'
                    };
                } catch (e) {
                    console.log('Login failed with status:', response.status);
                    return { 
                        success: false, 
                        error: 'Invalid password'
                    };
                }
            } catch (error) {
                console.error('Login error:', error);
                
                // Only use fallback in localhost environment
                const isLocalhost = window.location.hostname === 'localhost' || 
                                  window.location.hostname === '127.0.0.1';
                
                // Fallback to hardcoded passwords only in local development
                if (isLocalhost && (password === 'Rosie@007' || password === 'localdev')) {
                    console.log('Backend unreachable, using fallback authentication');
                    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlzQWRtaW4iOnRydWV9LCJpYXQiOjE2MTk4OTQ3NTEsImV4cCI6MTYxOTk4MTE1MX0.demo-token-fallback-' + Date.now();
                    setAuthToken(token);
                    return { success: true, token: token };
                }
                
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
            
            // Regular API upload
            const token = getAuthToken();
            if (!token) {
                return { success: false, error: 'Authentication required' };
            }
            
            try {
                debugLog('Uploading resume via API');
                const formData = new FormData();
                formData.append('resume', file);
                
                debugLog('Resume form data:', {
                    fileName: file.name,
                    fileType: file.type,
                    fileSize: file.size
                });
                
                const response = await fetch(API_ENDPOINTS.RESUME, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });
                
                let responseText;
                try {
                    responseText = await response.text();
                    const data = responseText ? JSON.parse(responseText) : {};
                    
                    if (response.ok) {
                        return { success: true, data };
                    } else {
                        debugLog('Resume upload failed with response:', { 
                            status: response.status, 
                            statusText: response.statusText,
                            data
                        });
                        return { 
                            success: false, 
                            error: data.message || 'Upload failed',
                            status: response.status,
                            statusText: response.statusText
                        };
                    }
                } catch (parseError) {
                    debugLog('Failed to parse response:', responseText);
                    return { 
                        success: false, 
                        error: `Upload failed: ${response.status} ${response.statusText}`,
                        responseText: responseText
                    };
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
                const response = await fetch(API_ENDPOINTS.RESUME, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    return { success: true };
                } else {
                    const error = await response.json();
                    return { success: false, error: error.message || 'Delete failed' };
                }
            } catch (error) {
                debugLog('Resume delete error:', error);
                return { success: false, error: error.message };
            }
        }
    };
    
    // Image API
    const image = {
        // Upload a profile image
        upload: async function(file) {
            const token = getAuthToken();
            if (!token) {
                return { success: false, error: 'Authentication required' };
            }
            
            try {
                debugLog('Uploading image via API');
                const formData = new FormData();
                formData.append('image', file);
                
                debugLog('Image form data:', {
                    fileName: file.name,
                    fileType: file.type,
                    fileSize: file.size
                });
                
                const response = await fetch(API_ENDPOINTS.IMAGE, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });
                
                let responseText;
                try {
                    responseText = await response.text();
                    const data = responseText ? JSON.parse(responseText) : {};
                    
                    if (response.ok) {
                        return { success: true, data };
                    } else {
                        debugLog('Image upload failed with response:', { 
                            status: response.status, 
                            statusText: response.statusText,
                            data
                        });
                        return { 
                            success: false, 
                            error: data.message || 'Upload failed',
                            status: response.status,
                            statusText: response.statusText
                        };
                    }
                } catch (parseError) {
                    debugLog('Failed to parse response:', responseText);
                    return { 
                        success: false, 
                        error: `Upload failed: ${response.status} ${response.statusText}`,
                        responseText: responseText
                    };
                }
            } catch (error) {
                debugLog('Image upload error:', error);
                return { success: false, error: error.message };
            }
        },
        
        // Get the profile image
        get: async function() {
            try {
                const response = await fetch(API_ENDPOINTS.IMAGE, {
                    method: 'GET'
                });
                
                if (response.ok) {
                    const blob = await response.blob();
                    const url = URL.createObjectURL(blob);
                    return { success: true, data: { url } };
                } else {
                    return { success: false, error: 'Image not found' };
                }
            } catch (error) {
                debugLog('Image get error:', error);
                return { success: false, error: error.message };
            }
        },
        
        // Delete the profile image
        delete: async function() {
            const token = getAuthToken();
            if (!token) {
                return { success: false, error: 'Authentication required' };
            }
            
            try {
                const response = await fetch(API_ENDPOINTS.IMAGE, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    return { success: true };
                } else {
                    const error = await response.json();
                    return { success: false, error: error.message || 'Delete failed' };
                }
            } catch (error) {
                debugLog('Image delete error:', error);
                return { success: false, error: error.message };
            }
        }
    };
    
    // Placeholder image API
    const placeholder = {
        // Get a placeholder image of specified dimensions
        get: function(width, height) {
            return `${API_ENDPOINTS.PLACEHOLDER}/${width}/${height}`;
        }
    };
    
    // Public API
    return {
        checkBackendConnection,
        auth,
        resume,
        image,
        placeholder
    };
})();

// Expose the API client to the window for use by other scripts
window.ApiClient = ApiClient;

console.log('API client loaded and initialized');

// Export the API client for use in other files
if (typeof module !== 'undefined') {
    module.exports = ApiClient;
} 