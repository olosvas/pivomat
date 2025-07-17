import { storage } from "../storage";
import { hardwareService } from "./hardwareService";
import { InsertOrder, OrderItem } from "@shared/schema";

export interface OrderRequest {
  items: OrderItem[];
  language: string;
  ageVerificationMethod?: string;
  paymentMethod?: string;
}

export class OrderService {
  async createOrder(orderRequest: OrderRequest): Promise<number> {
    const orderNumber = this.generateOrderNumber();
    const totalAmount = orderRequest.items.reduce((sum, item) => sum + item.subtotal, 0);
    
    const order: InsertOrder = {
      orderNumber,
      items: orderRequest.items,
      totalAmount: totalAmount.toString(),
      language: orderRequest.language,
      ageVerificationMethod: orderRequest.ageVerificationMethod,
      paymentMethod: orderRequest.paymentMethod,
      status: 'pending'
    };

    const createdOrder = await storage.createOrder(order);
    
    // Log order creation
    await storage.createSystemLog({
      level: 'info',
      message: `Order ${orderNumber} created`,
      context: { 
        orderId: createdOrder.id,
        items: orderRequest.items.length,
        total: totalAmount,
        language: orderRequest.language
      }
    });

    return createdOrder.id;
  }

  async processOrder(orderId: number): Promise<void> {
    const order = await storage.getOrderById(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    if (order.status !== 'pending') {
      throw new Error(`Order ${orderId} is not pending`);
    }

    try {
      // Update order status to processing
      await storage.updateOrderStatus(orderId, 'processing');
      
      // Process each item
      for (const item of order.items) {
        await this.dispenseItem(item, orderId);
      }
      
      // Update order status to completed
      await storage.updateOrderStatus(orderId, 'completed');
      
      // Log completion
      await storage.createSystemLog({
        level: 'info',
        message: `Order ${order.orderNumber} completed`,
        context: { 
          orderId,
          items: order.items.length,
          total: order.totalAmount
        }
      });
      
    } catch (error) {
      // Update order status to failed
      await storage.updateOrderStatus(orderId, 'failed');
      
      // Log error
      await storage.createSystemLog({
        level: 'error',
        message: `Order ${order.orderNumber} failed`,
        context: { 
          orderId,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
      
      throw error;
    }
  }

  private async dispenseItem(item: OrderItem, orderId: number): Promise<void> {
    try {
      await hardwareService.dispenseVolume(item.beverageId, item.volume);
      
      // Log successful dispensing
      await storage.createSystemLog({
        level: 'info',
        message: `Dispensed ${item.volume}L of ${item.name}`,
        context: { 
          orderId,
          beverageId: item.beverageId,
          volume: item.volume
        }
      });
      
    } catch (error) {
      // Log dispensing error
      await storage.createSystemLog({
        level: 'error',
        message: `Failed to dispense ${item.name}`,
        context: { 
          orderId,
          beverageId: item.beverageId,
          volume: item.volume,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
      
      throw error;
    }
  }

  private generateOrderNumber(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `${timestamp}${random}`.toUpperCase();
  }

  async getOrderStatus(orderId: number): Promise<string> {
    const order = await storage.getOrderById(orderId);
    return order?.status || 'not_found';
  }
}

export const orderService = new OrderService();
