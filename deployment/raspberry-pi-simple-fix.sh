#!/bin/bash

echo "🔧 Jednoduché riešenie pre Raspberry Pi..."

# 1. Zastaviť aplikáciu
pm2 stop beverage-kiosk 2>/dev/null || true
pm2 delete beverage-kiosk 2>/dev/null || true

# 2. Vytvoriť .env súbor
cat > .env << 'EOF'
NODE_ENV=development
DATABASE_URL=postgresql://neondb_owner:npg_x4izKw3sGULf@ep-green-queen-a2ysqaa6-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
PORT=3000
HARDWARE_MODE=production
EOF

# 3. Načítať environment variables
export NODE_ENV=development
export DATABASE_URL="postgresql://neondb_owner:npg_x4izKw3sGULf@ep-green-queen-a2ysqaa6-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
export PORT=3000
export HARDWARE_MODE=production

# 4. Rebuild aplikácie
echo "🔨 Building aplikáciu..."
npm run build

# 5. Spustiť aplikáciu
echo "🚀 Spúšťam aplikáciu..."
pm2 start deployment/ecosystem.config.cjs --env development

# 6. Čakať na spustenie
sleep 8

# 7. Test API
echo "🧪 Testujem lokálne API..."
curl -s "http://localhost:3000/api/beverages" | head -c 200

echo ""
echo "✅ Hotovo! Kiosk beží lokálne s databázou."
echo "📱 Otvor: http://localhost:3000"
echo "📋 PM2 status: pm2 status"
echo "📋 PM2 logs: pm2 logs beverage-kiosk"
