#!/bin/bash

# Smart Beverage Kiosk - Raspberry Pi Deployment Script
# This script sets up the kiosk application on Raspberry Pi to connect to production API

set -e

echo "🍺 Smart Beverage Kiosk - Raspberry Pi Setup"
echo "=============================================="

# Configuration
PRODUCTION_API_URL="https://smart-beverage-dispenser-uzisinapoj.replit.app"
APP_DIR="/home/pi/kiosk-app"
SERVICE_NAME="kiosk-app"

# Check if running on Raspberry Pi
if ! command -v gpio &> /dev/null && [ ! -f /proc/device-tree/model ] || ! grep -q "Raspberry Pi" /proc/device-tree/model 2>/dev/null; then
    echo "⚠️  Warning: This script is designed for Raspberry Pi"
fi

# Install Node.js if not present
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install PM2 globally if not present
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    sudo npm install -g pm2
fi

# Create application directory
echo "📁 Setting up application directory..."
sudo mkdir -p "$APP_DIR"
sudo chown pi:pi "$APP_DIR"
cd "$APP_DIR"

# Clone or update repository
if [ -d ".git" ]; then
    echo "🔄 Updating existing repository..."
    git pull origin main
else
    echo "📥 Cloning repository..."
    git clone https://github.com/olosvas/BeerDispenser.git .
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create production environment file
echo "⚙️  Creating environment configuration..."
cat > .env << EOF
NODE_ENV=production
HARDWARE_MODE=production
VITE_API_URL=$PRODUCTION_API_URL
EOF

# Build application with production API URL
echo "🏗️  Building application for production..."
export VITE_API_URL="$PRODUCTION_API_URL"
npm run build

# Create PM2 ecosystem file
echo "⚙️  Creating PM2 configuration..."
cat > ecosystem.config.cjs << EOF
module.exports = {
  apps: [{
    name: '$SERVICE_NAME',
    script: 'npm',
    args: 'start',
    cwd: '$APP_DIR',
    env: {
      NODE_ENV: 'production',
      HARDWARE_MODE: 'production'
    },
    restart_delay: 1000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
EOF

# Setup systemd service for PM2
echo "🔧 Setting up system service..."
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup systemd -u pi --hp /home/pi

# Configure autostart and fullscreen browser
echo "🖥️  Configuring kiosk mode..."

# Create autostart directory if it doesn't exist
mkdir -p ~/.config/autostart

# Create autostart entry for Chromium in kiosk mode
cat > ~/.config/autostart/kiosk.desktop << EOF
[Desktop Entry]
Type=Application
Name=Kiosk
Exec=chromium-browser --noerrdialogs --disable-infobars --kiosk http://localhost:3000
Hidden=false
NoDisplay=false
X-GNOME-Autostart-enabled=true
EOF

# Test API connectivity
echo "🔍 Testing API connectivity..."
if curl -s "$PRODUCTION_API_URL/api/beverages" > /dev/null; then
    echo "✅ API connection successful"
else
    echo "❌ API connection failed - check network settings"
fi

# Display final status
echo ""
echo "🎉 Deployment Complete!"
echo "======================="
echo "Application: $APP_DIR"
echo "Production API: $PRODUCTION_API_URL"
echo "Local URL: http://localhost:3000"
echo ""
echo "The kiosk will start automatically on next boot."
echo "To restart manually: pm2 restart $SERVICE_NAME"
echo "To view logs: pm2 logs $SERVICE_NAME"
echo ""
echo "Reboot your Raspberry Pi to start kiosk mode."