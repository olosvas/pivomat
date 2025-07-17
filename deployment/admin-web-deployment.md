# Admin Web App Deployment Guide

## Deployment Options

### Option 1: Deploy on Replit (Recommended)
The admin web app can be deployed directly on Replit for easy access and management.

#### Steps:
1. **Prepare for Deployment**
   - Your application is already configured for Replit deployment
   - All necessary environment variables are set
   - Database connection is configured

2. **Deploy via Replit**
   - Click the "Deploy" button in your Replit workspace
   - Choose "Web Service" deployment type
   - Configure the deployment settings:
     - **Service Name**: `beverage-kiosk-admin`
     - **Build Command**: `npm run build`
     - **Start Command**: `npm start`
     - **Port**: 5000

3. **Environment Variables**
   - DATABASE_URL: (already configured)
   - NODE_ENV: production
   - SESSION_SECRET: (auto-generated)

4. **Custom Domain (Optional)**
   - Add your custom domain in deployment settings
   - Configure DNS settings as instructed

### Option 2: Deploy on VPS/Cloud Server

#### Requirements:
- Ubuntu 20.04+ or similar Linux distribution
- Node.js 20+
- PM2 for process management
- Nginx for reverse proxy
- SSL certificate (Let's Encrypt recommended)

#### Installation Steps:

1. **Server Setup**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y

# Install certbot for SSL
sudo apt install certbot python3-certbot-nginx -y
```

2. **Application Deployment**
```bash
# Create application directory
sudo mkdir -p /var/www/beverage-admin
cd /var/www/beverage-admin

# Clone repository
git clone <your-repo-url> .

# Install dependencies
npm install

# Build application
npm run build

# Set proper permissions
sudo chown -R www-data:www-data /var/www/beverage-admin
```

3. **Environment Configuration**
Create `/var/www/beverage-admin/.env.production`:
```bash
NODE_ENV=production
DATABASE_URL=<your-neon-postgres-url>
PORT=5000
SESSION_SECRET=<generate-secure-secret>
HARDWARE_MODE=development
```

4. **PM2 Configuration**
Create `/var/www/beverage-admin/ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'beverage-admin',
    script: './dist/server/index.js',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log'
  }]
};
```

5. **Start Application**
```bash
# Start with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save
pm2 startup
```

6. **Nginx Configuration**
Create `/etc/nginx/sites-available/beverage-admin`:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy to Node.js application
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support
    location /ws {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files
    location /static {
        alias /var/www/beverage-admin/dist/client;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

7. **Enable Site and SSL**
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/beverage-admin /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

## Production Configuration

### Database Connection
Ensure your Neon PostgreSQL database is configured for production:
- Connection pooling enabled
- Proper connection limits set
- SSL connection enforced

### Security Considerations

1. **Firewall Setup**
```bash
# Configure UFW firewall
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
```

2. **Regular Updates**
```bash
# Create update script
cat > /var/www/beverage-admin/update.sh << 'EOF'
#!/bin/bash
cd /var/www/beverage-admin
git pull origin main
npm install
npm run build
pm2 restart beverage-admin
EOF

chmod +x /var/www/beverage-admin/update.sh
```

3. **Backup Strategy**
```bash
# Database backups (automated)
# Environment configuration backups
# Application code backups
```

## Monitoring and Logging

### PM2 Monitoring
```bash
# Monitor processes
pm2 monit

# View logs
pm2 logs beverage-admin

# Restart application
pm2 restart beverage-admin
```

### System Monitoring
```bash
# Check system resources
htop
df -h
free -h

# Check Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## Connecting to Raspberry Pi Kiosk

### Network Configuration
1. **Same Local Network**: Both devices on same WiFi/LAN
2. **Port Forwarding**: Configure router for external access
3. **VPN Setup**: Secure connection for remote management

### Admin Panel Access
- **Local**: `http://raspberrypi-ip:3000/admin`
- **Remote**: `https://your-domain.com/admin`

### Real-time Communication
- WebSocket connection for live updates
- Order notifications
- System status monitoring
- Hardware control commands

## Maintenance

### Regular Tasks
- Monitor system resources
- Check application logs
- Update dependencies
- Backup configuration
- Test hardware connections

### Troubleshooting
- Check PM2 process status
- Verify database connectivity
- Monitor WebSocket connections
- Review Nginx access logs

## Security Best Practices

1. **Access Control**
   - Strong passwords
   - Regular security updates
   - Limited admin access

2. **Network Security**
   - Firewall configuration
   - SSL/TLS encryption
   - Secure database connections

3. **Application Security**
   - Input validation
   - Session management
   - CSRF protection
   - Rate limiting