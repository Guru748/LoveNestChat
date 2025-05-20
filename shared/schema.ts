import { pgTable, text, serial, varchar, integer, boolean, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table definition
export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  email: varchar("email").notNull().unique(),
  displayName: varchar("display_name"),
  photoURL: varchar("photo_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  partnerEmail: varchar("partner_email"),
  partnerConnected: boolean("partner_connected").default(false),
});

// Chat room table definition
export const chatRooms = pgTable("chat_rooms", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  name: varchar("name"),
});

// Chat room members junction table
export const chatRoomMembers = pgTable("chat_room_members", {
  userId: varchar("user_id").notNull().references(() => users.id),
  chatRoomId: integer("chat_room_id").notNull().references(() => chatRooms.id),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
}, (table) => ({
  pk: primaryKey(table.userId, table.chatRoomId),
}));

// Messages table definition
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  encrypted: text("encrypted").notNull(),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  chatRoomId: integer("chat_room_id").notNull().references(() => chatRooms.id),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  read: boolean("read").default(false).notNull(),
  readAt: timestamp("read_at"),
});

// Status table for online/offline/typing indicators
export const statuses = pgTable("statuses", {
  userId: varchar("user_id").primaryKey().references(() => users.id),
  online: boolean("online").default(false).notNull(),
  lastSeen: timestamp("last_seen").defaultNow().notNull(),
  typing: boolean("typing").default(false).notNull(),
  chatRoomId: integer("chat_room_id").references(() => chatRooms.id),
});

// Themes table for user theme preferences
export const themes = pgTable("themes", {
  userId: varchar("user_id").primaryKey().references(() => users.id),
  themeName: varchar("theme_name").notNull(),
  themeClass: varchar("theme_class").notNull(),
});

// Sessions table for auth
export const sessions = pgTable("sessions", {
  sid: varchar("sid").primaryKey(),
  sess: text("sess").notNull(),
  expire: timestamp("expire", { mode: "date" }).notNull(),
});

// Schema definitions for insertion
export const insertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  displayName: true,
  photoURL: true,
  partnerEmail: true,
});

export const insertChatRoomSchema = createInsertSchema(chatRooms).pick({
  name: true,
});

export const insertChatRoomMemberSchema = createInsertSchema(chatRoomMembers).pick({
  userId: true,
  chatRoomId: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  content: true,
  encrypted: true,
  senderId: true,
  chatRoomId: true,
});

export const insertStatusSchema = createInsertSchema(statuses).pick({
  userId: true,
  online: true,
  typing: true,
  chatRoomId: true,
});

export const insertThemeSchema = createInsertSchema(themes).pick({
  userId: true,
  themeName: true,
  themeClass: true,
});

// Type definitions for insertion and selection
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertChatRoom = z.infer<typeof insertChatRoomSchema>;
export type ChatRoom = typeof chatRooms.$inferSelect;

export type InsertChatRoomMember = z.infer<typeof insertChatRoomMemberSchema>;
export type ChatRoomMember = typeof chatRoomMembers.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export type InsertStatus = z.infer<typeof insertStatusSchema>;
export type Status = typeof statuses.$inferSelect;

export type InsertTheme = z.infer<typeof insertThemeSchema>;
export type Theme = typeof themes.$inferSelect;
