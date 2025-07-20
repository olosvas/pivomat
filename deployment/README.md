# Raspberry Pi Deployment

## Quick Setup

1. Copy the deployment script to your Raspberry Pi:
```bash
wget https://raw.githubusercontent.com/olosvas/BeerDispenser/main/deployment/raspberry-pi-setup.sh
chmod +x raspberry-pi-setup.sh
```

2. Run the setup script:
```bash
./raspberry-pi-setup.sh
```

3. Reboot your Raspberry Pi:
```bash
sudo reboot
```

The kiosk application will automatically start in fullscreen mode and connect to the production API.

## Manual Control

- **Restart app**: `pm2 restart kiosk-app`
- **View logs**: `pm2 logs kiosk-app`
- **Stop app**: `pm2 stop kiosk-app`

## Architecture

```
Raspberry Pi Kiosk → Production API → PostgreSQL Database
(localhost:3000)     (replit.app)     (Neon)
```

The Raspberry Pi runs the frontend locally but connects to the production API for all data operations.