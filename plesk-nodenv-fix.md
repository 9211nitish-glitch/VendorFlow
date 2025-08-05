# 🔧 Plesk NodeEnv Error Fix for StarsFlock.in

## Error Explanation
`/usr/local/psa/bin/chrootsh: nodenv: command not found`

This error occurs when Plesk's Node.js environment isn't properly configured or when there's a version mismatch.

## ✅ Quick Fix Solutions

### Solution 1: Use Direct Node Path (Recommended)
Update your Plesk Node.js settings:

1. **In Plesk Panel** → Node.js → starsflock.in
2. **Change Application Startup File** to use full path:
   ```
   /usr/bin/node server.js
   ```
   OR
   ```
   /opt/plesk/node/16/bin/node server.js
   ```

### Solution 2: Alternative Package.json Script
Replace the content of `/backend/package.json` with:
```json
{
  "name": "starsflock-backend",
  "version": "1.0.0",
  "type": "module",
  "main": "server.js",
  "scripts": {
    "start": "/usr/bin/node server.js"
  },
  "engines": {
    "node": ">=16.0.0"
  },
  "dependencies": {
    "@tanstack/react-query": "^5.60.5",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "express": "^4.21.2",
    "express-validator": "^7.2.0",
    "jsonwebtoken": "^9.0.2",
    "multer": "^1.4.5-lts.1",
    "mysql2": "^3.11.4",
    "nanoid": "^5.0.9",
    "node-cron": "^3.0.3",
    "razorpay": "^2.9.4"
  }
}
```

### Solution 3: Create Simple Start Script
Create `/backend/start.sh`:
```bash
#!/bin/bash
export NODE_ENV=production
exec /usr/bin/node server.js
```

Then in Plesk:
- **Application Startup File**: `start.sh`
- Make sure to `chmod +x start.sh`

### Solution 4: Manual Installation (SSH Method)
If you have SSH access:

```bash
# Navigate to backend directory
cd /var/www/vhosts/starsflock.in/httpdocs/backend

# Install dependencies manually
/usr/bin/npm install --production

# Start the application manually (for testing)
/usr/bin/node server.js

# If working, you can set up PM2
/usr/bin/npm install -g pm2
pm2 start server.js --name starsflock
pm2 startup
pm2 save
```

## 🎯 Recommended Steps

1. **Try Solution 1 first** (change startup file path in Plesk)
2. **If that fails**, use Solution 2 (update package.json)
3. **As last resort**, use SSH method (Solution 4)

## 🔍 Debug Commands

To check Node.js installation on your server:
```bash
which node
node --version
which npm
npm --version
```

## ⚡ Expected Result

Once fixed, your Plesk Node.js panel should show:
- **Status**: Running ✅
- **Application URL**: http://starsflock.in working
- **No more nodenv errors**

The application will be accessible and all API endpoints will work correctly.