import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const beverages = pgTable("beverages", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  nameEn: text("name_en").notNull(),
  nameSk: text("name_sk").notNull(),
  description: text("description"),
  descriptionEn: text("description_en"),
  descriptionSk: text("description_sk"),
  pricePerLiter: decimal("price_per_liter", { precision: 10, scale: 2 }).notNull(),
  volumeOptions: jsonb("volume_options").$type<number[]>().notNull().default([0.3, 0.5]),
  imageUrl: text("image_url"),
  flowSensorPin: integer("flow_sensor_pin").notNull(),
  valvePin: integer("valve_pin").notNull(),
  totalCapacity: decimal("total_capacity", { precision: 10, scale: 2 }).notNull(),
  currentStock: decimal("current_stock", { precision: 10, scale: 2 }).notNull(),
  requiresAgeVerification: boolean("requires_age_verification").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  items: jsonb("items").$type<OrderItem[]>().notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  language: text("language").notNull(),
  ageVerificationMethod: text("age_verification_method"),
  paymentMethod: text("payment_method"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at")
});

export const systemLogs = pgTable("system_logs", {
  id: serial("id").primaryKey(),
  level: text("level").notNull(),
  message: text("message").notNull(),
  context: jsonb("context"),
  timestamp: timestamp("timestamp").defaultNow()
});

export const inventoryLogs = pgTable("inventory_logs", {
  id: serial("id").primaryKey(),
  beverageId: text("beverage_id").notNull(),
  changeType: text("change_type").notNull(), // 'refill', 'dispense', 'adjust'
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  previousStock: decimal("previous_stock", { precision: 10, scale: 2 }).notNull(),
  newStock: decimal("new_stock", { precision: 10, scale: 2 }).notNull(),
  orderId: integer("order_id"),
  notes: text("notes"),
  timestamp: timestamp("timestamp").defaultNow()
});

// Cup supply tracking for future hardware integration
export const cupInventory = pgTable("cup_inventory", {
  id: serial("id").primaryKey(),
  cupType: text("cup_type").notNull().default("standard"), // "standard", "large", etc.
  currentStock: integer("current_stock").notNull().default(0),
  minimumThreshold: integer("minimum_threshold").notNull().default(10),
  maxCapacity: integer("max_capacity").notNull().default(100),
  lastReplenished: timestamp("last_replenished").defaultNow(),
  isActive: boolean("is_active").default(true)
});

export const beverageRelations = relations(beverages, ({ many }) => ({
  inventoryLogs: many(inventoryLogs)
}));

export const orderRelations = relations(orders, ({ many }) => ({
  inventoryLogs: many(inventoryLogs)
}));

export const inventoryLogRelations = relations(inventoryLogs, ({ one }) => ({
  beverage: one(beverages, {
    fields: [inventoryLogs.beverageId],
    references: [beverages.id]
  }),
  order: one(orders, {
    fields: [inventoryLogs.orderId],
    references: [orders.id]
  })
}));

export interface OrderItem {
  beverageId: string;
  name: string;
  volume: number;
  pricePerLiter: number;
  subtotal: number;
}

export const insertBeverageSchema = createInsertSchema(beverages).omit({
  createdAt: true,
  updatedAt: true
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  completedAt: true
});

export const insertSystemLogSchema = createInsertSchema(systemLogs).omit({
  id: true,
  timestamp: true
});

export const insertInventoryLogSchema = createInsertSchema(inventoryLogs).omit({
  id: true,
  timestamp: true
});

export type Beverage = typeof beverages.$inferSelect;
export type InsertBeverage = z.infer<typeof insertBeverageSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type SystemLog = typeof systemLogs.$inferSelect;
export type InsertSystemLog = z.infer<typeof insertSystemLogSchema>;
export type InventoryLog = typeof inventoryLogs.$inferSelect;
export type InsertInventoryLog = z.infer<typeof insertInventoryLogSchema>;

export type InsertCupInventory = typeof cupInventory.$inferInsert;
export type CupInventory = typeof cupInventory.$inferSelect;
