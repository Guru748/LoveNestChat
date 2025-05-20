import { useState, useEffect, useCallback, useRef } from "react";
import { ref, push, onValue, update, get } from "firebase/database";
import { database } from "@/lib/firebase";
import { Message } from "@/types";
import { useToast } from "@/hooks/use-toast";

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const password = useRef<string | null>(sessionStorage.getItem("bearBooPassword"));
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  
  // Reference to the messages in Firebase
  const messagesRef = ref(database, "messages");
  const statusRef = ref(database, "status");
  const typingRef = ref(database, "typing");
  
  // Encrypt and decrypt functions
  const encrypt = useCallback((message: string): string => {
    if (!password.current) return "";
    return btoa(`${password.current}:${message}`);
  }, []);
  
  const decrypt = useCallback((encrypted: string): string | null => {
    try {
      if (!password.current) return null;
      const decoded = atob(encrypted);
      const parts = decoded.split(":");
      
      // If the message was encrypted with a different password, we can't decrypt it
      if (parts[0] !== password.current) {
        return "[encrypted message]";
      }
      
      return parts[1];
    } catch (error) {
      console.error("Decryption error:", error);
      return "[encrypted message]";
    }
  }, []);
  
  // Listen for messages from Firebase
  useEffect(() => {
    if (!password.current) return;
    
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const messagesData: Message[] = [];
      
      snapshot.forEach((childSnapshot) => {
        const key = childSnapshot.key;
        const encryptedText = childSnapshot.val();
        
        try {
          // Decrypt the message if possible
          const decryptedText = decrypt(encryptedText);
          
          if (decryptedText) {
            // Try to parse the JSON data
            const messageData = JSON.parse(decryptedText);
            messagesData.push({
              ...messageData,
              id: key,
            });
          }
        } catch (error) {
          console.error("Error processing message:", error);
        }
      });
      
      // Sort messages by timestamp
      messagesData.sort((a, b) => a.timestamp - b.timestamp);
      setMessages(messagesData);
      
      // Play sound for new message
      if (messagesData.length > 0 && messages.length > 0) {
        const lastMessage = messagesData[messagesData.length - 1];
        if (lastMessage.sender === "other" && lastMessage.id !== messages[messages.length - 1]?.id) {
          const audio = document.getElementById("message-received") as HTMLAudioElement;
          if (audio) audio.play().catch(() => {});
        }
      }
    });
    
    // Listen for typing indicator
    const typingUnsubscribe = onValue(typingRef, (snapshot) => {
      setIsTyping(snapshot.val() === true);
    });
    
    // Listen for online status
    const statusUnsubscribe = onValue(statusRef, (snapshot) => {
      setIsOnline(snapshot.val()?.online || false);
    });
    
    // Set online status
    update(statusRef, { online: true });
    
    // Set offline status on unmount
    return () => {
      unsubscribe();
      typingUnsubscribe();
      statusUnsubscribe();
      update(statusRef, { online: false });
    };
  }, [decrypt, messages]);
  
  // Update read status when messages are viewed
  useEffect(() => {
    if (messages.length > 0) {
      const unreadMessages = messages.filter(msg => msg.sender === "other" && !msg.read);
      
      unreadMessages.forEach(msg => {
        // Mark message as read
        if (msg.id) {
          const decryptedMsg = {
            ...msg,
            read: true
          };
          
          const encryptedMsg = encrypt(JSON.stringify(decryptedMsg));
          const messageRef = ref(database, `messages/${msg.id}`);
          update(messageRef, encryptedMsg);
        }
      });
    }
  }, [messages, encrypt]);
  
  // Send message function
  const sendMessage = useCallback((text: string) => {
    if (!text.trim() || !password.current) return;
    
    try {
      // Create message object
      const message: Message = {
        text,
        sender: "me",
        timestamp: Date.now(),
        read: false,
        encrypted: "" // Placeholder, will be set in the encrypted version
      };
      
      // Encrypt the message
      const encryptedMessage = encrypt(JSON.stringify(message));
      
      // Push to Firebase
      push(messagesRef, encryptedMessage);
      
      // Play sent sound
      const audio = document.getElementById("message-sent") as HTMLAudioElement;
      if (audio) audio.play().catch(() => {});
      
      // Randomly simulate a response after 2-4 seconds
      if (Math.random() > 0.5) {
        // Show typing indicator
        update(typingRef, { typing: true });
        
        const responseTime = 2000 + Math.random() * 2000;
        setTimeout(() => {
          // Stop typing indicator
          update(typingRef, { typing: false });
          
          // Random responses
          const responses = [
            "Aww, that's so sweet! 💓",
            "I miss you too, babe! 🥺",
            "You always know how to make me smile! 🥰",
            "Sending you all my love! 💕",
            "Can't wait to hug you for real! 🤗",
            "You're the best thing that's ever happened to me 💘"
          ];
          
          const response = responses[Math.floor(Math.random() * responses.length)];
          
          // Create response message
          const responseMessage: Message = {
            text: response,
            sender: "other",
            timestamp: Date.now(),
            read: true,
            encrypted: ""
          };
          
          // Encrypt and send response
          const encryptedResponse = encrypt(JSON.stringify(responseMessage));
          push(messagesRef, encryptedResponse);
        }, responseTime);
      }
      
      return true;
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Unable to send message. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  }, [encrypt, toast]);
  
  // Set typing indicator
  const setTyping = useCallback((isCurrentlyTyping: boolean) => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    update(typingRef, { typing: isCurrentlyTyping });
    
    if (isCurrentlyTyping) {
      // Auto clear typing indicator after 5 seconds
      typingTimeoutRef.current = setTimeout(() => {
        update(typingRef, { typing: false });
      }, 5000);
    }
  }, []);
  
  return {
    messages,
    sendMessage,
    isTyping,
    setTyping,
    isOnline
  };
}
