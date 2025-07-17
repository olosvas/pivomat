# Hardware Wiring Guide for Raspberry Pi Kiosk

## Components Required

### Electronic Components
- **Raspberry Pi 4B** (4GB+ recommended)
- **7" Touchscreen Display** (official Pi display or compatible)
- **YF-S301 Flow Sensors** (2x for dual beverage setup)
- **12V Solenoid Valves** (2x for dual beverage setup)
- **5V Relay Modules** (2x for valve control)
- **Breadboard or PCB** for connections
- **Jumper Wires** (Male-to-Male, Male-to-Female)
- **Resistors** (10kΩ pull-up resistors for flow sensors)
- **Power Supply** (12V for valves, 5V for Pi)
- **Mounting Hardware** for secure installation

### Mechanical Components
- **Tubing** (food-grade silicone tubing)
- **Fittings** (barb fittings for tubing connections)
- **Mounting Brackets** for valves and sensors
- **Enclosure** for electronics protection

## GPIO Pin Assignments

### Default Configuration
```
GPIO Pin | Function          | Component
---------|-------------------|------------------
17       | Flow Sensor 1     | YF-S301 Signal
18       | Flow Sensor 2     | YF-S301 Signal
26       | Valve Control 1   | Relay Module IN1
27       | Valve Control 2   | Relay Module IN2
5V       | Power Supply      | Relay VCC, Sensors VCC
GND      | Common Ground     | All GND connections
```

## Wiring Diagrams

### Flow Sensor Wiring
```
YF-S301 Flow Sensor:
┌─────────────────────┐
│  RED   (VCC) ──────── 5V
│  BLACK (GND) ──────── GND
│  YELLOW(Signal) ──── GPIO17 (with 10kΩ pull-up)
└─────────────────────┘

Pull-up Resistor Connection:
GPIO17 ──── 10kΩ ──── 5V
```

### Solenoid Valve Wiring (via Relay)
```
Relay Module:
┌─────────────────────┐
│  VCC ──────────────── 5V
│  GND ──────────────── GND
│  IN1 ──────────────── GPIO26
│  COM ──────────────── 12V+ (Power Supply)
│  NO  ──────────────── Solenoid Valve +
└─────────────────────┘

Solenoid Valve:
┌─────────────────────┐
│  RED  (+) ─────────── Relay NO
│  BLACK(-) ─────────── 12V- (Power Supply)
└─────────────────────┘
```

### Complete Circuit Diagram
```
Power Supply (12V/5V):
    12V+ ──┬── Relay COM
    12V- ──┼── Solenoid Valve (-)
    5V   ──┼── Raspberry Pi 5V
    GND  ──┼── Common Ground
           
Raspberry Pi GPIO:
    GPIO17 ──┬── Flow Sensor 1 (Yellow)
             └── 10kΩ ──── 5V
    GPIO18 ──┬── Flow Sensor 2 (Yellow)
             └── 10kΩ ──── 5V
    GPIO26 ──── Relay 1 (IN1)
    GPIO27 ──── Relay 2 (IN2)
    5V     ──── Relay VCC, Sensor VCC
    GND    ──── Common Ground
```

## Step-by-Step Wiring Instructions

### 1. Safety First
- Power off all devices before wiring
- Use proper ESD protection
- Double-check connections before powering on
- Use multimeter to verify continuity

### 2. Flow Sensor Installation
```bash
# Connect Flow Sensor 1 (Beverage 1)
- Red wire    → Pi 5V pin (Pin 2)
- Black wire  → Pi GND pin (Pin 6)
- Yellow wire → Pi GPIO17 (Pin 11) via 10kΩ pull-up resistor

# Connect Flow Sensor 2 (Beverage 2)
- Red wire    → Pi 5V pin (Pin 4)
- Black wire  → Pi GND pin (Pin 9)
- Yellow wire → Pi GPIO18 (Pin 12) via 10kΩ pull-up resistor
```

### 3. Relay Module Installation
```bash
# Connect Relay Module 1 (Valve 1)
- VCC → Pi 5V pin (Pin 2)
- GND → Pi GND pin (Pin 6)
- IN1 → Pi GPIO26 (Pin 37)

# Connect Relay Module 2 (Valve 2)
- VCC → Pi 5V pin (Pin 4)
- GND → Pi GND pin (Pin 9)
- IN1 → Pi GPIO27 (Pin 13)
```

### 4. Solenoid Valve Connection
```bash
# Connect Solenoid Valve 1
- COM (Relay) → 12V+ power supply
- NO (Relay)  → Solenoid valve positive terminal
- Solenoid negative → 12V- power supply

# Connect Solenoid Valve 2
- COM (Relay) → 12V+ power supply
- NO (Relay)  → Solenoid valve positive terminal
- Solenoid negative → 12V- power supply
```

### 5. Power Supply Connection
```bash
# 12V Power Supply (for valves)
- 12V+ → Relay COM terminals
- 12V- → Solenoid valve negative terminals

# 5V Power Supply (Raspberry Pi)
- Use official Pi power adapter
- Connect to Pi micro-USB or USB-C port
```

## Testing Hardware Connections

### 1. Continuity Testing
```bash
# Use multimeter to test:
- All GND connections are connected
- 5V connections have proper voltage
- 12V connections have proper voltage
- GPIO pins are properly connected
```

### 2. Flow Sensor Testing
```bash
# Test flow sensor signals
# SSH into Raspberry Pi and run:
gpio mode 17 in
gpio read 17  # Should read 1 (high) with pull-up

# Test with water flow
# Signal should pulse when water flows through sensor
```

### 3. Relay Testing
```bash
# Test relay operation
gpio mode 26 out
gpio write 26 1  # Should activate relay (LED on)
gpio write 26 0  # Should deactivate relay (LED off)
```

### 4. Valve Testing
```bash
# Test complete valve operation
gpio write 26 1  # Open valve 1
sleep 2
gpio write 26 0  # Close valve 1

# Listen for clicking sound from relay
# Check valve operation manually
```

## Mechanical Installation

### 1. Flow Sensor Mounting
- Install sensors inline with beverage tubing
- Ensure proper flow direction (arrow on sensor)
- Use appropriate fittings for secure connection
- Mount sensors where they won't interfere with operation

### 2. Solenoid Valve Mounting
- Mount valves in vertical position (coil up)
- Ensure proper flow direction
- Use brackets for secure mounting
- Keep valves accessible for maintenance

### 3. Tubing Installation
- Use food-grade silicone tubing
- Minimize tube length to reduce lag
- Secure all connections with clamps
- Test for leaks before operation

## Troubleshooting

### Common Issues

1. **Flow Sensor Not Reading**
   - Check pull-up resistor installation
   - Verify 5V power supply
   - Test sensor with multimeter
   - Check GPIO pin assignment

2. **Valve Not Operating**
   - Check relay power supply (5V)
   - Test relay activation with GPIO
   - Verify 12V power for solenoid
   - Check wiring connections

3. **Intermittent Operation**
   - Check for loose connections
   - Verify power supply stability
   - Test under load conditions
   - Check for interference

### Diagnostic Commands
```bash
# Check GPIO status
gpio readall

# Test hardware service
sudo systemctl status beverage-kiosk
sudo journalctl -u beverage-kiosk -f

# Monitor GPIO activity
sudo apt install wiringpi
gpio mode 17 in
watch gpio read 17
```

## Safety Considerations

### Electrical Safety
- Use proper fuses and circuit protection
- Ensure proper grounding
- Use appropriate wire gauges
- Install emergency stop switch

### Food Safety
- Use food-grade materials only
- Regular cleaning and sanitization
- Proper storage of beverages
- Temperature monitoring if required

### Mechanical Safety
- Secure all mounting hardware
- Regular maintenance schedule
- Pressure testing of system
- Emergency shutdown procedures

## Maintenance Schedule

### Daily
- Visual inspection of connections
- Check for leaks
- Verify system operation

### Weekly
- Clean sensors and valves
- Check electrical connections
- Test emergency procedures

### Monthly
- Calibrate flow sensors
- Replace worn tubing
- Update system software
- Full system testing

## Documentation

Keep detailed records of:
- Installation photos
- Wiring diagrams with actual pin assignments
- Component specifications
- Maintenance logs
- Troubleshooting procedures
- Contact information for suppliers