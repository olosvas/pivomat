#!/bin/bash

echo "🔧 Opravujem API endpointy na Raspberry Pi..."

# 1. Zastaviť aplikáciu
pm2 stop beverage-kiosk 2>/dev/null || true
pm2 delete beverage-kiosk 2>/dev/null || true

# 2. Vytvoriť správny .env súbor
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

# 4. Spustiť aplikáciu
pm2 start deployment/ecosystem.config.cjs --env development

# 5. Čakať na spustenie
sleep 5

# 6. Test API
echo "🧪 Testujem API..."
curl -s "http://localhost:3000/api/beverages" | head -c 100

echo ""
echo "✅ Hotovo! Kiosk by mal teraz načítavať správne dáta."
echo "📱 Otvor: http://localhost:3000"
