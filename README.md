# Resume Website

A creative resume website styled as a Pokemon card with interactive features. The website allows for card flipping, image uploads, and resume management.

## Features

- **Interactive Pokemon Card**: Holographic effects and card flipping
- **Admin Panel**: Secure login to manage content
- **Resume Management**: Upload and manage your resume PDF
- **Profile Image**: Authenticated users can upload a custom profile image
- **Emergency Mode**: Can operate without a backend by using local storage

## Quick Start

### Local Development

1. Clone the repository
   ```
   git clone https://github.com/yourusername/pokemon-card-resume.git
   cd pokemon-card-resume
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Start the frontend server
   ```
   cd frontend
   node server.js
   ```

4. Start the backend server (optional)
   ```
   cd backend
   npm start
   ```

5. Open your browser and navigate to [http://localhost:8080](http://localhost:8080)

### Emergency Mode

If the backend server is not running, the application will automatically switch to "emergency mode" on localhost, which:

- Stores data in local storage instead of a database
- Shows an emergency mode banner
- Provides an alternative authentication method for local development

## Project Structure

```
/
├── frontend/             # Frontend files
│   ├── css/              # Stylesheets
│   ├── js/               # JavaScript files
│   │   ├── api.js        # API client for backend communication
│   │   ├── app.js        # Main application logic
│   │   ├── debug.js      # Debugging utilities
│   │   ├── init.js       # Initialization and emergency mode
│   │   └── pokemon-card.js # Card interactivity
│   ├── assets/           # Images and other assets
│   ├── index.html        # Main HTML file
│   └── server.js         # Static file server for development
├── backend/              # Backend API server (Node.js)
│   ├── routes/           # API route handlers
│   ├── middleware/       # Express middleware
│   └── server.js         # Backend server entry point
├── vercel.json           # Vercel deployment configuration
└── package.json          # NPM package configuration
```

## Key Components

### Pokemon Card

The Pokemon card is the centerpiece of the website. It features:

- Holographic effects that respond to mouse movement
- Front and back views that can be toggled by clicking the card
- Real-time visual feedback

### Authentication

The admin panel is protected by secure authentication:

- Production mode: Set via environment variables
- Development mode: Custom authentication setting
- Emergency mode: Special local development authentication

### File Uploads

Authenticated users can:

- Upload a PDF resume
- Upload a custom profile image
- Manage (view/delete) their uploaded files

## Development

### Debugging

The application includes comprehensive debugging tools:

- Debug console (toggle with the bug icon)
- Emergency mode banner when backend is unavailable
- Detailed logs in the browser console

### API Client

The API client (`api.js`) automatically:

- Detects the environment (local/production)
- Switches to emergency mode when needed
- Handles authentication tokens

## Production Deployment Information

This site is configured to work in two modes:

1. **Full Mode** - With backend API connectivity (ideal scenario)
2. **Emergency Mode** - When backend API is unreachable, the site will:
   - Store data in localStorage instead of the backend
   - Allow basic functionality without API connectivity
   - Display a notification when operating in emergency mode

The site will automatically detect if the backend is unreachable and enable emergency mode.

## License

MIT

## Contact

Akash Patel - akashp3128@gmail.com
