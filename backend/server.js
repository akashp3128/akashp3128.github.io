const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const { 
    ensureUploadDirExists, 
    isProduction, 
    getGridFSReadStream, 
    getGridFSFiles 
} = require('./utils/storage');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Set up middleware
app.use(helmet()); // Security headers

// CORS middleware
const allowedOrigins = process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL, 'https://akashp3128.github.io'] 
    : ['http://localhost:8080', 'http://localhost:3000', 'http://127.0.0.1:8080', 'http://127.0.0.1:3000', 'null'];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl requests, etc.)
        if (!origin) {
            console.log('Request with no origin');
            return callback(null, true);
        }
        
        console.log('Request from origin:', origin);
        
        if (process.env.NODE_ENV !== 'production') {
            // In development mode, allow any origin
            return callback(null, true);
        }
        
        // Check if the origin is allowed
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        } else {
            console.warn(`Origin not allowed: ${origin}`);
            return callback(null, true); // Still allow for now, but log a warning
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // Logging

// Create uploads directory if it doesn't exist (for local development)
if (!isProduction) {
    ensureUploadDirExists();
}

// API routes
const authRoutes = require('./routes/auth');
const resumeRoutes = require('./routes/resume');
const imageRoutes = require('./routes/image');

app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/image', imageRoutes);

// Add a route to serve files from GridFS in production
if (isProduction) {
    app.get('/api/file/:filename', async (req, res) => {
        try {
            const filename = req.params.filename;
            
            // Check if the file exists in GridFS
            const files = await getGridFSFiles({ filename });
            
            if (!files || files.length === 0) {
                return res.status(404).json({ message: 'File not found' });
            }
            
            // Check if this is an image file
            const contentType = files[0].contentType;
            if (contentType) {
                res.set('Content-Type', contentType);
            }
            
            // Stream the file from GridFS
            const readStream = getGridFSReadStream(filename);
            readStream.pipe(res);
        } catch (error) {
            console.error('Error streaming file from GridFS:', error);
            res.status(500).json({ message: 'Error retrieving file', error: error.message });
        }
    });
}

// Add a route to serve uploaded files in development
if (!isProduction) {
    app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));
}

// Add debug route for troubleshooting
app.get('/api/debug', (req, res) => {
    // Only show this in development
    if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({ message: 'Debug information not available in production' });
    }
    
    // Get MongoDB connection status
    const mongoStatus = require('mongoose').connection.readyState;
    const mongoStatusText = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
    }[mongoStatus] || 'unknown';
    
    // Get basic environment information
    const debugInfo = {
        environment: process.env.NODE_ENV || 'development',
        uploads_directory: path.join(__dirname, 'uploads'),
        uploads_exist: fs.existsSync(path.join(__dirname, 'uploads')),
        platform: process.platform,
        storage_type: isProduction ? 'MongoDB GridFS' : 'local',
        mongodb_status: mongoStatusText,
        mongodb_uri: isProduction ? 'hidden in production' : (process.env.MONGODB_URI || 'mongodb://localhost:27017/pokemon-card-resume'),
        jwt_secret_configured: !!process.env.JWT_SECRET,
        admin_password_configured: !!process.env.ADMIN_PASSWORD,
        server_timezone: new Date().toString(),
    };
    
    res.json(debugInfo);
});

// Basic route for testing
app.get('/', (req, res) => {
    res.status(200).json({ 
        message: 'Pokemon Card Resume API is running',
        status: 'OK'
    });
});

// Add an explicit health endpoint for connectivity checks
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is healthy' });
});

// Add API version of health endpoint for frontend
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'API is healthy' });
});

// Add CORS headers to all responses as a fallback
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    // Handle preflight OPTIONS requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    next();
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Server error'
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 