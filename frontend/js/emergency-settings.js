/**
 * EMERGENCY SETTINGS PANEL
 * Creates a minimal settings panel that works regardless of other scripts
 */

// Execute immediately
(function() {
    console.log('[EMERGENCY-SETTINGS] Loading emergency settings panel...');
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initEmergencySettings);
    } else {
        initEmergencySettings();
    }
})();

function initEmergencySettings() {
    console.log('[EMERGENCY-SETTINGS] Creating emergency settings panel');
    
    // Create settings panel if it doesn't exist
    createEmergencySettingsPanel();
    
    // Set up event listeners
    setupPanelEvents();
    
    // Check if we need to refresh auth state
    refreshAuthState();
}

function createEmergencySettingsPanel() {
    // Check if panel already exists
    if (document.querySelector('.emergency-settings-panel')) {
        return;
    }
    
    // Create panel
    const panel = document.createElement('div');
    panel.className = 'emergency-settings-panel admin-only authenticated-only';
    
    // Create panel content based on current page
    const isNavyPage = window.location.href.includes('navy-career');
    
    panel.innerHTML = `
        <span class="emergency-settings-close">&times;</span>
        <h3>Admin Settings</h3>
        
        ${isNavyPage ? `
        <!-- Navy career page options -->
        <div class="settings-section">
            <h4>Navy Profile</h4>
            <button id="emergencyEditAbout" class="btn">Edit About Content</button>
            <button id="emergencyUploadImage" class="btn">Upload Profile Image</button>
            <button id="emergencyUploadEval" class="btn">Upload Evaluation</button>
        </div>
        ` : `
        <!-- Main page options -->
        <div class="settings-section">
            <h4>Pokemon Card</h4>
            <button id="emergencyEditCard" class="btn">Edit Card Content</button>
            <button id="emergencyUploadProfileImg" class="btn">Upload Card Image</button>
            <button id="emergencyUploadResume" class="btn">Upload Resume</button>
        </div>
        `}
        
        <div class="settings-section">
            <h4>Account</h4>
            <p>Logged in as Admin</p>
            <button id="emergencyLogout" class="btn">Logout</button>
        </div>
    `;
    
    // Add to body
    document.body.appendChild(panel);
    console.log('[EMERGENCY-SETTINGS] Settings panel created');
}

function setupPanelEvents() {
    // Close button
    const closeBtn = document.querySelector('.emergency-settings-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            document.querySelector('.emergency-settings-panel').classList.remove('open');
        });
    }
    
    // Logout button
    const logoutBtn = document.getElementById('emergencyLogout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('emergency_auth');
            refreshAuthState();
            showEmergencyNotification('Logged out successfully', 'success');
        });
    }
    
    // Navy page buttons
    const editAboutBtn = document.getElementById('emergencyEditAbout');
    if (editAboutBtn) {
        editAboutBtn.addEventListener('click', function() {
            // Try to open the existing edit modal
            const editModal = document.getElementById('editAboutModal');
            if (editModal) {
                editModal.style.display = 'block';
                // Initialize content
                const editor = document.getElementById('aboutTextEditor');
                const content = document.getElementById('navyAboutContent');
                if (editor && content) {
                    editor.value = content.innerHTML;
                }
            } else {
                showEmergencyNotification('Edit modal not found', 'error');
            }
        });
    }
    
    const uploadImageBtn = document.getElementById('emergencyUploadImage');
    if (uploadImageBtn) {
        uploadImageBtn.addEventListener('click', function() {
            // Try to trigger the overlay click
            const overlay = document.getElementById('navyProfileUploadOverlay');
            if (overlay) {
                overlay.click();
            } else {
                showEmergencyNotification('Upload functionality not found', 'error');
            }
        });
    }
    
    const uploadEvalBtn = document.getElementById('emergencyUploadEval');
    if (uploadEvalBtn) {
        uploadEvalBtn.addEventListener('click', function() {
            // Try to open the upload modal
            const uploadModal = document.getElementById('uploadEvalModal');
            if (uploadModal) {
                uploadModal.style.display = 'block';
            } else {
                showEmergencyNotification('Upload modal not found', 'error');
            }
        });
    }
    
    // Main page buttons
    const editCardBtn = document.getElementById('emergencyEditCard');
    if (editCardBtn) {
        editCardBtn.addEventListener('click', function() {
            // Scroll to admin panel
            const adminPanel = document.getElementById('adminPanel');
            if (adminPanel) {
                adminPanel.scrollIntoView({ behavior: 'smooth' });
                showEmergencyNotification('Scroll to card editor', 'info');
            } else {
                showEmergencyNotification('Card editor not found', 'error');
            }
        });
    }
    
    const uploadProfileImgBtn = document.getElementById('emergencyUploadProfileImg');
    if (uploadProfileImgBtn) {
        uploadProfileImgBtn.addEventListener('click', function() {
            // Scroll to image upload area
            const uploadArea = document.getElementById('imageUploadArea');
            if (uploadArea) {
                uploadArea.scrollIntoView({ behavior: 'smooth' });
                showEmergencyNotification('Scroll to image upload', 'info');
            } else {
                showEmergencyNotification('Image upload area not found', 'error');
            }
        });
    }
    
    const uploadResumeBtn = document.getElementById('emergencyUploadResume');
    if (uploadResumeBtn) {
        uploadResumeBtn.addEventListener('click', function() {
            // Scroll to resume upload
            const uploadArea = document.getElementById('uploadArea');
            if (uploadArea) {
                uploadArea.scrollIntoView({ behavior: 'smooth' });
                showEmergencyNotification('Scroll to resume upload', 'info');
            } else {
                showEmergencyNotification('Resume upload area not found', 'error');
            }
        });
    }
    
    console.log('[EMERGENCY-SETTINGS] Event listeners set up');
}

function refreshAuthState() {
    const isAuthenticated = localStorage.getItem('emergency_auth') === 'true';
    
    if (isAuthenticated) {
        document.body.classList.add('authenticated');
        // Fix all admin-only elements
        document.querySelectorAll('.admin-only, .authenticated-only').forEach(function(el) {
            if (el.tagName === 'BUTTON' || 
                el.tagName === 'A' || 
                el.tagName === 'DIV' || 
                el.tagName === 'SPAN') {
                el.style.display = '';
            } else {
                el.style.display = 'block';
            }
        });
    } else {
        document.body.classList.remove('authenticated');
        // Hide all admin elements
        document.querySelectorAll('.admin-only, .authenticated-only').forEach(function(el) {
            el.style.display = 'none';
        });
        
        // Also make sure settings panel is closed
        const panel = document.querySelector('.emergency-settings-panel');
        if (panel) {
            panel.classList.remove('open');
        }
    }
    
    console.log('[EMERGENCY-SETTINGS] Auth state refreshed:', isAuthenticated);
}

function showEmergencyNotification(message, type = 'info') {
    console.log(`[EMERGENCY-SETTINGS] Notification: ${message} (${type})`);
    
    // Create or get notification element
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        document.body.appendChild(notification);
    }
    
    // Set content and type
    notification.textContent = message;
    notification.className = `notification ${type}`;
    
    // Force reflow
    notification.offsetHeight;
    
    // Show notification
    notification.classList.add('show');
    
    // Auto-hide after 3 seconds
    setTimeout(function() {
        notification.classList.remove('show');
    }, 3000);
} 