#!/bin/bash

echo "🎯 Finálne riešenie pre Raspberry Pi..."

# 1. Zastaviť aplikáciu
pm2 stop beverage-kiosk 2>/dev/null || true
pm2 delete beverage-kiosk 2>/dev/null || true

# 2. Vytvoriť .env súbor pre build process
cat > .env << 'EOF'
NODE_ENV=production
VITE_API_URL=https://smart-beverage-dispenser-uzisinapoj.replit.app
PORT=3000
HARDWARE_MODE=production
DATABASE_URL=postgresql://neondb_owner:npg_x4izKw3sGULf@ep-green-queen-a2ysqaa6-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
EOF

# 3. Načítať environment variables pre build
export NODE_ENV=production
export VITE_API_URL=https://smart-beverage-dispenser-uzisinapoj.replit.app
export PORT=3000
export HARDWARE_MODE=production

# 4. Vyčistiť predchádzajúci build
rm -rf dist/

# 5. Build s explicitnou VITE_API_URL
echo "🔨 Building s produkčným API URL..."
echo "VITE_API_URL = $VITE_API_URL"
npm run build

# 6. Skontrolovať že build má správnu konfigúráciu
echo "🔍 Kontrolujem build súbory..."
if [ -f "dist/client/index.html" ]; then
    echo "✅ Frontend build OK"
else
    echo "❌ Frontend build FAILED"
    exit 1
fi

if [ -f "dist/server/index.js" ]; then
    echo "✅ Backend build OK"
else
    echo "❌ Backend build FAILED"
    exit 1
fi

# 7. Vytvoriť logs priečinok
mkdir -p logs

# 8. Vytvoriť ecosystem config len pre serving
cat > pi-ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [{
    name: 'beverage-kiosk',
    script: './dist/server/index.js',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      HARDWARE_MODE: 'production'
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '256M',
    exec_mode: 'fork'
  }]
};
EOF

# 9. Spustiť aplikáciu
echo "🚀 Spúšťam kiosk..."
pm2 start pi-ecosystem.config.cjs

# 10. Čakať na spustenie
sleep 8

# 11. Test lokálneho kiosku
echo "🧪 Test kiosku na Pi..."
curl -s "http://localhost:3000/" | head -c 100

echo ""
echo ""

# 12. Test či kiosk môže pristupovať k produkčnému API
echo "🧪 Test cross-origin request z Pi..."
curl -s -H "Accept: application/json" \
  -H "Origin: http://localhost:3000" \
  -H "User-Agent: Mozilla/5.0" \
  "https://smart-beverage-dispenser-uzisinapoj.replit.app/api/beverages" | head -c 200

echo ""
echo ""
echo "✅ Raspberry Pi kiosk je pripravený!"
echo "📱 Kiosk URL: http://localhost:3000"
echo "🔧 Hardware mód: PRODUCTION"
echo "🌐 API: https://smart-beverage-dispenser-uzisinapoj.replit.app"
echo ""
echo "📋 Skontroluj kiosk v browseri na Pi:"
echo "   chromium-browser http://localhost:3000 --kiosk"
