const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { authenticateToken } = require('../middleware/auth');

// Set up multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Make sure upload dir exists
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) {
            try {
                fs.mkdirSync(uploadDir, { recursive: true, mode: 0o777 });
                console.log('Created uploads directory for image:', uploadDir);
            } catch (error) {
                console.error('Failed to create uploads directory for image:', error);
            }
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Always save with the same name to ensure only one profile image exists
        // Extract extension from original file
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, 'profile' + ext);
    }
});

// File filter to only allow images
const fileFilter = (req, file, cb) => {
    // Check both MIME type and extension
    const isImageMimeType = file.mimetype.startsWith('image/');
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
    const hasImageExtension = imageExtensions.some(ext => 
        file.originalname.toLowerCase().endsWith(ext)
    );
    
    if (isImageMimeType || hasImageExtension) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

// Set up upload middleware
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max size
    },
    fileFilter: fileFilter
});

// Helper function to find the profile image
const findProfileImage = () => {
    const uploadsDir = path.join(__dirname, '../uploads');
    const files = fs.readdirSync(uploadsDir);
    
    // Look for any file that starts with 'profile'
    const profileImage = files.find(file => file.startsWith('profile'));
    return profileImage ? path.join(uploadsDir, profileImage) : null;
};

/**
 * @route GET /api/image
 * @desc Get the profile image
 * @access Public
 */
router.get('/', (req, res) => {
    const imagePath = findProfileImage();
    
    if (imagePath && fs.existsSync(imagePath)) {
        res.sendFile(imagePath);
    } else {
        res.status(404).json({ message: 'No profile image found' });
    }
});

/**
 * @route POST /api/image
 * @desc Upload a new profile image
 * @access Private
 */
router.post('/', authenticateToken, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded or invalid file type' });
    }
    
    res.status(201).json({ 
        message: 'Profile image uploaded successfully',
        file: {
            filename: req.file.filename,
            size: req.file.size
        }
    });
});

/**
 * @route DELETE /api/image
 * @desc Delete the profile image
 * @access Private
 */
router.delete('/', authenticateToken, (req, res) => {
    const imagePath = findProfileImage();
    
    if (imagePath && fs.existsSync(imagePath)) {
        try {
            fs.unlinkSync(imagePath);
            res.status(200).json({ message: 'Profile image deleted successfully' });
        } catch (error) {
            console.error('Error deleting profile image:', error);
            res.status(500).json({ message: 'Error deleting profile image file' });
        }
    } else {
        res.status(404).json({ message: 'No profile image found' });
    }
});

// Error handling middleware for multer errors
router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'File size too large. Maximum size is 5MB.' });
        }
        return res.status(400).json({ message: `Upload error: ${err.message}` });
    } else if (err) {
        return res.status(400).json({ message: err.message });
    }
    next();
});

module.exports = router; 