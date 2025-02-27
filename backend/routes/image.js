const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { list } = require('@vercel/blob');
const { authenticateToken } = require('../middleware/auth');
const { 
    createImageStorage, 
    fileExists, 
    deleteFile, 
    getFileUrl,
    isProduction,
    uploadToBlob
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
        try {
            // In production, look for any profile image in Vercel Blob
            const blobs = await list();
            const profileImage = blobs.blobs.find(blob => 
                blob.pathname.startsWith('profile')
            );
            return profileImage ? profileImage.pathname : null;
        } catch (error) {
            console.error('Error getting profile image from Blob:', error);
            return null;
        }
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
                // In production, redirect to the Blob URL
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
router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded or invalid file type' });
    }
    
    try {
        if (isProduction) {
            // In production, upload to Vercel Blob
            const file = req.file;
            const fileExtension = path.extname(file.originalname).toLowerCase();
            const filename = `profile${fileExtension}`;
            
            // Upload to Vercel Blob
            const blob = await uploadToBlob(
                file.buffer,
                filename,
                file.mimetype
            );
            
            console.log('Image upload successful:', blob);
            
            return res.status(201).json({ 
                message: 'Profile image uploaded successfully',
                file: {
                    url: blob.url,
                    size: file.size
                }
            });
        } else {
            // For local uploads
            console.log('Image upload successful:', req.file);
            
            return res.status(201).json({ 
                message: 'Profile image uploaded successfully',
                file: {
                    filename: req.file.filename,
                    size: req.file.size
                }
            });
        }
    } catch (error) {
        console.error('Error in image upload:', error);
        return res.status(500).json({ 
            message: 'Error uploading image',
            error: error.message
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