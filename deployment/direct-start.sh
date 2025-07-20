#!/bin/bash

# Direct Node.js Start - Bypass PM2 completely
echo "Starting Node.js directly..."

cd /home/oliver/kiosk-app

# Kill everything
pm2 kill
pkill -f node || true
pkill chromium-browser || true

# Check what we have
echo "Directory contents:"
ls -la

echo "Checking if built files exist:"
ls -la dist/ || echo "No dist folder"
ls -la server/ || echo "No server folder"

# Try to start the server directly first
echo "Starting server directly..."
export NODE_ENV=production
export HARDWARE_MODE=production

# Try the main entry point
if [ -f "server/index.js" ]; then
    echo "Found server/index.js - starting directly"
    node server/index.js &
    SERVER_PID=$!
    sleep 3
    
    # Test if it's running
    if curl -s http://localhost:3000 >/dev/null; then
        echo "SUCCESS: Server running on port 3000"
        PORT=3000
    elif curl -s http://localhost:5000 >/dev/null; then
        echo "SUCCESS: Server running on port 5000"
        PORT=5000
    else
        echo "Server failed to start. Checking process:"
        ps aux | grep node
        kill $SERVER_PID 2>/dev/null || true
        
        # Try building first
        echo "Building application..."
        npm run build
        
        # Try again
        node server/index.js &
        SERVER_PID=$!
        sleep 3
        
        if curl -s http://localhost:3000 >/dev/null; then
            PORT=3000
        elif curl -s http://localhost:5000 >/dev/null; then
            PORT=5000
        else
            echo "FAILED: Server still not responding"
            echo "Checking logs:"
            tail -20 /tmp/server.log 2>/dev/null || echo "No logs found"
            exit 1
        fi
    fi
    
    echo "Server is running on port $PORT"
    
    # Now start browser
    echo "Starting browser..."
    chromium-browser --kiosk --disable-web-security http://localhost:$PORT &
    
    echo "SUCCESS: Kiosk is now running"
    echo "Server PID: $SERVER_PID"
    echo "URL: http://localhost:$PORT"
    
else
    echo "ERROR: server/index.js not found"
    echo "Available files:"
    find . -name "*.js" -o -name "package.json"
    exit 1
fi
