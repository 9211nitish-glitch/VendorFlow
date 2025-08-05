# 🎯 StarsFlock.in Plesk Setup - CORRECTED

## Issue Identified
Your Plesk is configured to look for `/httpdocs/backend/server.js` but our build creates `/httpdocs/dist/index.js`

## ✅ CORRECTED File Structure for Plesk

Upload to your server in this exact structure:
```
/var/www/vhosts/starsflock.in/httpdocs/
├── backend/                     # Node.js application directory
│   ├── server.js               # Entry point (Plesk requirement)
│   ├── index.js                # Main server code
│   ├── package.json            # Backend dependencies
│   ├── uploads/                # File upload directory
│   └── .env                    # Environment variables
├── index.html                  # React app entry
├── assets/                     # Frontend assets
│   ├── index-[hash].css
│   └── index-[hash].js
└── .htaccess                   # Apache configuration
```

## 📤 Upload Instructions

1. **Backend Files** → Upload to `/var/www/vhosts/starsflock.in/httpdocs/backend/`:
   - `backend/server.js`
   - `backend/index.js` 
   - `backend/package.json`
   - `backend/uploads/` (empty directory)

2. **Frontend Files** → Upload to `/var/www/vhosts/starsflock.in/httpdocs/`:
   - `index.html`
   - `assets/` folder
   - `.htaccess`

3. **Create** `/var/www/vhosts/starsflock.in/httpdocs/backend/.env`:
```env
NODE_ENV=production
JWT_SECRET=NitishTrytohard@22000

DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=your_database_name
DB_PORT=3306

PORT=5000
```

## 🔧 Plesk Node.js Settings

In your Plesk Node.js settings, verify:
- **Document Root**: `/httpdocs/backend`
- **Application Startup File**: `server.js` ✅
- **Application Mode**: `production`
- **Node.js Version**: Keep current (16.20.2 is fine)

## 🚀 Startup Commands

SSH into your server:
```bash
cd /var/www/vhosts/starsflock.in/httpdocs/backend
npm install --production
```

Then use Plesk's "Restart App" button.

## 🔄 Updated .htaccess

Place this in `/var/www/vhosts/starsflock.in/httpdocs/.htaccess`:
```apache
RewriteEngine On

# Proxy API requests to Node.js (port will be auto-assigned by Plesk)
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^api/(.*)$ http://localhost:5000/api/$1 [P,L]

# Serve React app for all other requests
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/
RewriteRule . /index.html [L]
```

## ✅ After Upload

1. Upload files in the correct structure
2. Create `.env` file in backend directory
3. Run `npm install --production` in backend directory
4. Use Plesk "Restart App" button
5. Check http://starsflock.in

Your app should now start successfully!