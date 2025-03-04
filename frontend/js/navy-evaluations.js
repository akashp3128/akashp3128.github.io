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
    function initializePage() {
        console.log('Initializing Navy Evaluations page');
        
        // First check if ApiClient is globally available (from <script> tag)
        if (typeof ApiClient !== 'undefined' && !window.ApiClient) {
            console.log('Found global ApiClient, assigning to window');
            window.ApiClient = ApiClient;
        }
        
        // Wait for ApiClient to be available (it's loaded separately)
        if (!window.ApiClient) {
            console.log('ApiClient not loaded yet, waiting...');
            
            // Try to find it in the global scope as fallback
            if (typeof ApiClient !== 'undefined') {
                console.log('Using global ApiClient');
                window.ApiClient = ApiClient;
                continueInitialization();
                return;
            }
            
            // If not found, wait for it to load
            let waitTime = 0;
            const waitInterval = 100; // ms
            const maxWaitTime = 5000; // 5 seconds timeout
            
            const waitForApi = setInterval(() => {
                waitTime += waitInterval;
                
                // Check window.ApiClient first
                if (window.ApiClient) {
                    clearInterval(waitForApi);
                    console.log('ApiClient loaded on window, continuing initialization');
                    continueInitialization();
                    return;
                }
                
                // If not in window, check global scope
                if (typeof ApiClient !== 'undefined') {
                    clearInterval(waitForApi);
                    console.log('ApiClient found in global scope, continuing initialization');
                    window.ApiClient = ApiClient;
                    continueInitialization();
                    return;
                }
                
                // If we've waited too long, continue anyway but show a warning
                if (waitTime >= maxWaitTime) {
                    clearInterval(waitForApi);
                    console.warn('ApiClient not available after timeout, continuing with limited functionality');
                    // Don't alert here - it's annoying on page load
                    // Just continue with whatever we have
                    continueInitialization();
                }
            }, waitInterval);
        } else {
            console.log('ApiClient already available, continuing initialization');
            continueInitialization();
        }
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
    }
    
    // Function to check login status and update UI
    function checkLoginStatus() {
        console.log('Checking login status...');
        // Show login status in the debug area
        const loginStatusDiv = document.querySelector('.login-status');
        
        // First check if ApiClient is globally available (from <script> tag)
        if (typeof ApiClient !== 'undefined' && !window.ApiClient) {
            console.log('Found global ApiClient during status check, assigning to window');
            window.ApiClient = ApiClient;
        }
        
        // Try to use window.ApiClient first
        let apiClient = window.ApiClient;
        
        // If not available on window, try global scope
        if (!apiClient && typeof ApiClient !== 'undefined') {
            console.log('Using global ApiClient for login check');
            apiClient = ApiClient;
            // Also set it on window for future use
            window.ApiClient = ApiClient;
        }
        
        // Early return if APIClient isn't available in any scope
        if (!apiClient || !apiClient.auth) {
            console.warn('ApiClient not available for auth check');
            if (loginStatusDiv) loginStatusDiv.textContent = 'Auth service not available';
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
                
                // Show the admin panel
                if (navyAdminPanel) {
                    navyAdminPanel.classList.add('visible');
                    if (loginStatusPanel) {
                        loginStatusPanel.textContent = 'Currently logged in as Admin';
                    }
                }
            } else {
                document.body.classList.remove('authenticated');
                if (adminToggle) adminToggle.classList.remove('admin-active');
                
                // Hide all admin-only elements
                document.querySelectorAll('.admin-only').forEach(el => {
                    el.style.display = 'none';
                });
                
                // Hide admin panel
                if (navyAdminPanel) {
                    navyAdminPanel.classList.remove('visible');
                }
            }
        } catch (e) {
            console.error('Error checking authentication status:', e);
            if (loginStatusDiv) loginStatusDiv.textContent = 'Error checking auth status';
            
            // Hide admin panel
            if (navyAdminPanel) {
                navyAdminPanel.classList.remove('visible');
            }
        }
    }
    
    // Setup all event listeners
    function setupEventListeners() {
        console.log('Setting up event listeners');
        
        // Close modal button
        if (closeModalBtn) {
            console.log('Adding click handler to close modal button');
            closeModalBtn.addEventListener('click', function() {
                closeModal(passwordModal);
            });
        }
        
        // Closing modals on outer click
        window.addEventListener('click', function(e) {
            if (e.target === imageViewerModal) closeModal(imageViewerModal);
            if (e.target === uploadEvalModal) closeModal(uploadEvalModal);
            if (e.target === editAboutModal) closeModal(editAboutModal);
            if (e.target === passwordModal) closeModal(passwordModal);
        });
        
        // Login button click
        if (submitPassword) {
            submitPassword.addEventListener('click', handleLogin);
        }
        
        // Password input key press (enter key)
        if (passwordInput) {
            passwordInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    handleLogin();
                }
            });
        }
        
        // Profile image upload
        if (navyProfileUploadOverlay) {
            navyProfileUploadOverlay.addEventListener('click', handleProfileImageUpload);
        }
        
        // Admin panel profile upload button (alternative to overlay)
        if (uploadNavyProfileBtn) {
            uploadNavyProfileBtn.addEventListener('click', handleProfileImageUpload);
        }
        
        // Edit about content
        if (editNavyAboutBtn) {
            editNavyAboutBtn.addEventListener('click', openEditAboutModal);
        }
        
        // Admin panel edit about button (alternative to button in section)
        if (editAboutSectionBtn) {
            editAboutSectionBtn.addEventListener('click', openEditAboutModal);
        }
        
        // Save about content
        if (saveAboutBtn) {
            saveAboutBtn.addEventListener('click', saveAboutContent);
        }
        
        // Upload evaluation button
        if (uploadEvalBtn) {
            uploadEvalBtn.addEventListener('click', function() {
                openModal(uploadEvalModal);
                showUploadStep(1);
            });
        }
        
        // Admin panel upload evaluation button (alternative to button in section)
        if (uploadEvaluationBtn) {
            uploadEvaluationBtn.addEventListener('click', function() {
                openModal(uploadEvalModal);
                showUploadStep(1);
                resetUploadForm();
            });
        }
        
        // Reorder evaluations button
        if (reorderEvalsBtn) {
            reorderEvalsBtn.addEventListener('click', enableReorderMode);
        }
        
        // Admin panel reorder button (alternative to button in section)
        if (reorderEvaluationsBtn) {
            reorderEvaluationsBtn.addEventListener('click', enableReorderMode);
        }
        
        // Admin panel delete evaluation button
        if (deleteEvaluationBtn) {
            deleteEvaluationBtn.addEventListener('click', function() {
                if (evaluations.length === 0) {
                    alert('No evaluations to delete.');
                    return;
                }
                
                const evalToDelete = prompt('Enter the number of the evaluation to delete (1-' + evaluations.length + '):');
                const index = parseInt(evalToDelete) - 1;
                
                if (isNaN(index) || index < 0 || index >= evaluations.length) {
                    alert('Invalid evaluation number.');
                    return;
                }
                
                if (confirm('Are you sure you want to delete evaluation #' + (index + 1) + '?')) {
                    // Delete the evaluation with API call
                    window.ApiClient.navy.deleteEvaluation(evaluations[index].id)
                        .then(response => {
                            if (response.success) {
                                alert('Evaluation deleted successfully.');
                                loadEvaluations(); // Reload the evaluations
                            } else {
                                alert('Failed to delete evaluation: ' + (response.error || 'Unknown error'));
                            }
                        })
                        .catch(error => {
                            console.error('Error deleting evaluation:', error);
                            alert('Error deleting evaluation. Please try again.');
                        });
                }
            });
        }
        
        // Admin panel logout button
        if (logoutAdminBtn) {
            logoutAdminBtn.addEventListener('click', function() {
                window.ApiClient.auth.logout();
                checkLoginStatus();
                alert('You have been logged out.');
            });
        }
        
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
        console.log('Handle login called');
        const loginStatusDiv = document.querySelector('.login-status');
        if (loginStatusDiv) loginStatusDiv.textContent = 'Logging in...';
        
        const password = passwordInput ? passwordInput.value : '';
        
        if (!password) {
            if (loginStatusDiv) loginStatusDiv.textContent = 'Error: Password required';
            alert('Please enter a password');
            return;
        }
        
        console.log('Attempting login with password');
        
        // Check for ApiClient in window and global scope
        let apiClient = window.ApiClient;
        
        // If ApiClient isn't available yet, create a fallback version
        if (!apiClient) {
            console.warn('ApiClient not found in window. Attempting to find global scope ApiClient');
            if (typeof ApiClient !== 'undefined') {
                console.log('Using global ApiClient');
                apiClient = ApiClient;
                // Also set it on window for future use
                window.ApiClient = ApiClient;
            } else {
                console.error('ApiClient not available in any scope');
                if (loginStatusDiv) loginStatusDiv.textContent = 'Error: Auth service not initialized';
                alert('Login system not initialized properly. Please refresh the page and try again.');
                return;
            }
        }
        
        // Make sure ApiClient is available and has auth module
        if (!apiClient || !apiClient.auth) {
            console.error('ApiClient auth module not available');
            if (loginStatusDiv) loginStatusDiv.textContent = 'Error: Auth service not available';
            alert('Login system not available. Please refresh the page and try again.');
            return;
        }
        
        try {
            apiClient.auth.login(password)
                .then(response => {
                    console.log('Login response:', response);
                    if (response.success) {
                        // Hide the password modal
                        if (passwordModal) {
                            passwordModal.style.display = 'none';
                        }
                        
                        // Update login status
                        if (loginStatusDiv) loginStatusDiv.textContent = 'Success! Logged in as Admin';
                        
                        // Update UI based on new auth status
                        checkLoginStatus();
                        
                        // Clear password field
                        if (passwordInput) passwordInput.value = '';
                        
                        // Reload evaluations to show admin features
                        loadEvaluations();
                        loadNavalProfile();
                        
                        // Make admin elements visible
                        document.querySelectorAll('.admin-only').forEach(el => {
                            el.style.display = el.tagName.toLowerCase() === 'button' || 
                                              el.tagName.toLowerCase() === 'a' ? 
                                              'inline-block' : 'block';
                        });
                        
                        // Apply authenticated class and styles
                        document.body.classList.add('authenticated');
                        if (adminToggle) adminToggle.classList.add('admin-active');
                        
                        console.log('Login successful, admin features enabled');
                        alert('Login successful! Admin features enabled.');
                    } else {
                        console.error('Login failed: Invalid credentials');
                        if (loginStatusDiv) loginStatusDiv.textContent = 'Error: Invalid password';
                        alert('Invalid password. Please try again.');
                    }
                })
                .catch(err => {
                    console.error('Login error:', err);
                    if (loginStatusDiv) loginStatusDiv.textContent = 'Error: Login failed';
                    alert('Login failed. Please try again.');
                });
        } catch (e) {
            console.error('Exception during login process:', e);
            if (loginStatusDiv) loginStatusDiv.textContent = 'Error: Login system error';
            alert('Login system encountered an error. Please refresh the page and try again.');
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
        closeModal(imageViewerModal);
        closeModal(uploadEvalModal);
        closeModal(editAboutModal);
    }
});
