import { 
  beverages, 
  orders, 
  systemLogs, 
  inventoryLogs,
  type Beverage, 
  type InsertBeverage,
  type Order,
  type InsertOrder,
  type SystemLog,
  type InsertSystemLog,
  type InventoryLog,
  type InsertInventoryLog
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, gte } from "drizzle-orm";

export interface IStorage {
  // Beverage operations
  getAllBeverages(): Promise<Beverage[]>;
  getBeverageById(id: string): Promise<Beverage | undefined>;
  createBeverage(beverage: InsertBeverage): Promise<Beverage>;
  updateBeverage(id: string, updates: Partial<InsertBeverage>): Promise<Beverage>;
  deleteBeverage(id: string): Promise<void>;
  
  // Order operations
  getAllOrders(limit?: number): Promise<Order[]>;
  getOrderById(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order>;
  
  // System log operations
  createSystemLog(log: InsertSystemLog): Promise<SystemLog>;
  getSystemLogs(limit?: number): Promise<SystemLog[]>;
  
  // Inventory operations
  createInventoryLog(log: InsertInventoryLog): Promise<InventoryLog>;
  getInventoryLogs(beverageId?: string, limit?: number): Promise<InventoryLog[]>;
  updateBeverageStock(beverageId: string, newStock: number, changeType: string, amount: number, orderId?: number, notes?: string): Promise<void>;
  
  // Analytics
  getDashboardStats(): Promise<{
    todayOrders: number;
    todayRevenue: number;
    lowStockItems: number;
    systemStatus: string;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getAllBeverages(): Promise<Beverage[]> {
    return await db.select().from(beverages).orderBy(beverages.name);
  }

  async getBeverageById(id: string): Promise<Beverage | undefined> {
    const [beverage] = await db.select().from(beverages).where(eq(beverages.id, id));
    return beverage;
  }

  async createBeverage(beverage: InsertBeverage): Promise<Beverage> {
    const [created] = await db.insert(beverages).values(beverage as any).returning();
    return created;
  }

  async updateBeverage(id: string, updates: Partial<InsertBeverage>): Promise<Beverage> {
    const [updated] = await db.update(beverages)
      .set(updates as any)
      .where(eq(beverages.id, id))
      .returning();
    return updated;
  }

  async deleteBeverage(id: string): Promise<void> {
    await db.delete(beverages).where(eq(beverages.id, id));
  }

  async getAllOrders(limit = 50): Promise<Order[]> {
    return await db.select().from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(limit);
  }

  async getOrderById(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [created] = await db.insert(orders).values(order as any).returning();
    return created;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const [updated] = await db.update(orders)
      .set({ 
        status,
        completedAt: status === 'completed' ? new Date() : null
      })
      .where(eq(orders.id, id))
      .returning();
    return updated;
  }

  async createSystemLog(log: InsertSystemLog): Promise<SystemLog> {
    const [created] = await db.insert(systemLogs).values(log).returning();
    return created;
  }

  async getSystemLogs(limit = 100): Promise<SystemLog[]> {
    return await db.select().from(systemLogs)
      .orderBy(desc(systemLogs.timestamp))
      .limit(limit);
  }

  async createInventoryLog(log: InsertInventoryLog): Promise<InventoryLog> {
    const [created] = await db.insert(inventoryLogs).values(log).returning();
    return created;
  }

  async getInventoryLogs(beverageId?: string, limit = 100): Promise<InventoryLog[]> {
    const query = db.select().from(inventoryLogs);
    
    if (beverageId) {
      query.where(eq(inventoryLogs.beverageId, beverageId));
    }
    
    return await query.orderBy(desc(inventoryLogs.timestamp)).limit(limit);
  }

  async updateBeverageStock(
    beverageId: string, 
    newStock: number, 
    changeType: string, 
    amount: number, 
    orderId?: number, 
    notes?: string
  ): Promise<void> {
    const beverage = await this.getBeverageById(beverageId);
    if (!beverage) throw new Error('Beverage not found');

    const previousStock = parseFloat(beverage.currentStock);
    
    // Update beverage stock
    await db.update(beverages)
      .set({ 
        currentStock: newStock.toString(),

      })
      .where(eq(beverages.id, beverageId));

    // Create inventory log
    await this.createInventoryLog({
      beverageId,
      changeType,
      amount: amount.toString(),
      previousStock: previousStock.toString(),
      newStock: newStock.toString(),
      orderId,
      notes
    });
  }

  async getDashboardStats(): Promise<{
    todayOrders: number;
    todayRevenue: number;
    lowStockItems: number;
    systemStatus: string;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get today's orders
    const todayOrdersResult = await db.select({
      count: sql<number>`count(*)`,
      revenue: sql<number>`sum(cast(total_amount as decimal))`
    }).from(orders).where(gte(orders.createdAt, today));

    // Get low stock items (less than 20% of capacity)
    const lowStockResult = await db.select({
      count: sql<number>`count(*)`
    }).from(beverages).where(
      and(
        beverages.isActive,
        sql`cast(current_stock as decimal) < cast(total_capacity as decimal) * 0.2`
      )
    );

    return {
      todayOrders: todayOrdersResult[0]?.count || 0,
      todayRevenue: todayOrdersResult[0]?.revenue || 0,
      lowStockItems: lowStockResult[0]?.count || 0,
      systemStatus: 'online'
    };
  }
}

export const storage = new DatabaseStorage();
