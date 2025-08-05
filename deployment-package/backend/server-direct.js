// StarsFlock.in - Direct Node.js Server (No External Dependencies)
// This bypasses all npm/nodenv issues by using only built-in Node.js modules

import http from 'http';
import fs from 'fs';
import path from 'path';
import url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

console.log('🚀 Starting StarsFlock.in server...');
console.log('📁 Server directory:', __dirname);

const server = http.createServer((req, res) => {
  const reqUrl = url.parse(req.url, true);
  
  // CORS headers for all requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  console.log(`${req.method} ${req.url}`);

  // API Routes
  if (req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'OK', 
      message: 'StarsFlock.in server is running successfully!',
      timestamp: new Date().toISOString(),
      server: 'Node.js Built-in Server'
    }));
    return;
  }

  if (req.url.startsWith('/api/')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      message: 'StarsFlock.in API Server Ready',
      endpoint: req.url,
      method: req.method,
      status: 'Coming Soon - Database Integration Pending'
    }));
    return;
  }

  // Static file serving
  let filePath;
  if (req.url === '/' || req.url === '/index.html') {
    filePath = path.join(__dirname, '../index.html');
  } else {
    filePath = path.join(__dirname, '..', req.url);
  }

  // Security check - prevent directory traversal
  const normalizedPath = path.normalize(filePath);
  const rootDir = path.join(__dirname, '..');
  if (!normalizedPath.startsWith(rootDir)) {
    res.writeHead(403);
    res.end('Access Denied');
    return;
  }

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // File doesn't exist - serve index.html for SPA routing
      const indexPath = path.join(__dirname, '../index.html');
      fs.access(indexPath, fs.constants.F_OK, (indexErr) => {
        if (indexErr) {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <head><title>StarsFlock.in</title></head>
              <body>
                <h1>StarsFlock.in Server Running</h1>
                <p>Frontend files not found. Please upload your React build files.</p>
                <p><a href="/api/health">Check Server Health</a></p>
              </body>
            </html>
          `);
        } else {
          // Serve index.html for SPA routing
          res.writeHead(200, { 'Content-Type': 'text/html' });
          fs.createReadStream(indexPath).pipe(res);
        }
      });
      return;
    }

    // File exists - determine content type and serve
    const ext = path.extname(filePath).toLowerCase();
    const contentTypes = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2',
      '.ttf': 'font/ttf',
      '.eot': 'application/vnd.ms-fontobject'
    };

    const contentType = contentTypes[ext] || 'application/octet-stream';
    
    res.writeHead(200, { 
      'Content-Type': contentType,
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000'
    });
    
    fs.createReadStream(filePath).pipe(res);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ StarsFlock.in server successfully started!`);
  console.log(`🌐 Server running on: http://localhost:${PORT}`);
  console.log(`🔧 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📱 Frontend: http://localhost:${PORT}`);
  console.log(`📝 No external dependencies required - using Node.js built-ins only`);
});

// Handle server errors
server.on('error', (err) => {
  console.error('❌ Server error:', err.message);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please check Plesk configuration.`);
  }
});

process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
});