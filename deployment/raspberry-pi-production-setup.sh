#!/bin/bash

echo "🚀 Nastavujem Raspberry Pi pre produkčné API..."

# 1. Zastaviť existujúce procesy
pm2 stop beverage-kiosk 2>/dev/null || true
pm2 delete beverage-kiosk 2>/dev/null || true

# 2. Vytvoriť .env súbor pre Pi s produkčným API
cat > .env << 'EOF'
# Raspberry Pi konfigurácia
NODE_ENV=production
VITE_API_URL=https://smart-beverage-dispenser-uzisinapoj.replit.app
PORT=3000
HARDWARE_MODE=production

# Databáza sa používa len pre hardware logging
DATABASE_URL=postgresql://neondb_owner:npg_x4izKw3sGULf@ep-green-queen-a2ysqaa6-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
EOF

# 3. Načítať environment variables
export NODE_ENV=production
export VITE_API_URL=https://smart-beverage-dispenser-uzisinapoj.replit.app
export PORT=3000
export HARDWARE_MODE=production

# 4. Rebuild frontend s produkčným API URL
echo "🔨 Building frontend s produkčným API..."
npm run build

# 5. Vytvoriť jednoduché ecosystem.config.cjs pre Pi
cat > raspberry-pi-ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [{
    name: 'beverage-kiosk',
    script: './dist/server/index.js',
    env: {
      NODE_ENV: 'production',
      VITE_API_URL: 'https://smart-beverage-dispenser-uzisinapoj.replit.app',
      PORT: 3000,
      HARDWARE_MODE: 'production'
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '256M',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    exec_mode: 'fork'
  }]
};
EOF

# 6. Vytvoriť logs priečinok
mkdir -p logs

# 7. Spustiť aplikáciu
echo "🚀 Spúšťam kiosk aplikáciu..."
pm2 start raspberry-pi-ecosystem.config.cjs

# 8. Uložiť PM2 konfiguráciu
pm2 save
pm2 startup

# 9. Čakať na spustenie
sleep 5

# 10. Test produkčného API
echo "🧪 Testovanie produkčného API..."
curl -s -H "Accept: application/json" "https://smart-beverage-dispenser-uzisinapoj.replit.app/api/beverages" | head -c 200

echo ""
echo "🧪 Testovanie lokálneho kiosku..."
curl -s "http://localhost:3000" | head -c 100

echo ""
echo "✅ Raspberry Pi nastavené!"
echo "🌐 API: https://smart-beverage-dispenser-uzisinapoj.replit.app/api/beverages"
echo "📱 Kiosk: http://localhost:3000"
echo "🔧 Hardware mód: PRODUCTION (reálne GPIO)"
echo "📋 PM2 status: pm2 status"
echo "📋 PM2 logs: pm2 logs beverage-kiosk"
