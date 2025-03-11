const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { put, list, del, head } = require('@vercel/blob');

// Check if we're in production or development
const isProduction = process.env.NODE_ENV === 'production';

// Helper to ensure upload directory exists for local development
const ensureUploadDirExists = () => {
    if (isProduction) return true; // No need for local directories in production
    
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
        try {
            fs.mkdirSync(uploadDir, { recursive: true, mode: 0o777 });
            console.log('Created uploads directory:', uploadDir);
            return true;
        } catch (error) {
            console.error('Failed to create uploads directory:', error);
            return false;
        }
    }
    return true;
};

// Create a disk storage engine for local development
const createLocalDiskStorage = (fileType) => {
    console.log(`Using local storage for ${fileType} uploads`);
    ensureUploadDirExists();
    
    return multer.diskStorage({
        destination: function (req, file, cb) {
            let uploadDir = path.join(__dirname, '../uploads');
            
            // Create subdirectories based on file type
            if (fileType === 'navy-evals') {
                uploadDir = path.join(uploadDir, 'navy-evals');
            } else if (fileType === 'navy-profile') {
                uploadDir = path.join(uploadDir, 'navy-profile');
            }
            
            // Ensure the directory exists
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            
            cb(null, uploadDir);
        },
        filename: function (req, file, cb) {
            if (fileType === 'resume') {
                cb(null, 'resume.pdf');
            } else if (fileType === 'image') {
                const ext = path.extname(file.originalname).toLowerCase();
                cb(null, 'profile' + ext);
            } else if (fileType === 'navy-profile') {
                const ext = path.extname(file.originalname).toLowerCase();
                cb(null, 'profile' + ext);
            } else if (fileType === 'navy-evals') {
                // Generate a unique filename for evaluations
                const date = req.body.date || new Date().toISOString().split('T')[0];
                const timestamp = Date.now();
                const ext = path.extname(file.originalname).toLowerCase();
                cb(null, `navy-eval-${date}-${timestamp}${ext}`);
            } else {
                cb(null, file.originalname);
            }
        }
    });
};

// Create memory storage for production (we'll upload to Vercel Blob after multer processes the file)
const createMemoryStorage = () => {
    return multer.memoryStorage();
};

// Create storage engine for file uploads
const createStorage = (fileType) => {
    if (isProduction) {
        // In production, use memory storage and then upload to Vercel Blob
        console.log(`Using Vercel Blob storage for ${fileType} uploads`);
        return createMemoryStorage();
    } else {
        // In development, use local disk storage
        return createLocalDiskStorage(fileType);
    }
};

// Create storage engine for resume uploads
const createResumeStorage = () => {
    return createStorage('resume');
};

// Create storage engine for image uploads
const createImageStorage = (type = 'image') => {
    return createStorage(type);
};

// Upload file to Vercel Blob
const uploadToBlob = async (buffer, filename, contentType) => {
    try {
        // Upload to Vercel Blob
        const blob = await put(filename, buffer, {
            contentType: contentType,
            access: 'public' // Make files publicly accessible
        });
        
        console.log(`File uploaded to Vercel Blob: ${blob.url}`);
        return blob;
    } catch (error) {
        console.error('Error uploading to Vercel Blob:', error);
        throw error;
    }
};

// Get URL for a file
const getFileUrl = (filename) => {
    if (isProduction) {
        // For production, we'll have to check if the file exists in Vercel Blob first
        // But for now, return the pattern
        return `/api/blob/${filename}`;
    } else {
        // Local URL
        return `/api/uploads/${filename}`;
    }
};

// Check if a file exists
const fileExists = async (filename) => {
    if (isProduction) {
        try {
            // Check if file exists in Vercel Blob
            const blobs = await list();
            return blobs.blobs.some(blob => blob.pathname === filename);
        } catch (error) {
            console.error('Error checking if file exists in Vercel Blob:', error);
            return false;
        }
    } else {
        const filePath = path.join(__dirname, '../uploads', filename);
        return fs.existsSync(filePath);
    }
};

// Delete a file
const deleteFile = async (filename) => {
    if (isProduction) {
        try {
            // Delete from Vercel Blob
            await del(filename);
            console.log(`File ${filename} deleted from Vercel Blob`);
            return true;
        } catch (error) {
            console.error('Error deleting file from Vercel Blob:', error);
            throw error;
        }
    } else {
        try {
            const filePath = path.join(__dirname, '../uploads', filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            return true;
        } catch (error) {
            console.error('Error deleting local file:', error);
            throw error;
        }
    }
};

module.exports = {
    createResumeStorage,
    createImageStorage,
    getFileUrl,
    fileExists,
    deleteFile,
    ensureUploadDirExists,
    isProduction,
    uploadToBlob
}; 