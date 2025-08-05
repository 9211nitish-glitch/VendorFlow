# 🚨 Nuclear Option: Complete Clean Installation

The npm errors indicate locked directories that can't be overwritten. Here's the most thorough solution:

## Option 1: Complete Backend Directory Reset

**Delete and recreate the entire backend directory:**

1. **In Plesk File Manager:**
   - Delete the entire `/httpdocs/backend/` folder
   - Create a new empty `/httpdocs/backend/` folder

2. **Re-upload only these files:**
   - `server.js`
   - `index.js`
   - `force-clean-install.sh`
   - Create empty `uploads/` folder

3. **Run the cleanup script:**
   ```bash
   cd /var/www/vhosts/starsflock.in/httpdocs/backend
   chmod +x force-clean-install.sh
   ./force-clean-install.sh
   ```

## Option 2: Manual Commands (If script fails)

```bash
cd /var/www/vhosts/starsflock.in/httpdocs/backend

# Kill any processes
pkill -f "node"

# Nuclear cleanup
rm -rf node_modules
rm -rf ~/.npm
rm -rf /tmp/npm-*
rm -f package-lock.json

# Create minimal package.json
echo '{
  "name": "starsflock-backend",
  "version": "1.0.0",
  "type": "module",
  "main": "server.js",
  "scripts": {"start": "/usr/bin/node server.js"},
  "dependencies": {}
}' > package.json

# Install one by one with delays
npm install express@^4.21.2 --save
sleep 2
npm install mysql2@^3.11.4 --save
sleep 2
npm install cors@^2.8.5 --save
sleep 2
npm install bcryptjs@^2.4.3 --save
sleep 2
npm install jsonwebtoken@^9.0.2 --save
sleep 2
npm install multer@^1.4.5-lts.1 --save
sleep 2
npm install nanoid@^4.0.2 --save
sleep 2
npm install node-cron@^3.0.3 --save
sleep 2
npm install razorpay@^2.9.4 --save
```

## Option 3: Alternative - Use Yarn Instead

If npm continues to fail:
```bash
# Install yarn
npm install -g yarn

# Use yarn instead
yarn add express@^4.21.2 mysql2@^3.11.4 cors@^2.8.5 bcryptjs@^2.4.3 jsonwebtoken@^9.0.2 multer@^1.4.5-lts.1 nanoid@^4.0.2 node-cron@^3.0.3 razorpay@^2.9.4
```

## After Success

1. **Create `.env` file**
2. **Restart App in Plesk**
3. **Test at http://starsflock.in**

The nuclear option should resolve all npm lock issues completely.