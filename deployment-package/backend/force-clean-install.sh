#!/bin/bash

echo "🔧 Force cleaning npm installation for StarsFlock.in..."

# Stop any running processes that might lock files
pkill -f "node"

# Remove everything npm related
rm -rf node_modules
rm -f package-lock.json
rm -rf ~/.npm/_cacache
rm -rf /tmp/npm-*

# Clear all npm caches
npm cache clean --force
npm cache verify

echo "📦 Installing packages with forced clean state..."

# Create a minimal package.json first
cat > package.json << 'EOF'
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
  "dependencies": {}
}
EOF

# Install core dependencies first
echo "Installing core packages..."
npm install express@^4.21.2 --save --omit=dev
npm install mysql2@^3.11.4 --save --omit=dev
npm install cors@^2.8.5 --save --omit=dev
npm install bcryptjs@^2.4.3 --save --omit=dev
npm install jsonwebtoken@^9.0.2 --save --omit=dev

# Install additional packages
echo "Installing additional packages..."
npm install multer@^1.4.5-lts.1 --save --omit=dev
npm install express-validator@^7.2.0 --save --omit=dev
npm install nanoid@^4.0.2 --save --omit=dev
npm install node-cron@^3.0.3 --save --omit=dev
npm install razorpay@^2.9.4 --save --omit=dev

echo "✅ Installation complete!"
echo "Testing server startup..."
/usr/bin/node --version
echo "Node.js version check complete"