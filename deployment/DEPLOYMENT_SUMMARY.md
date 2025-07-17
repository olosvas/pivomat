# Deployment Summary

## Overview
This guide provides everything needed to deploy the Smart Beverage Dispensing Kiosk System on a Raspberry Pi 4B and deploy the admin web application.

## Quick Start

### 1. Raspberry Pi Kiosk Setup

#### Hardware Requirements
- Raspberry Pi 4B (4GB+)
- 7" official touchscreen
- 2x YF-S301 flow sensors
- 2x 12V solenoid valves
- 2x 5V relay modules
- Power supplies (5V for Pi, 12V for valves)

#### Software Installation
```bash
# 1. Install Node.js and dependencies
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git

# 2. Clone and setup application
git clone <your-repo> /home/pi/kiosk-app
cd /home/pi/kiosk-app

# 3. Install GPIO dependencies
npm install rpi-gpio@^2.1.7

# 4. Build for production
chmod +x deployment/build-production.sh
./deployment/build-production.sh

# 5. Setup environment
echo "NODE_ENV=production" > .env.production
echo "HARDWARE_MODE=production" >> .env.production
echo "DATABASE_URL=<your-neon-db-url>" >> .env.production

# 6. Start application
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### 2. Hardware Wiring

#### GPIO Pin Configuration
| Pin | Function | Component |
|-----|----------|-----------|
| 17  | Flow Sensor 1 | YF-S301 Signal (with 10kΩ pull-up) |
| 18  | Flow Sensor 2 | YF-S301 Signal (with 10kΩ pull-up) |
| 26  | Valve 1 | Relay Module IN1 |
| 27  | Valve 2 | Relay Module IN2 |
| 5V  | Power | Relay VCC, Sensor VCC |
| GND | Ground | Common Ground |

#### Wiring Steps
1. Connect flow sensors with pull-up resistors
2. Connect relay modules to GPIO pins
3. Wire solenoid valves through relays
4. Test all connections before powering on

### 3. Admin Web Application Deployment

#### Option A: Deploy on Replit (Recommended)
1. Click "Deploy" in your Replit workspace
2. Choose "Web Service" deployment
3. Configure:
   - Build Command: `npm run build`
   - Start Command: `npm start`
   - Port: 5000
4. Set environment variables (DATABASE_URL already configured)
5. Deploy and access admin panel

#### Option B: Deploy on VPS
```bash
# 1. Server setup
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs nginx certbot python3-certbot-nginx

# 2. Application setup
git clone <your-repo> /var/www/beverage-admin
cd /var/www/beverage-admin
npm install
npm run build

# 3. Configure PM2
npm install -g pm2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup

# 4. Configure Nginx (see admin-web-deployment.md)
# 5. Setup SSL certificate
```

## Configuration Files

### Key Files Created
- `deployment/raspberry-pi-setup.md` - Complete Pi setup guide
- `deployment/admin-web-deployment.md` - Admin app deployment guide
- `deployment/hardware-wiring.md` - Detailed wiring instructions
- `deployment/ecosystem.config.js` - PM2 configuration
- `deployment/build-production.sh` - Production build script

### Environment Variables
#### Raspberry Pi (.env.production)
```
NODE_ENV=production
HARDWARE_MODE=production
DATABASE_URL=<your-neon-postgres-url>
PORT=3000
```

#### Admin Web App (.env.production)
```
NODE_ENV=production
DATABASE_URL=<your-neon-postgres-url>
PORT=5000
SESSION_SECRET=<generate-secure-secret>
```

## System Architecture

### Raspberry Pi Kiosk
- **Application**: Full-screen kiosk interface
- **Hardware Control**: GPIO pins for valves and sensors
- **Database**: Connects to shared PostgreSQL database
- **Display**: 7" touchscreen in kiosk mode

### Admin Web Application
- **Deployment**: Cloud-hosted (Replit or VPS)
- **Access**: Web browser from any device
- **Features**: Real-time monitoring, beverage management, order tracking
- **Communication**: WebSocket connection to monitor kiosk

## Testing Checklist

### Hardware Testing
- [ ] Flow sensors detect water flow correctly
- [ ] Valves open/close on command
- [ ] GPIO pins respond to software control
- [ ] Touchscreen calibrated properly
- [ ] All electrical connections secure

### Software Testing
- [ ] Kiosk interface loads in fullscreen
- [ ] Language switching works (English/Slovak)
- [ ] Order placement and processing
- [ ] Admin panel accessible remotely
- [ ] WebSocket communication active
- [ ] Database operations working

### Integration Testing
- [ ] Orders appear in admin panel
- [ ] Hardware control from admin interface
- [ ] Real-time updates between systems
- [ ] Age verification process
- [ ] Payment simulation working

## Troubleshooting

### Common Issues

1. **GPIO Permission Errors**
   ```bash
   sudo usermod -a -G gpio pi
   sudo reboot
   ```

2. **Database Connection Issues**
   - Verify DATABASE_URL in environment files
   - Check network connectivity
   - Ensure Neon database is accessible

3. **Hardware Not Responding**
   - Check wiring connections
   - Verify power supply voltages
   - Test GPIO pins with multimeter

4. **Admin Panel Not Loading**
   - Check PM2 process status: `pm2 status`
   - Verify port configuration
   - Check firewall settings

### Support Resources
- Hardware wiring diagrams in `hardware-wiring.md`
- GPIO pin reference and troubleshooting
- System logs: `pm2 logs` and `journalctl`
- Database monitoring via admin panel

## Security Considerations

### Production Deployment
- Use strong passwords for all accounts
- Enable firewall on all systems
- Use SSL/TLS for admin web interface
- Regular security updates
- Backup database regularly

### Network Security
- Change default passwords
- Use VPN for remote access
- Monitor system logs for suspicious activity
- Keep software updated

## Maintenance

### Regular Tasks
- Weekly: Check hardware connections
- Monthly: Update software dependencies
- Quarterly: Full system backup
- As needed: Calibrate flow sensors

### Monitoring
- PM2 process monitoring
- Database performance
- Hardware status via admin panel
- System resource usage

## Next Steps

1. **Immediate**: Follow hardware wiring guide
2. **Setup**: Install software on Raspberry Pi
3. **Deploy**: Admin web application
4. **Test**: Complete system integration
5. **Configure**: Fine-tune settings for your beverages
6. **Train**: Staff on system operation

## Support

For technical issues:
1. Check troubleshooting section
2. Review system logs
3. Verify hardware connections
4. Test in development mode first

The system is designed to be robust and self-monitoring, with detailed logging and error handling throughout.