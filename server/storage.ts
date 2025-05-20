import { eq, and, sql } from "drizzle-orm";
import { 
  users, 
  messages, 
  statuses, 
  themes, 
  chatRooms, 
  chatRoomMembers,
  type User, 
  type InsertUser,
  type Message,
  type InsertMessage,
  type Status,
  type InsertStatus,
  type Theme,
  type InsertTheme,
  type ChatRoom,
  type InsertChatRoom,
  type ChatRoomMember,
  type InsertChatRoomMember
} from "@shared/schema";
import { db } from "./db";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<InsertUser>): Promise<User>;
  
  // Chat room methods
  createChatRoom(data: InsertChatRoom): Promise<ChatRoom>;
  getChatRoom(id: number): Promise<ChatRoom | undefined>;
  getChatRoomByMembers(userId1: string, userId2: string): Promise<ChatRoom | undefined>;
  addMemberToChatRoom(data: InsertChatRoomMember): Promise<ChatRoomMember>;
  getChatRoomMembers(chatRoomId: number): Promise<User[]>;
  
  // Message methods
  createMessage(message: InsertMessage): Promise<Message>;
  getMessages(chatRoomId: number, limit: number): Promise<Message[]>;
  markMessageAsRead(id: number): Promise<void>;
  
  // Status methods
  updateStatus(data: InsertStatus): Promise<Status>;
  getStatus(userId: string): Promise<Status | undefined>;
  
  // Theme methods
  updateTheme(data: InsertTheme): Promise<Theme>;
  getTheme(userId: string): Promise<Theme | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  
  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }
  
  async updateUser(id: string, data: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...data })
      .where(eq(users.id, id))
      .returning();
    return user;
  }
  
  // Chat room methods
  async createChatRoom(data: InsertChatRoom): Promise<ChatRoom> {
    const [chatRoom] = await db.insert(chatRooms).values(data).returning();
    return chatRoom;
  }
  
  async getChatRoom(id: number): Promise<ChatRoom | undefined> {
    const [room] = await db.select().from(chatRooms).where(eq(chatRooms.id, id));
    return room;
  }
  
  async getChatRoomByMembers(userId1: string, userId2: string): Promise<ChatRoom | undefined> {
    // Find a chat room where both users are members
    const result = await db.execute(sql`
      SELECT cr.* FROM chat_rooms cr
      JOIN chat_room_members crm1 ON cr.id = crm1.chat_room_id
      JOIN chat_room_members crm2 ON cr.id = crm2.chat_room_id
      WHERE crm1.user_id = ${userId1} AND crm2.user_id = ${userId2}
      LIMIT 1
    `);
    
    if (result.rows.length > 0) {
      return result.rows[0] as ChatRoom;
    }
    return undefined;
  }
  
  async addMemberToChatRoom(data: InsertChatRoomMember): Promise<ChatRoomMember> {
    const [member] = await db.insert(chatRoomMembers).values(data).returning();
    return member;
  }
  
  async getChatRoomMembers(chatRoomId: number): Promise<User[]> {
    const result = await db.execute(sql`
      SELECT u.* FROM users u
      JOIN chat_room_members crm ON u.id = crm.user_id
      WHERE crm.chat_room_id = ${chatRoomId}
    `);
    
    return result.rows as User[];
  }
  
  // Message methods
  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }
  
  async getMessages(chatRoomId: number, limit: number = 50): Promise<Message[]> {
    const msgs = await db.select()
      .from(messages)
      .where(eq(messages.chatRoomId, chatRoomId))
      .orderBy(messages.timestamp)
      .limit(limit);
    return msgs;
  }
  
  async markMessageAsRead(id: number): Promise<void> {
    await db.update(messages)
      .set({ read: true, readAt: new Date() })
      .where(eq(messages.id, id));
  }
  
  // Status methods
  async updateStatus(data: InsertStatus): Promise<Status> {
    // Upsert - insert if not exists, update if exists
    const [status] = await db
      .insert(statuses)
      .values(data)
      .onConflictDoUpdate({
        target: statuses.userId,
        set: {
          online: data.online,
          typing: data.typing,
          lastSeen: new Date(),
          chatRoomId: data.chatRoomId,
        }
      })
      .returning();
    return status;
  }
  
  async getStatus(userId: string): Promise<Status | undefined> {
    const [status] = await db.select().from(statuses).where(eq(statuses.userId, userId));
    return status;
  }
  
  // Theme methods
  async updateTheme(data: InsertTheme): Promise<Theme> {
    // Upsert - insert if not exists, update if exists
    const [theme] = await db
      .insert(themes)
      .values(data)
      .onConflictDoUpdate({
        target: themes.userId,
        set: {
          themeName: data.themeName,
          themeClass: data.themeClass,
        }
      })
      .returning();
    return theme;
  }
  
  async getTheme(userId: string): Promise<Theme | undefined> {
    const [theme] = await db.select().from(themes).where(eq(themes.userId, userId));
    return theme;
  }
}

export const storage = new DatabaseStorage();
