// Main application logic for the Pokemon card website
document.addEventListener('DOMContentLoaded', function() {
    // DOM References
    const cardInner = document.querySelector('.card-inner');
    const settingsBtn = document.getElementById('settingsBtn');
    const adminPasswordInput = document.getElementById('adminPassword');
    const adminLoginButton = document.getElementById('adminLoginButton');
    const adminLogoutButton = document.getElementById('adminLogoutButton');
    const adminPanel = document.querySelector('.admin-panel');
    const resumeUploadButton = document.getElementById('resumeUploadButton');
    const resumeFileInput = document.getElementById('resumeFile');
    const imageFileInput = document.getElementById('imageFile');
    const imageUploadButton = document.getElementById('imageUploadButton');
    
    // Check if ApiClient is available
    if (!window.ApiClient) {
        console.error('ApiClient not available');
        return;
    }
    
    // Check login status and update UI accordingly
    checkLoginStatus();
    
    // Initialize the Pokemon card
    initializePokemonCard();
    
    // Setup event listeners
    setupEventListeners();
    
    // Function to check login status and update UI
    function checkLoginStatus() {
        const isAuthenticated = window.ApiClient.auth.isAuthenticated();
        
        if (isAuthenticated) {
            showAdminPanel();
        } else {
            hideAdminPanel();
        }
    }
    
    // Function to show the admin panel
    function showAdminPanel() {
        adminPanel.classList.add('visible');
        adminPasswordInput.style.display = 'none';
        adminLoginButton.style.display = 'none';
        adminLogoutButton.style.display = 'block';
    }
    
    // Function to hide the admin panel
    function hideAdminPanel() {
        adminPanel.classList.remove('visible');
        adminPasswordInput.style.display = 'block';
        adminLoginButton.style.display = 'block';
        adminLogoutButton.style.display = 'none';
    }
    
    // Initialize the Pokemon card
    function initializePokemonCard() {
        if (!cardInner) {
            console.error('Card inner element not found');
            return;
        }
        
        // Load profile image if available
        loadProfileImage();
    }
    
    // Load the profile image
    function loadProfileImage() {
        ApiClient.image.get().then(response => {
            if (response.success) {
                // Set profile image on the card
                const profileImage = document.querySelector('.profile-image');
                if (profileImage) {
                    profileImage.src = response.data.url;
                }
            } else {
                console.log('No profile image found, using placeholder');
            }
        }).catch(error => {
            console.error('Error loading profile image:', error);
        });
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Settings button click handler
        if (settingsBtn) {
            settingsBtn.addEventListener('click', function() {
                const authDialog = document.getElementById('authDialog');
                if (authDialog) {
                    authDialog.style.display = 'flex';
                }
            });
        }
        
        // Admin login button
        if (adminLoginButton) {
            adminLoginButton.addEventListener('click', handleAdminLogin);
        }
        
        // Admin password input (handle Enter key)
        if (adminPasswordInput) {
            adminPasswordInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    handleAdminLogin();
                }
            });
        }
        
        // Admin logout button
        if (adminLogoutButton) {
            adminLogoutButton.addEventListener('click', function() {
                ApiClient.auth.logout();
                hideAdminPanel();
            });
        }
        
        // Resume upload button
        if (resumeUploadButton && resumeFileInput) {
            resumeUploadButton.addEventListener('click', function() {
                resumeFileInput.click();
            });
            
            resumeFileInput.addEventListener('change', handleResumeUpload);
        }
        
        // Profile image upload
        if (imageUploadButton && imageFileInput) {
            imageUploadButton.addEventListener('click', function() {
                imageFileInput.click();
            });
            
            imageFileInput.addEventListener('change', handleImageUpload);
        }
        
        // Close dialog buttons
        document.querySelectorAll('.close-dialog').forEach(button => {
            button.addEventListener('click', function() {
                const dialog = this.closest('.dialog');
                if (dialog) {
                    dialog.style.display = 'none';
                }
            });
        });
    }
    
    // Handle admin login
    function handleAdminLogin() {
        const password = adminPasswordInput.value;
        
        if (!password) {
            showError('Please enter a password');
            return;
        }
        
        ApiClient.auth.login(password).then(response => {
            if (response.success) {
                showAdminPanel();
                adminPasswordInput.value = '';
            } else {
                showError('Invalid password');
            }
        }).catch(error => {
            console.error('Login error:', error);
            showError('Login failed');
        });
    }
    
    // Handle resume upload
    function handleResumeUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        // Validate file
        if (file.type !== 'application/pdf') {
            showError('Please upload a PDF file');
            return;
        }
        
        showMessage('Uploading resume...');
        
        ApiClient.resume.upload(file).then(response => {
            if (response.success) {
                showMessage('Resume uploaded successfully');
            } else {
                showError('Resume upload failed: ' + (response.error || 'Unknown error'));
            }
        }).catch(error => {
            console.error('Resume upload error:', error);
            showError('Resume upload failed');
        });
    }
    
    // Handle image upload
    function handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        // Validate file
        if (!file.type.startsWith('image/')) {
            showError('Please upload an image file');
            return;
        }
        
        showMessage('Uploading image...');
        
        ApiClient.image.upload(file).then(response => {
            if (response.success) {
                showMessage('Image uploaded successfully');
                loadProfileImage(); // Reload the profile image
            } else {
                showError('Image upload failed: ' + (response.error || 'Unknown error'));
            }
        }).catch(error => {
            console.error('Image upload error:', error);
            showError('Image upload failed');
        });
    }
    
    // Show an error message
    function showError(message) {
        const errorDialog = document.getElementById('errorDialog');
        const errorMessage = document.getElementById('errorMessage');
        
        if (errorDialog && errorMessage) {
            errorMessage.textContent = message;
            errorDialog.style.display = 'flex';
        } else {
            alert('Error: ' + message);
        }
    }
    
    // Show a message
    function showMessage(message) {
        const messageDialog = document.getElementById('messageDialog');
        const messageText = document.getElementById('messageText');
        
        if (messageDialog && messageText) {
            messageText.textContent = message;
            messageDialog.style.display = 'flex';
        } else {
            alert(message);
        }
    }
}); 