import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { orderService } from "./services/orderService";
import { inventoryService } from "./services/inventoryService";
import { hardwareService } from "./services/hardwareService";
import { insertBeverageSchema, insertOrderSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Setup WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('Admin client connected');
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        // Handle WebSocket messages if needed
      } catch (error) {
        console.error('Invalid WebSocket message:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('Admin client disconnected');
    });
  });

  // Broadcast to all connected WebSocket clients
  const broadcast = (data: any) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  };

  // Kiosk API endpoints
  app.get('/api/beverages', async (req, res) => {
    try {
      const beverages = await storage.getAllBeverages();
      const activeBeverages = beverages.filter(b => b.isActive);
      res.json(activeBeverages);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch beverages' });
    }
  });

  app.post('/api/orders', async (req, res) => {
    try {
      const orderData = req.body;
      const orderId = await orderService.createOrder(orderData);
      
      // Broadcast new order to admin clients
      broadcast({
        type: 'new_order',
        data: { orderId, ...orderData }
      });
      
      res.json({ orderId });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create order' });
    }
  });

  app.post('/api/orders/:id/process', async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      await orderService.processOrder(orderId);
      
      // Broadcast order completion to admin clients
      broadcast({
        type: 'order_completed',
        data: { orderId }
      });
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to process order' });
    }
  });

  app.get('/api/orders/:id/status', async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const status = await orderService.getOrderStatus(orderId);
      res.json({ status });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get order status' });
    }
  });

  app.post('/api/verify-age/face', async (req, res) => {
    try {
      // Mock age verification - in real implementation would use AI
      const isVerified = Math.random() > 0.1; // 90% success rate
      
      await storage.createSystemLog({
        level: 'info',
        message: 'Face age verification attempted',
        context: { result: isVerified ? 'success' : 'failed' }
      });
      
      res.json({ verified: isVerified });
    } catch (error) {
      res.status(500).json({ error: 'Age verification failed' });
    }
  });

  app.post('/api/verify-age/id', async (req, res) => {
    try {
      // Mock ID verification - in real implementation would use OCR
      const isVerified = Math.random() > 0.05; // 95% success rate
      
      await storage.createSystemLog({
        level: 'info',
        message: 'ID age verification attempted',
        context: { result: isVerified ? 'success' : 'failed' }
      });
      
      res.json({ verified: isVerified });
    } catch (error) {
      res.status(500).json({ error: 'ID verification failed' });
    }
  });

  app.get('/api/system/status', async (req, res) => {
    try {
      const hardwareStatus = hardwareService.getHardwareStatus();
      const dashboardStats = await storage.getDashboardStats();
      
      res.json({
        hardware: hardwareStatus,
        stats: dashboardStats,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get system status' });
    }
  });

  // Admin API endpoints
  app.get('/api/admin/dashboard', async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      const recentOrders = await storage.getAllOrders(10);
      const stockAlerts = await inventoryService.getStockAlerts();
      
      res.json({
        stats,
        recentOrders,
        stockAlerts
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
  });

  app.get('/api/admin/beverages', async (req, res) => {
    try {
      const beverages = await storage.getAllBeverages();
      res.json(beverages);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch beverages' });
    }
  });

  app.post('/api/admin/beverages', async (req, res) => {
    try {
      const beverageData = insertBeverageSchema.parse(req.body);
      const beverage = await storage.createBeverage(beverageData);
      
      broadcast({
        type: 'beverage_created',
        data: beverage
      });
      
      res.json(beverage);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create beverage' });
    }
  });

  app.put('/api/admin/beverages/:id', async (req, res) => {
    try {
      const id = req.params.id;
      const updates = req.body;
      const beverage = await storage.updateBeverage(id, updates);
      
      broadcast({
        type: 'beverage_updated',
        data: beverage
      });
      
      res.json(beverage);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update beverage' });
    }
  });

  app.delete('/api/admin/beverages/:id', async (req, res) => {
    try {
      const id = req.params.id;
      await storage.deleteBeverage(id);
      
      broadcast({
        type: 'beverage_deleted',
        data: { id }
      });
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete beverage' });
    }
  });

  app.get('/api/admin/orders', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const orders = await storage.getAllOrders(limit);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  });

  app.get('/api/admin/inventory', async (req, res) => {
    try {
      const report = await inventoryService.getInventoryReport();
      const alerts = await inventoryService.getStockAlerts();
      
      res.json({
        report,
        alerts
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch inventory data' });
    }
  });

  app.post('/api/admin/inventory/:id/replenish', async (req, res) => {
    try {
      const beverageId = req.params.id;
      const { amount, notes } = req.body;
      
      await inventoryService.replenishStock(beverageId, amount, notes);
      
      broadcast({
        type: 'stock_replenished',
        data: { beverageId, amount, notes }
      });
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to replenish stock' });
    }
  });

  app.post('/api/admin/inventory/:id/adjust', async (req, res) => {
    try {
      const beverageId = req.params.id;
      const { newStock, reason } = req.body;
      
      await inventoryService.adjustStock(beverageId, newStock, reason);
      
      broadcast({
        type: 'stock_adjusted',
        data: { beverageId, newStock, reason }
      });
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to adjust stock' });
    }
  });

  app.get('/api/admin/logs', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const logs = await storage.getSystemLogs(limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch logs' });
    }
  });

  app.get('/api/admin/inventory-logs/:beverageId?', async (req, res) => {
    try {
      const beverageId = req.params.beverageId;
      const limit = parseInt(req.query.limit as string) || 100;
      const logs = await storage.getInventoryLogs(beverageId, limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch inventory logs' });
    }
  });

  return httpServer;
}
