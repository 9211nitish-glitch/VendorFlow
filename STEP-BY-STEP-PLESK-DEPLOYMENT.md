# 🎯 Step-by-Step Plesk Deployment for StarsFlock.in

## Current Issue: 503 Service Unavailable

The 503 error means Plesk can't start your Node.js application. Here's the complete fix:

## STEP 1: Complete Backend Cleanup

**In Plesk File Manager:**
1. Navigate to `/httpdocs/backend/`
2. **DELETE ALL FILES** in the backend folder:
   - Delete `node_modules` (if exists)
   - Delete `package-lock.json` (if exists)
   - Delete any existing `server.js`
   - Delete any existing `package.json`
   - Delete any existing `index.js`

## STEP 2: Upload New Backend Files

**Upload these 2 files ONLY:**
1. `index.js` (the new ultra-simple server)
2. `package.json` (minimal configuration)

**File Structure Should Be:**
```
/httpdocs/
├── backend/
│   ├── index.js        ← NEW ultra-simple server
│   └── package.json    ← NEW minimal config
├── index.html          ← Your React app
├── assets/            ← Your CSS/JS files
└── ...
```

## STEP 3: Plesk Node.js Configuration

**In Plesk → Node.js:**
1. **Document Root**: `/httpdocs/backend`
2. **Application Startup File**: `index.js`
3. **Application Mode**: `production`
4. **Node.js Version**: Keep current (16.20.2)

## STEP 4: Start the Application

1. **Click "Restart App"** in Plesk
2. **Wait 30 seconds** for startup
3. **Check Status** - should show "Running"

## STEP 5: Test Your Website

**Test these URLs:**
1. `http://starsflock.in` - Should show your website
2. `http://starsflock.in/api/health` - Should show server status

## Expected Results

**✅ Success Indicators:**
- Plesk shows "Running" status
- Website loads at starsflock.in
- No 503 errors
- Health check responds with JSON

**❌ If Still Getting 503:**
The issue might be Plesk configuration. Try:
1. Change "Application Startup File" to just `index.js`
2. Ensure Document Root is correct
3. Check Plesk logs for specific error messages

## Technical Details

**Why This Works:**
- Uses CommonJS (`require`) instead of ES modules
- Zero external dependencies
- Ultra-simple HTTP server
- Handles all your React app routing
- Provides API endpoints

**What It Provides:**
- Serves your React frontend
- API health check endpoint
- CORS handling for development
- SPA routing support
- Error handling

This minimal approach bypasses all npm/nodenv issues and gets your StarsFlock.in website online immediately.