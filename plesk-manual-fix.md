# 🔧 Plesk Manual Fix - File Manager Method

Since npm commands keep failing with directory locks, we need to use Plesk File Manager to manually fix this:

## STEP 1: Delete node_modules via File Manager

1. **Go to Plesk** → **Files** → **File Manager**
2. **Navigate to:** `/httpdocs/backend/`
3. **Delete these items:**
   - `node_modules` folder (completely delete it)
   - `package-lock.json` file (if exists)

## STEP 2: Upload Pre-built Node Modules

I'll create a minimal working setup for you:

### Create Simple Package Structure
1. **Create** `/httpdocs/backend/package.json` with minimal content:
```json
{
  "name": "starsflock-backend",
  "version": "1.0.0",
  "type": "module",
  "main": "server.js"
}
```

## STEP 3: Alternative - Use Built-in Dependencies

Since npm keeps failing, let's modify the server to use only Node.js built-in modules where possible:

### Updated server.js (No external dependencies)
```javascript
import http from 'http';
import fs from 'fs';
import path from 'path';
import url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const server = http.createServer((req, res) => {
  // Basic CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Health check endpoint
  if (req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'OK', message: 'StarsFlock.in server running' }));
    return;
  }

  // Basic API endpoint
  if (req.url.startsWith('/api/')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'StarsFlock.in API - Coming Soon' }));
    return;
  }

  // Serve static files
  const filePath = path.join(__dirname, '../', req.url === '/' ? 'index.html' : req.url);
  
  if (fs.existsSync(filePath)) {
    const ext = path.extname(filePath);
    const contentType = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml'
    }[ext] || 'text/plain';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  } else {
    // SPA fallback - serve index.html for client-side routing
    const indexPath = path.join(__dirname, '../index.html');
    if (fs.existsSync(indexPath)) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      fs.createReadStream(indexPath).pipe(res);
    } else {
      res.writeHead(404);
      res.end('File not found');
    }
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`StarsFlock.in server running on port ${PORT}`);
});
```

## STEP 4: Test Basic Server

1. **Replace** your current `server.js` with the minimal version above
2. **Remove** `package.json` dependencies section
3. **Restart app** in Plesk Node.js panel
4. **Test** at http://starsflock.in

This will get your basic site running without npm dependency issues. Once it's working, we can gradually add features back.

## STEP 5: Alternative - Contact Plesk Support

If the above doesn't work, the npm directory lock issue might be a server-level problem that needs Plesk support to resolve.