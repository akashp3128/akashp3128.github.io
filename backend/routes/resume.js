const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { authenticateToken } = require('../middleware/auth');

// Set up multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: function (req, file, cb) {
        // Always save with the same name to ensure only one resume exists
        cb(null, 'resume.pdf');
    }
});

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

// Set up upload middleware
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max size
    },
    fileFilter: fileFilter
});

// Path to the resume file
const resumePath = path.join(__dirname, '../uploads/resume.pdf');

/**
 * @route GET /api/resume
 * @desc Get the resume file
 * @access Public
 */
router.get('/', (req, res) => {
    // Check if resume file exists
    if (fs.existsSync(resumePath)) {
        res.sendFile(resumePath);
    } else {
        res.status(404).json({ message: 'No resume file found' });
    }
});

/**
 * @route POST /api/resume
 * @desc Upload a new resume
 * @access Private
 */
router.post('/', authenticateToken, upload.single('resume'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded or invalid file type' });
    }
    
    res.status(201).json({ 
        message: 'Resume uploaded successfully',
        file: {
            filename: req.file.filename,
            size: req.file.size
        }
    });
});

/**
 * @route DELETE /api/resume
 * @desc Delete the resume
 * @access Private
 */
router.delete('/', authenticateToken, (req, res) => {
    // Check if resume file exists
    if (fs.existsSync(resumePath)) {
        try {
            fs.unlinkSync(resumePath);
            res.status(200).json({ message: 'Resume deleted successfully' });
        } catch (error) {
            console.error('Error deleting resume:', error);
            res.status(500).json({ message: 'Error deleting resume file' });
        }
    } else {
        res.status(404).json({ message: 'No resume file found' });
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