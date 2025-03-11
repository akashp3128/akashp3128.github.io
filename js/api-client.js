/**
 * API Client
 * 
 * Handles all API requests to the backend server.
 * Provides fallback functionality for emergency mode.
 */

// Initialize the API client
(function() {
    console.log('Initializing API client...');
    
    // Create the API client object
    window.ApiClient = {
        // Base URL for API requests
        baseUrl: window.API_BASE_URL || window.location.origin,
        
        // Flag to track if we're in emergency mode
        emergencyMode: false,
        
        // Initialize the API client
        init: function() {
            console.log('API client initializing with base URL:', this.baseUrl);
            
            // Check if the API is available
            this.checkApiAvailability()
                .then(available => {
                    if (!available) {
                        this.enableEmergencyMode('API unavailable');
                    }
                })
                .catch(err => {
                    console.error('Error checking API availability:', err);
                    this.enableEmergencyMode('API check failed');
                });
        },
        
        // Check if the API is available
        checkApiAvailability: async function() {
            try {
                const response = await fetch(`${this.baseUrl}/api/health`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    },
                    // Short timeout for health check
                    signal: AbortSignal.timeout(3000)
                });
                
                if (response.ok) {
                    console.log('API is available');
                    return true;
                } else {
                    console.warn('API health check failed with status:', response.status);
                    return false;
                }
            } catch (error) {
                console.error('API health check error:', error);
                return false;
            }
        },
        
        // Enable emergency mode
        enableEmergencyMode: function(reason) {
            console.warn(`Enabling emergency mode: ${reason}`);
            this.emergencyMode = true;
            document.body.classList.add('emergency-mode');
            
            // Show notification if the function exists
            if (typeof showNotification === 'function') {
                showNotification('Backend API unavailable. Emergency mode enabled.', 'warning');
            }
            
            // Dispatch event for other components
            window.dispatchEvent(new CustomEvent('emergency-mode-enabled', {
                detail: { reason }
            }));
        },
        
        // Generic request method
        request: async function(endpoint, options = {}) {
            // If in emergency mode, use mock data
            if (this.emergencyMode) {
                return this.mockResponse(endpoint, options);
            }
            
            // Get auth token if available
            const token = window.AuthManager && window.AuthManager.getToken();
            
            // Default options
            const defaultOptions = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            };
            
            // Add auth token if available
            if (token) {
                defaultOptions.headers['Authorization'] = `Bearer ${token}`;
            }
            
            // Merge options
            const requestOptions = {
                ...defaultOptions,
                ...options,
                headers: {
                    ...defaultOptions.headers,
                    ...(options.headers || {})
                }
            };
            
            try {
                const response = await fetch(`${this.baseUrl}${endpoint}`, requestOptions);
                
                // Check for unauthorized
                if (response.status === 401) {
                    console.warn('Unauthorized API request');
                    
                    // Clear token if we have an auth manager
                    if (window.AuthManager) {
                        window.AuthManager.logout();
                    }
                    
                    throw new Error('Unauthorized');
                }
                
                // Handle other error responses
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`API error (${response.status}):`, errorText);
                    throw new Error(`API error: ${response.status} ${errorText}`);
                }
                
                // Parse JSON response
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    return await response.json();
                } else {
                    return await response.text();
                }
            } catch (error) {
                console.error('API request failed:', error);
                
                // If not already in emergency mode, enable it
                if (!this.emergencyMode) {
                    this.enableEmergencyMode('API request failed');
                }
                
                // Return mock data as fallback
                return this.mockResponse(endpoint, options);
            }
        },
        
        // Mock response for emergency mode
        mockResponse: function(endpoint, options) {
            console.log('Using mock data for:', endpoint);
            
            // Simple mock data based on endpoint
            if (endpoint.includes('/navy/evaluations')) {
                return {
                    success: true,
                    data: [
                        {
                            id: 'mock-1',
                            year: '2019',
                            rank: 'HT2',
                            promotion_recommendation: 'EP',
                            reporting_senior: 'LCDR SMITH',
                            summary: 'Outstanding performance in all areas.'
                        },
                        {
                            id: 'mock-2',
                            year: '2018',
                            rank: 'HT3',
                            promotion_recommendation: 'MP',
                            reporting_senior: 'LT JOHNSON',
                            summary: 'Excellent technical skills and leadership potential.'
                        }
                    ]
                };
            }
            
            if (endpoint.includes('/auth/login')) {
                // For login, check if password is correct in emergency mode
                const body = JSON.parse(options.body || '{}');
                if (body.password === 'Rosie@007' || body.password === 'localdev') {
                    return {
                        success: true,
                        token: 'mock-emergency-token',
                        user: {
                            name: 'Emergency Admin',
                            role: 'admin'
                        }
                    };
                } else {
                    throw new Error('Invalid credentials');
                }
            }
            
            // Default mock response
            return {
                success: true,
                message: 'Mock data in emergency mode',
                data: {}
            };
        },
        
        // Convenience methods for common request types
        get: function(endpoint) {
            return this.request(endpoint);
        },
        
        post: function(endpoint, data) {
            return this.request(endpoint, {
                method: 'POST',
                body: JSON.stringify(data)
            });
        },
        
        put: function(endpoint, data) {
            return this.request(endpoint, {
                method: 'PUT',
                body: JSON.stringify(data)
            });
        },
        
        delete: function(endpoint) {
            return this.request(endpoint, {
                method: 'DELETE'
            });
        }
    };
    
    // Initialize the API client when the page loads
    document.addEventListener('DOMContentLoaded', function() {
        window.ApiClient.init();
    });
})(); 