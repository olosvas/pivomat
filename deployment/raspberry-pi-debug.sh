#!/bin/bash

# Raspberry Pi Debug Script
# Diagnostika problémov s načítavaním dát z databázy

echo "🔍 Diagnostika Raspberry Pi kiosk aplikácie..."
echo "================================================"

# 1. Skontroluj environment variables
echo "1. Environment Variables:"
if [ -f .env.production ]; then
    echo "✅ .env.production existuje"
    echo "NODE_ENV: $NODE_ENV"
    echo "DATABASE_URL: ${DATABASE_URL:0:30}..."
    echo "PORT: $PORT"
    echo "HARDWARE_MODE: $HARDWARE_MODE"
else
    echo "❌ .env.production neexistuje"
    echo "Vytváram .env.production súbor..."
    cat > .env.production << 'EOF'
NODE_ENV=production
DATABASE_URL=postgresql://neondb_owner:npg_x4izKw3sGULf@ep-green-queen-a2ysqaa6-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
PORT=3000
HARDWARE_MODE=production
SESSION_SECRET=raspberry-pi-kiosk-secret-2025
EOF
    echo "✅ .env.production vytvorený"
fi

# 2. Načítaj environment variables
echo ""
echo "2. Načítavam environment variables..."
set -a
source .env.production 2>/dev/null || echo "⚠️ Nemôžem načítať .env.production"
set +a

# 3. Skontroluj sieťové pripojenie
echo ""
echo "3. Sieťové pripojenie:"
if ping -c 1 google.com >/dev/null 2>&1; then
    echo "✅ Internet pripojenie OK"
else
    echo "❌ Internet pripojenie zlyhalo"
fi

# 4. Skontroluj Node.js a npm
echo ""
echo "4. Node.js a npm:"
echo "Node.js verzia: $(node --version)"
echo "npm verzia: $(npm --version)"

# 5. Skontroluj dependencies
echo ""
echo "5. Dependencies:"
if [ -d node_modules ]; then
    echo "✅ node_modules existuje"
    if [ -d node_modules/@neondatabase ]; then
        echo "✅ @neondatabase/serverless nainštalovaný"
    else
        echo "❌ @neondatabase/serverless chýba"
        echo "Inštalujem dependencies..."
        npm install
    fi
else
    echo "❌ node_modules chýba"
    echo "Inštalujem dependencies..."
    npm install
fi

# 6. Test databázového pripojenia
echo ""
echo "6. Test databázového pripojenia:"
node -e "
const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');
neonConfig.webSocketConstructor = ws;

const dbUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_x4izKw3sGULf@ep-green-queen-a2ysqaa6-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

console.log('🔗 Testujem pripojenie k databáze...');
console.log('DB URL:', dbUrl.substring(0, 50) + '...');

const pool = new Pool({ connectionString: dbUrl });

async function testDB() {
  try {
    console.log('📡 Pripájam sa k databáze...');
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Databázové pripojenie úspešné!');
    console.log('🕐 Server čas:', result.rows[0].now);
    
    console.log('📋 Testujem beverages tabuľku...');
    const beverages = await pool.query('SELECT COUNT(*) FROM beverages');
    console.log('🍺 Počet nápojov:', beverages.rows[0].count);
    
    if (beverages.rows[0].count > 0) {
      const samples = await pool.query('SELECT id, name, name_en, price_per_liter FROM beverages LIMIT 3');
      console.log('📝 Vzorky nápojov:');
      samples.rows.forEach(bev => {
        console.log('  -', bev.id, ':', bev.name, '(', bev.name_en, ') - €' + bev.price_per_liter);
      });
    }
    
    await pool.end();
    console.log('✅ Databáza test dokončený');
  } catch (error) {
    console.error('❌ Databáza ERROR:', error.message);
    console.error('Stack:', error.stack);
  }
}

testDB();
" 2>/dev/null || echo "❌ Node.js test zlyhalo"

# 7. Skontroluj PM2 status
echo ""
echo "7. PM2 Status:"
if command -v pm2 >/dev/null 2>&1; then
    echo "✅ PM2 je nainštalovaný"
    pm2 list
    echo ""
    echo "📊 PM2 logs (posledných 10 riadkov):"
    pm2 logs beverage-kiosk --lines 10 --nostream 2>/dev/null || echo "❌ Žiadne PM2 logy"
else
    echo "❌ PM2 nie je nainštalovaný"
    echo "Inštalujem PM2..."
    npm install -g pm2
fi

# 8. Test API endpointu
echo ""
echo "8. Test API endpointu:"
if curl -s -f "http://localhost:3000/api/beverages" >/dev/null 2>&1; then
    echo "✅ API endpoint /api/beverages funguje"
    echo "📋 Prvé 3 nápoje:"
    curl -s "http://localhost:3000/api/beverages" | head -c 300 | jq -r '.[] | "  - \(.id): \(.name) - €\(.pricePerLiter)"' 2>/dev/null || echo "Raw response: $(curl -s 'http://localhost:3000/api/beverages' | head -c 200)"
else
    echo "❌ API endpoint nefunguje"
    echo "🔍 Testujem či aplikácia beží..."
    if curl -s -f "http://localhost:3000" >/dev/null 2>&1; then
        echo "✅ Aplikácia beží na porte 3000"
        echo "❌ Ale /api/beverages endpoint nefunguje"
    else
        echo "❌ Aplikácia nebeží na porte 3000"
    fi
fi

# 9. Skontroluj logy
echo ""
echo "9. Aplikačné logy:"
if [ -f logs/combined.log ]; then
    echo "📋 Posledné logy (combined.log):"
    tail -10 logs/combined.log
elif [ -f logs/error.log ]; then
    echo "📋 Error logy:"
    tail -10 logs/error.log
else
    echo "⚠️ Žiadne log súbory nenájdené"
fi

echo ""
echo "================================================"
echo "🎯 Diagnostika dokončená!"
echo ""
echo "Ak sú všetky testy OK, aplikácia by mala fungovať na:"
echo "http://localhost:3000"
echo ""
echo "Ak sú problémy, skontroluj PM2 logy:"
echo "pm2 logs beverage-kiosk"
