// Navy Evaluations Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    console.log('Navy evaluations page initialized');
    
    // Create our core objects using an OOP approach
    const NavyUI = new NavyUIController();
    const ModalManager = new ModalController();
    const AdminManager = new AdminController(NavyUI, ModalManager);
    
    // Initialize the page
    NavyUI.initializePage();
});

/**
 * Modal Controller Class - Handles all modal-related functionality
 * Following Single Responsibility Principle
 */
class ModalController {
    constructor() {
        // Modal References
        this.imageViewerModal = document.getElementById('imageViewerModal');
        this.uploadEvalModal = document.getElementById('uploadEvalModal');
        this.editAboutModal = document.getElementById('editAboutModal');
        this.passwordModal = document.getElementById('passwordModal');
        
        // Setup modal close buttons
        this.setupCloseButtons();
        
        // Setup outside click closing
        this.setupOutsideClickClose();
    }
    
    setupCloseButtons() {
        console.log('Setting up modal close buttons');
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.closeAllModals();
            });
        });
        
        // Close specifically for password modal
        const closeModalBtn = document.getElementById('closeModal');
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.passwordModal) {
                    this.passwordModal.style.display = 'none';
                }
            });
        }
    }
    
    setupOutsideClickClose() {
        window.addEventListener('click', (event) => {
            if (event.target.classList.contains('modal')) {
                this.closeModal(event.target);
            }
        });
    }
    
    openModal(modal) {
        if (!modal) return;
        
        console.log('Opening modal', modal.id);
        modal.style.display = 'block';
        
        // Add admin modal class if user is authenticated
        if (document.body.classList.contains('authenticated')) {
            modal.classList.add('admin-modal');
            
            // Make modal content draggable in admin mode
            const modalContent = modal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.classList.add('draggable');
                
                // Add modal controls if they don't exist
                if (!modalContent.querySelector('.modal-controls')) {
                    this.addModalControls(modalContent);
                }
                
                // Fix modal position to ensure no overlap with buttons
                modalContent.style.top = '80px';
                modalContent.style.left = '50%';
                modalContent.style.transform = 'translateX(-50%)';
                
                // Ensure the close button is not covered
                const closeBtn = modalContent.querySelector('.close-modal');
                if (closeBtn) {
                    closeBtn.style.zIndex = '1000';
                    closeBtn.style.position = 'absolute';
                    closeBtn.style.right = '10px';
                    closeBtn.style.top = '10px';
                }
            }
        }
    }
    
    closeModal(modal) {
        if (!modal) return;
        
        console.log('Closing modal', modal.id);
        modal.style.display = 'none';
        
        // Remove admin classes
        modal.classList.remove('admin-modal');
        
        // Reset modal content position if it was draggable
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.classList.remove('draggable', 'compact');
            modalContent.style.top = '';
            modalContent.style.left = '';
            modalContent.style.transform = '';
        }
    }
    
    closeAllModals() {
        console.log('Closing all modals');
        this.closeModal(this.imageViewerModal);
        this.closeModal(this.uploadEvalModal);
        this.closeModal(this.editAboutModal);
        this.closeModal(this.passwordModal);
    }
    
    addModalControls(modalContent) {
        // Create modal header if it doesn't exist
        let modalHeader = modalContent.querySelector('.modal-header');
        if (!modalHeader) {
            modalHeader = document.createElement('div');
            modalHeader.className = 'modal-header';
            
            // Create controls
            const controls = document.createElement('div');
            controls.className = 'modal-controls';
            
            // Add controls to header
            modalHeader.appendChild(controls);
            
            // Prepend to modal content (but after close button)
            const closeBtn = modalContent.querySelector('.close-modal');
            if (closeBtn) {
                modalContent.insertBefore(modalHeader, closeBtn.nextSibling);
            } else {
                modalContent.prepend(modalHeader);
            }
        }
        
        // Add controls if they don't exist
        let controls = modalContent.querySelector('.modal-controls');
        if (!controls) {
            controls = document.createElement('div');
            controls.className = 'modal-controls';
            modalHeader.appendChild(controls);
        }
        
        // Clear existing controls to avoid duplicates
        controls.innerHTML = '';
        
        // Add compact toggle button
        const compactBtn = document.createElement('button');
        compactBtn.className = 'modal-control-btn compact-toggle';
        compactBtn.innerHTML = '🔍';
        compactBtn.title = 'Toggle compact mode';
        compactBtn.onclick = (e) => {
            e.stopPropagation();
            modalContent.classList.toggle('compact');
        };
        
        controls.appendChild(compactBtn);
        
        // Make modal draggable
        this.makeElementDraggable(modalContent);
    }
    
    makeElementDraggable(element) {
        if (!element) return;
        
        console.log('Making element draggable', element);
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        
        // Find header or create a dragable area
        const header = element.querySelector('.modal-header') || element;
        
        if (header) {
            header.onmousedown = dragMouseDown;
            
            // Add a visual cue that this is draggable
            header.style.cursor = 'move';
        }
        
        function dragMouseDown(e) {
            e.preventDefault();
            
            // Get the mouse cursor position at startup
            pos3 = e.clientX;
            pos4 = e.clientY;
            
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
            
            // Add active dragging class
            element.classList.add('dragging');
        }
        
        function elementDrag(e) {
            e.preventDefault();
            
            // Calculate the new cursor position
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            
            // Set the element's new position
            // Ensure it stays within viewport bounds
            const top = Math.max(10, Math.min(window.innerHeight - 100, element.offsetTop - pos2));
            const left = Math.max(10, Math.min(window.innerWidth - 100, element.offsetLeft - pos1));
            
            element.style.top = top + "px";
            element.style.left = left + "px";
            element.style.transform = 'none'; // Remove centering transform
        }
        
        function closeDragElement() {
            // Stop moving when mouse button is released
            document.onmouseup = null;
            document.onmousemove = null;
            
            // Remove active dragging class
            element.classList.remove('dragging');
        }
    }
}

/**
 * NavyUI Controller Class - Handles UI-related functionality
 * Following Single Responsibility Principle
 */
class NavyUIController {
    constructor() {
        // DOM References
        this.navyProfileImage = document.getElementById('navyProfileImage');
        this.navyProfileUploadOverlay = document.getElementById('navyProfileUploadOverlay');
        this.editNavyAboutBtn = document.getElementById('editNavyAboutBtn');
        this.navyAboutContent = document.getElementById('navyAboutContent');
        this.uploadEvalBtn = document.getElementById('uploadEvalBtn');
        this.reorderEvalsBtn = document.getElementById('reorderEvalsBtn');
        this.evaluationsGallery = document.getElementById('evaluationsGallery');
        this.aboutTextEditor = document.getElementById('aboutTextEditor');
        this.saveAboutBtn = document.getElementById('saveAboutBtn');
        
        // Image Viewer Modal References
        this.enlargedImage = document.getElementById('enlargedImage');
        this.prevImageBtn = document.getElementById('prevImageBtn');
        this.nextImageBtn = document.getElementById('nextImageBtn');
        this.imageDate = document.getElementById('imageDate');
        this.imageIndex = document.getElementById('imageIndex');
        
        // Upload Modal References
        this.evalUploadArea = document.getElementById('evalUploadArea');
        this.evalFileInput = document.getElementById('evalFileInput');
        this.cropperImage = document.getElementById('cropperImage');
        this.evalDate = document.getElementById('evalDate');
        this.evalDescription = document.getElementById('evalDescription');
        this.uploadStep1 = document.getElementById('uploadStep1');
        this.uploadStep2 = document.getElementById('uploadStep2');
        this.uploadStep3 = document.getElementById('uploadStep3');
        this.prevStepBtn = document.getElementById('prevStepBtn');
        this.nextStepBtn = document.getElementById('nextStepBtn');
        this.uploadFinalBtn = document.getElementById('uploadFinalBtn');
        
        // Cropper Controls
        this.rotateLeftBtn = document.getElementById('rotateLeftBtn');
        this.rotateRightBtn = document.getElementById('rotateRightBtn');
        this.zoomInBtn = document.getElementById('zoomInBtn');
        this.zoomOutBtn = document.getElementById('zoomOutBtn');
        
        // Variables
        this.cropper = null;
        this.currentEvaluationIndex = 0;
        this.evaluations = [];
        this.currentUploadStep = 1;
        this.apiClient = null; // Will be initialized later
    }
    
    initializePage() {
        console.log('Initializing Navy Career page');
        
        // Try to initialize with API client
        this.getApiClient()
            .then(client => {
                console.log('API client initialized');
                this.apiClient = client;
                this.continueInitialization();
            })
            .catch(error => {
                console.warn('API client initialization failed, continuing without API:', error);
                this.continueInitialization();
            });
    }
    
    continueInitialization() {
        // Check login status - this will handle admin UI setup if needed
        this.checkLoginStatus();
        
        // Load data and setup listeners
        this.loadNavalProfile();
        this.setupEventListeners();
    }
    
    async getApiClient() {
        console.log('Getting API client');
        if (window.api) {
            return window.api;
        } else {
            console.warn('API not available, waiting...');
            // Wait for up to 2 seconds for API to be available
            return new Promise((resolve, reject) => {
                let attempts = 0;
                const checkApi = setInterval(() => {
                    attempts++;
                    if (window.api) {
                        clearInterval(checkApi);
                        resolve(window.api);
                    } else if (attempts > 20) { // 20 * 100ms = 2 seconds
                        clearInterval(checkApi);
                        reject(new Error('API not available after waiting'));
                    }
                }, 100);
            });
        }
    }
    
    checkLoginStatus() {
        console.log('Checking login status');
        const isLoggedIn = localStorage.getItem('admin_authenticated') === 'true';
        
        if (isLoggedIn) {
            document.body.classList.add('authenticated');
            this.showAdminControls();
        } else {
            document.body.classList.remove('authenticated');
            this.hideAdminControls();
        }
    }
    
    showAdminControls() {
        console.log('Showing admin controls');
        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = 'block';
        });
    }
    
    hideAdminControls() {
        console.log('Hiding admin controls');
        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = 'none';
        });
    }
    
    setupEventListeners() {
        console.log('Setting up UI event listeners');
        
        // Save about changes
        if (this.saveAboutBtn) {
            this.saveAboutBtn.addEventListener('click', () => this.saveAboutContent());
        }
        
        // About section edit
        if (this.editNavyAboutBtn) {
            this.editNavyAboutBtn.addEventListener('click', () => this.openEditAboutModal());
        }
        
        // Navy profile image upload
        if (this.navyProfileUploadOverlay) {
            this.navyProfileUploadOverlay.addEventListener('click', () => this.handleProfileImageUpload());
        }
    }
    
    loadNavalProfile() {
        console.log('Loading naval profile');
        this.loadProfileImage();
        this.loadAboutContent();
        this.loadEvaluations();
    }
    
    loadProfileImage() {
        console.log('Loading profile image');
        // Use stored profile image or default
        const storedProfileImage = localStorage.getItem('navy_profile_image');
        if (storedProfileImage && this.navyProfileImage) {
            this.navyProfileImage.src = storedProfileImage;
        }
    }
    
    loadAboutContent() {
        console.log('Loading about content');
        // Load about content from storage
        const aboutContent = localStorage.getItem('navy_about_content');
        if (aboutContent && this.navyAboutContent) {
            this.navyAboutContent.innerHTML = aboutContent;
        }
    }
    
    loadEvaluations() {
        console.log('Loading evaluations');
        // Load evaluations from storage
        const storedEvaluations = localStorage.getItem('navy_evaluations');
        if (storedEvaluations) {
            try {
                this.evaluations = JSON.parse(storedEvaluations);
                this.renderEvaluations();
            } catch (e) {
                console.error('Failed to parse stored evaluations:', e);
            }
        }
    }
    
    openEditAboutModal() {
        console.log('Opening edit about modal');
        if (this.aboutTextEditor && this.navyAboutContent) {
            this.aboutTextEditor.value = this.navyAboutContent.innerHTML;
            const modal = document.getElementById('editAboutModal');
            if (modal && window.ModalManager) {
                window.ModalManager.openModal(modal);
            }
        }
    }
    
    saveAboutContent() {
        console.log('Saving about content');
        if (!this.aboutTextEditor || !this.navyAboutContent) {
            console.error('Missing required elements for saving about content');
            return;
        }
        
        const content = this.aboutTextEditor.value;
        
        // Update the content immediately
        this.navyAboutContent.innerHTML = content;
        
        // Try to save via API if available
        if (this.apiClient && this.apiClient.saveAboutContent) {
            this.apiClient.saveAboutContent(content)
                .then(() => {
                    console.log('About content saved via API');
                    // Also save to localStorage as backup
                    localStorage.setItem('navy_about_content', content);
                    
                    // Show success message
                    this.showNotification('Content saved successfully!', 'success');
                    
                    // Close the modal
                    const modal = document.getElementById('editAboutModal');
                    if (modal && window.ModalManager) {
                        window.ModalManager.closeModal(modal);
                    }
                })
                .catch(error => {
                    console.error('Failed to save about content via API:', error);
                    // Fall back to localStorage
                    localStorage.setItem('navy_about_content', content);
                    
                    // Show warning message
                    this.showNotification('Content saved locally (offline mode)', 'warning');
                    
                    // Close the modal
                    const modal = document.getElementById('editAboutModal');
                    if (modal && window.ModalManager) {
                        window.ModalManager.closeModal(modal);
                    }
                });
        } else {
            // No API available, use localStorage
            localStorage.setItem('navy_about_content', content);
            
            // Show info message
            this.showNotification('Content saved locally', 'info');
            
            // Close the modal
            const modal = document.getElementById('editAboutModal');
            if (modal && window.ModalManager) {
                window.ModalManager.closeModal(modal);
            }
        }
    }
    
    handleProfileImageUpload() {
        console.log('Handling profile image upload');
        // Create file input dynamically
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);
        
        fileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                const reader = new FileReader();
                
                reader.onload = (e) => {
                    // Set the profile image
                    if (this.navyProfileImage) {
                        this.navyProfileImage.src = e.target.result;
                        
                        // Save to localStorage
                        localStorage.setItem('navy_profile_image', e.target.result);
                        
                        // Show success message
                        this.showNotification('Profile image updated!', 'success');
                    }
                };
                
                reader.readAsDataURL(file);
            }
            
            // Remove the temporary file input
            document.body.removeChild(fileInput);
        });
        
        // Trigger file selection
        fileInput.click();
    }
    
    showNotification(message, type = 'info') {
        // Create notification element if it doesn't exist
        let notification = document.querySelector('.notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.className = 'notification';
            document.body.appendChild(notification);
        }
        
        // Set message and type
        notification.textContent = message;
        notification.className = 'notification ' + type;
        
        // Show notification
        notification.classList.add('show');
        
        // Hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
}

/**
 * Admin Controller Class - Handles admin-related functionality
 * Following Single Responsibility Principle
 */
class AdminController {
    constructor(navyUI, modalManager) {
        this.navyUI = navyUI;
        this.modalManager = modalManager;
        
        // Create global references to our controllers
        window.NavyUI = navyUI;
        window.ModalManager = modalManager;
        
        // Admin Panel Controls
        this.adminToggle = document.getElementById('adminToggle');
        this.passwordModal = document.getElementById('passwordModal');
        this.passwordInput = document.getElementById('passwordInput');
        this.submitPassword = document.getElementById('submitPassword');
        
        // Setup admin event listeners
        this.setupAdminEventListeners();
    }
    
    setupAdminEventListeners() {
        console.log('Setting up admin event listeners');
        
        // Admin toggle click (show password modal)
        if (this.adminToggle) {
            this.adminToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.passwordModal) {
                    this.modalManager.openModal(this.passwordModal);
                    if (this.passwordInput) {
                        setTimeout(() => this.passwordInput.focus(), 100);
                    }
                }
            });
        }
        
        // Login form submit
        if (this.submitPassword) {
            this.submitPassword.addEventListener('click', () => this.handleLogin());
        }
        
        // Login form Enter key
        if (this.passwordInput) {
            this.passwordInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleLogin();
                }
            });
        }
    }
    
    handleLogin() {
        console.log('Handling login');
        if (!this.passwordInput) {
            console.error('Password input field not found!');
            return;
        }
        
        const password = this.passwordInput.value;
        
        // Clear the input field for security
        this.passwordInput.value = '';
        
        // Check password
        if (password === 'admin1234') { // In a real app, use a secure authentication method
            console.log('Login successful');
            
            // Set authenticated flag
            localStorage.setItem('admin_authenticated', 'true');
            document.body.classList.add('authenticated');
            
            // Show admin controls
            this.navyUI.showAdminControls();
            
            // Close the modal
            this.modalManager.closeModal(this.passwordModal);
            
            // Show success message
            this.navyUI.showNotification('Login successful! Admin mode activated.', 'success');
        } else {
            console.log('Login failed');
            
            // Show error message
            this.navyUI.showNotification('Incorrect password. Please try again.', 'error');
            
            // Focus the password input again
            setTimeout(() => this.passwordInput.focus(), 100);
        }
    }
}
    
    // Function to check login status and update UI
    function checkLoginStatus() {
        console.log('Checking login status...');
        // Show login status in the debug area
        const loginStatusDiv = document.querySelector('.login-status');
        
        // Get ApiClient using the safe accessor function
        const apiClient = getApiClient();
        
        // If we don't have an ApiClient with auth functionality
        if (!apiClient || !apiClient.auth) {
            console.warn('ApiClient not available for auth check');
            if (loginStatusDiv) loginStatusDiv.textContent = 'Auth service not available';
            
            // Hide admin features
            document.body.classList.remove('authenticated');
            if (adminToggle) adminToggle.classList.remove('admin-active');
            document.querySelectorAll('.admin-only').forEach(el => {
                el.style.display = 'none';
            });
            
            return;
        }
        
        try {
            const isAuthenticated = apiClient.auth.isAuthenticated();
            console.log('Authentication status:', isAuthenticated);
            
            if (loginStatusDiv) {
                loginStatusDiv.textContent = isAuthenticated ? 
                    'Status: Logged in as Admin' : 
                    'Status: Not logged in';
            }
            
            if (isAuthenticated) {
                document.body.classList.add('authenticated');
                if (adminToggle) adminToggle.classList.add('admin-active');
                
                // Show all admin-only elements
                document.querySelectorAll('.admin-only').forEach(el => {
                    el.style.display = el.tagName.toLowerCase() === 'button' || 
                                      el.tagName.toLowerCase() === 'a' ? 
                                      'inline-block' : 'block';
                });
                
                // Hide password modal if it's open
                if (passwordModal) passwordModal.style.display = 'none';
            } else {
                document.body.classList.remove('authenticated');
                if (adminToggle) adminToggle.classList.remove('admin-active');
                
                // Hide all admin-only elements
                document.querySelectorAll('.admin-only').forEach(el => {
                    el.style.display = 'none';
                });
            }
        } catch (e) {
            console.error('Error checking authentication status:', e);
            if (loginStatusDiv) loginStatusDiv.textContent = 'Error checking auth status';
            
            // On error, hide admin features for safety
            document.body.classList.remove('authenticated');
            if (adminToggle) adminToggle.classList.remove('admin-active');
            document.querySelectorAll('.admin-only').forEach(el => {
                el.style.display = 'none';
            });
        }
    }
    
    // Helper function to safely get ApiClient
    function getApiClient() {
        // Try window.ApiClient first (should be available from init.js)
        if (window.ApiClient && window.ApiClient.auth) {
            return window.ApiClient;
        }
        
        // If not on window, try global scope
        if (typeof ApiClient !== 'undefined' && ApiClient.auth) {
            // Also set it on window for future use
            window.ApiClient = ApiClient;
            return ApiClient;
        }
        
        // Neither available
        return null;
    }
    
    // Setup all event listeners
    function setupEventListeners() {
        console.log('Setting up event listeners');
        
        // Close modal button
        if (closeModalBtn) {
            console.log('Adding click handler to close modal button');
            closeModalBtn.addEventListener('click', function() {
                console.log('Close modal button clicked');
                if (passwordModal) {
                    passwordModal.style.display = 'none';
                }
            });
        } else {
            console.error('Close modal button not found!');
        }
        
        // Close modals on outside click
        window.addEventListener('click', function(event) {
            if (event.target === passwordModal) {
                passwordModal.style.display = 'none';
            }
            
            if (event.target === uploadEvalModal) {
                closeModal(uploadEvalModal);
            }
            
            if (event.target === imageViewerModal) {
                closeModal(imageViewerModal);
            }
            
            if (event.target === editAboutModal) {
                closeModal(editAboutModal);
            }
        });
        
        // Login form - Ensure these handlers are properly attached
        console.log('Setting up login form handlers');
        if (submitPassword) {
            console.log('Adding click handler to submitPassword button');
            submitPassword.addEventListener('click', function() {
                console.log('Submit password button clicked');
                handleLogin();
            });
        } else {
            console.error('Submit password button not found!');
        }
        
        if (passwordInput) {
            console.log('Adding keypress handler to passwordInput');
            passwordInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    console.log('Enter key pressed in password input');
                    handleLogin();
                }
            });
        } else {
            console.error('Password input field not found!');
        }
        
        // Navy profile image upload
        if (navyProfileUploadOverlay) {
            navyProfileUploadOverlay.addEventListener('click', handleProfileImageUpload);
        }
        
        // About section edit
        if (editNavyAboutBtn) {
            editNavyAboutBtn.addEventListener('click', openEditAboutModal);
        }
        
        // Save about changes
        if (saveAboutBtn) {
            saveAboutBtn.addEventListener('click', saveAboutContent);
        }
        
        // Upload evaluation button
        if (uploadEvalBtn) {
            uploadEvalBtn.addEventListener('click', openUploadEvalModal);
        }
        
        // Reorder evaluations button
        if (reorderEvalsBtn) {
            reorderEvalsBtn.addEventListener('click', enableReorderMode);
        }
        
        // Evaluation upload area
        if (evalUploadArea) {
            evalUploadArea.addEventListener('click', triggerFileInput);
            evalUploadArea.addEventListener('dragover', handleDragOver);
            evalUploadArea.addEventListener('drop', handleFileDrop);
        }
        
        // Evaluation file input
        if (evalFileInput) {
            evalFileInput.addEventListener('change', handleFileSelection);
        }
        
        // Modal close buttons
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', closeAllModals);
        });
        
        // Cropper controls
        if (rotateLeftBtn) rotateLeftBtn.addEventListener('click', () => rotateCropper(-90));
        if (rotateRightBtn) rotateRightBtn.addEventListener('click', () => rotateCropper(90));
        if (zoomInBtn) zoomInBtn.addEventListener('click', () => zoomCropper(0.1));
        if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => zoomCropper(-0.1));
        
        // Upload wizard navigation
        if (prevStepBtn) prevStepBtn.addEventListener('click', prevUploadStep);
        if (nextStepBtn) nextStepBtn.addEventListener('click', nextUploadStep);
        if (uploadFinalBtn) uploadFinalBtn.addEventListener('click', uploadEvaluation);
        
        // Image viewer navigation
        if (prevImageBtn) prevImageBtn.addEventListener('click', showPrevImage);
        if (nextImageBtn) nextImageBtn.addEventListener('click', showNextImage);
    }
    
    // Load naval profile content
    function loadNavalProfile() {
        // Load profile image
        loadProfileImage();
        
        // Load about content
        loadAboutContent();
    }
    
    // Function to load the profile image
    function loadProfileImage() {
        // Try to load the navy profile image
        window.ApiClient.image.getNavyProfileImage()
            .then(imageUrl => {
                if (imageUrl) {
                    navyProfileImage.src = imageUrl;
                }
            })
            .catch(error => {
                console.error('Error loading profile image:', error);
            });
    }
    
    // Function to load about content
    function loadAboutContent() {
        const savedContent = localStorage.getItem('navy_about_content');
        
        if (savedContent) {
            navyAboutContent.innerHTML = savedContent;
        }
        
        // In a real implementation, you would load this from the API
        // ApiClient.getNavyContent().then(content => { ... });
    }
    
    // Function to load evaluations
    function loadEvaluations() {
        // Clear existing evaluations
        evaluationsGallery.innerHTML = '';
        
        // In the real implementation, you would load these from your backend API
        // For now, let's use localStorage for the demo
        const savedEvaluations = localStorage.getItem('navy_evaluations');
        
        if (savedEvaluations) {
            evaluations = JSON.parse(savedEvaluations);
        } else {
            // Initialize with empty array if none exist
            evaluations = [];
        }
        
        // Sort evaluations by date
        evaluations.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Render evaluations
        renderEvaluations();
    }
    
    // Function to render evaluations
    function renderEvaluations() {
        if (evaluations.length === 0) {
            // Display a message if no evaluations
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-message';
            emptyMessage.textContent = 'No evaluations available. Use the upload button to add your first evaluation.';
            evaluationsGallery.appendChild(emptyMessage);
            return;
        }
        
        // Render each evaluation
        evaluations.forEach((evaluation, index) => {
            const evalItem = document.createElement('div');
            evalItem.className = 'evaluation-item';
            evalItem.dataset.index = index;
            
            // Create image element
            const image = document.createElement('img');
            image.className = 'evaluation-image';
            image.src = evaluation.imageUrl;
            image.alt = `Evaluation from ${evaluation.date}`;
            
            // Create overlay
            const overlay = document.createElement('div');
            overlay.className = 'evaluation-overlay';
            
            // Format the date
            const formattedDate = new Date(evaluation.date).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            // Create date element
            const dateElem = document.createElement('div');
            dateElem.className = 'evaluation-date';
            dateElem.textContent = formattedDate;
            
            // If there's a description, create description element
            if (evaluation.description) {
                const descElem = document.createElement('div');
                descElem.className = 'evaluation-desc';
                descElem.textContent = evaluation.description;
                overlay.appendChild(descElem);
            }
            
            // Add date to overlay
            overlay.appendChild(dateElem);
            
            // Add click event to open the image viewer
            evalItem.addEventListener('click', function() {
                openImageViewer(index);
            });
            
            // Append elements
            evalItem.appendChild(image);
            evalItem.appendChild(overlay);
            
            // Append to gallery
            evaluationsGallery.appendChild(evalItem);
        });
    }
    
    // Function to open the image viewer
    function openImageViewer(index) {
        if (evaluations.length === 0) return;
        
        currentEvaluationIndex = index;
        
        // Load image and details
        const evaluation = evaluations[currentEvaluationIndex];
        enlargedImage.src = evaluation.imageUrl;
        
        // Format the date
        const formattedDate = new Date(evaluation.date).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        imageDate.textContent = `Date: ${formattedDate}`;
        imageIndex.textContent = `${currentEvaluationIndex + 1} of ${evaluations.length}`;
        
        // Show the modal
        openModal(imageViewerModal);
        
        // Update navigation buttons
        updateImageNavigation();
    }
    
    // Function to update image navigation buttons state
    function updateImageNavigation() {
        prevImageBtn.disabled = currentEvaluationIndex === 0;
        nextImageBtn.disabled = currentEvaluationIndex === evaluations.length - 1;
        
        prevImageBtn.style.opacity = prevImageBtn.disabled ? 0.5 : 1;
        nextImageBtn.style.opacity = nextImageBtn.disabled ? 0.5 : 1;
    }
    
    // Function to show the previous image
    function showPrevImage() {
        if (currentEvaluationIndex > 0) {
            currentEvaluationIndex--;
            openImageViewer(currentEvaluationIndex);
        }
    }
    
    // Function to show the next image
    function showNextImage() {
        if (currentEvaluationIndex < evaluations.length - 1) {
            currentEvaluationIndex++;
            openImageViewer(currentEvaluationIndex);
        }
    }
    
    // Function to handle login
    function handleLogin() {
        console.log('Handling login');
        if (!this.passwordInput) {
            console.error('Password input field not found!');
            return;
        }
        
        const password = this.passwordInput.value;
        
        // Clear the input field for security
        this.passwordInput.value = '';
        
        // Check password
        if (password === 'admin1234') { // In a real app, use a secure authentication method
            console.log('Login successful');
            
            // Set authenticated flag
            localStorage.setItem('admin_authenticated', 'true');
            document.body.classList.add('authenticated');
            
            // Show admin controls
            this.navyUI.showAdminControls();
            
            // Close the modal
            this.modalManager.closeModal(this.passwordModal);
            
            // Show success message
            this.navyUI.showNotification('Login successful! Admin mode activated.', 'success');
        } else {
            console.log('Login failed');
            
            // Show error message
            this.navyUI.showNotification('Incorrect password. Please try again.', 'error');
            
            // Focus the password input again
            setTimeout(() => this.passwordInput.focus(), 100);
        }
    }
}
    
    // Function to go to the next upload step
    function nextUploadStep() {
        if (currentUploadStep === 1) {
            // Check if file is selected
            if (!evalFileInput.files || !evalFileInput.files[0]) {
                alert('Please select an image file first');
                return;
            }
            
            // Initialize cropper
            showUploadStep(2);
            initCropper();
        } else if (currentUploadStep === 2) {
            // Move to the final step
            showUploadStep(3);
        }
    }
    
    // Function to trigger file input click
    function triggerFileInput() {
        evalFileInput.click();
    }
    
    // Function to handle drag over
    function handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        evalUploadArea.classList.add('drag-over');
    }
    
    // Function to handle file drop
    function handleFileDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        evalUploadArea.classList.remove('drag-over');
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            evalFileInput.files = e.dataTransfer.files;
            handleFileSelection();
        }
    }
    
    // Function to handle file selection
    function handleFileSelection() {
        if (evalFileInput.files && evalFileInput.files[0]) {
            const file = evalFileInput.files[0];
            
            // Check if it's an image
            if (!file.type.match('image.*')) {
                alert('Please select an image file');
                return;
            }
            
            // Read the file
            const reader = new FileReader();
            reader.onload = function(e) {
                // Set the image source for cropping
                cropperImage.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }
    
    // Function to initialize the cropper
    function initCropper() {
        // Destroy previous cropper if it exists
        if (cropper) {
            cropper.destroy();
        }
        
        // Initialize new cropper
        cropper = new Cropper(cropperImage, {
            aspectRatio: 3 / 4, // Match the aspect ratio of the evaluation cards
            viewMode: 1,
            responsive: true,
            restore: true
        });
    }
    
    // Function to rotate the cropper
    function rotateCropper(degree) {
        if (cropper) {
            cropper.rotate(degree);
        }
    }
    
    // Function to zoom the cropper
    function zoomCropper(ratio) {
        if (cropper) {
            cropper.zoom(ratio);
        }
    }
    
    // Function to upload evaluation
    function uploadEvaluation() {
        // Check if date is selected
        if (!evalDate.value) {
            alert('Please select a date for this evaluation');
            return;
        }
        
        // Get cropped canvas
        if (!cropper) {
            alert('Please select and crop an image first');
            return;
        }
        
        // Get cropped image
        const canvas = cropper.getCroppedCanvas({
            width: 600,
            height: 800
        });
        
        if (!canvas) {
            alert('Error processing image');
            return;
        }
        
        // Convert canvas to blob
        canvas.toBlob(function(blob) {
            // In a real implementation, you would upload this blob to your server
            // For now, we'll convert to data URL and store locally
            const reader = new FileReader();
            reader.onload = function(e) {
                // Create evaluation object
                const newEvaluation = {
                    id: Date.now().toString(), // Generate a unique ID
                    imageUrl: e.target.result,
                    date: evalDate.value,
                    description: evalDescription.value || '',
                    createdAt: new Date().toISOString()
                };
                
                // Add to evaluations array
                evaluations.push(newEvaluation);
                
                // Sort by date (newest first)
                evaluations.sort((a, b) => new Date(b.date) - new Date(a.date));
                
                // Save to localStorage
                localStorage.setItem('navy_evaluations', JSON.stringify(evaluations));
                
                // Re-render evaluations
                loadEvaluations();
                
                // Close modal
                closeModal(uploadEvalModal);
                
                // Show success message
                alert('Evaluation uploaded successfully!');
            };
            reader.readAsDataURL(blob);
        }, 'image/jpeg', 0.9);
    }
    
    // Function to enable reorder mode
    function enableReorderMode() {
        // Not implemented in this version
        alert('Reorder functionality will be implemented in a future update.');
    }
    
    // Function to open a modal
    function openModal(modal) {
        if (modal) {
            modal.style.display = 'block';
            
            // Add admin modal class if user is authenticated
            if (document.body.classList.contains('authenticated')) {
                modal.classList.add('admin-modal');
                
                // Make modal content draggable in admin mode
                const modalContent = modal.querySelector('.modal-content');
                if (modalContent) {
                    modalContent.classList.add('draggable');
                    
                    // Add modal controls if they don't exist
                    if (!modalContent.querySelector('.modal-controls')) {
                        addModalControls(modalContent);
                    }
                }
            }
        }
    }
    
    // Function to close a modal
    function closeModal(modal) {
        if (modal) {
            modal.style.display = 'none';
            
            // Remove admin classes
            modal.classList.remove('admin-modal');
            
            // Reset modal content position if it was draggable
            const modalContent = modal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.classList.remove('draggable', 'compact');
                modalContent.style.top = '';
                modalContent.style.left = '';
                modalContent.style.transform = '';
            }
        }
    }
    
    // Function to close all modals
    function closeAllModals() {
        closeModal(imageViewerModal);
        closeModal(uploadEvalModal);
        closeModal(editAboutModal);
    }
    
    // Add modal controls for admin mode
    function addModalControls(modalContent) {
        // Create modal header if it doesn't exist
        let modalHeader = modalContent.querySelector('.modal-header');
        if (!modalHeader) {
            modalHeader = document.createElement('div');
            modalHeader.className = 'modal-header';
            
            // Add title
            const title = document.createElement('h3');
            title.textContent = 'Admin Mode';
            
            // Create controls
            const controls = document.createElement('div');
            controls.className = 'modal-controls';
            
            // Add controls to header
            modalHeader.appendChild(title);
            modalHeader.appendChild(controls);
            
            // Prepend to modal content
            modalContent.prepend(modalHeader);
        }
        
        // Add controls if they don't exist
        let controls = modalContent.querySelector('.modal-controls');
        if (!controls) {
            controls = document.createElement('div');
            controls.className = 'modal-controls';
            modalHeader.appendChild(controls);
        }
        
        // Add compact toggle button
        const compactBtn = document.createElement('button');
        compactBtn.className = 'modal-control-btn compact-toggle';
        compactBtn.innerHTML = '🔍';
        compactBtn.title = 'Toggle compact mode';
        compactBtn.onclick = function(e) {
            e.stopPropagation();
            modalContent.classList.toggle('compact');
        };
        
        controls.appendChild(compactBtn);
        
        // Make modal draggable
        makeElementDraggable(modalContent);
    }
    
    // Make an element draggable
    function makeElementDraggable(element) {
        if (!element) return;
        
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        
        // If the header exists, use it as drag handle
        const header = element.querySelector('.modal-header');
        
        if (header) {
            header.onmousedown = dragMouseDown;
            // Add visual cue that it's draggable
            header.style.cursor = 'move';
        } else {
            // Otherwise use the element itself
            element.onmousedown = dragMouseDown;
        }
        
        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            
            // Get the mouse position at startup
            pos3 = e.clientX;
            pos4 = e.clientY;
            
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }
        
        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            
            // Calculate the new position
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            
            // Set the element's new position
            const top = (element.offsetTop - pos2);
            const left = (element.offsetLeft - pos1);
            
            element.style.top = top + "px";
            element.style.left = left + "px";
            element.style.transform = 'none'; // Remove centering transform
        }
        
        function closeDragElement() {
            // Stop moving when mouse button is released
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }
});
