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

  constructor() {
    // Initialize GPIO states
    this.initializeGPIO();
  }

  private initializeGPIO(): void {
    // Mock GPIO initialization
    console.log('Initializing GPIO pins...');
    
    // In a real implementation, this would initialize the GPIO library
    // For now, we'll simulate the hardware state
  }

  async openValve(pin: number): Promise<void> {
    console.log(`Opening valve on pin ${pin}`);
    this.valveStates.set(pin, true);
    
    // Log hardware action
    await storage.createSystemLog({
      level: 'info',
      message: `Valve opened on pin ${pin}`,
      context: { pin, action: 'open' }
    });
  }

  async closeValve(pin: number): Promise<void> {
    console.log(`Closing valve on pin ${pin}`);
    this.valveStates.set(pin, false);
    
    // Log hardware action
    await storage.createSystemLog({
      level: 'info',
      message: `Valve closed on pin ${pin}`,
      context: { pin, action: 'close' }
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
