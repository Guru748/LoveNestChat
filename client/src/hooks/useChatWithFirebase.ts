import { useState, useEffect, useRef, useCallback } from "react";
import { ref, onValue, push, set, update, get, onDisconnect } from "firebase/database";
import { database } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Message } from "@/types";
import { useToast } from "@/hooks/use-toast";

export function useChatWithFirebase() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isPartnerOnline, setIsPartnerOnline] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const chatPassword = useRef<string | null>(sessionStorage.getItem("bearBooPassword"));
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Chat room ID
  const chatRoomId = "bearboo-default-room";
  
  // Function to encrypt message
  const encryptMessage = useCallback((text: string): string => {
    if (!chatPassword.current) return "";
    try {
      return btoa(`${chatPassword.current}:${text}`);
    } catch (error) {
      console.error("Encryption error:", error);
      return "";
    }
  }, []);
  
  // Function to decrypt message
  const decryptMessage = useCallback((encrypted: string): string | null => {
    if (!chatPassword.current) return null;
    try {
      const decoded = atob(encrypted);
      const parts = decoded.split(":");
      
      // If the message was encrypted with a different password
      if (parts[0] !== chatPassword.current) {
        return "[encrypted message]";
      }
      
      return parts[1];
    } catch (error) {
      console.error("Decryption error:", error);
      return "[corrupted message]";
    }
  }, []);
  
  // References to Firebase paths
  const messagesRef = ref(database, `rooms/${chatRoomId}/messages`);
  const userTypingRef = currentUser ? ref(database, `rooms/${chatRoomId}/typing/${currentUser.uid}`) : null;
  const userOnlineRef = currentUser ? ref(database, `rooms/${chatRoomId}/online/${currentUser.uid}`) : null;
  
  // Send a message
  const sendMessage = useCallback((text: string) => {
    if (!text.trim() || !currentUser || !chatPassword.current) return false;
    
    try {
      // Create message object
      const message: Message = {
        text: text,
        sender: "me",
        timestamp: Date.now(),
        read: false,
        encrypted: ""
      };
      
      // Encrypt the message
      const encryptedText = encryptMessage(JSON.stringify(message));
      
      // Push to Firebase
      const newMessageRef = push(messagesRef);
      set(newMessageRef, {
        senderUid: currentUser.uid,
        senderName: currentUser.displayName || "User",
        encrypted: encryptedText,
        timestamp: message.timestamp
      });
      
      // Play sent sound
      const audio = document.getElementById("message-sent") as HTMLAudioElement;
      if (audio) audio.play().catch(() => {});
      
      return true;
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Failed to send",
        description: "Your message couldn't be sent. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  }, [currentUser, messagesRef, encryptMessage, toast]);
  
  // Update typing status
  const updateTypingStatus = useCallback((isCurrentlyTyping: boolean) => {
    if (!currentUser || !userTypingRef) return;
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Update typing status in Firebase
    update(userTypingRef, { 
      isTyping: isCurrentlyTyping,
      timestamp: Date.now(),
      displayName: currentUser.displayName || "User"
    });
    
    // Auto clear typing status after 5 seconds
    if (isCurrentlyTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        if (userTypingRef) {
          update(userTypingRef, { isTyping: false });
        }
      }, 5000);
    }
  }, [currentUser, userTypingRef]);
  
  // Handle message input changes
  const handleInputChange = useCallback((value: string) => {
    setMessageInput(value);
    updateTypingStatus(value.trim().length > 0);
  }, [updateTypingStatus]);
  
  // Listen for messages and status updates
  useEffect(() => {
    if (!currentUser || !chatPassword.current) return;
    
    // Set online status when connected
    if (userOnlineRef) {
      update(userOnlineRef, { 
        online: true,
        timestamp: Date.now(),
        displayName: currentUser.displayName || "User"
      });
      
      // Set offline when disconnected
      onDisconnect(userOnlineRef).update({ 
        online: false,
        timestamp: Date.now()
      });
    }
    
    // Listen for messages
    const unsubscribeMessages = onValue(messagesRef, (snapshot) => {
      const messageList: Message[] = [];
      
      snapshot.forEach((childSnapshot) => {
        const data = childSnapshot.val();
        const messageId = childSnapshot.key;
        
        try {
          // Check if this is our message or someone else's
          const isMine = data.senderUid === currentUser.uid;
          
          // Try to decrypt
          if (data.encrypted) {
            const decrypted = decryptMessage(data.encrypted);
            
            if (decrypted && decrypted !== "[encrypted message]" && decrypted !== "[corrupted message]") {
              // Parse the decrypted message
              try {
                const parsedMessage = JSON.parse(decrypted) as Message;
                messageList.push({
                  ...parsedMessage,
                  id: messageId,
                  sender: isMine ? "me" : "other",
                  timestamp: data.timestamp || Date.now()
                });
              } catch (parseError) {
                // If JSON parsing fails, just use the decrypted text
                messageList.push({
                  id: messageId,
                  text: decrypted,
                  sender: isMine ? "me" : "other",
                  timestamp: data.timestamp || Date.now(),
                  read: false,
                  encrypted: data.encrypted
                });
              }
            } else {
              // Show a placeholder for messages we can't decrypt
              messageList.push({
                id: messageId,
                text: "[encrypted message - use same password to view]",
                sender: isMine ? "me" : "other",
                timestamp: data.timestamp || Date.now(),
                read: false,
                encrypted: data.encrypted
              });
            }
          }
        } catch (error) {
          console.error("Error processing message:", error);
        }
      });
      
      // Sort by timestamp
      messageList.sort((a, b) => a.timestamp - b.timestamp);
      setMessages(messageList);
      
      // Play sound for new messages from others
      const latestMessage = messageList[messageList.length - 1];
      if (latestMessage && latestMessage.sender === "other" && 
          (!messages.length || latestMessage.id !== messages[messages.length - 1]?.id)) {
        const audio = document.getElementById("message-received") as HTMLAudioElement;
        if (audio) audio.play().catch(() => {});
      }
    });
    
    // Listen for typing status
    const typingRef = ref(database, `rooms/${chatRoomId}/typing`);
    const unsubscribeTyping = onValue(typingRef, (snapshot) => {
      const data = snapshot.val() || {};
      
      // Check if anyone but current user is typing
      const someoneElseTyping = Object.entries(data).some(([uid, status]: [string, any]) => 
        uid !== currentUser.uid && status.isTyping === true
      );
      
      setIsTyping(someoneElseTyping);
    });
    
    // Listen for online status
    const onlineRef = ref(database, `rooms/${chatRoomId}/online`);
    const unsubscribeOnline = onValue(onlineRef, (snapshot) => {
      const data = snapshot.val() || {};
      
      // Check if anyone but current user is online
      const someoneElseOnline = Object.entries(data).some(([uid, status]: [string, any]) => 
        uid !== currentUser.uid && status.online === true
      );
      
      setIsPartnerOnline(someoneElseOnline);
    });
    
    // Cleanup listeners
    return () => {
      unsubscribeMessages();
      unsubscribeTyping();
      unsubscribeOnline();
      
      // Set offline status
      if (userOnlineRef) {
        update(userOnlineRef, { online: false, timestamp: Date.now() });
      }
    };
  }, [currentUser, messagesRef, decryptMessage, messages]);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  return {
    messages,
    isTyping,
    isPartnerOnline,
    messageInput,
    setMessageInput: handleInputChange,
    sendMessage,
    messagesEndRef
  };
}