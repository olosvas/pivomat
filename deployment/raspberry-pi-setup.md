# Raspberry Pi Kiosk Setup Guide

## Hardware Requirements
- Raspberry Pi 4B (4GB+ recommended)
- 7" touchscreen display
- MicroSD card (32GB+ recommended)
- YF-S301 flow sensors
- 12V solenoid valves
- Relay modules (for valve control)
- Breadboard/PCB for connections
- Jumper wires

## GPIO Pin Configuration

### Default Pin Assignments
- **Valve Control Pins**: GPIO 26, 27 (configurable in admin panel)
- **Flow Sensor Pins**: GPIO 17, 18 (configurable in admin panel)
- **Power**: 5V and GND pins
- **Relay Control**: GPIO pins as configured

### Wiring Diagram
```
Raspberry Pi 4B GPIO Layout:
┌─────────────────────────────────┐
│ 5V  ●●  5V                     │
│ GND ●●  GPIO2 (SDA)            │
│ GPIO3 ●●  GPIO4                │
│ GND ●●  GPIO17 (Flow Sensor 1) │
│ GPIO18 ●●  GND (Flow Sensor 2) │
│ GPIO27 ●●  GPIO22 (Valve 1)    │
│ 3.3V ●●  GPIO10               │
│ GPIO9 ●●  GPIO11               │
│ GND ●●  GPIO0                  │
│ GPIO5 ●●  GPIO6                │
│ GPIO13 ●●  GPIO19              │
│ GPIO26 ●●  GPIO12 (Valve 2)    │
│ GND ●●  GND                    │
└─────────────────────────────────┘
```

## Software Installation

### 1. Raspberry Pi OS Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install git
sudo apt install git -y
```

### 2. Clone and Setup Application
```bash
# Clone the repository
git clone <your-repo-url> /home/pi/kiosk-app
cd /home/pi/kiosk-app

# Install dependencies
npm install

# Build the application
npm run build
```

### 3. Environment Configuration
Create `/home/pi/kiosk-app/.env.production`:
```bash
NODE_ENV=production
DATABASE_URL=<your-neon-postgres-url>
PORT=3000
HARDWARE_MODE=production
```

### 4. Hardware Service Configuration
The hardware service will automatically detect GPIO pins and initialize them in production mode.

## Kiosk Mode Configuration

### 1. Install Chromium Browser
```bash
sudo apt install chromium-browser unclutter -y
```

### 2. Auto-start Configuration
Create `/home/pi/kiosk-start.sh`:
```bash
#!/bin/bash
# Start the kiosk application
cd /home/pi/kiosk-app
pm2 start ecosystem.config.js --env production

# Wait for app to start
sleep 10

# Start chromium in kiosk mode
chromium-browser --kiosk --disable-infobars --disable-session-crashed-bubble --disable-component-update --no-first-run --start-fullscreen http://localhost:3000
```

### 3. System Service Setup
Create `/etc/systemd/system/kiosk.service`:
```ini
[Unit]
Description=Beverage Kiosk Application
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/kiosk-app
ExecStart=/home/pi/kiosk-start.sh
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Enable the service:
```bash
sudo chmod +x /home/pi/kiosk-start.sh
sudo systemctl enable kiosk.service
sudo systemctl start kiosk.service
```

## Hardware Testing

### Flow Sensor Testing
```bash
# Test flow sensor readings
cd /home/pi/kiosk-app
node -e "
const { hardwareService } = require('./dist/server/services/hardwareService');
console.log('Testing flow sensors...');
// Flow sensor test code here
"
```

### Valve Testing
```bash
# Test valve operation
cd /home/pi/kiosk-app
node -e "
const { hardwareService } = require('./dist/server/services/hardwareService');
console.log('Testing valves...');
hardwareService.openValve(26);
setTimeout(() => hardwareService.closeValve(26), 2000);
"
```

## Touchscreen Calibration

### 1. Install Calibration Tools
```bash
sudo apt install xinput-calibrator -y
```

### 2. Calibrate Display
```bash
# Run calibration
sudo xinput-calibrator

# Follow on-screen instructions
# Save calibration data to /etc/X11/xorg.conf.d/99-calibration.conf
```

## Network Configuration

### WiFi Setup
```bash
# Edit WiFi configuration
sudo nano /etc/wpa_supplicant/wpa_supplicant.conf

# Add your network:
network={
    ssid="YourNetworkName"
    psk="YourPassword"
}
```

### Static IP (Optional)
```bash
# Edit dhcpcd.conf
sudo nano /etc/dhcpcd.conf

# Add static IP configuration:
interface wlan0
static ip_address=192.168.1.100/24
static routers=192.168.1.1
static domain_name_servers=192.168.1.1
```

## Troubleshooting

### Common Issues
1. **GPIO Permission Errors**: Add pi user to gpio group
   ```bash
   sudo usermod -a -G gpio pi
   ```

2. **Display Issues**: Check `/boot/config.txt` for display settings
   ```bash
   # Add to /boot/config.txt
   hdmi_force_hotplug=1
   hdmi_group=2
   hdmi_mode=87
   ```

3. **Hardware Not Detected**: Verify wiring and pin configurations

### Logs
```bash
# Check application logs
pm2 logs

# Check system service logs
sudo journalctl -u kiosk.service -f

# Check hardware service logs
tail -f /home/pi/kiosk-app/logs/hardware.log
```

## Maintenance

### Regular Updates
```bash
# Update application
cd /home/pi/kiosk-app
git pull origin main
npm install
npm run build
pm2 restart all
```

### Backup Configuration
```bash
# Backup important files
cp /home/pi/kiosk-app/.env.production ~/backup/
cp /etc/systemd/system/kiosk.service ~/backup/
```