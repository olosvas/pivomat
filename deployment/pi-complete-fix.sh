#!/bin/bash

# Complete Raspberry Pi Kiosk Fix - Creates missing files and starts service
echo "🔧 Complete Raspberry Pi Kiosk Fix"
echo "=================================="

cd /home/pi/kiosk-app || {
    echo "❌ App directory not found"
    exit 1
}

# Stop any existing PM2 processes
echo "🛑 Stopping existing PM2 processes..."
pm2 delete kiosk-app 2>/dev/null || true

# Create missing configuration files
echo "📝 Creating ecosystem.config.cjs..."
cat > ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [{
    name: 'kiosk-app',
    script: 'npm',
    args: 'start',
    cwd: '/home/pi/kiosk-app',
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

echo "📝 Creating .env file..."
cat > .env << 'EOF'
NODE_ENV=production
HARDWARE_MODE=production
VITE_API_URL=https://smart-beverage-dispenser-uzisinapoj.replit.app
EOF

# Check if we have a built application
if [ ! -d "dist" ]; then
    echo "🏗️ Building application..."
    npm run build
fi

# Ensure package.json has start script
echo "⚙️ Checking package.json..."
if ! grep -q '"start"' package.json; then
    echo "Adding start script..."
    node -e "
    const pkg = require('./package.json');
    if (!pkg.scripts) pkg.scripts = {};
    pkg.scripts.start = 'node server/index.js';
    require('fs').writeFileSync('package.json', JSON.stringify(pkg, null, 2));
    "
fi

# Start PM2 service
echo "🚀 Starting PM2 service..."
pm2 start ecosystem.config.cjs
pm2 save

# Wait and check status
echo "⏱️ Waiting for service to start..."
sleep 5

echo "📊 PM2 Status:"
pm2 list

# Test connectivity
echo "🧪 Testing connectivity..."
sleep 3

if curl -s http://localhost:3000 > /dev/null; then
    PORT=3000
    echo "✅ Service responding on port 3000"
elif curl -s http://localhost:5000 > /dev/null; then
    PORT=5000
    echo "✅ Service responding on port 5000"
else
    echo "❌ Service not responding. Check logs:"
    pm2 logs kiosk-app --lines 10
    exit 1
fi

# Setup browser
echo "🖥️ Setting up browser autostart..."
mkdir -p ~/.config/autostart
cat > ~/.config/autostart/kiosk.desktop << EOF
[Desktop Entry]
Type=Application
Name=Kiosk
Exec=chromium-browser --noerrdialogs --disable-infobars --kiosk http://localhost:$PORT
Hidden=false
NoDisplay=false
X-GNOME-Autostart-enabled=true
EOF

# Launch browser
echo "🌐 Launching browser..."
pkill chromium-browser 2>/dev/null || true
sleep 2
chromium-browser --noerrdialogs --disable-infobars --kiosk http://localhost:$PORT &

echo ""
echo "✅ Complete Fix Applied!"
echo "======================="
echo "Service URL: http://localhost:$PORT"
echo "Browser launched in kiosk mode"
echo ""
echo "Commands:"
echo "- View logs: pm2 logs kiosk-app"
echo "- Restart: pm2 restart kiosk-app"
echo "- Status: pm2 list"
