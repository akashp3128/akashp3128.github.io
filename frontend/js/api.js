// API client for communicating with the backend
const ApiClient = (function() {
    // Determine the API URL based on the current environment
    const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:3000'  // Local development
        : window.location.origin;  // Production (same domain)
    
    console.log('API URL configured as:', API_URL);
    
    const API_ENDPOINTS = {
        RESUME: `${API_URL}/api/resume`,
        AUTH: `${API_URL}/api/auth`,
    };

    // Get the authentication token from localStorage
    function getAuthToken() {
        return localStorage.getItem('authToken');
    }

    // Set the authentication token to localStorage
    function setAuthToken(token) {
        if (token) {
            localStorage.setItem('authToken', token);
        } else {
            localStorage.removeItem('authToken');
        }
    }

    // Authentication API
    const auth = {
        // Login with password
        login: async function(password) {
            console.log('Attempting login with API endpoint:', API_ENDPOINTS.AUTH + '/login');
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
                        details: error.message
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

    // Return the public API
    return {
        auth,
        resume,
        getApiUrl: () => API_URL
    };
})();

// Export the API client for use in other files
if (typeof module !== 'undefined') {
    module.exports = ApiClient;
} 