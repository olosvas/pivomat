#!/bin/bash

# Quick Fix for Raspberry Pi Kiosk - Port Detection and Browser Launch
echo "🔧 Raspberry Pi Kiosk Quick Fix"
echo "==============================="

cd /home/oliver/kiosk-app

echo "📊 Current PM2 Status:"
pm2 list

echo -e "\n🔍 Checking what's actually running:"
sudo netstat -tlnp | grep -E ':(3000|5000|8080)' || echo "No services found on common ports"

echo -e "\n🧪 Testing ports directly:"
# Test port 3000
if curl -s -m 5 http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Port 3000 is responding"
    WORKING_PORT=3000
elif curl -s -m 5 http://localhost:5000 > /dev/null 2>&1; then
    echo "✅ Port 5000 is responding"
    WORKING_PORT=5000
else
    echo "❌ No ports responding. Checking PM2 logs..."
    pm2 logs kiosk-app --lines 10
    
    # Try to restart the service
    echo "🔄 Attempting to restart service..."
    pm2 restart kiosk-app
    sleep 5
    
    # Test again
    if curl -s -m 5 http://localhost:3000 > /dev/null 2>&1; then
        WORKING_PORT=3000
    elif curl -s -m 5 http://localhost:5000 > /dev/null 2>&1; then
        WORKING_PORT=5000
    else
        echo "❌ Service failed to start. Manual intervention needed."
        echo "Run: pm2 logs kiosk-app"
        exit 1
    fi
fi

echo "✅ Service is running on port: $WORKING_PORT"

# Kill any existing browser
echo "🔄 Restarting browser..."
pkill chromium-browser
sleep 2

# Update autostart with correct port
echo "⚙️ Updating autostart configuration..."
mkdir -p ~/.config/autostart
cat > ~/.config/autostart/kiosk.desktop << EOF
[Desktop Entry]
Type=Application
Name=Kiosk
Exec=chromium-browser --noerrdialogs --disable-infobars --kiosk --disable-web-security --disable-features=VizDisplayCompositor http://localhost:$WORKING_PORT
Hidden=false
NoDisplay=false
X-GNOME-Autostart-enabled=true
EOF

# Start browser in kiosk mode
echo "🚀 Starting browser in kiosk mode..."
DISPLAY=:0 chromium-browser --noerrdialogs --disable-infobars --kiosk --disable-web-security --disable-features=VizDisplayCompositor http://localhost:$WORKING_PORT &

echo ""
echo "✅ Quick Fix Complete!"
echo "====================="
echo "Service URL: http://localhost:$WORKING_PORT"
echo "Browser should be opening in kiosk mode"
echo ""
echo "If browser doesn't open:"
echo "1. Check if X11 is running: echo \$DISPLAY"
echo "2. Manual browser: chromium-browser --kiosk http://localhost:$WORKING_PORT"
echo "3. Check PM2: pm2 logs kiosk-app"
