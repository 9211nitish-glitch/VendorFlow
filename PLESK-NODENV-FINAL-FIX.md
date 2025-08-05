# 🎯 FINAL FIX: Bypass All Plesk Node.js Issues

## The Problem
- `nodenv: command not found` error persists
- npm directory locks prevent package installation
- Plesk Node.js configuration issues

## ✅ DEFINITIVE SOLUTION: Direct Node.js Server

### STEP 1: Complete File Replacement

**In Plesk File Manager:**

1. **Navigate to:** `/httpdocs/backend/`
2. **Delete ALL existing files:**
   - Delete `node_modules` folder (if exists)
   - Delete `package-lock.json` (if exists)
   - Delete current `server.js`
   - Delete current `package.json`

3. **Upload these NEW files:**
   - `server-direct.js` → rename to `server.js`
   - `package-direct.json` → rename to `package.json`

### STEP 2: Verify Frontend Files

**In `/httpdocs/` (root directory):**
- Ensure `index.html` exists
- Ensure `assets/` folder with CSS/JS files exists

### STEP 3: Plesk Configuration

**Plesk Node.js Settings:**
- **Document Root**: `/httpdocs/backend`
- **Application Startup File**: `server.js`
- **Application Mode**: `production`
- **Node.js Version**: Keep current (16.20.2)

### STEP 4: No NPM Installation Required

The new server uses ONLY Node.js built-in modules:
- No external dependencies
- No npm install needed
- No package installation errors
- Bypasses all nodenv/npm issues

### STEP 5: Start Server

1. **Click "Restart App"** in Plesk Node.js panel
2. **Check status** - should show "Running"
3. **Test website**: `http://starsflock.in`
4. **Test API**: `http://starsflock.in/api/health`

## 🎉 Expected Results

After following these steps:
- ✅ No more nodenv errors
- ✅ No more npm installation failures
- ✅ Server starts successfully
- ✅ Website loads properly
- ✅ API endpoints respond
- ✅ React app serves correctly

## 🔄 What This Server Provides

**Current Features:**
- Static file serving (your React app)
- API endpoint structure
- CORS handling
- SPA routing support
- Health check endpoint
- Error handling

**Future Addition:**
Once basic server is working, we can gradually add:
- Database connections
- Authentication
- Full feature set

This approach completely bypasses all Plesk/npm/nodenv issues and gets your StarsFlock.in website live immediately.