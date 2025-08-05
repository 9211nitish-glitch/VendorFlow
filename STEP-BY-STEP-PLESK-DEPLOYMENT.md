# 📋 StarsFlock.in Live Deployment - Step by Step Guide

## STEP 1: Create Database in Plesk

1. **Go to Plesk Panel** → **Databases** → **Add Database**
2. **Create new database:**
   - Database name: `starsflock_db`
   - Username: `starsflock_admin` 
   - Password: Create a strong password (save it!)
3. **Note down these details** - you'll need them in Step 4

## STEP 2: Upload Files with Correct Structure

### 2A. Create Backend Directory
1. **Go to Plesk** → **Files** → **File Manager**
2. **Navigate to:** `/httpdocs/`
3. **Create new folder:** `backend`

### 2B. Upload Backend Files to `/httpdocs/backend/`
Upload these files from your `deployment-package/backend/` folder:
- `server.js`
- `index.js`
- `package.json`
- `start.sh`

### 2C. Upload Frontend Files to `/httpdocs/`
Upload these files from your `deployment-package/` folder:
- `index.html`
- `assets/` (entire folder)
- `.htaccess`

### 2D. Create Uploads Directory
1. **In `/httpdocs/backend/`** create folder: `uploads`
2. **Set permissions** to 755 (writable)

## STEP 3: Configure Plesk Node.js Settings

1. **Go to Plesk Panel** → **Node.js**
2. **Click on your domain** (starsflock.in)
3. **Configure these settings:**
   - **Node.js Version:** Keep current (16.20.2)
   - **Document Root:** `/httpdocs/backend`
   - **Application Root:** `/httpdocs/backend`
   - **Application Startup File:** `server.js`
   - **Application Mode:** `production`

## STEP 4: Create Environment File

1. **In File Manager, go to:** `/httpdocs/backend/`
2. **Create new file:** `.env`
3. **Add this content** (replace with your actual database details):

```env
NODE_ENV=production
JWT_SECRET=NitishTrytohard@22000

# Your Database Details (from Step 1)
DB_HOST=localhost
DB_USER=starsflock_admin
DB_PASSWORD=your_database_password_from_step1
DB_NAME=starsflock_db
DB_PORT=3306

PORT=5000

# Optional - Add later when needed
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

## STEP 5: Install Dependencies

### Option A: Using Plesk Terminal (Recommended)
1. **Go to Plesk** → **Node.js** → **NPM**
2. **Click "Install Dependencies"**
3. **Wait for installation to complete**

### Option B: Using SSH (If you have access)
```bash
cd /var/www/vhosts/starsflock.in/httpdocs/backend
npm install --production
```

## STEP 6: Start the Application

1. **Go to Plesk Panel** → **Node.js**
2. **Click "Restart App"** or **"Enable Node.js"**
3. **Check status** - should show "Running"

## STEP 7: Configure Apache (If needed)

If your `.htaccess` isn't working, check these settings:

1. **Go to Plesk** → **Apache & nginx Settings**
2. **Ensure these directives are allowed:**
   - `mod_rewrite` enabled
   - `AllowOverride All`

## STEP 8: Test Your Website

1. **Visit:** `http://starsflock.in`
2. **You should see:** Your React app loading
3. **Test API:** `http://starsflock.in/api/health` should return "OK"

## STEP 9: Create First Admin User

1. **Go to your website**
2. **Click "Register"**
3. **Create your first account** - this becomes the admin automatically
4. **Login and verify** admin dashboard works

## 🔧 TROUBLESHOOTING

### If Application Won't Start:
1. **Check Plesk Node.js logs** for errors
2. **Verify file permissions** (files should be readable)
3. **Check `.env` file** has correct database credentials

### If Database Connection Fails:
1. **Test database connection** in Plesk database panel
2. **Verify credentials** in `.env` file match database settings
3. **Check database user permissions**

### If Frontend Doesn't Load:
1. **Check `.htaccess` file** is in `/httpdocs/` root
2. **Verify `assets/` folder** uploaded correctly
3. **Check Apache settings** allow `.htaccess` overrides

## 🎉 SUCCESS INDICATORS

When everything works correctly:
- ✅ Plesk Node.js shows "Running" status
- ✅ `http://starsflock.in` loads your app
- ✅ Registration/login works
- ✅ Admin dashboard accessible
- ✅ Task management functional

## 📞 NEED HELP?

If stuck at any step:
1. **Check Plesk error logs** in Node.js section
2. **Verify file structure** matches the guide exactly
3. **Double-check database credentials**
4. **Ensure all files uploaded correctly**

Your StarsFlock.in website will be fully live and functional after completing these steps!