// Main application logic for the Pokemon card website
document.addEventListener('DOMContentLoaded', function() {
    // DOM References
    const cardInner = document.querySelector('.card-inner');
    const settingsBtn = document.getElementById('adminToggle');
    const adminPasswordInput = document.getElementById('passwordInput');
    const adminLoginButton = document.getElementById('submitPassword');
    const adminLogoutButton = document.getElementById('logoutBtn');
    const adminPanel = document.querySelector('.admin-panel');
    const resumeUploadArea = document.getElementById('uploadArea');
    const resumeFileInput = document.getElementById('fileInput');
    const imageFileInput = document.getElementById('imageFileInput');
    const imageUploadArea = document.getElementById('imageUploadArea');
    const deleteResumeButton = document.getElementById('deleteResumeBtn');
    const deleteImageButton = document.getElementById('deleteImageBtn');
    const saveCardContentBtn = document.getElementById('saveCardContent');
    
    // Wait for ApiClient to be ready before initializing
    if (window.apiClientReady) {
        window.apiClientReady
            .then(apiClient => {
                console.log('ApiClient ready from promise, initializing Pokemon card app');
                initializeApp(apiClient);
            })
            .catch(error => {
                console.error('Error waiting for ApiClient:', error);
                // Try to initialize anyway with whatever we have
                initializeApp(window.ApiClient || getApiClientFallback());
            });
            
        // Also listen for the apiClientReady event as a backup
        document.addEventListener('apiClientReady', (event) => {
            console.log('ApiClient ready event received in Pokemon card app');
            // Only initialize if we haven't already
            if (!window.pokemonCardInitialized) {
                initializeApp(event.detail);
            }
        });
    } else {
        // No promise available, initialize directly
        console.log('No apiClientReady promise, initializing Pokemon card app directly');
        initializeApp(window.ApiClient || getApiClientFallback());
    }
    
    // Helper function to create a fallback ApiClient if needed
    function getApiClientFallback() {
        console.warn('Creating fallback ApiClient in Pokemon card app');
        return {
            auth: {
                isAuthenticated: function() { 
                    return !!localStorage.getItem('authToken'); 
                },
                login: async function(password) {
                    console.log('Using fallback login in Pokemon card app');
                    // Only accept dev passwords in fallback mode
                    if (password === 'Rosie@007' || password === 'localdev') {
                        localStorage.setItem('authToken', 'fallback-token-' + Date.now());
                        return { success: true };
                    }
                    return { success: false, error: 'Invalid password' };
                },
                logout: function() {
                    localStorage.removeItem('authToken');
                    return { success: true };
                }
            }
        };
    }
    
    // Main initialization function
    function initializeApp(apiClient) {
        if (window.pokemonCardInitialized) {
            console.log('[akash] Pokemon card app already initialized, skipping');
            return;
        }
        
        console.log('[akash] Initializing Pokemon card app with API:', apiClient);
        window.pokemonCardInitialized = true;
        window.ApiClient = apiClient;
        
        // Initialize Pokemon card functionality
        initializeCardFeatures();
        
        // Setup settings panel button actions
        setupSettingsPanelEvents();
        
        // Check login status and update UI
        if (window.AuthManager) {
            console.log('[akash] Using centralized AuthManager for authentication status');
            if (window.AuthManager.isAuthenticated()) {
                console.log('[akash] User is authenticated, showing admin UI');
                showAdminUI();
            } else {
                console.log('[akash] User is not authenticated, hiding admin UI');
                hideAdminUI();
            }
            
            // Listen for auth state changes
            document.addEventListener('authStateChanged', (event) => {
                console.log('[akash] Auth state changed in Pokemon card app:', event.detail.isAuthenticated);
                if (event.detail.isAuthenticated) {
                    showAdminUI();
                } else {
                    hideAdminUI();
                }
            });
        } else {
            console.warn('[akash] AuthManager not available, using legacy auth check');
            checkLoginStatus();
        }
        
        // Load card content
        loadCardContent();
    }
    
    // Setup event listeners for the settings panel
    function setupSettingsPanelEvents() {
        console.log('[akash] Setting up settings panel events');
        // Edit Card Content
        const settingsEditCard = document.getElementById('settingsEditCard');
        if (settingsEditCard) {
            settingsEditCard.addEventListener('click', () => {
                console.log('[akash] Edit card button clicked');
                scrollToSection('adminPanel');
                if (window.SettingsManager) window.SettingsManager.closeSettings();
            });
        } else {
            console.warn('[akash] Settings edit card button not found');
        }
        
        // Upload Profile Image
        const settingsUploadImage = document.getElementById('settingsUploadImage');
        if (settingsUploadImage) {
            settingsUploadImage.addEventListener('click', () => {
                console.log('[akash] Upload image button clicked');
                scrollToSection('imageUploadArea');
                if (window.SettingsManager) window.SettingsManager.closeSettings();
            });
        } else {
            console.warn('[akash] Settings upload image button not found');
        }
        
        // Upload Resume
        const settingsUploadResume = document.getElementById('settingsUploadResume');
        if (settingsUploadResume) {
            settingsUploadResume.addEventListener('click', () => {
                console.log('[akash] Upload resume button clicked');
                scrollToSection('uploadArea');
                if (window.SettingsManager) window.SettingsManager.closeSettings();
            });
        } else {
            console.warn('[akash] Settings upload resume button not found');
        }
    }
    
    // Helper function to scroll to a section
    function scrollToSection(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            console.warn('[akash] Element not found:', elementId);
        }
    }
    
    // Show admin UI elements
    function showAdminUI() {
        console.log('[akash] Showing admin UI');
        document.body.classList.add('authenticated');
        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = 'block';
        });
    }
    
    // Hide admin UI elements
    function hideAdminUI() {
        console.log('[akash] Hiding admin UI');
        document.body.classList.remove('authenticated');
        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = 'none';
        });
    }
    
    // Function to check login status and update UI
    function checkLoginStatus() {
        // Get ApiClient
        const apiClient = window.ApiClient;
        
        if (!apiClient || !apiClient.auth) {
            console.error('ApiClient not available for auth check');
            hideAdminUI();
            return;
        }
        
        try {
            const isAuthenticated = apiClient.auth.isAuthenticated();
            
            if (isAuthenticated) {
                showAdminUI();
            } else {
                hideAdminUI();
            }
        } catch (error) {
            console.error('Error checking authentication:', error);
            // On error, hide admin panel for safety
            hideAdminUI();
        }
    }
    
    // Initialize the Pokemon card
    function initializeCardFeatures() {
        if (!cardInner) {
            console.error('Card inner element not found');
            return;
        }
        
        // Load profile image if available
        loadProfileImage();
        
        // Load resume preview
        loadResumePreview();
    }
    
    // Load the profile image
    function loadProfileImage() {
        ApiClient.image.get().then(response => {
            if (response.success) {
                // Set profile image on the card
                const cardImage = document.querySelector('.card-image img');
                if (cardImage) {
                    cardImage.src = response.data.url;
                    cardImage.classList.add('custom-image');
                    cardImage.alt = 'Akash Patel - Legendary Software Engineer';
                    
                    // Show delete image button if authenticated
                    if (ApiClient.auth.isAuthenticated() && deleteImageButton) {
                        deleteImageButton.style.display = 'block';
                    }
                    
                    console.log('Successfully loaded custom profile image:', response.data.url);
                }
            } else {
                console.log('No profile image found, using placeholder');
                
                // Reset to placeholder if no image found
                const cardImage = document.querySelector('.card-image img');
                if (cardImage) {
                    cardImage.src = '/api/placeholder/300/155';
                    cardImage.classList.remove('custom-image');
                }
                
                // Hide delete image button
                if (deleteImageButton) {
                    deleteImageButton.style.display = 'none';
                }
            }
        }).catch(error => {
            console.error('Error loading profile image:', error);
        });
    }
    
    // Load resume preview
    function loadResumePreview() {
        ApiClient.resume.get().then(response => {
            if (response.success) {
                // Set resume preview
                const resumePreview = document.getElementById('resumePreview');
                const downloadBtn = document.getElementById('downloadBtn');
                
                if (resumePreview) {
                    resumePreview.src = response.data.url;
                }
                
                if (downloadBtn) {
                    downloadBtn.href = response.data.url;
                    downloadBtn.style.display = 'inline-block';
                }
                
                // Show delete resume button if authenticated
                if (ApiClient.auth.isAuthenticated() && deleteResumeButton) {
                    deleteResumeButton.style.display = 'block';
                }
            } else {
                console.log('No resume found');
                
                // Hide download and delete buttons
                const downloadBtn = document.getElementById('downloadBtn');
                if (downloadBtn) {
                    downloadBtn.style.display = 'none';
                }
                
                if (deleteResumeButton) {
                    deleteResumeButton.style.display = 'none';
                }
            }
        }).catch(error => {
            console.error('Error loading resume:', error);
        });
    }
    
    // Load the card content from localStorage
    function loadCardContent() {
        // Try to get saved content from localStorage
        const savedContent = localStorage.getItem('pokemonCardContent');
        
        if (savedContent) {
            try {
                const content = JSON.parse(savedContent);
                console.log('Loaded saved card content:', content);
                
                // Fill form fields with saved content
                if (document.getElementById('cardName')) document.getElementById('cardName').value = content.name || 'Akash Patel';
                if (document.getElementById('cardHP')) document.getElementById('cardHP').value = content.hp || '200';
                if (document.getElementById('cardInfo')) document.getElementById('cardInfo').value = content.info || '';
                if (document.getElementById('ability1Name')) document.getElementById('ability1Name').value = content.ability1Name || 'Algorithm Development';
                if (document.getElementById('ability1Cost')) document.getElementById('ability1Cost').value = content.ability1Cost || '★★★★';
                if (document.getElementById('ability1Desc')) document.getElementById('ability1Desc').value = content.ability1Desc || '';
                if (document.getElementById('ability2Name')) document.getElementById('ability2Name').value = content.ability2Name || 'Systems Integration';
                if (document.getElementById('ability2Cost')) document.getElementById('ability2Cost').value = content.ability2Cost || '★★★';
                if (document.getElementById('ability2Desc')) document.getElementById('ability2Desc').value = content.ability2Desc || '';
                if (document.getElementById('cardType')) document.getElementById('cardType').value = content.type || 'Legendary Software Engineer';
                if (document.getElementById('cardEnergy')) document.getElementById('cardEnergy').value = content.energy || '✦✦✦✦✦';
                
                // Update the card
                updateCardContent(content);
                
                console.log('Card content loaded and applied');
            } catch (e) {
                console.error('Error loading card content:', e);
            }
        } else {
            console.log('No saved card content found');
        }
    }
    
    // Update the card with the provided content
    function updateCardContent(content) {
        console.log('Updating card content with:', content);
        
        // Front side updates
        const cardName = document.querySelector('.card-header');
        const cardHPElement = document.querySelector('.card-stats');
        const cardInfo = document.querySelector('.card-info');
        const ability1NameElement = document.querySelectorAll('.ability-name')[0];
        const ability1CostElement = document.querySelectorAll('.ability-cost')[0];
        const ability1DescElement = document.querySelectorAll('.ability-description')[0];
        const ability2NameElement = document.querySelectorAll('.ability-name')[1];
        const ability2CostElement = document.querySelectorAll('.ability-cost')[1];
        const ability2DescElement = document.querySelectorAll('.ability-description')[1];
        const cardTypeElement = document.querySelector('.card-type');
        const cardEnergyElement = document.querySelector('.card-energy');
        
        // Update name (preserving the HP element)
        if (cardName) {
            const nameText = document.createTextNode(content.name);
            
            // Clear existing content (except HP)
            while (cardName.firstChild) {
                if (cardName.firstChild !== cardHPElement) {
                    cardName.removeChild(cardName.firstChild);
                } else {
                    break;
                }
            }
            
            // Add the new name text before the HP element
            cardName.insertBefore(nameText, cardHPElement);
        }
        
        // Update HP
        if (cardHPElement) {
            cardHPElement.textContent = `HP ${content.hp} ⚡`;
        }
        
        // Update info
        if (cardInfo) {
            cardInfo.textContent = content.info;
        }
        
        // Update abilities
        if (ability1NameElement) ability1NameElement.textContent = content.ability1Name;
        if (ability1CostElement) ability1CostElement.textContent = content.ability1Cost;
        if (ability1DescElement) ability1DescElement.textContent = content.ability1Desc;
        
        if (ability2NameElement) ability2NameElement.textContent = content.ability2Name;
        if (ability2CostElement) ability2CostElement.textContent = content.ability2Cost;
        if (ability2DescElement) ability2DescElement.textContent = content.ability2Desc;
        
        // Update card type and energy
        if (cardTypeElement) cardTypeElement.textContent = content.type;
        if (cardEnergyElement) cardEnergyElement.textContent = content.energy;
    }
    
    // Show an error message
    function showError(message) {
        const notification = document.getElementById('notification');
        
        if (notification) {
            notification.textContent = message;
            notification.className = 'notification error show';
            
            setTimeout(() => {
                notification.className = 'notification';
            }, 3000);
        } else {
            alert('Error: ' + message);
        }
    }
    
    // Show a message
    function showMessage(message) {
        const notification = document.getElementById('notification');
        
        if (notification) {
            notification.textContent = message;
            notification.className = 'notification success show';
            
            setTimeout(() => {
                notification.className = 'notification';
            }, 3000);
        } else {
            alert(message);
        }
    }
}); 