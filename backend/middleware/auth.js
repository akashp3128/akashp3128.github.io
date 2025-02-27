const jwt = require('jsonwebtoken');

/**
 * Middleware to authenticate JWT tokens
 */
const authenticateToken = (req, res, next) => {
    // Get token from Authorization header
    const authHeader = req.headers['authorization'];
    
    // Log for debugging
    console.log('Auth header received:', authHeader ? 'Present' : 'Missing');
    
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

    if (!token) {
        return res.status(401).json({ message: 'Authentication token required' });
    }
    
    try {
        // Get JWT secret from environment variable or use a default (only for development)
        const jwtSecret = process.env.JWT_SECRET || 'pokemoncardresumedemosecret';
        
        // Check for demo/hardcoded token pattern - for development environments
        const isDemoToken = token.includes('demo-token');
        if (isDemoToken && (process.env.NODE_ENV !== 'production')) {
            console.log('Using demo token for development');
            req.user = { isAdmin: true };
            return next();
        }
        
        // Verify the token
        const decoded = jwt.verify(token, jwtSecret);
        console.log('JWT verified successfully');
        req.user = decoded; // Add user info to request
        next();
    } catch (error) {
        console.error('Token verification failed:', error.message);
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};

module.exports = {
    authenticateToken
}; 