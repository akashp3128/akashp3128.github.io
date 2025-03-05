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
    
    // Load card content from localStorage if available
    loadCardContent();
    
    // Implement lazy-loading for images and resume previews
    lazyLoad();
    
    // Enhance accessibility by adding ARIA attributes
    initializeAccessibility();
});

// Ensure debounce function is defined before usage
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Example usage: Debounce resize event
window.addEventListener('resize', debounce(() => {
    console.log('Window resized');
    // Add resize handling logic here
}, 250));

// Implement lazy-loading for images and resume previews
function lazyLoad() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    const lazyIframes = document.querySelectorAll('iframe[data-src]');

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                element.src = element.getAttribute('data-src');
                observer.unobserve(element);
            }
        });
    });

    lazyImages.forEach(img => observer.observe(img));
    lazyIframes.forEach(iframe => observer.observe(iframe));
}

// Initialize lazy-loading
lazyLoad();

// Enhanced error handling function
function handleError(error, context = 'An error occurred') {
    console.error(`${context}:`, error);
    showError(`${context}: ${error.message || error}`);
}

// Consolidated accessibility initialization
function initializeAccessibility() {
    document.querySelectorAll('button, .modal, input, textarea').forEach(el => {
        el.setAttribute('aria-label', el.textContent.trim() || el.placeholder || 'interactive element');
        if (el.tagName === 'BUTTON') {
            el.setAttribute('role', 'button');
            el.setAttribute('tabindex', '0');
        }
        if (el.classList.contains('modal')) {
            el.setAttribute('role', 'dialog');
            el.setAttribute('aria-modal', 'true');
        }
    });
}

initializeAccessibility();

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
        showError('Failed to load profile image. Please try again later.');
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
        showError('Failed to load resume. Please try again later.');
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
    
    // Save card content button
    if (saveCardContentBtn) {
        saveCardContentBtn.addEventListener('click', saveCardContent);
        console.log('Card content save button listener added');
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

// Show loading indicator
function showLoading(message) {
    const notification = document.getElementById('notification');
    if (notification) {
        notification.textContent = message;
        notification.className = 'notification loading show';
    }
}

// Hide loading indicator
function hideLoading() {
    const notification = document.getElementById('notification');
    if (notification) {
        notification.className = 'notification';
    }
}

// Handle resume upload
function handleResumeUpload(e) {
    const file = e.target.files[0];
    if (!file) return handleError('No file selected', 'Resume Upload');

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) return showError('Please upload a PDF file');

    showMessage('Uploading resume...');

    ApiClient.resume.upload(file).then(response => {
        if (response.success) {
            showMessage('Resume uploaded successfully');
            loadResumePreview();
        } else {
            handleError(response.error, 'Resume upload failed');
        }
    }).catch(error => handleError(error, 'Resume upload error'));
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

// Save the card content to localStorage
function saveCardContent() {
    console.log('Saving card content');
    
    // Get values from form fields
    const content = {
        name: document.getElementById('cardName').value,
        hp: document.getElementById('cardHP').value,
        info: document.getElementById('cardInfo').value,
        ability1Name: document.getElementById('ability1Name').value,
        ability1Cost: document.getElementById('ability1Cost').value,
        ability1Desc: document.getElementById('ability1Desc').value,
        ability2Name: document.getElementById('ability2Name').value,
        ability2Cost: document.getElementById('ability2Cost').value,
        ability2Desc: document.getElementById('ability2Desc').value,
        type: document.getElementById('cardType').value,
        energy: document.getElementById('cardEnergy').value
    };
    
    // Save to localStorage
    localStorage.setItem('pokemonCardContent', JSON.stringify(content));
    
    // Update the card
    updateCardContent(content);
    
    // Show success message
    showMessage('Card content saved successfully!');
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