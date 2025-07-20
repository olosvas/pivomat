#!/bin/bash

# Raspberry Pi Kiosk Recovery Script - After Power Loss
echo "🔧 Raspberry Pi Kiosk Recovery"
echo "=============================="

# Navigate to app directory
cd /home/oliver/kiosk-app || {
    echo "❌ App directory not found. Running setup first..."
    exit 1
}

echo "🛑 Stopping all PM2 processes..."
pm2 kill

echo "🧹 Cleaning up any stuck processes..."
pkill -f "npm start" || true
pkill -f "node.*server" || true

echo "📦 Reinstalling dependencies (in case of corruption)..."
rm -rf node_modules package-lock.json
npm install

echo "🏗️ Rebuilding application..."
export VITE_API_URL="https://smart-beverage-dispenser-uzisinapoj.replit.app"
npm run build

echo "🚀 Starting PM2 with fresh config..."
pm2 start ecosystem.config.cjs
pm2 save

echo "⏱️ Waiting for startup..."
sleep 5

echo "📊 Checking status..."
pm2 list

echo "🔍 Testing connectivity..."
sleep 3
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ App is responding on port 3000"
    PORT=3000
elif curl -s http://localhost:5000 > /dev/null; then
    echo "✅ App is responding on port 5000"
    PORT=5000
else
    echo "❌ App is not responding. Checking logs..."
    pm2 logs kiosk-app --lines 20
    exit 1
fi

echo "🖥️ Setting up browser autostart for port $PORT..."
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

echo "🔄 Restarting browser in kiosk mode..."
pkill chromium-browser || true
sleep 2
chromium-browser --noerrdialogs --disable-infobars --kiosk http://localhost:$PORT &

echo ""
echo "✅ Recovery Complete!"
echo "===================="
echo "App is running on: http://localhost:$PORT"
echo "Browser should open automatically"
echo ""
echo "If issues persist:"
echo "- Check logs: pm2 logs kiosk-app"
echo "- Restart service: pm2 restart kiosk-app"
echo "- Reboot Pi: sudo reboot"
