# 🔧 NPM Installation Fix for StarsFlock.in

## Issues Identified:
1. **Node version conflict**: nanoid v5.1.5 requires Node 18+, you have Node 16.20.2
2. **Directory lock error**: bcryptjs installation conflict

## ✅ SOLUTION: Clean Installation

Run these commands on your Plesk server:

```bash
# Navigate to your backend directory
cd /var/www/vhosts/starsflock.in/httpdocs/backend

# Remove problematic node_modules
rm -rf node_modules
rm -f package-lock.json

# Clear npm cache
npm cache clean --force

# Install with fixed package versions
npm install --omit=dev

# If still fails, install packages individually:
npm install bcryptjs@^2.4.3 --omit=dev
npm install cors@^2.8.5 --omit=dev
npm install express@^4.21.2 --omit=dev
npm install express-validator@^7.2.0 --omit=dev
npm install jsonwebtoken@^9.0.2 --omit=dev
npm install multer@^1.4.5-lts.1 --omit=dev
npm install mysql2@^3.11.4 --omit=dev
npm install nanoid@^4.0.2 --omit=dev
npm install node-cron@^3.0.3 --omit=dev
npm install razorpay@^2.9.4 --omit=dev
npm install @tanstack/react-query@^5.60.5 --omit=dev
```

## 📁 Updated package.json

I've created an updated `package.json` with Node 16 compatible versions:
- **nanoid**: Downgraded from v5.0.9 to v4.0.2 (Node 16 compatible)
- All other packages remain the same

## 🚀 Alternative: Quick Copy Method

If npm install still fails:
1. **Delete the current backend folder completely**
2. **Re-upload the updated files** from deployment-package
3. **Run npm install** on the clean directory

## ✅ Verification

After successful installation:
```bash
npm list
node server.js
```

Your application should start without errors.