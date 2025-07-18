#!/bin/bash

echo "🔧 Nastavujem produkčné API pre Raspberry Pi..."

# 1. Zastaviť aplikáciu
pm2 stop beverage-kiosk 2>/dev/null || true
pm2 delete beverage-kiosk 2>/dev/null || true

# 2. Vytvoriť .env súbor s produkčným API
cat > .env << 'EOF'
NODE_ENV=production
VITE_API_URL=https://smart-beverage-dispenser-uzisinapoj.replit.app
DATABASE_URL=postgresql://neondb_owner:npg_x4izKw3sGULf@ep-green-queen-a2ysqaa6-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
PORT=3000
HARDWARE_MODE=production
EOF

# 3. Načítať environment variables
export NODE_ENV=production
export VITE_API_URL=https://smart-beverage-dispenser-uzisinapoj.replit.app
export DATABASE_URL="postgresql://neondb_owner:npg_x4izKw3sGULf@ep-green-queen-a2ysqaa6-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
export PORT=3000
export HARDWARE_MODE=production

# 4. Rebuild frontend s produkčným API
echo "🔨 Rebuilding frontend s produkčným API..."
npm run build

# 5. Spustiť aplikáciu
echo "🚀 Spúšťam aplikáciu s produkčným API..."
pm2 start deployment/ecosystem.config.cjs --env production

# 6. Čakať na spustenie
sleep 5

# 7. Test lokálneho servera
echo "🧪 Testujem lokálny server..."
curl -s "http://localhost:3000" | head -c 100

# 8. Test produkčného API
echo ""
echo "🧪 Testujem produkčné API..."
curl -s "https://smart-beverage-dispenser-uzisinapoj.replit.app/api/beverages" | head -c 200

echo ""
echo "✅ Hotovo! Kiosk teraz používa produkčné API."
echo "📱 Otvor: http://localhost:3000"
echo "🌐 API: https://smart-beverage-dispenser-uzisinapoj.replit.app/api/beverages"
echo "📋 PM2 status: pm2 status"
echo "📋 PM2 logs: pm2 logs beverage-kiosk"
