#!/bin/bash

# Build script for production deployment
echo "Building Vendor Task Management System for production..."

# Clean previous builds
rm -rf dist/
rm -rf client/dist/

# Build frontend
echo "Building frontend..."
npm run build

# Check if build was successful
if [ ! -d "dist/public" ]; then
    echo "❌ Frontend build failed!"
    exit 1
fi

# Create deployment package directory
echo "Creating deployment package..."
mkdir -p deployment-package

# Copy necessary files
cp -r dist/ deployment-package/
cp -r uploads/ deployment-package/ 2>/dev/null || mkdir deployment-package/uploads
cp package.json deployment-package/
cp package-lock.json deployment-package/
cp ecosystem.config.js deployment-package/

# Create uploads directory if it doesn't exist
mkdir -p deployment-package/uploads

echo "✅ Build complete! Files ready in 'deployment-package' directory"
echo ""
echo "📋 Next steps:"
echo "1. Upload 'deployment-package' contents to your Plesk server"
echo "2. Create .env file with your credentials (see deploy.md)"
echo "3. Run 'npm install --production' on the server"
echo "4. Start with PM2: 'pm2 start ecosystem.config.js'"
echo ""
echo "📖 See deploy.md for detailed instructions"