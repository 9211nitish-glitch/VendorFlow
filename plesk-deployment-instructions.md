# 🚀 Deploy to Plesk Server - Quick Guide

## ✅ Ready Files
Your project is now built and ready for deployment. Here's what you have:

**Built Files:**
- `dist/index.js` - Your Node.js server
- `dist/public/` - Your React frontend files
- `deployment-package/` - Complete deployment package

## 📤 Upload to Plesk

### 1. Upload Files
Upload everything from `deployment-package` folder to your domain's document root:
```
/var/www/vhosts/yourdomain.com/httpdocs/
```

### 2. Create Environment File
Create `.env` file in your domain root with your database credentials:
```env
NODE_ENV=production
JWT_SECRET=NitishTrytohard@22000

# Your Plesk MySQL Database
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password  
DB_NAME=your_database_name
DB_PORT=3306

# Optional API Keys (add when needed)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

PORT=5000
```

### 3. Setup Commands (via SSH)
```bash
cd /var/www/vhosts/yourdomain.com/httpdocs
npm install --production
npm install -g pm2
pm2 start ecosystem.config.js
pm2 startup
pm2 save
```

### 4. Configure Reverse Proxy

**For Apache (.htaccess):**
```apache
RewriteEngine On
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^api/(.*)$ http://localhost:5000/api/$1 [P,L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

**For Nginx:**
```nginx
location /api/ {
    proxy_pass http://localhost:5000/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location / {
    try_files $uri $uri/ /index.html;
}
```

## 🔧 Troubleshooting

**Check if app is running:**
```bash
pm2 status
pm2 logs vendor-task-management
```

**Restart app:**
```bash
pm2 restart vendor-task-management
```

## 🎯 What Happens After Deployment
1. Database tables created automatically
2. Admin user: First registered user becomes admin
3. Package system ready with predefined packages
4. File uploads stored in `uploads/` directory

Your Vendor Task Management System will be live at your domain!