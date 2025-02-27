const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
const fs = require('fs');

// Configure AWS (only needed in production)
if (process.env.NODE_ENV === 'production') {
    aws.config.update({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION || 'us-east-1'
    });
}

// Create S3 instance
const s3 = new aws.S3();

// Check if we're in production (Vercel) or development
const isProduction = process.env.NODE_ENV === 'production';

// Helper to ensure upload directory exists for local development
const ensureUploadDirExists = () => {
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

// Create storage engine for resume uploads
const createResumeStorage = () => {
    if (isProduction) {
        // Use S3 in production
        console.log('Using S3 storage for resume uploads');
        return multerS3({
            s3: s3,
            bucket: process.env.S3_BUCKET_NAME || 'pokemon-card-resume',
            acl: 'public-read',
            contentType: multerS3.AUTO_CONTENT_TYPE,
            key: function (req, file, cb) {
                cb(null, 'resume.pdf');
            }
        });
    } else {
        // Use local storage in development
        console.log('Using local storage for resume uploads');
        ensureUploadDirExists();
        return multer.diskStorage({
            destination: function (req, file, cb) {
                const uploadDir = path.join(__dirname, '../uploads');
                cb(null, uploadDir);
            },
            filename: function (req, file, cb) {
                cb(null, 'resume.pdf');
            }
        });
    }
};

// Create storage engine for image uploads
const createImageStorage = () => {
    if (isProduction) {
        // Use S3 in production
        console.log('Using S3 storage for image uploads');
        return multerS3({
            s3: s3,
            bucket: process.env.S3_BUCKET_NAME || 'pokemon-card-resume',
            acl: 'public-read',
            contentType: multerS3.AUTO_CONTENT_TYPE,
            key: function (req, file, cb) {
                const ext = path.extname(file.originalname).toLowerCase();
                cb(null, 'profile' + ext);
            }
        });
    } else {
        // Use local storage in development
        console.log('Using local storage for image uploads');
        ensureUploadDirExists();
        return multer.diskStorage({
            destination: function (req, file, cb) {
                const uploadDir = path.join(__dirname, '../uploads');
                cb(null, uploadDir);
            },
            filename: function (req, file, cb) {
                const ext = path.extname(file.originalname).toLowerCase();
                cb(null, 'profile' + ext);
            }
        });
    }
};

// Get URL for a file (S3 URL in production, local URL in development)
const getFileUrl = (filename) => {
    if (isProduction) {
        const bucket = process.env.S3_BUCKET_NAME || 'pokemon-card-resume';
        return `https://${bucket}.s3.amazonaws.com/${filename}`;
    } else {
        // Local URL - depends on how your server is set up to serve static files
        return `/api/uploads/${filename}`;
    }
};

// Check if a file exists
const fileExists = async (filename) => {
    if (isProduction) {
        try {
            const bucket = process.env.S3_BUCKET_NAME || 'pokemon-card-resume';
            const params = {
                Bucket: bucket,
                Key: filename
            };
            
            await s3.headObject(params).promise();
            return true;
        } catch (error) {
            if (error.code === 'NotFound') {
                return false;
            }
            console.error('Error checking if file exists in S3:', error);
            throw error;
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
            const bucket = process.env.S3_BUCKET_NAME || 'pokemon-card-resume';
            const params = {
                Bucket: bucket,
                Key: filename
            };
            
            await s3.deleteObject(params).promise();
            return true;
        } catch (error) {
            console.error('Error deleting file from S3:', error);
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
    isProduction
}; 