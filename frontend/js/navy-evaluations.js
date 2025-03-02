// Navy Evaluations Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // DOM References
    const navyProfileImage = document.getElementById('navyProfileImage');
    const navyProfileUploadOverlay = document.getElementById('navyProfileUploadOverlay');
    const editNavyAboutBtn = document.getElementById('editNavyAboutBtn');
    const navyAboutContent = document.getElementById('navyAboutContent');
    const uploadEvalBtn = document.getElementById('uploadEvalBtn');
    const reorderEvalsBtn = document.getElementById('reorderEvalsBtn');
    const evaluationsGallery = document.getElementById('evaluationsGallery');
    
    // Modal References
    const imageViewerModal = document.getElementById('imageViewerModal');
    const uploadEvalModal = document.getElementById('uploadEvalModal');
    const editAboutModal = document.getElementById('editAboutModal');
    const aboutTextEditor = document.getElementById('aboutTextEditor');
    const saveAboutBtn = document.getElementById('saveAboutBtn');
    
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
    
    // Admin Panel Controls (Reused from main page)
    const adminToggle = document.getElementById('adminToggle');
    const adminLogin = document.getElementById('adminLogin');
    const passwordInput = document.getElementById('passwordInput');
    const submitPassword = document.getElementById('submitPassword');
    
    // Variables
    let cropper = null;
    let currentEvaluationIndex = 0;
    let evaluations = [];
    let currentUploadStep = 1;
    
    // Check if ApiClient is available
    if (!window.ApiClient) {
        console.error('ApiClient not available');
        return;
    }
    
    // Initialize page
    initializePage();
    
    // Setup event listeners
    setupEventListeners();
    
    // Function to initialize the page
    function initializePage() {
        // Check login status
        checkLoginStatus();
        
        // Load naval profile content
        loadNavalProfile();
        
        // Load evaluations
        loadEvaluations();
    }
    
    // Function to check login status and update UI
    function checkLoginStatus() {
        const isAuthenticated = window.ApiClient.auth.isAuthenticated();
        
        if (isAuthenticated) {
            document.body.classList.add('authenticated');
        } else {
            document.body.classList.remove('authenticated');
        }
    }
    
    // Setup all event listeners
    function setupEventListeners() {
        // Admin toggle
        if (adminToggle) {
            adminToggle.addEventListener('click', toggleAdminLogin);
        }
        
        // Login form
        if (submitPassword) {
            submitPassword.addEventListener('click', handleLogin);
        }
        
        if (passwordInput) {
            passwordInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    handleLogin();
                }
            });
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
        
        // Close modal when clicking outside of it
        window.addEventListener('click', function(e) {
            if (e.target === imageViewerModal) {
                closeModal(imageViewerModal);
            } else if (e.target === uploadEvalModal) {
                closeModal(uploadEvalModal);
            } else if (e.target === editAboutModal) {
                closeModal(editAboutModal);
            }
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
    
    // Function to toggle admin login panel
    function toggleAdminLogin() {
        if (window.ApiClient.auth.isAuthenticated()) {
            // If already authenticated, ask if they want to log out
            if (confirm('Do you want to log out?')) {
                window.ApiClient.auth.logout();
                checkLoginStatus();
            }
        } else {
            adminLogin.style.display = adminLogin.style.display === 'block' ? 'none' : 'block';
        }
    }
    
    // Function to handle login
    function handleLogin() {
        const password = passwordInput.value;
        
        if (!password) {
            alert('Please enter a password');
            return;
        }
        
        window.ApiClient.auth.login(password)
            .then(success => {
                if (success) {
                    adminLogin.style.display = 'none';
                    checkLoginStatus();
                } else {
                    alert('Invalid password');
                }
            })
            .catch(err => {
                console.error('Login error:', err);
                alert('Login failed. Please try again.');
            });
    }
    
    // Function to handle profile image upload
    function handleProfileImageUpload() {
        // Create a file input element
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        
        // Handle file selection
        fileInput.addEventListener('change', function() {
            if (fileInput.files && fileInput.files[0]) {
                const file = fileInput.files[0];
                
                // Upload file
                const formData = new FormData();
                formData.append('image', file);
                
                // You would send this to your API
                // For now, we'll simulate with local storage
                const reader = new FileReader();
                reader.onload = function(e) {
                    // Store the image URL
                    localStorage.setItem('navy_profile_image', e.target.result);
                    
                    // Update the image
                    navyProfileImage.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
        
        // Trigger file selection
        fileInput.click();
    }
    
    // Function to open the edit about modal
    function openEditAboutModal() {
        aboutTextEditor.value = navyAboutContent.innerHTML;
        openModal(editAboutModal);
    }
    
    // Function to save about content
    function saveAboutContent() {
        const content = aboutTextEditor.value;
        
        // Update the content
        navyAboutContent.innerHTML = content;
        
        // Save to localStorage (or your API in a real implementation)
        localStorage.setItem('navy_about_content', content);
        
        // Close the modal
        closeModal(editAboutModal);
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
        // Reset file input
        evalFileInput.value = '';
        
        // Reset cropper
        if (cropper) {
            cropper.destroy();
            cropper = null;
        }
        
        // Reset date and description
        evalDate.value = '';
        evalDescription.value = '';
        
        // Show step 1
        showUploadStep(1);
    }
    
    // Function to show a specific upload step
    function showUploadStep(step) {
        currentUploadStep = step;
        
        // Hide all steps
        uploadStep1.style.display = 'none';
        uploadStep2.style.display = 'none';
        uploadStep3.style.display = 'none';
        
        // Show buttons based on step
        prevStepBtn.style.display = step > 1 ? 'block' : 'none';
        nextStepBtn.style.display = step < 3 ? 'block' : 'none';
        uploadFinalBtn.style.display = step === 3 ? 'block' : 'none';
        
        // Show the current step
        if (step === 1) {
            uploadStep1.style.display = 'block';
        } else if (step === 2) {
            uploadStep2.style.display = 'block';
        } else if (step === 3) {
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
        closeModal(imageViewerModal);
        closeModal(uploadEvalModal);
        closeModal(editAboutModal);
    }
});
