// Navy Evaluations Page JavaScript

// Import crypto-js for password hashing
import CryptoJS from 'crypto-js';
import { AuthManager } from './auth';

document.addEventListener('DOMContentLoaded', async function() {
    console.log('Navy evaluations page initialized');
    
    // Initialize AuthManager
    try {
        await AuthManager.initialize();
    } catch (error) {
        console.error('Error initializing AuthManager:', error);
        alert('Failed to initialize authentication. Please refresh the page.');
        return;
    }

    // Check authentication status
    if (!AuthManager.isAuthenticated()) {
        alert('You are not logged in. Redirecting to login page.');
        window.location.href = '/login.html'; // Redirect to login page
        return;
    }

    // DOM References
    const navyProfileImage = document.getElementById('navyProfileImage');
    const navyProfileUploadOverlay = document.getElementById('navyProfileUploadOverlay');
    const editNavyAboutBtn = document.getElementById('editNavyAboutBtn');
    const navyAboutContent = document.getElementById('navyAboutContent');
    const uploadEvalBtn = document.getElementById('uploadEvalBtn');
    const reorderEvalsBtn = document.getElementById('reorderEvalsBtn');
    const evaluationsGallery = document.getElementById('evaluationsGallery');
    
    // Apply direct click handler to admin toggle for maximum compatibility
    const directAdminToggle = document.getElementById('adminToggle');
    if (directAdminToggle) {
        console.log('Adding direct click handler to admin toggle');
        directAdminToggle.onclick = function() {
            console.log('Admin toggle clicked directly');
            const pwdModal = document.getElementById('passwordModal');
            if (pwdModal) {
                console.log('Showing password modal directly');
                pwdModal.style.display = 'block';
                const pwdInput = document.getElementById('passwordInput');
                if (pwdInput) pwdInput.focus();
            }
        };
    }
    
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
    const passwordModal = document.getElementById('passwordModal');
    const closeModalBtn = document.getElementById('closeModal');
    const passwordInput = document.getElementById('passwordInput');
    const submitPassword = document.getElementById('submitPassword');
    
    // Navy Admin Panel References
    const navyAdminPanel = document.getElementById('navyAdminPanel');
    const uploadNavyProfileBtn = document.getElementById('uploadNavyProfileBtn');
    const editAboutSectionBtn = document.getElementById('editAboutSectionBtn');
    const uploadEvaluationBtn = document.getElementById('uploadEvaluationBtn');
    const reorderEvaluationsBtn = document.getElementById('reorderEvaluationsBtn');
    const deleteEvaluationBtn = document.getElementById('deleteEvaluationBtn');
    const logoutAdminBtn = document.getElementById('logoutAdminBtn');
    const loginStatusPanel = document.querySelector('.login-status-panel');
    
    // Variables
    let cropper = null;
    let currentEvaluationIndex = 0;
    let evaluations = [];
    let currentUploadStep = 1;
    
    // Start initialization
    initializePage();
    
    // Initialize the page
    async function initializePage() {
        console.log('Initializing Navy Evaluations page');
        try {
            await loadApiClient();
            console.log('ApiClient loaded, continuing initialization');
            continueInitialization();
        } catch (error) {
            console.error('Error loading ApiClient:', error);
            alert('Failed to load necessary services. Please refresh the page.');
        }
    }
    
    // Function to load ApiClient
    async function loadApiClient() {
        return new Promise((resolve, reject) => {
            if (typeof ApiClient !== 'undefined') {
                window.ApiClient = ApiClient;
                resolve();
            } else {
                let waitTime = 0;
                const waitInterval = 100;
                const maxWaitTime = 5000;
                const waitForApi = setInterval(() => {
                    waitTime += waitInterval;
                    if (window.ApiClient || typeof ApiClient !== 'undefined') {
                        clearInterval(waitForApi);
                        window.ApiClient = ApiClient;
                        resolve();
                    }
                    if (waitTime >= maxWaitTime) {
                        clearInterval(waitForApi);
                        reject('ApiClient not available after timeout');
                    }
                }, waitInterval);
            }
        });
    }
    
    function continueInitialization() {
        // Check login status first
        checkLoginStatus();
        
        // Set up all event listeners
        setupEventListeners();
        
        // Load naval profile info
        loadNavalProfile();
        
        // Load evaluations data
        loadEvaluations();
        
        // Ensure all modals are closed after initialization
        closeAllModals();
    }
    
    // Function to check login status and update UI
    async function checkLoginStatus() {
        console.log('Checking login status...');
        const isAuthenticated = AuthManager.isAuthenticated();
        document.body.classList.toggle('authenticated', isAuthenticated);
        adminToggle.classList.toggle('admin-active', isAuthenticated);

        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = isAuthenticated ? 'block' : 'none';
        });

        navyAdminPanel.classList.toggle('visible', isAuthenticated);
        loginStatusPanel.textContent = isAuthenticated ? 'Logged in as Admin' : 'Not logged in';
    }
    
    // Function to show loading indicator
    function showLoadingIndicator(message) {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading-indicator';
        loadingDiv.textContent = message;
        document.body.appendChild(loadingDiv);
    }
    
    // Function to hide loading indicator
    function hideLoadingIndicator() {
        const loadingDiv = document.querySelector('.loading-indicator');
        if (loadingDiv) {
            document.body.removeChild(loadingDiv);
        }
    }
    
    // Optimize event listeners using event delegation
    function setupEventListeners() {
        console.log('Setting up event listeners');
        document.body.addEventListener('click', function(e) {
            if (e.target.matches('#closeModal')) {
                closeModal(passwordModal);
            } else if (e.target.matches('#submitPassword')) {
                handleLogin();
            } else if (e.target.matches('#navyProfileUploadOverlay, #uploadNavyProfileBtn')) {
                handleProfileImageUpload();
            } else if (e.target.matches('#editNavyAboutBtn, #editAboutSectionBtn')) {
                openEditAboutModal();
            } else if (e.target.matches('#saveAboutBtn')) {
                saveAboutContent();
            } else if (e.target.matches('#uploadEvalBtn, #uploadEvaluationBtn')) {
                openUploadEvalModal();
            } else if (e.target.matches('#reorderEvalsBtn, #reorderEvaluationsBtn')) {
                enableReorderMode();
            } else if (e.target.matches('#deleteEvaluationBtn')) {
                deleteEvaluation();
            } else if (e.target.matches('#logoutAdminBtn')) {
                AuthManager.logout();
                checkLoginStatus();
                alert('Logged out successfully.');
            } else if (e.target.matches('#rotateLeftBtn')) {
                rotateCropper(-90);
            } else if (e.target.matches('#rotateRightBtn')) {
                rotateCropper(90);
            } else if (e.target.matches('#zoomInBtn')) {
                zoomCropper(0.1);
            } else if (e.target.matches('#zoomOutBtn')) {
                zoomCropper(-0.1);
            } else if (e.target.matches('#prevStepBtn')) {
                prevUploadStep();
            } else if (e.target.matches('#nextStepBtn')) {
                nextUploadStep();
            } else if (e.target.matches('#uploadFinalBtn')) {
                uploadEvaluation();
            } else if (e.target.matches('#prevImageBtn')) {
                showPrevImage();
            } else if (e.target.matches('#nextImageBtn')) {
                showNextImage();
            } else if (e.target.matches('#adminToggle')) {
                openModal(passwordModal);
                passwordInput.focus();
            }
        });
        window.addEventListener('click', function(e) {
            if (e.target === imageViewerModal) closeModal(imageViewerModal);
            if (e.target === uploadEvalModal) closeModal(uploadEvalModal);
            if (e.target === editAboutModal) closeModal(editAboutModal);
            if (e.target === passwordModal) closeModal(passwordModal);
        });
    }
    
    // Load naval profile content
    function loadNavalProfile() {
        console.log('Loading naval profile...');
        
        // Load profile image
        loadProfileImage();
        
        // Load about content
        loadAboutContent();
        
        // Ensure no modals are open after loading profile
        closeAllModals();
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
        } else {
            // Don't automatically open the edit modal, just use the default content
            console.log('No saved about content found, using default content');
            // The default content is already in the HTML, so we don't need to do anything
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
    async function handleLogin() {
        const password = passwordInput.value;
        if (!password) {
            alert('Please enter a password.');
            return;
        }

        showLoadingIndicator('Logging in...');
        try {
            const success = await AuthManager.login(password);
            hideLoadingIndicator();
            if (success) {
                closeModal(passwordModal);
                checkLoginStatus();
                alert('Login successful!');
            } else {
                alert('Incorrect password. Please try again.');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Login failed. Please try again.');
        } finally {
            hideLoadingIndicator();
        }
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
        openModal(uploadEvalModal);
        showUploadStep(1);
        resetUploadForm();
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
        console.log('Closing all modals to prevent unwanted redirects');
        closeModal(imageViewerModal);
        closeModal(uploadEvalModal);
        closeModal(editAboutModal);
    }
});
