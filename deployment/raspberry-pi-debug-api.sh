#!/bin/bash

echo "🔍 Debugging API problém na Raspberry Pi..."

# 1. Zastaviť aplikáciu
pm2 stop beverage-kiosk 2>/dev/null || true
pm2 delete beverage-kiosk 2>/dev/null || true

# 2. Vytvoriť .env súbor s debug módom
cat > .env << 'EOF'
NODE_ENV=production
DATABASE_URL=postgresql://neondb_owner:npg_x4izKw3sGULf@ep-green-queen-a2ysqaa6-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
PORT=3000
HARDWARE_MODE=production
DEBUG=*
EOF

# 3. Načítať environment variables
export NODE_ENV=production
export DATABASE_URL="postgresql://neondb_owner:npg_x4izKw3sGULf@ep-green-queen-a2ysqaa6-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
export PORT=3000
export HARDWARE_MODE=production

# 4. Rebuild aplikácie
echo "🔨 Building aplikáciu v production móde..."
npm run build

# 5. Skontrolovať či build existuje
ls -la dist/
ls -la dist/server/

# 6. Spustiť aplikáciu v production móde
echo "🚀 Spúšťam aplikáciu v production móde..."
pm2 start deployment/ecosystem.config.cjs --env production

# 7. Čakať na spustenie
sleep 8

# 8. Detailné testovanie
echo "🧪 Testovanie API endpointov..."
echo "Test 1: Základná dostupnosť"
curl -v "http://localhost:3000/" | head -c 100

echo ""
echo "Test 2: API endpoint s headers"
curl -v -H "Accept: application/json" "http://localhost:3000/api/beverages" | head -c 200

echo ""
echo "Test 3: Kontrola response headers"
curl -I "http://localhost:3000/api/beverages"

echo ""
echo "Test 4: PM2 logs"
pm2 logs beverage-kiosk --lines 20

echo ""
echo "✅ Debug test dokončený"
echo "📋 Skontroluj výstup vyššie pre chyby"
