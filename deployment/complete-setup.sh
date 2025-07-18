#!/bin/bash

# Kompletný setup script pre Raspberry Pi
# Skopíruj tento súbor na Pi a spusti ho

echo "🔧 Nastavujem Smart Beverage Kiosk na Raspberry Pi..."

# Vytvor .env.production súbor
echo "📝 Vytváram .env.production súbor..."
cat > .env.production << 'EOF'
NODE_ENV=development
DATABASE_URL=postgresql://neondb_owner:npg_x4izKw3sGULf@ep-green-queen-a2ysqaa6-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
PORT=3000
HARDWARE_MODE=production
SESSION_SECRET=raspberry-pi-kiosk-secret-2025
EOF

# POZNÁMKA: Používame NODE_ENV=development aby API endpointy fungovali
# HARDWARE_MODE=production zabezpečuje použitie reálnych GPIO pinov

# Vytvor ecosystem.config.cjs pre PM2
echo "📝 Vytváram PM2 konfiguráciu..."
cat > ecosystem.config.cjs << 'EOF'
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

# Otestuj databázové pripojenie
echo "🔍 Testujem databázové pripojenie..."
node -e "
const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');
neonConfig.webSocketConstructor = ws;

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_x4izKw3sGULf@ep-green-queen-a2ysqaa6-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
});

async function testDB() {
  try {
    const result = await pool.query('SELECT COUNT(*) FROM beverages');
    console.log('✅ Databáza pripojená - nápojov:', result.rows[0].count);
    
    const beverages = await pool.query('SELECT id, name, name_en FROM beverages ORDER BY created_at LIMIT 3');
    console.log('📋 Nápoje v databáze:');
    beverages.rows.forEach(bev => console.log('  -', bev.id, ':', bev.name));
    
    await pool.end();
    console.log('✅ Databáza test úspešný!');
  } catch (error) {
    console.error('❌ Databáza ERROR:', error.message);
  }
}

testDB();
"

# Zastaviť existujúce PM2 procesy
echo "🛑 Zastavujem existujúce procesy..."
pm2 delete beverage-kiosk 2>/dev/null || true

# Spustiť aplikáciu
echo "🚀 Spúšťam aplikáciu..."
pm2 start deployment/ecosystem.config.cjs --env development

# Uložiť PM2 konfiguráciu
pm2 save

# Nastaviť autostart
pm2 startup

# Zobraziť status
echo "📊 Status aplikácie:"
pm2 status

# Vytvor test script
cat > test-kiosk.sh << 'EOF'
#!/bin/bash
echo "🧪 Testujem kiosk aplikáciu..."

# Test API
echo "📡 Testuje API endpoint..."
if curl -s -f "http://localhost:3000/api/beverages" > /dev/null; then
    echo "✅ API endpoint funguje"
    curl -s "http://localhost:3000/api/beverages" | jq -r '.[] | "- \(.id): \(.name) - €\(.pricePerLiter)"' | head -5
else
    echo "❌ API endpoint nefunguje"
fi

# Test GPIO (ak je dostupný)
if command -v gpio >/dev/null 2>&1; then
    echo "🔌 GPIO nástroje dostupné"
else
    echo "⚠️  GPIO nástroje nie sú nainštalované"
    echo "   Nainštaluj: sudo apt install wiringpi"
fi

echo "🎯 Kiosk aplikácia je dostupná na: http://localhost:3000"
EOF

chmod +x test-kiosk.sh

echo ""
echo "🎉 Setup dokončený!"
echo ""
echo "📋 Ďalšie kroky:"
echo "1. Skontroluj status: pm2 status"
echo "2. Pozri logy: pm2 logs beverage-kiosk"
echo "3. Otestuj aplikáciu: ./test-kiosk.sh"
echo "4. Otvor kiosk: http://localhost:3000"
echo ""
echo "🔧 Užitočné príkazy:"
echo "- pm2 restart beverage-kiosk    # Reštart aplikácie"
echo "- pm2 logs beverage-kiosk       # Zobraz logy"
echo "- pm2 monit                     # Monitoring"
echo ""
echo "✅ Raspberry Pi kiosk je pripravený!"
