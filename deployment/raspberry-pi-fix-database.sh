#!/bin/bash

# Raspberry Pi Database Fix Script
# Opravuje všetky možné problémy s databázou

echo "🔧 Opravujem databázové pripojenie na Raspberry Pi..."

# 1. Zastaviť aplikáciu
echo "1. Zastavujem aplikáciu..."
pm2 stop beverage-kiosk 2>/dev/null || true
pm2 delete beverage-kiosk 2>/dev/null || true

# 2. Vyčistiť environment
echo "2. Vyčisťujem environment..."
unset DATABASE_URL
unset NODE_ENV
unset PORT
unset HARDWARE_MODE

# 3. Vytvoriť správny .env.production
echo "3. Vytváram správny .env.production..."
cat > .env.production << 'EOF'
NODE_ENV=development
DATABASE_URL=postgresql://neondb_owner:npg_x4izKw3sGULf@ep-green-queen-a2ysqaa6-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
PORT=3000
HARDWARE_MODE=production
SESSION_SECRET=raspberry-pi-kiosk-secret-2025
EOF

# DÔVOD: V production móde sa aplikácia snaží servovať statické súbory
# čo prepisuje API endpointy. Development mód zachová API funkčnosť.

# 4. Načítať environment variables
echo "4. Načítavam environment variables..."
set -a
source .env.production
set +a

echo "   DATABASE_URL: ${DATABASE_URL:0:50}..."
echo "   NODE_ENV: $NODE_ENV"
echo "   PORT: $PORT"

# 5. Skontrolovať dependencies
echo "5. Kontrolujem dependencies..."
if [ ! -d node_modules/@neondatabase ]; then
    echo "   Inštalujem @neondatabase/serverless..."
    npm install @neondatabase/serverless ws
fi

# 6. Test databázového pripojenia
echo "6. Testujem databázové pripojenie..."
node -e "
const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');
neonConfig.webSocketConstructor = ws;

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL
});

async function testDB() {
  try {
    console.log('🔗 Testujem pripojenie...');
    const result = await pool.query('SELECT COUNT(*) FROM beverages');
    console.log('✅ Databáza pripojená - nápojov:', result.rows[0].count);
    
    if (result.rows[0].count > 0) {
      const samples = await pool.query('SELECT id, name, price_per_liter FROM beverages LIMIT 3');
      samples.rows.forEach(bev => {
        console.log('   -', bev.id, ':', bev.name, '- €' + bev.price_per_liter);
      });
    }
    
    await pool.end();
    console.log('✅ Databáza test OK!');
  } catch (error) {
    console.error('❌ Databáza ERROR:', error.message);
    process.exit(1);
  }
}

testDB();
"

if [ $? -eq 0 ]; then
    echo "✅ Databázové pripojenie funguje!"
else
    echo "❌ Databázové pripojenie zlyhalo!"
    exit 1
fi

# 7. Vytvoriť/aktualizovať ecosystem.config.js
echo "7. Vytváram PM2 konfiguráciu..."
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

# 8. Vytvoriť logs priečinok
echo "8. Vytváram logs priečinok..."
mkdir -p logs

# 9. Spustiť aplikáciu
echo "9. Spúšťam aplikáciu..."
pm2 start ecosystem.config.cjs --env development

# 10. Počkať na spustenie
echo "10. Čakám na spustenie aplikácie..."
sleep 5

# 11. Test API
echo "11. Testujem API..."
for i in {1..5}; do
    if curl -s -f "http://localhost:3000/api/beverages" >/dev/null; then
        echo "✅ API endpoint funguje!"
        curl -s "http://localhost:3000/api/beverages" | head -c 200
        echo ""
        break
    else
        echo "⏳ Čakám na API... (pokus $i/5)"
        sleep 3
    fi
done

# 12. Uložiť PM2 konfiguráciu
echo "12. Ukladám PM2 konfiguráciu..."
pm2 save

# 13. Finálny status
echo "13. Finálny status:"
pm2 status
pm2 logs beverage-kiosk --lines 5 --nostream

echo ""
echo "🎉 Oprava dokončená!"
echo "📋 Kiosk aplikácia je dostupná na: http://localhost:3000"
echo "🔧 Užitočné príkazy:"
echo "   - pm2 logs beverage-kiosk    # Logy"
echo "   - pm2 restart beverage-kiosk # Reštart"
echo "   - pm2 status                 # Status"
