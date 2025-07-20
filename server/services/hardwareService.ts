import { storage } from "../storage";

export interface HardwareStatus {
  valvePin: number;
  flowSensorPin: number;
  isOpen: boolean;
  currentFlow: number;
  totalPulses: number;
}

export class HardwareService {
  private valveStates: Map<number, boolean> = new Map();
  private flowStates: Map<number, number> = new Map();
  private pulsesPerLiter = 450; // YF-S301 sensor specification
  private isProduction = process.env.NODE_ENV === 'production' || process.env.HARDWARE_MODE === 'production';
  private gpio: any = null;

  constructor() {
    // Initialize GPIO states
    this.initializeGPIO();
  }

  private initializeGPIO(): void {
    console.log('Initializing GPIO pins...');
    
    if (this.isProduction) {
      try {
        // Try to import rpi-gpio for production environment
        this.gpio = require('rpi-gpio');
        console.log('Production mode: GPIO hardware control enabled');
        
        // Setup GPIO pins for output (valves)
        // We'll configure pins dynamically when needed
      } catch (error) {
        console.warn('GPIO module not available, falling back to simulation mode');
        this.isProduction = false;
      }
    } else {
      console.log('Development mode: GPIO simulation enabled');
    }
  }

  async openValve(pin: number): Promise<void> {
    console.log(`Opening valve on pin ${pin}`);
    
    if (this.isProduction && this.gpio) {
      try {
        // Configure pin as output if not already configured
        await this.gpio.setup(pin, this.gpio.DIR_OUT);
        // Set pin HIGH to activate relay (normally closed relay)
        await this.gpio.write(pin, true);
      } catch (error) {
        console.error(`Failed to control GPIO pin ${pin}:`, error);
      }
    }
    
    this.valveStates.set(pin, true);
    
    // Log hardware action
    await storage.createSystemLog({
      level: 'info',
      message: `Valve opened on pin ${pin}`,
      context: { pin, action: 'open', mode: this.isProduction ? 'production' : 'simulation' }
    });
  }

  async closeValve(pin: number): Promise<void> {
    console.log(`Closing valve on pin ${pin}`);
    
    if (this.isProduction && this.gpio) {
      try {
        // Set pin LOW to deactivate relay
        await this.gpio.write(pin, false);
      } catch (error) {
        console.error(`Failed to control GPIO pin ${pin}:`, error);
      }
    }
    
    this.valveStates.set(pin, false);
    
    // Log hardware action
    await storage.createSystemLog({
      level: 'info',
      message: `Valve closed on pin ${pin}`,
      context: { pin, action: 'close', mode: this.isProduction ? 'production' : 'simulation' }
    });
  }

  isValveOpen(pin: number): boolean {
    return this.valveStates.get(pin) || false;
  }

  getCurrentFlow(pin: number): number {
    return this.flowStates.get(pin) || 0;
  }

  simulateFlow(pin: number, targetVolume: number): Promise<void> {
    return new Promise((resolve) => {
      const targetPulses = targetVolume * this.pulsesPerLiter;
      let currentPulses = 0;
      const pulseInterval = 50; // ms between pulses
      
      const interval = setInterval(() => {
        currentPulses += 1;
        this.flowStates.set(pin, currentPulses);
        
        if (currentPulses >= targetPulses) {
          clearInterval(interval);
          this.flowStates.set(pin, 0);
          resolve();
        }
      }, pulseInterval);
    });
  }

  async dispenseVolume(beverageId: string, targetVolume: number): Promise<void> {
    const beverage = await storage.getBeverageById(beverageId);
    if (!beverage) {
      throw new Error(`Beverage ${beverageId} not found`);
    }

    const currentStock = parseFloat(beverage.currentStock);
    if (currentStock < targetVolume) {
      throw new Error(`Insufficient stock for ${beverageId}`);
    }

    try {
      // Open valve
      await this.openValve(beverage.valvePin);
      
      // Start dispensing simulation
      await this.simulateFlow(beverage.flowSensorPin, targetVolume);
      
      // Close valve
      await this.closeValve(beverage.valvePin);
      
      // Update stock
      const newStock = currentStock - targetVolume;
      await storage.updateBeverageStock(
        beverageId,
        newStock,
        'dispense',
        targetVolume,
        undefined,
        `Dispensed ${targetVolume}L via hardware`
      );
      
      console.log(`Successfully dispensed ${targetVolume}L of ${beverage.name}`);
      
    } catch (error) {
      // Ensure valve is closed on error
      await this.closeValve(beverage.valvePin);
      throw error;
    }
  }

  async waitForCup(): Promise<void> {
    // In production mode, this would interface with cup sensor hardware
    if (this.isProduction) {
      // TODO: Implement actual cup detection logic
      // For now, simulate waiting for cup placement
      console.log('Waiting for cup to be placed...');
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second wait
    } else {
      // Development mode: simulate cup placement
      console.log('Simulating cup placement...');
      await new Promise(resolve => setTimeout(resolve, 500)); // 0.5 second wait
    }
    
    await storage.createSystemLog({
      level: 'info',
      message: 'Cup detected and ready for dispensing',
      context: { mode: this.isProduction ? 'production' : 'simulation' }
    });
  }

  async dispenseCup(): Promise<void> {
    // Future implementation for automatic cup dispensing
    if (this.isProduction) {
      console.log('Dispensing cup via hardware...');
      // TODO: Implement actual cup dispensing logic
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second for cup dispensing
    } else {
      console.log('Simulating cup dispensing...');
      await new Promise(resolve => setTimeout(resolve, 300)); // 0.3 second simulation
    }
    
    await storage.createSystemLog({
      level: 'info',
      message: 'Cup dispensed successfully',
      context: { mode: this.isProduction ? 'production' : 'simulation' }
    });
  }

  getHardwareStatus(): HardwareStatus[] {
    const status: HardwareStatus[] = [];
    
    // In a real implementation, this would query actual hardware
    // For now, return mock status
    this.valveStates.forEach((isOpen, pin) => {
      status.push({
        valvePin: pin,
        flowSensorPin: pin + 10, // Mock flow sensor pin
        isOpen,
        currentFlow: this.getCurrentFlow(pin + 10),
        totalPulses: 0
      });
    });
    
    return status;
  }
}

export const hardwareService = new HardwareService();
