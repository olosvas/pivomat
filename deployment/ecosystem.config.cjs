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
      NODE_ENV: 'development',
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
