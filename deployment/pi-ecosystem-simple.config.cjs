module.exports = {
  apps: [{
    name: 'beverage-kiosk',
    script: './dist/index.js',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      HARDWARE_MODE: 'production',
      DATABASE_URL: 'postgresql://neondb_owner:npg_x4izKw3sGULf@ep-green-queen-a2ysqaa6-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '256M',
    exec_mode: 'fork',
    // Add Node options to handle path resolution issues
    node_args: ['--experimental-specifier-resolution=node'],
    // Set working directory explicitly
    cwd: '/home/oliver/kiosk-app',
    // Redirect output to see what's happening
    out_file: './logs/out.log',
    error_file: './logs/err.log',
    log_file: './logs/combined.log'
  }]
};
