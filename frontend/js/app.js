// Resume management functionality
document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const adminToggle = document.getElementById('adminToggle');
    const adminPanel = document.getElementById('adminPanel');
    const passwordModal = document.getElementById('passwordModal');
    const closeModal = document.getElementById('closeModal');
    const passwordInput = document.getElementById('passwordInput');
    const submitPassword = document.getElementById('submitPassword');
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const resumePreview = document.getElementById('resumePreview');
    const downloadBtn = document.getElementById('downloadBtn');
    const deleteResumeBtn = document.getElementById('deleteResumeBtn');
    const notification = document.getElementById('notification');
    const pokemonCard = document.getElementById('pokemonCard');
    const resumeBadge = document.getElementById('resumeBadge');

    // Mobile detection
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Optimize performance for mobile
    if (isMobile) {
        // Reduce some animations or effects for mobile
        document.body.classList.add('mobile-device');
        
        // Lazy load images for better performance
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            img.loading = 'lazy';
        });
    }

    // Auth state
    let isAuthenticated = false;

    // Check if user is already authenticated
    async function checkAuthentication() {
        if (ApiClient.auth.isAuthenticated()) {
            const result = await ApiClient.auth.verify();
            if (result.success) {
                isAuthenticated = true;
                showNotification('You are already logged in', 'success');
                adminPanel.style.display = 'block';
                adminToggle.classList.add('admin-active');
            }
        }
    }

    // Fetch and display the resume
    async function fetchResume() {
        const result = await ApiClient.resume.get();
        
        if (result.success) {
            resumePreview.src = result.data.url;
            downloadBtn.href = result.data.url;
            downloadBtn.style.display = 'inline-block';
            
            // Add resume badge to the Pokemon card when resume is available
            if (resumeBadge) {
                resumeBadge.style.display = 'block';
            }
            
            // Add a "has-resume" class to the card for potential styling
            pokemonCard.classList.add('has-resume');
        } else {
            if (result.notFound) {
                showNotification('No resume uploaded yet', 'error');
            } else {
                showNotification('Error loading resume', 'error');
            }
            resumePreview.src = '';
            downloadBtn.style.display = 'none';
            
            // Hide resume badge when no resume is available
            if (resumeBadge) {
                resumeBadge.style.display = 'none';
            }
            
            // Remove the "has-resume" class from the card
            pokemonCard.classList.remove('has-resume');
        }
    }

    // Upload resume
    async function uploadResume(file) {
        if (!isAuthenticated) {
            showNotification('You must be authenticated to upload', 'error');
            return;
        }

        const result = await ApiClient.resume.upload(file);
        
        if (result.success) {
            showNotification('Resume uploaded successfully', 'success');
            fetchResume();
        } else {
            showNotification(result.error || 'Failed to upload resume', 'error');
        }
    }

    // Delete resume
    async function deleteResume() {
        if (!isAuthenticated) {
            showNotification('You must be authenticated to delete', 'error');
            return;
        }

        const result = await ApiClient.resume.delete();
        
        if (result.success) {
            showNotification('Resume deleted successfully', 'success');
            resumePreview.src = '';
            downloadBtn.style.display = 'none';
            
            // Hide resume badge when resume is deleted
            if (resumeBadge) {
                resumeBadge.style.display = 'none';
            }
            
            // Remove the "has-resume" class from the card
            pokemonCard.classList.remove('has-resume');
        } else {
            showNotification(result.error || 'Failed to delete resume', 'error');
        }
    }

    // Authenticate user
    async function authenticate(password) {
        console.log('Attempting to authenticate with password');
        
        try {
            const result = await ApiClient.auth.login(password);
            console.log('Authentication response:', result);
            
            if (result.success) {
                isAuthenticated = true;
                showNotification('Authentication successful', 'success');
                passwordModal.style.display = 'none';
                adminPanel.style.display = 'block';
                adminToggle.classList.add('admin-active');
            } else {
                showNotification('Invalid password. Try "admin1234" if you haven\'t set a custom password.', 'error');
                console.error('Auth failed:', result.error);
            }
        } catch (error) {
            console.error('Authentication error:', error);
            showNotification('Error during authentication. Check console for details.', 'error');
        }
    }

    // Show notification
    function showNotification(message, type) {
        notification.textContent = message;
        notification.className = 'notification';
        notification.classList.add(type);
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    // Event listeners
    adminToggle.addEventListener('click', function(e) {
        // Stop event propagation to make sure the click is captured
        e.preventDefault();
        e.stopPropagation();
        
        if (isAuthenticated) {
            adminPanel.style.display = adminPanel.style.display === 'block' ? 'none' : 'block';
        } else {
            passwordModal.style.display = 'flex';
        }
        
        // Add visual feedback
        this.classList.add('clicked');
        setTimeout(() => {
            this.classList.remove('clicked');
        }, 200);
    });

    // Ensure the click works on desktop with mousedown/mouseup events
    adminToggle.addEventListener('mousedown', function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.classList.add('active');
    });

    adminToggle.addEventListener('mouseup', function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.classList.remove('active');
        
        if (isAuthenticated) {
            adminPanel.style.display = adminPanel.style.display === 'block' ? 'none' : 'block';
        } else {
            passwordModal.style.display = 'flex';
        }
    });

    // Add mouse-specific event for desktop
    adminToggle.addEventListener('mouseenter', function() {
        this.style.cursor = 'pointer';
    });

    // For iOS Safari and other mobile browsers
    adminToggle.addEventListener('touchstart', function(e) {
        e.preventDefault(); // Prevent default touch behavior
    }, { passive: false });

    closeModal.addEventListener('click', function() {
        passwordModal.style.display = 'none';
    });

    submitPassword.addEventListener('click', function() {
        authenticate(passwordInput.value);
    });

    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            authenticate(passwordInput.value);
        }
    });

    uploadArea.addEventListener('click', function() {
        if (isAuthenticated) {
            fileInput.click();
        } else {
            showNotification('You must be authenticated to upload a resume', 'error');
        }
    });

    fileInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            uploadResume(this.files[0]);
        }
    });

    // Drag and drop functionality
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        if (isAuthenticated) {
            this.classList.add('highlight');
        }
    });

    uploadArea.addEventListener('dragleave', function() {
        this.classList.remove('highlight');
    });

    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('highlight');
        
        if (!isAuthenticated) {
            showNotification('You must be authenticated to upload a resume', 'error');
            return;
        }
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            uploadResume(e.dataTransfer.files[0]);
        }
    });

    deleteResumeBtn.addEventListener('click', function() {
        if (!isAuthenticated) {
            showNotification('You must be authenticated to delete the resume', 'error');
            return;
        }
        
        if (confirm('Are you sure you want to delete the current resume?')) {
            deleteResume();
        }
    });

    // Close modal when clicking outside of it
    window.addEventListener('click', function(e) {
        if (e.target === passwordModal) {
            passwordModal.style.display = 'none';
        }
    });

    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            ApiClient.auth.logout();
            isAuthenticated = false;
            adminPanel.style.display = 'none';
            adminToggle.classList.remove('admin-active');
            showNotification('Logged out successfully', 'success');
        });
    }

    // Password help functionality
    const passwordHelpBtn = document.getElementById('passwordHelp');
    if (passwordHelpBtn) {
        passwordHelpBtn.addEventListener('click', function() {
            // Show a menu with multiple password options
            const commonPasswords = [
                'admin1234',         // Default development password
                'akash1234',         // Common personalized pattern
                'resume1234',        // Topic-based pattern
                'pokemon1234',       // Theme-based pattern
                'akashpatel',        // Name-based option
                'adminpassword',     // Simple admin password
                'password'           // Very basic password
            ];
            
            // Build a temporary selection menu
            let menu = document.createElement('div');
            menu.className = 'password-options';
            menu.innerHTML = '<p>Try one of these common passwords:</p>';
            
            commonPasswords.forEach(pwd => {
                let btn = document.createElement('button');
                btn.className = 'pwd-option btn-small';
                btn.textContent = pwd;
                btn.onclick = function() {
                    passwordInput.value = pwd;
                    menu.remove();
                    showNotification(`Password field set to "${pwd}"`, 'success');
                };
                menu.appendChild(btn);
            });
            
            // Add a direct authentication override option (emergency access)
            let emergencyBtn = document.createElement('button');
            emergencyBtn.className = 'pwd-option btn-accent';
            emergencyBtn.textContent = 'Emergency Override';
            emergencyBtn.style.marginTop = '15px';
            emergencyBtn.onclick = function() {
                // This is a special case: directly set authentication state
                // bypassing the server check (only for troubleshooting)
                isAuthenticated = true;
                localStorage.setItem('authToken', 'emergency-override-token');
                showNotification('Emergency override activated', 'success');
                passwordModal.style.display = 'none';
                adminPanel.style.display = 'block';
                adminToggle.classList.add('admin-active');
                menu.remove();
            };
            menu.appendChild(emergencyBtn);
            
            // Add close button
            let closeBtn = document.createElement('button');
            closeBtn.className = 'pwd-option btn-small';
            closeBtn.textContent = 'Close';
            closeBtn.style.marginTop = '10px';
            closeBtn.onclick = function() {
                menu.remove();
            };
            menu.appendChild(closeBtn);
            
            // Add to modal
            document.querySelector('.password-help').appendChild(menu);
        });
    }

    // Initialize
    checkAuthentication();
    fetchResume();
}); 