const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const Admin = require('../models/Admin');

dotenv.config();

const createInitialAdmin = async () => {
    await mongoose.connect(process.env.MONGODB_URI);

    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD;

    if (!password) {
        console.error('ADMIN_PASSWORD environment variable must be set.');
        process.exit(1);
    }

    const existingAdmin = await Admin.findOne({ username: 'admin' });
    if (existingAdmin) {
        console.log('Admin user already exists.');
        process.exit(0);
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(process.env.ADMIN_PASSWORD, salt);

    const admin = new Admin({
        username: 'admin',
        passwordHash: hashedPassword
    });

    await admin.save();
    console.log('Initial admin user created successfully.');
    process.exit(0);
};

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('MongoDB connected successfully');
        createInitialAdmin();
    })
    .catch(error => {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }); 