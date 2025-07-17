import { storage } from "../storage";
import { Beverage } from "@shared/schema";

export interface StockAlert {
  beverageId: string;
  name: string;
  currentStock: number;
  totalCapacity: number;
  stockPercentage: number;
  alertLevel: 'low' | 'critical' | 'empty';
}

export class InventoryService {
  async getStockAlerts(): Promise<StockAlert[]> {
    const beverages = await storage.getAllBeverages();
    const alerts: StockAlert[] = [];

    for (const beverage of beverages) {
      if (!beverage.isActive) continue;

      const currentStock = parseFloat(beverage.currentStock);
      const totalCapacity = parseFloat(beverage.totalCapacity);
      const stockPercentage = (currentStock / totalCapacity) * 100;

      let alertLevel: 'low' | 'critical' | 'empty' | null = null;

      if (currentStock === 0) {
        alertLevel = 'empty';
      } else if (stockPercentage < 10) {
        alertLevel = 'critical';
      } else if (stockPercentage < 20) {
        alertLevel = 'low';
      }

      if (alertLevel) {
        alerts.push({
          beverageId: beverage.id,
          name: beverage.name,
          currentStock,
          totalCapacity,
          stockPercentage,
          alertLevel
        });
      }
    }

    return alerts.sort((a, b) => a.stockPercentage - b.stockPercentage);
  }

  async replenishStock(beverageId: string, amount: number, notes?: string): Promise<void> {
    const beverage = await storage.getBeverageById(beverageId);
    if (!beverage) {
      throw new Error(`Beverage ${beverageId} not found`);
    }

    const currentStock = parseFloat(beverage.currentStock);
    const totalCapacity = parseFloat(beverage.totalCapacity);
    const newStock = Math.min(currentStock + amount, totalCapacity);

    if (newStock > totalCapacity) {
      throw new Error(`Cannot exceed capacity of ${totalCapacity}L`);
    }

    await storage.updateBeverageStock(
      beverageId,
      newStock,
      'refill',
      amount,
      undefined,
      notes || `Manual refill of ${amount}L`
    );

    // Log refill
    await storage.createSystemLog({
      level: 'info',
      message: `Stock replenished for ${beverage.name}`,
      context: {
        beverageId,
        amount,
        previousStock: currentStock,
        newStock,
        notes
      }
    });
  }

  async adjustStock(beverageId: string, newStock: number, reason: string): Promise<void> {
    const beverage = await storage.getBeverageById(beverageId);
    if (!beverage) {
      throw new Error(`Beverage ${beverageId} not found`);
    }

    const currentStock = parseFloat(beverage.currentStock);
    const totalCapacity = parseFloat(beverage.totalCapacity);

    if (newStock < 0 || newStock > totalCapacity) {
      throw new Error(`Stock must be between 0 and ${totalCapacity}L`);
    }

    const adjustment = newStock - currentStock;

    await storage.updateBeverageStock(
      beverageId,
      newStock,
      'adjust',
      Math.abs(adjustment),
      undefined,
      reason
    );

    // Log adjustment
    await storage.createSystemLog({
      level: 'info',
      message: `Stock adjusted for ${beverage.name}`,
      context: {
        beverageId,
        previousStock: currentStock,
        newStock,
        adjustment,
        reason
      }
    });
  }

  async getInventoryReport(): Promise<{
    totalBeverages: number;
    activeBeverages: number;
    totalCapacity: number;
    totalCurrentStock: number;
    utilizationRate: number;
    lowStockCount: number;
    criticalStockCount: number;
    emptyStockCount: number;
  }> {
    const beverages = await storage.getAllBeverages();
    const alerts = await this.getStockAlerts();

    const totalBeverages = beverages.length;
    const activeBeverages = beverages.filter(b => b.isActive).length;
    const totalCapacity = beverages.reduce((sum, b) => sum + parseFloat(b.totalCapacity), 0);
    const totalCurrentStock = beverages.reduce((sum, b) => sum + parseFloat(b.currentStock), 0);
    const utilizationRate = totalCapacity > 0 ? (totalCurrentStock / totalCapacity) * 100 : 0;

    const lowStockCount = alerts.filter(a => a.alertLevel === 'low').length;
    const criticalStockCount = alerts.filter(a => a.alertLevel === 'critical').length;
    const emptyStockCount = alerts.filter(a => a.alertLevel === 'empty').length;

    return {
      totalBeverages,
      activeBeverages,
      totalCapacity,
      totalCurrentStock,
      utilizationRate,
      lowStockCount,
      criticalStockCount,
      emptyStockCount
    };
  }
}

export const inventoryService = new InventoryService();
