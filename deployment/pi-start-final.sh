#!/bin/bash

echo "🚀 Starting Raspberry Pi kiosk..."

# Clean start
pm2 stop beverage-kiosk 2>/dev/null || true
pm2 delete beverage-kiosk 2>/dev/null || true

# Create logs directory
mkdir -p logs

# Start with simple config
pm2 start dist/index.js --name beverage-kiosk --env production \
  --env NODE_ENV=production \
  --env PORT=3000 \
  --env HARDWARE_MODE=production \
  --env DATABASE_URL="postgresql://neondb_owner:npg_x4izKw3sGULf@ep-green-queen-a2ysqaa6-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Wait for startup
sleep 3

# Check status
pm2 status

echo "🧪 Testing kiosk..."
curl -s http://localhost:3000 | head -c 100

echo ""
echo "✅ Kiosk should be available at http://localhost:3000"
