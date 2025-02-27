const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const mongoose = require('mongoose');
const Grid = require('gridfs-stream');

// Check if we're in production or development
const isProduction = process.env.NODE_ENV === 'production';

// MongoDB connection
let gfs;
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pokemon-card-resume';

// Initialize MongoDB connection and GridFS
const connectMongoDB = () => {
    if (mongoose.connection.readyState === 0) {
        mongoose.connect(mongoURI)
        .then(() => {
            console.log('MongoDB connected successfully');
        })
        .catch(err => {
            console.error('MongoDB connection error:', err);
        });
    }

    // Initialize GridFS
    const conn = mongoose.connection;
    conn.once('open', () => {
        gfs = Grid(conn.db, mongoose.mongo);
        gfs.collection('uploads'); // Set the collection name
        console.log('GridFS initialized');
    });
};

// Connect to MongoDB when the module is imported
connectMongoDB();

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

// Create storage engine for file uploads (used for both resumes and images)
const createGridFsStorage = (fileType) => {
    if (isProduction) {
        // Use GridFS in production
        console.log(`Using GridFS storage for ${fileType} uploads`);
        return new GridFsStorage({
            url: mongoURI,
            file: (req, file) => {
                const filename = fileType === 'resume' ? 'resume.pdf' : 
                                (fileType === 'image' ? `profile${path.extname(file.originalname).toLowerCase()}` : file.originalname);
                
                return {
                    filename: filename,
                    bucketName: 'uploads' // Collection name
                };
            }
        });
    } else {
        // Use local storage in development
        console.log(`Using local storage for ${fileType} uploads`);
        ensureUploadDirExists();
        return multer.diskStorage({
            destination: function (req, file, cb) {
                const uploadDir = path.join(__dirname, '../uploads');
                cb(null, uploadDir);
            },
            filename: function (req, file, cb) {
                if (fileType === 'resume') {
                    cb(null, 'resume.pdf');
                } else if (fileType === 'image') {
                    const ext = path.extname(file.originalname).toLowerCase();
                    cb(null, 'profile' + ext);
                } else {
                    cb(null, file.originalname);
                }
            }
        });
    }
};

// Create storage engine for resume uploads
const createResumeStorage = () => {
    return createGridFsStorage('resume');
};

// Create storage engine for image uploads
const createImageStorage = () => {
    return createGridFsStorage('image');
};

// Get URL for a file
const getFileUrl = (filename) => {
    if (isProduction) {
        // Use a route that will stream the file from GridFS
        return `/api/file/${filename}`;
    } else {
        // Local URL
        return `/api/uploads/${filename}`;
    }
};

// Check if a file exists
const fileExists = async (filename) => {
    if (isProduction) {
        try {
            // Check if file exists in GridFS
            const files = await getGridFSFiles({ filename: filename });
            return files && files.length > 0;
        } catch (error) {
            console.error('Error checking if file exists in GridFS:', error);
            throw error;
        }
    } else {
        const filePath = path.join(__dirname, '../uploads', filename);
        return fs.existsSync(filePath);
    }
};

// Helper function to get files from GridFS
const getGridFSFiles = (filter = {}) => {
    return new Promise((resolve, reject) => {
        if (!gfs) {
            return reject(new Error('GridFS not initialized'));
        }
        
        gfs.files.find(filter).toArray((err, files) => {
            if (err) {
                return reject(err);
            }
            resolve(files);
        });
    });
};

// Helper function to get a file stream from GridFS
const getGridFSReadStream = (filename) => {
    if (!gfs) {
        throw new Error('GridFS not initialized');
    }
    return gfs.createReadStream({ filename });
};

// Delete a file
const deleteFile = async (filename) => {
    if (isProduction) {
        try {
            if (!gfs) {
                throw new Error('GridFS not initialized');
            }
            
            // Find the file first to get its ID
            const files = await getGridFSFiles({ filename: filename });
            if (!files || files.length === 0) {
                console.warn(`File ${filename} not found in GridFS`);
                return true;
            }
            
            // Delete the file chunks
            await new Promise((resolve, reject) => {
                gfs.remove({ _id: files[0]._id, root: 'uploads' }, (err) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve();
                });
            });
            
            console.log(`File ${filename} deleted from GridFS`);
            return true;
        } catch (error) {
            console.error('Error deleting file from GridFS:', error);
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
    getGridFSReadStream,
    getGridFSFiles
}; 