#!/bin/bash

echo "🔍 Diagnostika build problému na Raspberry Pi..."

# 1. Skontrolovať systémové požiadavky
echo "📊 Kontrolujem systém..."
echo "Node.js verzia: $(node --version)"
echo "NPM verzia: $(npm --version)"
echo "Voľná pamäť: $(free -h | grep ^Mem: | awk '{print $7}')"
echo "Voľné miesto na disku: $(df -h / | tail -1 | awk '{print $4}')"

# 2. Zvýšiť memory limit pre Node.js
export NODE_OPTIONS="--max-old-space-size=1024"
echo "Node.js memory limit nastavený na 1GB"

# 3. Zastaviť procesy ktoré môžu brať pamäť
pm2 stop all 2>/dev/null || true

# 4. Vyčistiť cache a build súbory
echo "🧹 Čistím cache..."
npm cache clean --force
rm -rf dist/
rm -rf node_modules/.vite/
rm -rf client/node_modules/.vite/ 2>/dev/null || true

# 5. Skontrolovať dependencies
echo "📦 Kontrolujem dependencies..."
if ! npm list --depth=0 > /dev/null 2>&1; then
    echo "⚠️  Dependencies problém, reinstalling..."
    rm -rf node_modules
    npm install
fi

# 6. Vytvoriť environment pre build
cat > .env << 'EOF'
NODE_ENV=production
VITE_API_URL=https://smart-beverage-dispenser-uzisinapoj.replit.app
PORT=3000
HARDWARE_MODE=production
DATABASE_URL=postgresql://neondb_owner:npg_x4izKw3sGULf@ep-green-queen-a2ysqaa6-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
EOF

# 7. Načítať environment variables
export NODE_ENV=production
export VITE_API_URL=https://smart-beverage-dispenser-uzisinapoj.replit.app
export PORT=3000
export HARDWARE_MODE=production

echo "🔨 Spúšťam build s detailným logovaním..."
echo "VITE_API_URL = $VITE_API_URL"

# 8. Build s verbose logovaním
npm run build --verbose 2>&1 | tee build.log

# 9. Skontrolovať výsledok
if [ $? -eq 0 ]; then
    echo "✅ Build úspešný!"
    
    # Skontrolovať či súbory existujú
    if [ -f "dist/public/index.html" ] && [ -f "dist/index.js" ]; then
        echo "✅ Všetky build súbory sú OK"
        
        # Spustiť aplikáciu
        cat > pi-ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [{
    name: 'beverage-kiosk',
    script: './dist/index.js',
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
        
        pm2 start pi-ecosystem.config.cjs
        sleep 3
        
        echo "🧪 Test aplikácie..."
        curl -s "http://localhost:3000/" | head -c 100
        
    else
        echo "❌ Build súbory chýbajú!"
        exit 1
    fi
else
    echo "❌ Build zlyhal! Detaily v build.log"
    echo "Posledné riadky chyby:"
    tail -20 build.log
    exit 1
fi

echo "🎉 Raspberry Pi kiosk je pripravený!"
