#!/bin/bash

# Raspberry Pi Kiosk Troubleshooting Script
echo "🔍 Raspberry Pi Kiosk Troubleshooting"
echo "====================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "📁 Navigating to app directory..."
    cd /home/oliver/kiosk-app
fi

echo "📊 Current Status Check:"
echo "------------------------"

# Check Node.js
echo "Node.js version:"
node --version

# Check PM2 status
echo -e "\nPM2 status:"
pm2 list

# Check what's running on common ports
echo -e "\nPort usage:"
sudo netstat -tlnp | grep -E ':(3000|5000|8080)' || echo "No services on ports 3000, 5000, or 8080"

# Check PM2 logs
echo -e "\nRecent PM2 logs:"
pm2 logs kiosk-app --lines 10

# Test local connectivity
echo -e "\nTesting local connectivity:"
curl -s http://localhost:3000 > /dev/null && echo "✅ Port 3000 responding" || echo "❌ Port 3000 not responding"
curl -s http://localhost:5000 > /dev/null && echo "✅ Port 5000 responding" || echo "❌ Port 5000 not responding"

# Check production API connectivity
echo -e "\nTesting production API:"
curl -s https://smart-beverage-dispenser-uzisinapoj.replit.app/api/beverages > /dev/null && echo "✅ Production API responding" || echo "❌ Production API not responding"

echo -e "\n🔧 Quick Fix Commands:"
echo "====================="
echo "1. Restart PM2: pm2 restart kiosk-app"
echo "2. Rebuild app: npm run build"
echo "3. Restart browser: pkill chromium && chromium-browser --kiosk http://localhost:3000"
echo "4. Check logs: pm2 logs kiosk-app"
