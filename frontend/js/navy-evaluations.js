// Navy Evaluations Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    console.log('Navy evaluations page initialized');
    
    // Create our core objects using an OOP approach
    const NavyUI = new NavyUIController();
    const ModalManager = new ModalController();
    const AdminManager = new AdminController(NavyUI, ModalManager);
    
    // Store references globally so they're accessible from any context
    window.NavyUI = NavyUI;
    window.ModalManager = ModalManager;
    window.AdminManager = AdminManager;

    // Log initialization status for debugging
    console.log('Controllers initialized and attached to window object', {
        NavyUI: window.NavyUI ? 'Available' : 'Missing',
        ModalManager: window.ModalManager ? 'Available' : 'Missing',
        AdminManager: window.AdminManager ? 'Available' : 'Missing'
    });
    
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
        // Load data and setup listeners
        this.loadNavalProfile();
        this.setupEventListeners();
        
        // Check login status from centralized AuthManager
        this.updateAuthUIState();
        
        // Listen for auth state changes
        document.addEventListener('authStateChanged', () => {
            this.updateAuthUIState();
        });
    }
    
    updateAuthUIState() {
        if (window.AuthManager && window.AuthManager.isAuthenticated()) {
            this.showAdminControls();
        } else {
            this.hideAdminControls();
        }
    }
    
    async getApiClient() {
        console.log('Getting API client');
        if (window.api) {
            return window.api;
        } else {
            console.warn('API not available, waiting...');
            
            // Wait for API to be available
            return new Promise((resolve, reject) => {
                // Setup timeout for API initialization
                const timeout = setTimeout(() => {
                    reject(new Error('API client initialization timed out'));
                }, 5000);
                
                // Listen for API ready event
                document.addEventListener('apiClientReady', function apiReady(event) {
                    clearTimeout(timeout);
                    document.removeEventListener('apiClientReady', apiReady);
                    resolve(event.detail);
                });
            });
        }
    }
    
    checkLoginStatus() {
        // This is kept for backward compatibility but 
        // we now use the centralized AuthManager
        this.updateAuthUIState();
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
        
        // Upload evaluation button
        if (this.uploadEvalBtn) {
            this.uploadEvalBtn.addEventListener('click', () => this.openUploadEvalModal());
        }
        
        // Reorder evaluations button
        if (this.reorderEvalsBtn) {
            this.reorderEvalsBtn.addEventListener('click', () => this.enableReorderMode());
        }
        
        // Settings panel buttons
        // Edit About from settings
        const settingsEditAbout = document.getElementById('settingsEditAbout');
        if (settingsEditAbout) {
            settingsEditAbout.addEventListener('click', () => {
                this.openEditAboutModal();
                if (window.SettingsManager) window.SettingsManager.closeSettings();
            });
        }
        
        // Upload Profile Photo from settings
        const settingsUploadPhoto = document.getElementById('settingsUploadPhoto');
        if (settingsUploadPhoto) {
            settingsUploadPhoto.addEventListener('click', () => {
                this.handleProfileImageUpload();
                if (window.SettingsManager) window.SettingsManager.closeSettings();
            });
        }
        
        // Add Evaluation from settings
        const settingsAddEval = document.getElementById('settingsAddEval');
        if (settingsAddEval) {
            settingsAddEval.addEventListener('click', () => {
                this.openUploadEvalModal();
                if (window.SettingsManager) window.SettingsManager.closeSettings();
            });
        }
        
        // Reorder Evaluations from settings
        const settingsReorderEvals = document.getElementById('settingsReorderEvals');
        if (settingsReorderEvals) {
            settingsReorderEvals.addEventListener('click', () => {
                this.enableReorderMode();
                if (window.SettingsManager) window.SettingsManager.closeSettings();
            });
        }
        
        // Image viewer navigation
        if (this.prevImageBtn) {
            this.prevImageBtn.addEventListener('click', () => this.showPrevImage());
        }
        
        if (this.nextImageBtn) {
            this.nextImageBtn.addEventListener('click', () => this.showNextImage());
        }
        
        // Upload evaluation steps
        if (this.prevStepBtn) {
            this.prevStepBtn.addEventListener('click', () => this.prevUploadStep());
        }
        
        if (this.nextStepBtn) {
            this.nextStepBtn.addEventListener('click', () => this.nextUploadStep());
        }
        
        if (this.uploadFinalBtn) {
            this.uploadFinalBtn.addEventListener('click', () => this.uploadEvaluation());
        }
        
        // File upload handling
        if (this.evalUploadArea) {
            this.evalUploadArea.addEventListener('click', () => this.triggerFileInput());
            this.evalUploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
            this.evalUploadArea.addEventListener('drop', (e) => this.handleFileDrop(e));
        }
        
        if (this.evalFileInput) {
            this.evalFileInput.addEventListener('change', () => this.handleFileSelection());
        }
        
        // Cropper controls
        if (this.rotateLeftBtn) {
            this.rotateLeftBtn.addEventListener('click', () => this.rotateCropper(-90));
        }
        
        if (this.rotateRightBtn) {
            this.rotateRightBtn.addEventListener('click', () => this.rotateCropper(90));
        }
        
        if (this.zoomInBtn) {
            this.zoomInBtn.addEventListener('click', () => this.zoomCropper(0.1));
        }
        
        if (this.zoomOutBtn) {
            this.zoomOutBtn.addEventListener('click', () => this.zoomCropper(-0.1));
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
    
    renderEvaluations() {
        if (!this.evaluationsGallery || !this.evaluations.length) {
            return;
        }
        
        // Clear gallery
        this.evaluationsGallery.innerHTML = '';
        
        // Sort evaluations by date (newest first)
        this.evaluations.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Render evaluations
        this.evaluations.forEach((evaluation, index) => {
            const evalItem = document.createElement('div');
            evalItem.className = 'evaluation-item';
            evalItem.dataset.index = index;
            
            const evalImage = document.createElement('div');
            evalImage.className = 'evaluation-image';
            evalImage.style.backgroundImage = `url(${evaluation.image})`;
            
            const evalOverlay = document.createElement('div');
            evalOverlay.className = 'evaluation-overlay';
            
            const evalDate = document.createElement('div');
            evalDate.className = 'evaluation-date';
            evalDate.textContent = new Date(evaluation.date).toLocaleDateString();
            
            const evalDesc = document.createElement('div');
            evalDesc.className = 'evaluation-desc';
            evalDesc.textContent = evaluation.description || 'Navy Evaluation';
            
            evalOverlay.appendChild(evalDate);
            evalOverlay.appendChild(evalDesc);
            evalImage.appendChild(evalOverlay);
            evalItem.appendChild(evalImage);
            
            // Add click handler to open image viewer
            evalItem.addEventListener('click', () => this.openImageViewer(index));
            
            this.evaluationsGallery.appendChild(evalItem);
        });
    }
    
    openEditAboutModal() {
        console.log('Opening edit about modal');
        if (this.aboutTextEditor && this.navyAboutContent) {
            console.log('Setting text editor content from navyAboutContent');
            this.aboutTextEditor.value = this.navyAboutContent.innerHTML;
            
            const modal = document.getElementById('editAboutModal');
            console.log('Edit modal element found:', modal ? 'Yes' : 'No');
            
            // First try to use direct reference if available
            if (modal && this.modalManager) {
                console.log('Using direct modalManager reference to open modal');
                this.modalManager.openModal(modal);
            }
            // Then fall back to window reference
            else if (modal && window.ModalManager) {
                console.log('Using window.ModalManager to open modal');
                window.ModalManager.openModal(modal);
            }
            // Manual fallback if all else fails
            else if (modal) {
                console.log('Using manual display setting as fallback');
                modal.style.display = 'block';
                
                // Add any admin-specific classes if needed
                if (document.body.classList.contains('authenticated')) {
                    modal.classList.add('admin-modal');
                }
            } else {
                console.error('Could not find edit modal element!');
            }
        } else {
            console.error('Missing required elements for edit modal:', {
                aboutTextEditor: this.aboutTextEditor ? 'Found' : 'Missing',
                navyAboutContent: this.navyAboutContent ? 'Found' : 'Missing'
            });
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
    
    openUploadEvalModal() {
        // Reset the form
        this.resetUploadForm();
        
        // Open the modal
        const modal = document.getElementById('uploadEvalModal');
        if (modal && window.ModalManager) {
            window.ModalManager.openModal(modal);
        }
    }
    
    resetUploadForm() {
        // Reset file input
        if (this.evalFileInput) {
            this.evalFileInput.value = '';
        }
        
        // Reset cropper
        if (this.cropper) {
            this.cropper.destroy();
            this.cropper = null;
        }
        
        // Reset date and description
        if (this.evalDate) {
            this.evalDate.value = '';
        }
        
        if (this.evalDescription) {
            this.evalDescription.value = '';
        }
        
        // Show step 1
        this.showUploadStep(1);
    }
    
    showUploadStep(step) {
        this.currentUploadStep = step;
        
        // Hide all steps
        if (this.uploadStep1) this.uploadStep1.style.display = 'none';
        if (this.uploadStep2) this.uploadStep2.style.display = 'none';
        if (this.uploadStep3) this.uploadStep3.style.display = 'none';
        
        // Show buttons based on step
        if (this.prevStepBtn) this.prevStepBtn.style.display = step > 1 ? 'block' : 'none';
        if (this.nextStepBtn) this.nextStepBtn.style.display = step < 3 ? 'block' : 'none';
        if (this.uploadFinalBtn) this.uploadFinalBtn.style.display = step === 3 ? 'block' : 'none';
        
        // Show the current step
        if (step === 1 && this.uploadStep1) {
            this.uploadStep1.style.display = 'block';
        } else if (step === 2 && this.uploadStep2) {
            this.uploadStep2.style.display = 'block';
        } else if (step === 3 && this.uploadStep3) {
            this.uploadStep3.style.display = 'block';
        }
    }
    
    prevUploadStep() {
        if (this.currentUploadStep > 1) {
            this.showUploadStep(this.currentUploadStep - 1);
        }
    }
    
    nextUploadStep() {
        if (this.currentUploadStep === 1) {
            // Check if file is selected
            if (!this.evalFileInput || !this.evalFileInput.files || !this.evalFileInput.files[0]) {
                this.showNotification('Please select an image file first', 'error');
                return;
            }
            
            // Initialize cropper
            this.showUploadStep(2);
            this.initCropper();
        } else if (this.currentUploadStep === 2) {
            // Move to the final step
            this.showUploadStep(3);
        }
    }
    
    triggerFileInput() {
        if (this.evalFileInput) {
            this.evalFileInput.click();
        }
    }
    
    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        if (this.evalUploadArea) {
            this.evalUploadArea.classList.add('highlight');
        }
    }
    
    handleFileDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        
        if (this.evalUploadArea) {
            this.evalUploadArea.classList.remove('highlight');
        }
        
        if (e.dataTransfer.files && e.dataTransfer.files[0] && this.evalFileInput) {
            this.evalFileInput.files = e.dataTransfer.files;
            this.handleFileSelection();
        }
    }
    
    handleFileSelection() {
        if (!this.evalFileInput || !this.evalFileInput.files || !this.evalFileInput.files[0]) {
            return;
        }
        
        const file = this.evalFileInput.files[0];
        
        // Check if file is an image
        if (!file.type.match('image.*')) {
            this.showNotification('Please select an image file', 'error');
            return;
        }
        
        // Read the file
        const reader = new FileReader();
        reader.onload = (e) => {
            if (this.cropperImage) {
                this.cropperImage.src = e.target.result;
            }
        };
        reader.readAsDataURL(file);
    }
    
    initCropper() {
        if (!this.cropperImage) return;
        
        // Ensure Cropper.js is loaded
        if (typeof Cropper === 'undefined') {
            console.error('Cropper.js not loaded');
            return;
        }
        
        // Initialize cropper
        this.cropper = new Cropper(this.cropperImage, {
            aspectRatio: 1 / 1.4, // Typical document ratio
            viewMode: 1,
            autoCropArea: 0.9,
            restore: false,
            guides: true,
            center: true,
            highlight: false,
            cropBoxMovable: true,
            cropBoxResizable: true,
            toggleDragModeOnDblclick: false,
        });
    }
    
    rotateCropper(degree) {
        if (this.cropper) {
            this.cropper.rotate(degree);
        }
    }
    
    zoomCropper(ratio) {
        if (this.cropper) {
            this.cropper.zoom(ratio);
        }
    }
    
    uploadEvaluation() {
        if (!this.cropper || !this.evalDate || !this.evalDate.value) {
            this.showNotification('Please provide a date for the evaluation', 'error');
            return;
        }
        
        // Get cropped canvas
        const canvas = this.cropper.getCroppedCanvas({
            width: 800,
            height: 1120,
            minWidth: 400,
            minHeight: 560,
            maxWidth: 1600,
            maxHeight: 2240,
            fillColor: '#fff',
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high',
        });
        
        // Convert canvas to blob
        canvas.toBlob((blob) => {
            // Convert blob to data URL
            const reader = new FileReader();
            reader.onloadend = () => {
                // Create new evaluation object
                const newEvaluation = {
                    id: Date.now().toString(),
                    image: reader.result,
                    date: this.evalDate.value,
                    description: this.evalDescription ? this.evalDescription.value : ''
                };
                
                // Add to evaluations array
                this.evaluations.push(newEvaluation);
                
                // Save to localStorage
                localStorage.setItem('navy_evaluations', JSON.stringify(this.evaluations));
                
                // Render evaluations
                this.renderEvaluations();
                
                // Close modal
                const modal = document.getElementById('uploadEvalModal');
                if (modal && window.ModalManager) {
                    window.ModalManager.closeModal(modal);
                }
                
                // Show success message
                this.showNotification('Evaluation uploaded successfully!', 'success');
            };
            reader.readAsDataURL(blob);
        }, 'image/jpeg', 0.9);
    }
    
    enableReorderMode() {
        // Not implemented in this version
        this.showNotification('Reorder functionality will be implemented in a future update.', 'info');
    }
    
    openImageViewer(index) {
        if (!this.evaluations || index >= this.evaluations.length) return;
        
        this.currentEvaluationIndex = index;
        const evaluation = this.evaluations[index];
        
        if (this.enlargedImage) {
            this.enlargedImage.src = evaluation.image;
        }
        
        if (this.imageDate) {
            this.imageDate.textContent = 'Date: ' + new Date(evaluation.date).toLocaleDateString();
        }
        
        this.updateImageNavigation();
        
        const modal = document.getElementById('imageViewerModal');
        if (modal && window.ModalManager) {
            window.ModalManager.openModal(modal);
        }
    }
    
    updateImageNavigation() {
        if (!this.evaluations || !this.evaluations.length) return;
        
        if (this.imageIndex) {
            this.imageIndex.textContent = `${this.currentEvaluationIndex + 1} of ${this.evaluations.length}`;
        }
        
        if (this.prevImageBtn) {
            this.prevImageBtn.disabled = this.currentEvaluationIndex === 0;
        }
        
        if (this.nextImageBtn) {
            this.nextImageBtn.disabled = this.currentEvaluationIndex === this.evaluations.length - 1;
        }
    }
    
    showPrevImage() {
        if (this.currentEvaluationIndex > 0) {
            this.openImageViewer(this.currentEvaluationIndex - 1);
        }
    }
    
    showNextImage() {
        if (this.currentEvaluationIndex < this.evaluations.length - 1) {
            this.openImageViewer(this.currentEvaluationIndex + 1);
        }
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
        console.log('Initializing AdminController');
        
        // Store controller references
        this.navyUI = navyUI;
        this.modalManager = modalManager;
        
        console.log('Controller references:', {
            navyUI: this.navyUI ? 'Provided' : 'Missing',
            modalManager: this.modalManager ? 'Provided' : 'Missing'
        });
        
        // Create global references to our controllers
        // This has been moved to the main initialization but kept for backward compatibility
        if (!window.NavyUI) window.NavyUI = navyUI;
        if (!window.ModalManager) window.ModalManager = modalManager;
        if (!window.AdminManager) window.AdminManager = this;
        
        // Admin Panel Controls
        this.adminToggle = document.getElementById('adminToggle');
        this.passwordModal = document.getElementById('passwordModal');
        this.passwordInput = document.getElementById('passwordInput');
        this.submitPassword = document.getElementById('submitPassword');
        
        console.log('Admin elements found:', {
            adminToggle: this.adminToggle ? 'Found' : 'Missing',
            passwordModal: this.passwordModal ? 'Found' : 'Missing',
            passwordInput: this.passwordInput ? 'Found' : 'Missing',
            submitPassword: this.submitPassword ? 'Found' : 'Missing'
        });
        
        // Setup admin event listeners
        this.setupAdminEventListeners();
        
        // Listen for auth state changes
        document.addEventListener('authStateChanged', (event) => {
            if (event.detail.isAuthenticated) {
                this.navyUI.showAdminControls();
            } else {
                this.navyUI.hideAdminControls();
            }
        });
    }
    
    setupAdminEventListeners() {
        console.log('Setting up admin event listeners');
        
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
        if (!password) {
            this.navyUI.showNotification('Please enter a password', 'error');
            return;
        }
        
        // Use the centralized AuthManager instead of directly manipulating localStorage
        window.AuthManager.login(password)
            .then(() => {
                // Close the modal
                if (this.passwordModal) {
                    this.modalManager.closeModal(this.passwordModal);
                }
                
                // Clear password field
                if (this.passwordInput) {
                    this.passwordInput.value = '';
                }
                
                this.navyUI.showNotification('Login successful', 'success');
            })
            .catch(error => {
                console.error('Login error:', error);
                this.navyUI.showNotification('Invalid password', 'error');
            });
    }
}

