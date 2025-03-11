const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const { list } = require('@vercel/blob');
const { 
    ensureUploadDirExists, 
    isProduction
} = require('./utils/storage');

// Try to load mongoose, but continue if it's not available
let mongoose = null;
try {
    mongoose = require('mongoose');
    console.log('MongoDB module loaded successfully');
} catch (err) {
    console.log('MongoDB module not available, continuing without database functionality');
}

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Log storage type
console.log(`Storage provider: ${isProduction ? 'Vercel Blob Storage' : 'Local File System'}`);

// Set up middleware
app.use(helmet()); // Security headers

// CORS middleware
const allowedOrigins = process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL, 'https://akashp3128.github.io', 'https://akashp3128-github-io.vercel.app', 'https://batman-akashp3128-github-io.vercel.app', 'https://akashp3128.vercel.app', 'https://akashp3128-github-io.vercel.app']
    : ['http://localhost:8080', 'http://localhost:3000', 'http://127.0.0.1:8080', 'http://127.0.0.1:3000'];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
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

// Import routes
const authRoutes = require('./routes/auth');
const resumeRoutes = require('./routes/resume');
const imageRoutes = require('./routes/image');
const navyRoutes = require('./routes/navy');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/image', imageRoutes);
app.use('/api/navy', navyRoutes);

// Add a route to serve files from Vercel Blob in production
if (isProduction) {
    app.get('/api/blob/:filename', async (req, res) => {
        try {
            const filename = req.params.filename;
            
            // Check if the file exists in Vercel Blob
            const blobs = await list();
            const blobFile = blobs.blobs.find(blob => blob.pathname === filename);
            
            if (!blobFile) {
                return res.status(404).json({ message: 'File not found' });
            }
            
            // Redirect to the blob URL
            res.redirect(blobFile.url);
        } catch (error) {
            console.error('Error serving file from Vercel Blob:', error);
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
    
    // Get basic environment information
    const debugInfo = {
        environment: process.env.NODE_ENV || 'development',
        uploads_directory: path.join(__dirname, 'uploads'),
        uploads_exist: fs.existsSync(path.join(__dirname, 'uploads')),
        platform: process.platform,
        storage_type: isProduction ? 'Vercel Blob Storage' : 'local',
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

// Middleware to set caching headers
app.use((req, res, next) => {
    if (req.method === 'GET') {
        res.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
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

// MongoDB connection setup - only if mongoose is available
const connectDB = async () => {
    if (!mongoose) {
        console.log('Skipping MongoDB connection - mongoose not available');
        return;
    }
    
    try {
        if (!process.env.MONGODB_URI) {
            console.log('Skipping MongoDB connection - MONGODB_URI not set');
            return;
        }
        
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        // Don't exit the process, let the server run without MongoDB
        console.log('Continuing to run server without MongoDB connection');
    }
};

// Connect to MongoDB if possible
connectDB();

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 