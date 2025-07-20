#!/bin/bash

# Instant Fix - Direct PM2 start without config file
echo "Instant Kiosk Fix - Direct Start"

cd /home/oliver/kiosk-app

# Kill everything
pm2 kill
pkill -f node || true

# Create simple ecosystem file right here
cat > ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [{
    name: 'kiosk-app',
    script: 'npm',
    args: 'start',
    cwd: '/home/oliver/kiosk-app',
    env: { NODE_ENV: 'production' }
  }]
};
EOF

# Make sure we have start script
if ! grep -q '"start"' package.json; then
    cp package.json package.json.bak
    sed -i '/"scripts": {/a\    "start": "node server/index.js",' package.json
fi

# Start directly
pm2 start ecosystem.config.cjs
sleep 3
pm2 save

# Check port
if curl -s http://localhost:3000 >/dev/null; then PORT=3000
elif curl -s http://localhost:5000 >/dev/null; then PORT=5000
else PORT=3000; fi

# Launch browser
pkill chromium-browser || true
chromium-browser --kiosk http://localhost:$PORT &

echo "Done. App should be at http://localhost:$PORT"
pm2 list
