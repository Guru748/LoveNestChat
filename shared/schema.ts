import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table definition
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Messages table definition
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  sender_id: integer("sender_id").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  read: boolean("read").default(false).notNull(),
  encrypted: text("encrypted").notNull(),
});

// Status table for online/offline/typing indicators
export const statuses = pgTable("statuses", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  online: boolean("online").default(false).notNull(),
  last_seen: timestamp("last_seen").defaultNow().notNull(),
  typing: boolean("typing").default(false).notNull(),
});

// Themes table for user theme preferences
export const themes = pgTable("themes", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  theme_name: text("theme_name").notNull(),
  theme_class: text("theme_class").notNull(),
});

// Schema definitions for insertion
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  content: true,
  sender_id: true,
  encrypted: true,
});

export const insertStatusSchema = createInsertSchema(statuses).pick({
  user_id: true,
  online: true,
  typing: true,
});

export const insertThemeSchema = createInsertSchema(themes).pick({
  user_id: true,
  theme_name: true,
  theme_class: true,
});

// Type definitions for insertion and selection
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export type InsertStatus = z.infer<typeof insertStatusSchema>;
export type Status = typeof statuses.$inferSelect;

export type InsertTheme = z.infer<typeof insertThemeSchema>;
export type Theme = typeof themes.$inferSelect;
