#!/bin/bash

# Kompletný setup script pre Raspberry Pi
echo "🔧 Nastavujem Smart Beverage Kiosk na Raspberry Pi..."

# Vytvor .env.production súbor
echo "📝 Vytváram .env.production súbor..."
cat > .env.production << 'EOF'
NODE_ENV=production
DATABASE_URL=postgresql://neondb_owner:npg_x4izKw3sGULf@ep-green-queen-a2ysqaa6-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
PORT=3000
HARDWARE_MODE=production
SESSION_SECRET=raspberry-pi-kiosk-secret-2025
EOF

# Vytvor ecosystem.config.js pre PM2
echo "📝 Vytváram PM2 konfiguráciu..."
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'beverage-kiosk',
    script: './dist/server/index.js',
    env: {
      NODE_ENV: 'development',
      PORT: 3000,
      DATABASE_URL: 'postgresql://neondb_owner:npg_x4izKw3sGULf@ep-green-queen-a2ysqaa6-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
      HARDWARE_MODE: 'production',
      DATABASE_URL: 'postgresql://neondb_owner:npg_x4izKw3sGULf@ep-green-queen-a2ysqaa6-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    exec_mode: 'fork',
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000
  }]
};
EOF

# Vytvor logs priečinok
mkdir -p logs

# Zastaviť existujúce PM2 procesy
echo "🛑 Zastavujem existujúce procesy..."
pm2 delete beverage-kiosk 2>/dev/null || true

# Spustiť aplikáciu
echo "🚀 Spúšťam aplikáciu..."
pm2 start ecosystem.config.js --env production

# Uložiť PM2 konfiguráciu
pm2 save

# Zobraziť status
echo "📊 Status aplikácie:"
pm2 status

echo ""
echo "🎉 Setup dokončený!"
echo "📋 Kiosk aplikácia je dostupná na: http://localhost:3000"
echo "🔧 Užitočné príkazy:"
echo "- pm2 status                     # Status aplikácie"
echo "- pm2 logs beverage-kiosk        # Logy"
echo "- pm2 restart beverage-kiosk     # Reštart"
echo "✅ Raspberry Pi kiosk je pripravený!"
