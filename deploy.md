# Plesk Server Deployment Guide

## Prerequisites
1. **Node.js 18+ installed** on your Plesk server
2. **MySQL database** created in Plesk
3. **PM2** installed globally: `npm install -g pm2`

## Step 1: Build the Project
Run this command locally to create production build:
```bash
npm run build
```

## Step 2: Files to Upload to Plesk Server
Upload these files/folders to your domain directory:
```
├── dist/                    # Built server files
├── client/dist/            # Built frontend files  
├── uploads/                # File upload directory
├── package.json
├── ecosystem.config.js     # PM2 configuration
├── .env                    # Environment variables (create this)
└── package-lock.json
```

## Step 3: Create .env File on Server
Create `.env` file in your domain root with:
```env
NODE_ENV=production
JWT_SECRET=NitishTrytohard@22000

# Update with your Plesk MySQL credentials
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=your_database_name
DB_PORT=3306

# Add your API keys
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

PORT=5000
```

## Step 4: Server Setup Commands
SSH into your Plesk server and run:
```bash
# Navigate to your domain directory
cd /var/www/vhosts/yourdomain.com/httpdocs

# Install dependencies
npm install --production

# Start with PM2
pm2 start ecosystem.config.js

# Setup PM2 to start on boot
pm2 startup
pm2 save
```

## Step 5: Plesk Configuration
1. **Apache/Nginx Configuration**: Set up reverse proxy to port 5000
2. **SSL Certificate**: Enable SSL for your domain
3. **File Permissions**: Ensure uploads directory is writable

## Step 6: Reverse Proxy Setup
### For Apache (.htaccess):
```apache
RewriteEngine On
RewriteRule ^api/(.*)$ http://localhost:5000/api/$1 [P,L]
RewriteRule ^(?!.*\.(js|css|png|jpg|jpeg|gif|ico|svg)).*$ /index.html [L]
```

### For Nginx:
```nginx
location /api/ {
    proxy_pass http://localhost:5000/api/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}

location / {
    try_files $uri $uri/ /index.html;
}
```

## Step 7: Database Setup
The database tables will be created automatically on first run.

## Monitoring
- Check logs: `pm2 logs vendor-task-management`
- Restart app: `pm2 restart vendor-task-management`
- Stop app: `pm2 stop vendor-task-management`