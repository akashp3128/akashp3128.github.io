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
        // Add authenticated class to body
        document.body.classList.add('authenticated');
        
        // Show admin panel
        if (adminPanel) {
            adminPanel.classList.add('visible');
            adminPanel.style.display = 'block';
        }
        
        // Hide login elements
        if (adminPasswordInput) adminPasswordInput.style.display = 'none';
        if (adminLoginButton) adminLoginButton.style.display = 'none';
        
        // Show admin elements
        if (adminLogoutButton) adminLogoutButton.style.display = 'block';
        
        // Make all admin-only elements visible
        document.querySelectorAll('.admin-only').forEach(element => {
            if (element.tagName === 'BUTTON' || element.tagName === 'A') {
                element.style.display = 'inline-block';
            } else {
                element.style.display = 'block';
            }
        });
        
        // Show delete buttons if they exist
        if (deleteResumeButton) deleteResumeButton.style.display = 'block';
        if (deleteImageButton) deleteImageButton.style.display = 'block';
        
        // Show upload areas
        const uploadAreas = document.querySelectorAll('.upload-area');
        uploadAreas.forEach(area => {
            area.style.display = 'block';
        });
        
        console.log('Admin panel shown');
    }
    
    // Function to hide the admin panel
    function hideAdminPanel() {
        // Remove authenticated class from body
        document.body.classList.remove('authenticated');
        
        // Hide admin panel
        if (adminPanel) {
            adminPanel.classList.remove('visible');
            adminPanel.style.display = 'none';
        }
        
        // Show login elements
        if (adminPasswordInput) adminPasswordInput.style.display = 'block';
        if (adminLoginButton) adminLoginButton.style.display = 'block';
        
        // Hide admin elements
        if (adminLogoutButton) adminLogoutButton.style.display = 'none';
        
        // Hide all admin-only elements
        document.querySelectorAll('.admin-only').forEach(element => {
            element.style.display = 'none';
        });
        
        // Hide delete buttons if they exist
        if (deleteResumeButton) deleteResumeButton.style.display = 'none';
        if (deleteImageButton) deleteImageButton.style.display = 'none';
        
        console.log('Admin panel hidden');
    }
    
    // Initialize the Pokemon card
    function initializePokemonCard() {
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
                    cardImage.src = 'https://via.placeholder.com/300x155';
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
        
        // Resume upload area click handler
        if (resumeUploadArea && resumeFileInput) {
            resumeUploadArea.addEventListener('click', function() {
                resumeFileInput.click();
            });
            
            resumeFileInput.addEventListener('change', handleResumeUpload);
        }
        
        // Profile image upload
        if (imageUploadArea && imageFileInput) {
            imageUploadArea.addEventListener('click', function() {
                imageFileInput.click();
            });
            
            imageFileInput.addEventListener('change', handleImageUpload);
        }
        
        // Delete resume button
        if (deleteResumeButton) {
            deleteResumeButton.addEventListener('click', handleResumeDelete);
        }
        
        // Delete image button
        if (deleteImageButton) {
            deleteImageButton.addEventListener('click', handleImageDelete);
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
                
                // Reload profile image and resume to check if delete buttons should be shown
                loadProfileImage();
                loadResumePreview();
                
                showMessage('Admin login successful');
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
        
        console.log('Attempting to upload resume file:', {
            name: file.name,
            type: file.type,
            size: file.size,
            lastModified: new Date(file.lastModified).toISOString()
        });
        
        // Validate file - check both MIME type and extension
        const isPdfMimeType = file.type === 'application/pdf';
        const isPdfExtension = file.name.toLowerCase().endsWith('.pdf');
        
        console.log('Resume validation:', { isPdfMimeType, isPdfExtension });
        
        if (!isPdfMimeType && !isPdfExtension) {
            showError('Please upload a PDF file');
            return;
        }
        
        showMessage('Uploading resume...');
        
        ApiClient.resume.upload(file).then(response => {
            console.log('Resume upload response:', response);
            if (response.success) {
                showMessage('Resume uploaded successfully');
                // Reload resume preview
                loadResumePreview();
            } else {
                showError('Resume upload failed: ' + (response.error || 'Unknown error'));
            }
        }).catch(error => {
            console.error('Resume upload error:', error);
            showError('Resume upload failed');
        });
    }
    
    // Handle resume delete
    function handleResumeDelete() {
        if (!confirm('Are you sure you want to delete your resume?')) {
            return;
        }
        
        showMessage('Deleting resume...');
        
        ApiClient.resume.delete().then(response => {
            if (response.success) {
                showMessage('Resume deleted successfully');
                // Reload resume preview
                loadResumePreview();
            } else {
                showError('Resume delete failed: ' + (response.error || 'Unknown error'));
            }
        }).catch(error => {
            console.error('Resume delete error:', error);
            showError('Resume delete failed');
        });
    }
    
    // Handle image upload
    function handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        console.log('Attempting to upload image file:', {
            name: file.name,
            type: file.type,
            size: file.size,
            lastModified: new Date(file.lastModified).toISOString()
        });
        
        // Validate file - check both MIME type and extension
        const isImageMimeType = file.type.startsWith('image/');
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
        const hasImageExtension = imageExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
        
        console.log('Image validation:', { isImageMimeType, hasImageExtension });
        
        if (!isImageMimeType && !hasImageExtension) {
            showError('Please upload a valid image file (JPG, PNG, GIF, etc.)');
            return;
        }
        
        showMessage('Uploading image...');
        
        ApiClient.image.upload(file).then(response => {
            console.log('Image upload response:', response);
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
    
    // Handle image delete
    function handleImageDelete() {
        if (!confirm('Are you sure you want to delete your profile image?')) {
            return;
        }
        
        showMessage('Deleting image...');
        
        ApiClient.image.delete().then(response => {
            if (response.success) {
                showMessage('Image deleted successfully');
                // Reload profile image
                loadProfileImage();
            } else {
                showError('Image delete failed: ' + (response.error || 'Unknown error'));
            }
        }).catch(error => {
            console.error('Image delete error:', error);
            showError('Image delete failed');
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