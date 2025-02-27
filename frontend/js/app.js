// Main application logic for the Pokemon card website
document.addEventListener('DOMContentLoaded', function() {
    // DOM References
    const cardInner = document.querySelector('.card-inner');
    const settingsBtn = document.getElementById('adminToggle');
    const adminPasswordInput = document.getElementById('passwordInput');
    const adminLoginButton = document.getElementById('submitPassword');
    const adminLogoutButton = document.getElementById('logoutBtn');
    const adminPanel = document.querySelector('.admin-panel');
    const resumeUploadButton = document.getElementById('resumeUploadButton');
    const resumeFileInput = document.getElementById('fileInput');
    const imageFileInput = document.getElementById('imageFileInput');
    const imageUploadButton = document.getElementById('imageUploadArea');
    
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
        if (adminPanel) adminPanel.classList.add('visible');
        if (adminPasswordInput) adminPasswordInput.style.display = 'none';
        if (adminLoginButton) adminLoginButton.style.display = 'none';
        if (adminLogoutButton) adminLogoutButton.style.display = 'block';
    }
    
    // Function to hide the admin panel
    function hideAdminPanel() {
        if (adminPanel) adminPanel.classList.remove('visible');
        if (adminPasswordInput) adminPasswordInput.style.display = 'block';
        if (adminLoginButton) adminLoginButton.style.display = 'block';
        if (adminLogoutButton) adminLogoutButton.style.display = 'none';
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
                const authDialog = document.getElementById('passwordModal');
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
        document.querySelectorAll('.close-modal').forEach(button => {
            button.addEventListener('click', function() {
                const modal = this.closest('.modal');
                if (modal) {
                    modal.style.display = 'none';
                }
            });
        });
    }
    
    // Handle admin login
    function handleAdminLogin() {
        if (!adminPasswordInput) {
            console.error('Password input not found');
            return;
        }
        
        const password = adminPasswordInput.value;
        
        if (!password) {
            showError('Please enter a password');
            return;
        }
        
        ApiClient.auth.login(password).then(response => {
            if (response.success) {
                showAdminPanel();
                adminPasswordInput.value = '';
                
                // Hide the password modal after successful login
                const passwordModal = document.getElementById('passwordModal');
                if (passwordModal) {
                    passwordModal.style.display = 'none';
                }
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