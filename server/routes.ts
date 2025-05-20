import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { WebSocketServer } from "ws";
import { WebSocket } from "ws";
import { z } from "zod";
import { insertUserSchema, insertChatRoomSchema, insertChatRoomMemberSchema } from "@shared/schema";

// Define API router types
interface ApiRequest<T> extends Request {
  body: T;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);
  
  // Create WebSocket server for real-time communication
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // User API endpoints
  app.post('/api/users', async (req: ApiRequest<any>, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      
      // If partner email is provided, try to establish connection
      if (userData.partnerEmail) {
        const partner = await storage.getUserByEmail(userData.partnerEmail);
        
        if (partner) {
          // Create chat room between users
          const chatRoom = await storage.createChatRoom({
            name: `${user.displayName || 'User'} & ${partner.displayName || 'Partner'}`
          });
          
          // Add both users to the chat room
          await storage.addMemberToChatRoom({
            userId: user.id,
            chatRoomId: chatRoom.id
          });
          
          await storage.addMemberToChatRoom({
            userId: partner.id,
            chatRoomId: chatRoom.id
          });
          
          // Update both users' partner connection status
          await storage.updateUser(user.id, {
            partnerConnected: true
          });
          
          await storage.updateUser(partner.id, {
            partnerConnected: true,
            partnerEmail: user.email
          });
        }
      }
      
      res.status(201).json({
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        partnerConnected: user.partnerConnected
      });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(400).json({ error: 'Invalid user data' });
    }
  });
  
  // Get user profile
  app.get('/api/users/:id', async (req: Request, res: Response) => {
    try {
      const userId = req.params.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json({
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        partnerConnected: user.partnerConnected
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  // Update user profile
  app.patch('/api/users/:id', async (req: ApiRequest<any>, res: Response) => {
    try {
      const userId = req.params.id;
      const updates = req.body;
      
      const user = await storage.updateUser(userId, updates);
      
      res.json({
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        partnerConnected: user.partnerConnected
      });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  // Handle theme preferences
  app.post('/api/users/:id/theme', async (req: ApiRequest<any>, res: Response) => {
    try {
      const userId = req.params.id;
      const { themeName, themeClass } = req.body;
      
      const theme = await storage.updateTheme({
        userId,
        themeName,
        themeClass
      });
      
      res.json(theme);
    } catch (error) {
      console.error('Error updating theme:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  // Get user's theme
  app.get('/api/users/:id/theme', async (req: Request, res: Response) => {
    try {
      const userId = req.params.id;
      const theme = await storage.getTheme(userId);
      
      if (!theme) {
        return res.status(404).json({ error: 'Theme not found' });
      }
      
      res.json(theme);
    } catch (error) {
      console.error('Error fetching theme:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  // WebSocket server for real-time updates
  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
    
    // Send welcome message
    ws.send(JSON.stringify({
      type: 'connected',
      message: 'Connected to BearBooLetters WebSocket server'
    }));
    
    // Listen for messages from clients
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle different message types
        switch (data.type) {
          case 'message':
            // Broadcast message to all clients
            wss.clients.forEach((client) => {
              if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(data));
              }
            });
            break;
            
          case 'typing':
            // Broadcast typing status
            wss.clients.forEach((client) => {
              if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                  type: 'typing',
                  userId: data.userId,
                  isTyping: data.isTyping
                }));
              }
            });
            break;
            
          case 'online':
            // Broadcast online status
            wss.clients.forEach((client) => {
              if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                  type: 'online',
                  userId: data.userId,
                  isOnline: data.isOnline
                }));
              }
            });
            break;
            
          default:
            console.log('Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });
    
    // Handle WebSocket connection close
    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
    });
  });

  return httpServer;
}
