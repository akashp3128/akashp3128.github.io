// Navy Evaluations Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    console.log('Navy evaluations page initialized');
    
    // DOM References
    const navyProfileImage = document.getElementById('navyProfileImage');
    const navyProfileUploadOverlay = document.getElementById('navyProfileUploadOverlay');
    const editNavyAboutBtn = document.getElementById('editNavyAboutBtn');
    const navyAboutContent = document.getElementById('navyAboutContent');
    const uploadEvalBtn = document.getElementById('uploadEvalBtn');
    const reorderEvalsBtn = document.getElementById('reorderEvalsBtn');
    const evaluationsGallery = document.getElementById('evaluationsGallery');
    
    // Admin Toggle & Settings Panel
    const adminToggle = document.getElementById('adminToggle');
    const settingsPanel = document.getElementById('settingsPanel');
    const closeSettings = document.getElementById('closeSettings');
    
    // Settings Panel Buttons
    const settingsEditAbout = document.getElementById('settingsEditAbout');
    const settingsUploadProfile = document.getElementById('settingsUploadProfile');
    const settingsUploadEval = document.getElementById('settingsUploadEval');
    const settingsReorderEvals = document.getElementById('settingsReorderEvals');
    const settingsLogout = document.getElementById('settingsLogout');
    
    // Modal References
    const imageViewerModal = document.getElementById('imageViewerModal');
    const uploadEvalModal = document.getElementById('uploadEvalModal');
    const editAboutModal = document.getElementById('editAboutModal');
    const profileImageModal = document.getElementById('profileImageModal');
    const passwordModal = document.getElementById('passwordModal');
    
    // About Editor References
    const aboutTextEditor = document.getElementById('aboutTextEditor');
    const richTextControls = document.getElementById('richTextControls');
    const saveAboutBtn = document.getElementById('saveAboutBtn');
    
    // Profile Image Upload References
    const profileUploadArea = document.getElementById('profileUploadArea');
    const profileFileInput = document.getElementById('profileFileInput');
    const profileCropperImage = document.getElementById('profileCropperImage');
    const uploadProfileBtn = document.getElementById('uploadProfileBtn');
    const cancelProfileUploadBtn = document.getElementById('cancelProfileUploadBtn');
    const profileCropperContainer = document.querySelector('#profileImageModal .cropper-container');
    const profileCropperControls = document.querySelector('#profileImageModal .cropper-controls');
    
    // Profile Image Cropper Controls
    const profileRotateLeftBtn = document.getElementById('profileRotateLeftBtn');
    const profileRotateRightBtn = document.getElementById('profileRotateRightBtn');
    const profileZoomInBtn = document.getElementById('profileZoomInBtn');
    const profileZoomOutBtn = document.getElementById('profileZoomOutBtn');
    
    // Image Viewer Modal References
    const enlargedImage = document.getElementById('enlargedImage');
    const prevImageBtn = document.getElementById('prevImageBtn');
    const nextImageBtn = document.getElementById('nextImageBtn');
    const imageDate = document.getElementById('imageDate');
    const imageIndex = document.getElementById('imageIndex');
    
    // Upload Modal References
    const evalUploadArea = document.getElementById('evalUploadArea');
    const evalFileInput = document.getElementById('evalFileInput');
    const cropperImage = document.getElementById('cropperImage');
    const evalDate = document.getElementById('evalDate');
    const evalDescription = document.getElementById('evalDescription');
    const uploadStep1 = document.getElementById('uploadStep1');
    const uploadStep2 = document.getElementById('uploadStep2');
    const uploadStep3 = document.getElementById('uploadStep3');
    const prevStepBtn = document.getElementById('prevStepBtn');
    const nextStepBtn = document.getElementById('nextStepBtn');
    const uploadFinalBtn = document.getElementById('uploadFinalBtn');
    
    // Cropper Controls
    const rotateLeftBtn = document.getElementById('rotateLeftBtn');
    const rotateRightBtn = document.getElementById('rotateRightBtn');
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    
    // Admin Panel Controls
    const passwordInput = document.getElementById('passwordInput');
    const submitPassword = document.getElementById('submitPassword');
    
    // Notification
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notificationMessage');
    
    // Variables
    let cropperEval = null;
    let cropperProfile = null;
    let currentEvaluationIndex = 0;
    let evaluations = [];
    let currentUploadStep = 1;
    
    // Start initialization
    initializePage();
    
    // Initialize the page
    function initializePage() {
        console.log('Initializing Navy evaluations page');
        
        // Check login status
        checkLoginStatus();
        
        // Setup event listeners for this page
        setupEventListeners();
        
        // Setup rich text editor
        setupRichTextEditor();
        
        // Load naval profile content
        loadNavalProfile();
        
        // Load evaluations
        loadEvaluations();
    }
    
    // Check if user is authenticated
    function checkLoginStatus() {
        console.log('Checking login status');
        
        // This is now done in init.js, but we still need to track admin state
        const isAuthenticated = localStorage.getItem('admin_authenticated') === 'true';
        
        console.log('User authenticated:', isAuthenticated);
    }
    
    // Set up page-specific event listeners
    function setupEventListeners() {
        console.log('Setting up event listeners');

        // Only bind event listeners for elements that don't have handlers in init.js
        
        // For evaluation-specific functions that aren't in init.js
        if (uploadEvalBtn) {
            uploadEvalBtn.addEventListener('click', openUploadEvalModal);
        }
        
        if (reorderEvalsBtn) {
            reorderEvalsBtn.addEventListener('click', enableReorderMode);
        }

        // Since we're already in the Navy career page, we need these event listeners
        // Profile upload area
        if (profileUploadArea) {
            profileUploadArea.addEventListener('click', function() {
                profileFileInput.click();
            });
            profileUploadArea.addEventListener('dragover', handleDragOver);
            profileUploadArea.addEventListener('drop', function(e) {
                handleFileDrop(e, profileFileInput);
            });
        }
        
        // File inputs
        if (evalFileInput) {
            evalFileInput.addEventListener('change', function() {
                handleFileSelection(this, cropperImage, 'evaluation');
            });
        }
        
        if (profileFileInput) {
            profileFileInput.addEventListener('change', function() {
                handleFileSelection(this, profileCropperImage, 'profile');
            });
        }
        
        // Profile upload buttons
        if (uploadProfileBtn) {
            uploadProfileBtn.addEventListener('click', uploadProfileImage);
        }
        
        if (cancelProfileUploadBtn) {
            cancelProfileUploadBtn.addEventListener('click', function() {
                closeModal(profileImageModal);
            });
        }
        
        // Evaluation upload wizard navigation
        if (prevStepBtn) prevStepBtn.addEventListener('click', prevUploadStep);
        if (nextStepBtn) nextStepBtn.addEventListener('click', nextUploadStep);
        if (uploadFinalBtn) uploadFinalBtn.addEventListener('click', uploadEvaluation);
        
        // Cropper controls - evaluation
        if (rotateLeftBtn) rotateLeftBtn.addEventListener('click', () => rotateCropper(cropperEval, -90));
        if (rotateRightBtn) rotateRightBtn.addEventListener('click', () => rotateCropper(cropperEval, 90));
        if (zoomInBtn) zoomInBtn.addEventListener('click', () => zoomCropper(cropperEval, 0.1));
        if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => zoomCropper(cropperEval, -0.1));
        
        // Cropper controls - profile
        if (profileRotateLeftBtn) profileRotateLeftBtn.addEventListener('click', () => rotateCropper(cropperProfile, -90));
        if (profileRotateRightBtn) profileRotateRightBtn.addEventListener('click', () => rotateCropper(cropperProfile, 90));
        if (profileZoomInBtn) profileZoomInBtn.addEventListener('click', () => zoomCropper(cropperProfile, 0.1));
        if (profileZoomOutBtn) profileZoomOutBtn.addEventListener('click', () => zoomCropper(cropperProfile, -0.1));
        
        // Image viewer navigation
        if (prevImageBtn) prevImageBtn.addEventListener('click', showPrevImage);
        if (nextImageBtn) nextImageBtn.addEventListener('click', showNextImage);

        // IMPORTANT: Add the save button listener that was missing before
        if (saveAboutBtn) {
            saveAboutBtn.addEventListener('click', saveAboutContent);
        }
    }
    
    // Toggle settings panel
    function toggleSettingsPanel() {
        if (settingsPanel) {
            settingsPanel.classList.toggle('visible');
        }
    }
    
    // Show notification
    function showNotification(message, type = 'success', duration = 3000) {
        // Use the Notification system from init.js
        if (window.Notifications && window.Notifications.show) {
            window.Notifications.show(message, type, duration);
            return;
        }
        
        // Fallback if the global notification system isn't available
        const notification = document.getElementById('notification');
        const notificationMessage = document.getElementById('notificationMessage');
        
        if (notification && notificationMessage) {
            notificationMessage.textContent = message;
            notification.className = 'notification ' + type;
            notification.classList.add('visible');
            
            setTimeout(() => {
                notification.classList.remove('visible');
            }, duration);
        }
    }
    
    // Setup rich text editor
    function setupRichTextEditor() {
        if (!richTextControls || !aboutTextEditor) return;
        console.log('Setting up rich text editor');
        
        richTextControls.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', function() {
                const format = this.dataset.format;
                
                if (!format) return;
                
                if (['bold', 'italic', 'underline'].includes(format)) {
                    document.execCommand(format, false, null);
                } else if (['p', 'h3', 'h4'].includes(format)) {
                    document.execCommand('formatBlock', false, format);
                }
                
                // Focus the editor after applying formatting
                aboutTextEditor.focus();
            });
        });
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
        const savedImageUrl = localStorage.getItem('navy_profile_image');
        
        if (savedImageUrl && navyProfileImage) {
            navyProfileImage.src = savedImageUrl;
        }
    }
    
    // Function to load about content
    function loadAboutContent() {
        const savedContent = localStorage.getItem('navy_about_content');
        
        if (savedContent && navyAboutContent) {
            navyAboutContent.innerHTML = savedContent;
        }
    }
    
    // Function to open the profile image modal
    function openProfileImageModal() {
        if (!profileImageModal) return;
        
        // Reset the form
        if (profileCropperContainer) profileCropperContainer.style.display = 'none';
        if (profileCropperControls) profileCropperControls.style.display = 'none';
        if (profileUploadArea) profileUploadArea.style.display = 'block';
        if (uploadProfileBtn) uploadProfileBtn.style.display = 'none';
        if (cancelProfileUploadBtn) cancelProfileUploadBtn.style.display = 'block';
        
        // Destroy previous cropper
        if (cropperProfile) {
            cropperProfile.destroy();
            cropperProfile = null;
        }
        
        // Open the modal
        openModal(profileImageModal);
    }
    
    // Function to open the edit about modal
    function openEditAboutModal() {
        if (!aboutTextEditor || !navyAboutContent || !editAboutModal) return;
        console.log('Opening edit about modal');
        
        // Load content from the about section into the editor
        aboutTextEditor.innerHTML = navyAboutContent.innerHTML;
        
        // Open the modal
        openModal(editAboutModal);
    }
    
    // Function to save about content
    function saveAboutContent() {
        if (!aboutTextEditor || !navyAboutContent) return;
        console.log('Saving about content');
        
        const content = aboutTextEditor.innerHTML;
        
        // Update the content
        navyAboutContent.innerHTML = content;
        
        // Save to localStorage
        localStorage.setItem('navy_about_content', content);
        
        // Close the modal
        closeModal(editAboutModal);
        
        // Show success notification
        showNotification('Content updated successfully!', 'success');
    }
    
    // Function to upload profile image
    function uploadProfileImage() {
        if (!cropperProfile || !navyProfileImage) {
            showNotification('Please select and crop an image first', 'error');
            return;
        }
        
        // Get cropped canvas
        const canvas = cropperProfile.getCroppedCanvas({
            width: 300,
            height: 300
        });
        
        if (!canvas) {
            showNotification('Error processing image', 'error');
            return;
        }
        
        // Convert to data URL
        const imageUrl = canvas.toDataURL('image/jpeg', 0.9);
        
        // Update profile image
        navyProfileImage.src = imageUrl;
        
        // Save to localStorage
        localStorage.setItem('navy_profile_image', imageUrl);
        
        // Close modal
        closeModal(profileImageModal);
        
        // Show success notification
        showNotification('Profile image updated successfully!', 'success');
    }
    
    // Function to open a modal
    function openModal(modal) {
        if (modal) {
            modal.style.display = 'block';
        }
    }
    
    // Function to close a modal
    function closeModal(modal) {
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    // Function to close all modals
    function closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }
    
    // Load evaluations & Render (using the existing methods)
    function loadEvaluations() {
        // Clear existing evaluations
        if (evaluationsGallery) evaluationsGallery.innerHTML = '';
        
        // Load from localStorage
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
    
    // Function to render evaluations (from original code)
    function renderEvaluations() {
        if (!evaluationsGallery) return;
        
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
    
    // Function to open the upload evaluation modal
    function openUploadEvalModal() {
        // Reset the form
        resetUploadForm();
        
        // Open the modal
        openModal(uploadEvalModal);
    }
    
    // Function to reset the upload form
    function resetUploadForm() {
        if (!evalFileInput) return;
        
        // Reset file input
        evalFileInput.value = '';
        
        // Reset cropper
        if (cropperEval) {
            cropperEval.destroy();
            cropperEval = null;
        }
        
        // Reset date and description
        if (evalDate) evalDate.value = '';
        if (evalDescription) evalDescription.value = '';
        
        // Show step 1
        showUploadStep(1);
    }
    
    // Function to show a specific upload step
    function showUploadStep(step) {
        currentUploadStep = step;
        
        // Hide all steps
        if (uploadStep1) uploadStep1.style.display = 'none';
        if (uploadStep2) uploadStep2.style.display = 'none';
        if (uploadStep3) uploadStep3.style.display = 'none';
        
        // Show buttons based on step
        if (prevStepBtn) prevStepBtn.style.display = step > 1 ? 'block' : 'none';
        if (nextStepBtn) nextStepBtn.style.display = step < 3 ? 'block' : 'none';
        if (uploadFinalBtn) uploadFinalBtn.style.display = step === 3 ? 'block' : 'none';
        
        // Show the current step
        if (step === 1 && uploadStep1) {
            uploadStep1.style.display = 'block';
        } else if (step === 2 && uploadStep2) {
            uploadStep2.style.display = 'block';
        } else if (step === 3 && uploadStep3) {
            uploadStep3.style.display = 'block';
        }
    }
    
    // Function to go to the previous upload step
    function prevUploadStep() {
        if (currentUploadStep > 1) {
            showUploadStep(currentUploadStep - 1);
        }
    }
    
    // Function to go to the next upload step
    function nextUploadStep() {
        if (currentUploadStep === 1) {
            // Check if file is selected
            if (!evalFileInput || !evalFileInput.files || !evalFileInput.files[0]) {
                showNotification('Please select an image file first', 'error');
                return;
            }
            
            // Initialize cropper
            showUploadStep(2);
            initCropper(cropperImage, 'evaluation');
        } else if (currentUploadStep === 2) {
            // Move to the final step
            showUploadStep(3);
        }
    }
    
    // Function to handle drag over
    function handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        this.classList.add('drag-over');
    }
    
    // Function to handle file drop
    function handleFileDrop(e, fileInput) {
        e.preventDefault();
        e.stopPropagation();
        const dropArea = e.currentTarget;
        dropArea.classList.remove('drag-over');
        
        if (e.dataTransfer.files && e.dataTransfer.files[0] && fileInput) {
            fileInput.files = e.dataTransfer.files;
            handleFileSelection(fileInput, fileInput === evalFileInput ? cropperImage : profileCropperImage, 
                               fileInput === evalFileInput ? 'evaluation' : 'profile');
        }
    }
    
    // Function to handle file selection
    function handleFileSelection(fileInput, cropperTarget, type) {
        if (!fileInput || !fileInput.files || !fileInput.files[0] || !cropperTarget) return;
        
        const file = fileInput.files[0];
        
        // Check if it's an image
        if (!file.type.match('image.*')) {
            showNotification('Please select an image file', 'error');
            return;
        }
        
        // Read the file
        const reader = new FileReader();
        reader.onload = function(e) {
            // Set the image source for cropping
            cropperTarget.src = e.target.result;
            
            if (type === 'profile') {
                // For profile, show cropper immediately
                profileUploadArea.style.display = 'none';
                profileCropperContainer.style.display = 'block';
                profileCropperControls.style.display = 'flex';
                uploadProfileBtn.style.display = 'block';
                
                // Initialize cropper after the image is loaded
                setTimeout(() => {
                    initCropper(profileCropperImage, 'profile');
                }, 100);
            }
        };
        reader.readAsDataURL(file);
    }
    
    // Function to initialize the cropper
    function initCropper(target, type) {
        if (!target) return;
        
        const options = {
            aspectRatio: type === 'profile' ? 1 : 3/4, // Square for profile, 3:4 for evaluations
            viewMode: 1,
            responsive: true,
            restore: true
        };
        
        // Destroy previous cropper if it exists
        if (type === 'evaluation' && cropperEval) {
            cropperEval.destroy();
        } else if (type === 'profile' && cropperProfile) {
            cropperProfile.destroy();
        }
        
        // Initialize new cropper
        if (type === 'evaluation') {
            cropperEval = new Cropper(target, options);
        } else {
            cropperProfile = new Cropper(target, options);
        }
    }
    
    // Function to rotate the cropper
    function rotateCropper(cropper, degree) {
        if (cropper) {
            cropper.rotate(degree);
        }
    }
    
    // Function to zoom the cropper
    function zoomCropper(cropper, ratio) {
        if (cropper) {
            cropper.zoom(ratio);
        }
    }
    
    // Function to upload evaluation
    function uploadEvaluation() {
        // Check if date is selected
        if (!evalDate || !evalDate.value) {
            showNotification('Please select a date for this evaluation', 'error');
            return;
        }
        
        // Get cropped canvas
        if (!cropperEval) {
            showNotification('Please select and crop an image first', 'error');
            return;
        }
        
        // Get cropped image
        const canvas = cropperEval.getCroppedCanvas({
            width: 600,
            height: 800
        });
        
        if (!canvas) {
            showNotification('Error processing image', 'error');
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
                    description: evalDescription && evalDescription.value ? evalDescription.value : '',
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
                showNotification('Evaluation uploaded successfully!', 'success');
            };
            reader.readAsDataURL(blob);
        }, 'image/jpeg', 0.9);
    }
    
    // Function to open the image viewer
    function openImageViewer(index) {
        if (evaluations.length === 0 || !imageViewerModal || !enlargedImage) return;
        
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
        
        if (imageDate) imageDate.textContent = `Date: ${formattedDate}`;
        if (imageIndex) imageIndex.textContent = `${currentEvaluationIndex + 1} of ${evaluations.length}`;
        
        // Show the modal
        openModal(imageViewerModal);
        
        // Update navigation buttons
        updateImageNavigation();
    }
    
    // Function to enable reorder mode
    function enableReorderMode() {
        // Not implemented in this version
        showNotification('Reorder functionality will be implemented in a future update.', 'warning');
    }
    
    // Function to update image navigation buttons state
    function updateImageNavigation() {
        if (!prevImageBtn || !nextImageBtn) return;
        
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
});
