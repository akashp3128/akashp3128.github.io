const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { authenticateToken } = require('../middleware/auth');
const { 
    createResumeStorage, 
    fileExists, 
    deleteFile, 
    getFileUrl,
    isProduction,
    uploadToBlob
} = require('../utils/storage');

// File filter to only allow PDFs
const fileFilter = (req, file, cb) => {
    // Check both MIME type and extension
    const isPdfMimeType = file.mimetype === 'application/pdf';
    const isPdfExtension = file.originalname.toLowerCase().endsWith('.pdf');
    
    if (isPdfMimeType || isPdfExtension) {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed!'), false);
    }
};

// Set up storage and upload middleware
const storage = createResumeStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max size
    },
    fileFilter: fileFilter
});

/**
 * @route GET /api/resume
 * @desc Get the resume file
 * @access Public
 */
router.get('/', async (req, res) => {
    try {
        // Check if resume file exists
        const resumeExists = await fileExists('resume.pdf');
        
        if (resumeExists) {
            if (isProduction) {
                // In production, redirect to the Blob URL
                const resumeUrl = getFileUrl('resume.pdf');
                return res.redirect(resumeUrl);
            } else {
                // In development, send the file
                const resumePath = path.join(__dirname, '../uploads/resume.pdf');
                return res.sendFile(resumePath);
            }
        } else {
            return res.status(404).json({ message: 'No resume file found' });
        }
    } catch (error) {
        console.error('Error getting resume:', error);
        return res.status(500).json({ message: 'Server error getting resume' });
    }
});

/**
 * @route POST /api/resume
 * @desc Upload a new resume
 * @access Private
 */
router.post('/', authenticateToken, upload.single('resume'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded or invalid file type' });
    }
    
    try {
        if (isProduction) {
            // In production, upload to Vercel Blob
            const file = req.file;
            
            // Upload to Vercel Blob
            const blob = await uploadToBlob(
                file.buffer,
                'resume.pdf',
                'application/pdf'
            );
            
            console.log('Resume upload successful:', blob);
            
            return res.status(201).json({ 
                message: 'Resume uploaded successfully',
                file: {
                    url: blob.url,
                    size: file.size
                }
            });
        } else {
            // For local uploads
            console.log('Resume upload successful:', req.file);
            
            return res.status(201).json({ 
                message: 'Resume uploaded successfully',
                file: {
                    filename: req.file.filename,
                    size: req.file.size
                }
            });
        }
    } catch (error) {
        console.error('Error in resume upload:', error);
        return res.status(500).json({ 
            message: 'Error uploading resume',
            error: error.message
        });
    }
});

/**
 * @route DELETE /api/resume
 * @desc Delete the resume
 * @access Private
 */
router.delete('/', authenticateToken, async (req, res) => {
    try {
        // Check if resume file exists
        const resumeExists = await fileExists('resume.pdf');
        
        if (resumeExists) {
            await deleteFile('resume.pdf');
            return res.status(200).json({ message: 'Resume deleted successfully' });
        } else {
            return res.status(404).json({ message: 'No resume file found' });
        }
    } catch (error) {
        console.error('Error deleting resume:', error);
        return res.status(500).json({ message: 'Error deleting resume file' });
    }
});

// Error handling middleware for multer errors
router.use((err, req, res, next) => {
    console.error('Resume route error:', err);
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