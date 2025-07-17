#!/bin/bash

# Production Build Script for Raspberry Pi Kiosk

set -e

echo "Building Beverage Kiosk for Production..."

# Install production dependencies
echo "Installing dependencies..."
npm ci --only=production

# Build the application
echo "Building application..."
npm run build

# Create logs directory
mkdir -p logs

# Set proper permissions
chmod -R 755 dist/
chmod -R 644 logs/

# Install PM2 globally if not installed
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    npm install -g pm2
fi

# Copy ecosystem config
cp deployment/ecosystem.config.js ./

echo "Production build completed successfully!"
echo "Run 'pm2 start ecosystem.config.js --env production' to start the application"