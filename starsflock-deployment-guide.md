# 🚀 StarsFlock.in Deployment Guide

## Domain Configuration
**Your Domain**: starsflock.in  
**Document Root**: `/var/www/vhosts/starsflock.in/httpdocs`

## 📤 Step 1: Upload Files to Your Server

Upload all contents from the `deployment-package` folder to:
```
/var/www/vhosts/starsflock.in/httpdocs/
```

Your server directory should look like:
```
/var/www/vhosts/starsflock.in/httpdocs/
├── dist/
│   ├── index.js                 # Node.js server
│   └── public/                  # React frontend files
├── uploads/                     # File upload directory
├── ecosystem.config.js          # PM2 configuration
├── package.json
├── package-lock.json
└── .env                         # Create this file (next step)
```

## 🔧 Step 2: Create Environment File

Create `.env` file in `/var/www/vhosts/starsflock.in/httpdocs/` with:
```env
NODE_ENV=production
JWT_SECRET=NitishTrytohard@22000

# Your Plesk MySQL Database Credentials
DB_HOST=localhost
DB_USER=starsflock_admin
DB_PASSWORD=your_mysql_password  
DB_NAME=starsflock_db
DB_PORT=3306

# Google OAuth (Optional - add when ready)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Razorpay Payment Gateway (Optional - add when ready)  
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

PORT=5000
```

## 🛠️ Step 3: Server Setup via SSH

Connect to your server via SSH and run:
```bash
cd /var/www/vhosts/starsflock.in/httpdocs

# Install dependencies
npm install --production

# Install PM2 globally (if not already installed)
npm install -g pm2

# Start your application
pm2 start ecosystem.config.js

# Setup PM2 to start on server reboot
pm2 startup
pm2 save
```

## 🔄 Step 4: Configure Reverse Proxy

### For Apache (recommended for Plesk):
Create or edit `.htaccess` in `/var/www/vhosts/starsflock.in/httpdocs/`:
```apache
RewriteEngine On

# Proxy API requests to Node.js server
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^api/(.*)$ http://localhost:5000/api/$1 [P,L]

# Serve React app for all other requests
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d  
RewriteCond %{REQUEST_URI} !^/api/
RewriteRule . /index.html [L]
```

## 🎯 Step 5: Database Setup

The application will automatically create these tables on first run:
- users (admin/vendor accounts)
- tasks (task management)
- packages (subscription packages)
- payments (Razorpay transactions)
- referrals (referral tracking)
- user_packages (user subscriptions)

## 🔍 Step 6: Verify Deployment

1. **Check PM2 Status**:
   ```bash
   pm2 status
   pm2 logs vendor-task-management
   ```

2. **Test Your Site**:
   - Visit `https://starsflock.in` - Should show your React app
   - Visit `https://starsflock.in/api/health` - Should return "OK"

3. **First Admin User**:
   - Register the first user account
   - This user automatically becomes the administrator

## 📊 Pre-configured Package System

Your system comes with these packages ready:

**Onsite Packages:**
- New Star Bundle (₹4,999)
- Rising Star Starter (₹9,999) 
- Shining Star Pack (₹19,999)
- Superstar Elite Plan (₹34,999)
- Legendary Star Package (₹49,999)

**Online Packages:**
- Fresh Face Trial (₹1,100)
- Fresh Face Star (₹4,999)
- Next Level Creator (₹9,999)
- Influence Empire (₹19,999)
- SuperStar Pro Package (₹34,999)
- Legendary Creator Kit (₹49,999)

## 🚨 Troubleshooting

**App not starting?**
```bash
pm2 logs vendor-task-management
```

**Database connection issues?**
- Check your MySQL credentials in `.env`
- Ensure database exists in Plesk

**Frontend not loading?**
- Check `.htaccess` configuration
- Verify file permissions

**Need to restart?**
```bash
pm2 restart vendor-task-management
```

## 🎉 You're Live!

Once deployed, StarsFlock.in will have:
- ✅ Complete vendor task management system
- ✅ Payment processing with Razorpay
- ✅ 5-level referral commission system
- ✅ File upload capabilities
- ✅ Mobile-responsive design
- ✅ Admin dashboard for task management
- ✅ Vendor portal for task completion

Your production-ready Vendor Task Management System is now live at **starsflock.in**!