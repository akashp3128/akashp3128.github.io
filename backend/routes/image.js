const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { authenticateToken } = require('../middleware/auth');
const { 
    createImageStorage, 
    fileExists, 
    deleteFile, 
    getFileUrl,
    isProduction 
} = require('../utils/storage');

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

// Set up storage and upload middleware
const storage = createImageStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max size
    },
    fileFilter: fileFilter
});

// Helper function to get the profile image filename
const getProfileImageFilename = async () => {
    if (isProduction) {
        // In production, we store profile with extension in S3
        // Try common extensions
        const extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
        for (const ext of extensions) {
            const filename = 'profile' + ext;
            if (await fileExists(filename)) {
                return filename;
            }
        }
        return null;
    } else {
        // In development, check the local filesystem
        const uploadsDir = path.join(__dirname, '../uploads');
        if (fs.existsSync(uploadsDir)) {
            const files = fs.readdirSync(uploadsDir);
            // Look for any file that starts with 'profile'
            const profileImage = files.find(file => file.startsWith('profile'));
            return profileImage || null;
        }
        return null;
    }
};

/**
 * @route GET /api/image
 * @desc Get the profile image
 * @access Public
 */
router.get('/', async (req, res) => {
    try {
        const profileFilename = await getProfileImageFilename();
        
        if (profileFilename) {
            if (isProduction) {
                // In production, redirect to the S3 URL
                const imageUrl = getFileUrl(profileFilename);
                return res.redirect(imageUrl);
            } else {
                // In development, send the file
                const imagePath = path.join(__dirname, '../uploads', profileFilename);
                return res.sendFile(imagePath);
            }
        } else {
            return res.status(404).json({ message: 'No profile image found' });
        }
    } catch (error) {
        console.error('Error getting profile image:', error);
        return res.status(500).json({ message: 'Server error getting image' });
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
    
    console.log('Image upload successful:', req.file);
    
    // For S3 uploads, the response format is different
    if (isProduction) {
        return res.status(201).json({ 
            message: 'Profile image uploaded successfully',
            file: {
                location: req.file.location,
                key: req.file.key,
                size: req.file.size
            }
        });
    } else {
        // For local uploads
        return res.status(201).json({ 
            message: 'Profile image uploaded successfully',
            file: {
                filename: req.file.filename,
                size: req.file.size
            }
        });
    }
});

/**
 * @route DELETE /api/image
 * @desc Delete the profile image
 * @access Private
 */
router.delete('/', authenticateToken, async (req, res) => {
    try {
        const profileFilename = await getProfileImageFilename();
        
        if (profileFilename) {
            await deleteFile(profileFilename);
            return res.status(200).json({ message: 'Profile image deleted successfully' });
        } else {
            return res.status(404).json({ message: 'No profile image found' });
        }
    } catch (error) {
        console.error('Error deleting profile image:', error);
        return res.status(500).json({ message: 'Error deleting profile image file' });
    }
});

// Error handling middleware for multer errors
router.use((err, req, res, next) => {
    console.error('Image route error:', err);
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