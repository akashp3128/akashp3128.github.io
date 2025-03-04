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

// Create a storage instance specifically for Navy evaluations
const evalStorage = createImageStorage('navy-evals');

// File filter to only allow image files
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

// Setup multer upload middleware
const upload = multer({ 
    storage: evalStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max file size
    }
});

// Create a storage instance for Navy profile
const profileStorage = createImageStorage('navy-profile');
const profileUpload = multer({
    storage: profileStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max file size
    }
});

// ===== ROUTES =====

// GET /api/navy/evaluations - Get all evaluations
router.get('/evaluations', async (req, res) => {
    try {
        let evaluations = [];
        
        if (isProduction) {
            // List files from Vercel Blob Storage
            const { blobs } = await list({ prefix: 'navy-evals/' });
            
            evaluations = blobs.map(blob => {
                const filename = path.basename(blob.pathname);
                // Try to extract metadata from filename
                // Example filename format: navy-eval-2023-01-15-1234567890.jpg
                const filenameParts = filename.split('-');
                let date = null;
                
                if (filenameParts.length >= 5) {
                    // Try to extract date from filename (parts 3, 4, 5)
                    try {
                        date = `${filenameParts[3]}-${filenameParts[4]}-${filenameParts[5]}`;
                    } catch (err) {
                        // If parsing fails, use file creation date
                        date = blob.uploadedAt;
                    }
                } else {
                    // Use file creation date
                    date = blob.uploadedAt;
                }
                
                return {
                    id: blob.pathname,
                    imageUrl: blob.url,
                    date: date,
                    createdAt: blob.uploadedAt
                };
            });
        } else {
            // Local file system
            const evalDir = path.join(__dirname, '../uploads/navy-evals');
            if (!fs.existsSync(evalDir)) {
                fs.mkdirSync(evalDir, { recursive: true });
            }
            
            const files = fs.readdirSync(evalDir);
            evaluations = files.map(file => {
                const filePath = path.join(evalDir, file);
                const stats = fs.statSync(filePath);
                
                // Try to extract date from filename
                // Example filename format: navy-eval-2023-01-15-1234567890.jpg
                const filenameParts = file.split('-');
                let date = null;
                
                if (filenameParts.length >= 5) {
                    // Try to extract date from filename (parts 3, 4, 5)
                    try {
                        date = `${filenameParts[3]}-${filenameParts[4]}-${filenameParts[5]}`;
                    } catch (err) {
                        // If parsing fails, use file creation date
                        date = stats.birthtime.toISOString().split('T')[0];
                    }
                } else {
                    // Use file creation date
                    date = stats.birthtime.toISOString().split('T')[0];
                }
                
                return {
                    id: file,
                    imageUrl: `/api/navy/evaluations/${file}`,
                    date: date,
                    createdAt: stats.birthtime.toISOString()
                };
            });
        }
        
        // Sort evaluations by date (newest first)
        evaluations.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        res.json(evaluations);
    } catch (error) {
        console.error('Error getting evaluations:', error);
        res.status(500).json({ error: 'Failed to get evaluations' });
    }
});

// POST /api/navy/evaluations - Upload a new evaluation (requires authentication)
router.post('/evaluations', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        if (!req.body.date) {
            return res.status(400).json({ error: 'Evaluation date is required' });
        }
        
        let evaluation = {
            id: req.file.filename || req.file.path,
            date: req.body.date,
            description: req.body.description || '',
            createdAt: new Date().toISOString()
        };
        
        if (isProduction) {
            // For Vercel Blob, we handle upload in the multer storage engine
            evaluation.imageUrl = req.file.url;
        } else {
            // For local storage, create URL path
            evaluation.imageUrl = `/api/navy/evaluations/${req.file.filename}`;
        }
        
        res.status(201).json({
            success: true,
            evaluation: evaluation
        });
    } catch (error) {
        console.error('Error uploading evaluation:', error);
        res.status(500).json({ error: 'Failed to upload evaluation' });
    }
});

// GET /api/navy/evaluations/:filename - Get a specific evaluation image
router.get('/evaluations/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        
        if (isProduction) {
            // For Vercel Blob, redirect to the blob URL
            const blobUrl = await getFileUrl(`navy-evals/${filename}`);
            if (blobUrl) {
                return res.redirect(blobUrl);
            } else {
                return res.status(404).json({ error: 'Evaluation not found' });
            }
        } else {
            // For local storage, serve the file
            const filePath = path.join(__dirname, '../uploads/navy-evals', filename);
            
            if (fs.existsSync(filePath)) {
                res.sendFile(filePath);
            } else {
                res.status(404).json({ error: 'Evaluation not found' });
            }
        }
    } catch (error) {
        console.error('Error getting evaluation:', error);
        res.status(500).json({ error: 'Failed to get evaluation' });
    }
});

// DELETE /api/navy/evaluations/:filename - Delete a specific evaluation (requires authentication)
router.delete('/evaluations/:filename', authenticateToken, async (req, res) => {
    try {
        const filename = req.params.filename;
        
        if (isProduction) {
            // For Vercel Blob, delete from blob storage
            const deleted = await deleteFile(`navy-evals/${filename}`);
            if (deleted) {
                return res.json({ success: true, message: 'Evaluation deleted successfully' });
            } else {
                return res.status(404).json({ error: 'Evaluation not found or could not be deleted' });
            }
        } else {
            // For local storage, delete the file
            const filePath = path.join(__dirname, '../uploads/navy-evals', filename);
            
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                return res.json({ success: true, message: 'Evaluation deleted successfully' });
            } else {
                return res.status(404).json({ error: 'Evaluation not found' });
            }
        }
    } catch (error) {
        console.error('Error deleting evaluation:', error);
        res.status(500).json({ error: 'Failed to delete evaluation' });
    }
});

// POST /api/navy/about - Save about section content (requires authentication)
router.post('/about', authenticateToken, express.json(), async (req, res) => {
    try {
        if (!req.body.content) {
            return res.status(400).json({ error: 'Content is required' });
        }
        
        const content = req.body.content;
        
        if (isProduction) {
            // Save to Vercel Blob as a JSON file
            const contentJson = JSON.stringify({ content });
            await uploadToBlob('navy-about.json', contentJson, 'application/json');
        } else {
            // Save to local file system
            const aboutDir = path.join(__dirname, '../uploads/navy');
            if (!fs.existsSync(aboutDir)) {
                fs.mkdirSync(aboutDir, { recursive: true });
            }
            
            const aboutPath = path.join(aboutDir, 'about.json');
            fs.writeFileSync(aboutPath, JSON.stringify({ content }));
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving about content:', error);
        res.status(500).json({ error: 'Failed to save about content' });
    }
});

// GET /api/navy/about - Get about section content
router.get('/about', async (req, res) => {
    try {
        let content = '';
        
        if (isProduction) {
            // Get from Vercel Blob
            try {
                const url = await getFileUrl('navy-about.json');
                if (url) {
                    const response = await fetch(url);
                    if (response.ok) {
                        const data = await response.json();
                        content = data.content;
                    }
                }
            } catch (error) {
                console.error('Error getting about content from Vercel Blob:', error);
                // Return empty content if file doesn't exist yet
            }
        } else {
            // Get from local file system
            const aboutPath = path.join(__dirname, '../uploads/navy/about.json');
            if (fs.existsSync(aboutPath)) {
                const data = JSON.parse(fs.readFileSync(aboutPath, 'utf8'));
                content = data.content;
            }
        }
        
        res.json({ content });
    } catch (error) {
        console.error('Error getting about content:', error);
        res.status(500).json({ error: 'Failed to get about content' });
    }
});

// POST /api/navy/profile - Upload Navy profile image (requires authentication)
router.post('/profile', authenticateToken, profileUpload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        let imageUrl = '';
        
        if (isProduction) {
            // For Vercel Blob, we handle upload in the multer storage engine
            imageUrl = req.file.url;
        } else {
            // For local storage, create URL path
            imageUrl = `/api/navy/profile/image`;
        }
        
        res.status(201).json({
            success: true,
            url: imageUrl
        });
    } catch (error) {
        console.error('Error uploading profile image:', error);
        res.status(500).json({ error: 'Failed to upload profile image' });
    }
});

// GET /api/navy/profile - Get Navy profile image
router.get('/profile', async (req, res) => {
    try {
        if (isProduction) {
            // For Vercel Blob, redirect to the blob URL
            const blobUrl = await getFileUrl('navy-profile/profile');
            if (blobUrl) {
                return res.json({ url: blobUrl });
            } else {
                return res.status(404).json({ error: 'Profile image not found' });
            }
        } else {
            // For local storage, check if file exists
            const filePath = path.join(__dirname, '../uploads/navy-profile/profile');
            
            if (fs.existsSync(filePath)) {
                res.json({ url: '/api/navy/profile/image' });
            } else {
                res.status(404).json({ error: 'Profile image not found' });
            }
        }
    } catch (error) {
        console.error('Error getting profile image:', error);
        res.status(500).json({ error: 'Failed to get profile image' });
    }
});

// GET /api/navy/profile/image - Serve the actual profile image
router.get('/profile/image', async (req, res) => {
    try {
        if (isProduction) {
            // For Vercel Blob, redirect to the blob URL
            const blobUrl = await getFileUrl('navy-profile/profile');
            if (blobUrl) {
                return res.redirect(blobUrl);
            } else {
                return res.status(404).json({ error: 'Profile image not found' });
            }
        } else {
            // For local storage, serve the file
            const filePath = path.join(__dirname, '../uploads/navy-profile/profile');
            
            if (fs.existsSync(filePath)) {
                res.sendFile(filePath);
            } else {
                res.status(404).json({ error: 'Profile image not found' });
            }
        }
    } catch (error) {
        console.error('Error serving profile image:', error);
        res.status(500).json({ error: 'Failed to serve profile image' });
    }
});

module.exports = router; 