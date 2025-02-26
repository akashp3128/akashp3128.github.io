# Pokemon Card Website - Production Deployment Guide

## Overview

This guide details the steps to deploy the Pokemon Card Resume website to production using Vercel. The application consists of:

1. A frontend static website with HTML, CSS, and JavaScript
2. A Node.js backend API (optional, as the site can work in "emergency mode" without a backend)

## Prerequisites

- A Vercel account (https://vercel.com)
- Git repository with your project
- Node.js and npm installed locally for testing

## Deployment Steps

### 1. Prepare Your Application

Ensure the following files are correctly set up:

- `vercel.json` - Configure build settings and routing
- `package.json` - Define dependencies and scripts
- Environment variables - Set up any required secrets

### 2. Testing Locally Before Deployment

```bash
# Start the frontend server
cd frontend
node server.js

# In a separate terminal, start the backend (optional)
cd backend
npm start
```

### 3. Deploy to Vercel

#### Option 1: Using the Vercel Dashboard

1. Login to the Vercel dashboard
2. Click "New Project"
3. Import your Git repository
4. Configure the project:
   - Root directory: `./`
   - Build Command: Auto-detected from vercel.json
   - Output Directory: Auto-detected
5. Add environment variables:
   - `JWT_SECRET`: A secure random string for authentication
   - `ADMIN_PASSWORD`: The admin password for accessing the admin panel
6. Click "Deploy"

#### Option 2: Using the Vercel CLI

1. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy from your project directory:
   ```bash
   vercel --prod
   ```

### 4. Post-Deployment Verification

After deployment, verify:

1. The website loads correctly
2. The Pokemon card flips when clicked
3. The settings button works
4. You can sign in using the admin password
5. Authenticated users can upload profile images

## Troubleshooting

### Common Issues:

1. **API Connection Problems**:
   - Check network requests in browser dev tools
   - Ensure API routes are correctly configured in vercel.json
   - Verify environment variables are set

2. **Authentication Issues**:
   - Check JWT token in localStorage
   - Ensure correct password is being used
   - Verify JWT_SECRET is properly set

3. **Image Upload Failures**:
   - Check file permissions and CORS settings
   - Ensure authentication token is properly passed
   - Verify file size limits

## Maintenance

### Updating the Deployment

To update your deployed application:

1. Push changes to your Git repository
2. Vercel will automatically rebuild and deploy the changes

### Monitoring

1. Use Vercel's built-in analytics to monitor traffic
2. Check logs in the Vercel dashboard for any errors

## Emergency Mode

The application includes an "emergency mode" feature for situations where the backend is unavailable:

- Enabled automatically in local development when backend is unreachable
- Stores data in localStorage instead of the backend database
- Use password "localdev" or "Rosie@007" for authentication in emergency mode

For production, it's recommended to have a proper backend running, but emergency mode ensures the site remains functional even if backend issues occur. 