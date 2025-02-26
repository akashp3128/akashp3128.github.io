const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Start with a high port number to avoid conflicts
const BASE_PORT = 8080;
let PORT = BASE_PORT;
let server = null;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml'
};

// Check if a port is in use
function isPortInUse(port) {
  return new Promise((resolve) => {
    const netstat = exec(`lsof -i:${port} || echo 'free'`, (error, stdout) => {
      if (error) {
        // If error, the command failed - likely meaning port is available
        resolve(false);
      } else {
        // If output contains 'free', port is available
        resolve(stdout.indexOf('free') === -1);
      }
    });
  });
}

// Create the server handler
const requestHandler = (req, res) => {
  console.log(`Request for ${req.url}`);
  
  // Normalize URL to prevent directory traversal
  let filePath = '.' + req.url;
  if (filePath === './') {
    filePath = './index.html';
  }
  
  // Handle API placeholder for development
  if (filePath.startsWith('./api/placeholder')) {
    const parts = filePath.split('/');
    const width = parts[3] || 300;
    const height = parts[4] || 200;
    
    res.writeHead(302, {
      'Location': `https://placehold.co/${width}x${height}`
    });
    res.end();
    return;
  }
  
  // Get file extension
  const extname = path.extname(filePath);
  let contentType = MIME_TYPES[extname] || 'application/octet-stream';
  
  // Read file
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // Page not found
        fs.readFile('./index.html', (err, content) => {
          if (err) {
            res.writeHead(500);
            res.end('Error loading index.html');
            return;
          }
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(content, 'utf-8');
        });
      } else {
        // Server error
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      // Success
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
};

// Start the server
async function startServer(initialPort) {
  // Check available ports starting from initialPort
  let port = initialPort;
  let maxAttempts = 10;
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    const inUse = await isPortInUse(port);
    if (!inUse) {
      break;
    }
    console.log(`Port ${port} is already in use, trying port ${port + 1}`);
    port++;
    attempts++;
  }
  
  if (attempts >= maxAttempts) {
    console.error('Could not find an available port after multiple attempts');
    process.exit(1);
  }
  
  // Create a new server instance
  server = http.createServer(requestHandler);
  
  server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
  }).on('error', (err) => {
    console.error('Server error:', err);
    process.exit(1);
  });
}

// Graceful shutdown
process.on('SIGINT', () => {
  if (server) {
    console.log('Shutting down server gracefully...');
    server.close(() => {
      console.log('Server has been closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

// Start the server
startServer(PORT); 