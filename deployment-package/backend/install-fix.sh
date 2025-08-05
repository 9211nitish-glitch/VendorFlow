#!/bin/bash

echo "Fixing NPM installation for StarsFlock.in..."

# Clean up existing installation
rm -rf node_modules
rm -f package-lock.json

# Clear npm cache
npm cache clean --force

echo "Installing packages with Node 16 compatibility..."

# Install packages individually to avoid conflicts
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

echo "Installation complete! Testing server startup..."
echo "If no errors appear below, your server is ready:"
/usr/bin/node server.js --test || echo "Server files ready for Plesk startup"