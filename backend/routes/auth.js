const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { authenticateToken } = require('../middleware/auth');
const Admin = require('../models/Admin');

// Initialize with hashed password in a real app, this would be in a database
let adminPasswordHash = null;

// When the server starts, hash the admin password from environment variable
const initializeAdminPassword = () => {
    if (!process.env.ADMIN_PASSWORD || !process.env.JWT_SECRET) {
        throw new Error('Critical environment variables ADMIN_PASSWORD and JWT_SECRET must be set.');
    }

    const salt = bcrypt.genSaltSync(10);
    adminPasswordHash = bcrypt.hashSync(process.env.ADMIN_PASSWORD, salt);
};

// Initialize the admin password hash
initializeAdminPassword();

/**
 * @route POST /api/auth/login
 * @desc Authenticate admin & get token
 * @access Public
 */
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        const admin = await Admin.findOne({ username });
        if (!admin) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const isMatch = await bcrypt.compare(password, admin.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const payload = { user: { isAdmin: true, username: admin.username } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during authentication' });
    }
});

/**
 * @route POST /api/auth/verify
 * @desc Verify token is valid
 * @access Private
 */
router.post('/verify', authenticateToken, (req, res) => {
    // If middleware passes, the token is valid
    res.json({ valid: true, user: req.user });
});

/**
 * @route POST /api/auth/change-password
 * @desc Change admin password
 * @access Private
 */
router.post('/change-password', authenticateToken, async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
        return res.status(400).json({ message: 'New password must be at least 8 characters' });
    }

    try {
        const isMatch = await bcrypt.compare(currentPassword, adminPasswordHash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        const salt = bcrypt.genSaltSync();
        adminPasswordHash = bcrypt.hashSync(newPassword, salt);

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error in /change-password:', error);
        res.status(500).json({ message: 'Server error while changing password' });
    }
});

/**
 * @route POST /api/auth/reset-password
 * @desc Reset the admin password to default (development only)
 * @access Public
 */
router.post('/reset-password', async (req, res) => {
    // Only allow password reset in development mode for security
    if (process.env.NODE_ENV !== 'development') {
        console.warn('Attempted password reset in production mode');
        return res.status(403).json({ 
            message: 'Password reset is only available in development mode',
            tip: 'Default password is usually "admin1234" unless customized' 
        });
    }
    
    // Reset to default password
    const defaultPassword = 'admin1234';
    const salt = bcrypt.genSaltSync(10);
    adminPasswordHash = bcrypt.hashSync(defaultPassword, salt);
    
    console.log('Password has been reset to default');
    res.json({ message: 'Password has been reset to default "admin1234"' });
});

module.exports = router; 