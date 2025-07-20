#!/bin/bash

# Check Build Status
echo "Build Status Check"
echo "=================="

cd /home/oliver/kiosk-app

echo "1. Directory structure:"
ls -la

echo -e "\n2. Package.json scripts:"
grep -A 10 '"scripts"' package.json || echo "No scripts found"

echo -e "\n3. Server files:"
ls -la server/ || echo "No server directory"

echo -e "\n4. Built files:"
ls -la dist/ || echo "No dist directory"

echo -e "\n5. Dependencies:"
ls -la node_modules/.bin/tsx || echo "tsx not found"
ls -la node_modules/.bin/tsc || echo "tsc not found"

echo -e "\n6. TypeScript files:"
find server -name "*.ts" -o -name "*.js" | head -10

echo -e "\n7. Testing manual build:"
npm run build 2>&1 | head -20

echo -e "\n8. Testing direct tsx run:"
npx tsx server/index.ts 2>&1 &
BUILD_PID=$!
sleep 5

if curl -s http://localhost:5000 >/dev/null; then
    echo "SUCCESS: tsx worked on port 5000"
    kill $BUILD_PID
elif curl -s http://localhost:3000 >/dev/null; then
    echo "SUCCESS: tsx worked on port 3000"  
    kill $BUILD_PID
else
    echo "FAILED: tsx didn't start server"
    kill $BUILD_PID 2>/dev/null || true
fi
