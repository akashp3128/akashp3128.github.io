const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Set up middleware
app.use(helmet()); // Security headers

// More permissive CORS configuration for development and production
const allowedOrigins = [
    'http://localhost:8080',
    'http://localhost:3000',
    'https://akashpatelresume.us', 
    'https://www.akashpatelresume.us'
];

app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) === -1) {
            console.log('CORS request from unauthorized origin:', origin);
        }
        
        // In development, allow all origins
        if (process.env.NODE_ENV === 'development') {
            return callback(null, true);
        }
        
        // In production, check against allowed origins
        if (allowedOrigins.indexOf(origin) !== -1) {
            return callback(null, true);
        }
        
        // Still allow the request to proceed to avoid breaking functionality
        return callback(null, true);
    },
    credentials: true
})); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // Logging

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// API routes
const authRoutes = require('./routes/auth');
const resumeRoutes = require('./routes/resume');

app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);

// Basic route for testing
app.get('/', (req, res) => {
    res.status(200).json({ 
        message: 'Pokemon Card Resume API is running',
        status: 'OK'
    });
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