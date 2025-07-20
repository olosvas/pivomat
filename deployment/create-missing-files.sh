#!/bin/bash

# Create Missing PM2 Configuration Files for Raspberry Pi
echo "📝 Creating missing PM2 configuration files"
echo "==========================================="

cd /home/pi/kiosk-app || {
    echo "❌ App directory not found"
    exit 1
}

echo "Creating ecosystem.config.cjs..."
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
    min_uptime: '10s',
    error_file: '/home/pi/.pm2/logs/kiosk-app-error.log',
    out_file: '/home/pi/.pm2/logs/kiosk-app-out.log',
    log_file: '/home/pi/.pm2/logs/kiosk-app.log'
  }]
};
EOF

echo "Creating .env file..."
cat > .env << 'EOF'
NODE_ENV=production
HARDWARE_MODE=production
VITE_API_URL=https://smart-beverage-dispenser-uzisinapoj.replit.app
EOF

echo "Checking package.json scripts..."
if ! grep -q '"start"' package.json; then
    echo "Adding start script to package.json..."
    # Backup original package.json
    cp package.json package.json.backup
    
    # Add start script if missing
    node -e "
    const pkg = require('./package.json');
    if (!pkg.scripts) pkg.scripts = {};
    if (!pkg.scripts.start) pkg.scripts.start = 'node server/index.js';
    require('fs').writeFileSync('package.json', JSON.stringify(pkg, null, 2));
    "
fi

echo "✅ Configuration files created:"
ls -la ecosystem.config.cjs .env package.json

echo ""
echo "🚀 Now you can run:"
echo "pm2 start ecosystem.config.cjs"
echo "pm2 save"
