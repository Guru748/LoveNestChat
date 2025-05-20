import { useState, useEffect, useCallback, useRef } from "react";
import { ref, onValue, push, set, update, get, onDisconnect } from "firebase/database";
import { database, auth, encryptMessage, decryptMessage } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Message } from "@/types";

export function useChatRoom() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isPartnerOnline, setIsPartnerOnline] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const chatPassword = useRef<string | null>(sessionStorage.getItem("bearBooPassword"));
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Chat room - for now, we'll use a default room
  // In a more advanced implementation, we would create rooms based on user pairs
  const chatRoomId = "default-love-room";
  
  // References to Firebase paths
  const messagesRef = ref(database, `rooms/${chatRoomId}/messages`);
  const typingRef = ref(database, `rooms/${chatRoomId}/typing/${user?.uid}`);
  const onlineRef = ref(database, `rooms/${chatRoomId}/online/${user?.uid}`);
  
  // Handle sending messages
  const sendMessage = useCallback((text: string) => {
    if (!text.trim() || !user || !chatPassword.current) return false;
    
    try {
      // Create message object
      const message: Message = {
        text,
        sender: "me",
        timestamp: Date.now(),
        read: false,
        encrypted: ""
      };
      
      // Encrypt the message content with the shared secret password
      const encryptedContent = encryptMessage(JSON.stringify(message), chatPassword.current);
      
      // Create a new message in Firebase
      const newMessageRef = push(messagesRef);
      set(newMessageRef, {
        encryptedData: encryptedContent,
        senderId: user.uid,
        timestamp: message.timestamp,
        read: false
      });
      
      // Play send sound
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
  }, [user, messagesRef, toast]);
  
  // Handle typing indicator
  const updateTypingStatus = useCallback((isCurrentlyTyping: boolean) => {
    if (!user) return;
    
    // Clear previous timeout if it exists
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Update typing status in Firebase
    update(typingRef, { isTyping: isCurrentlyTyping });
    
    // If currently typing, set a timeout to automatically clear the typing indicator
    if (isCurrentlyTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        update(typingRef, { isTyping: false });
      }, 5000);
    }
  }, [user, typingRef]);
  
  // Handle input change
  const handleInputChange = useCallback((value: string) => {
    setMessageInput(value);
    
    // Update typing status based on input
    updateTypingStatus(value.trim().length > 0);
  }, [updateTypingStatus]);
  
  // Listen to messages, typing status, and online status
  useEffect(() => {
    if (!user || !chatPassword.current) return;
    
    // Set online status when component mounts
    update(onlineRef, { isOnline: true });
    
    // Set up disconnect handler to update offline status when user disconnects
    onDisconnect(onlineRef).update({ isOnline: false });
    
    // Listen for new messages
    const unsubscribeMessages = onValue(messagesRef, (snapshot) => {
      const messageList: Message[] = [];
      
      snapshot.forEach((childSnapshot) => {
        const messageData = childSnapshot.val();
        
        try {
          // Only decrypt messages
          if (messageData.encryptedData) {
            const decryptedContent = decryptMessage(messageData.encryptedData, chatPassword.current!);
            
            if (decryptedContent && decryptedContent !== "[encrypted message]") {
              const parsedMessage = JSON.parse(decryptedContent) as Message;
              
              // Determine if the message is from current user or partner
              const isMine = messageData.senderId === user.uid;
              
              messageList.push({
                ...parsedMessage,
                id: childSnapshot.key,
                sender: isMine ? "me" : "other"
              });
            } else {
              // Handle messages that can't be decrypted
              messageList.push({
                id: childSnapshot.key,
                text: "[Encrypted message - Use correct password to view]",
                sender: "other",
                timestamp: messageData.timestamp,
                read: false,
                encrypted: messageData.encryptedData
              });
            }
          }
        } catch (error) {
          console.error("Error decrypting message:", error);
        }
      });
      
      // Sort messages by timestamp
      messageList.sort((a, b) => a.timestamp - b.timestamp);
      setMessages(messageList);
      
      // Play notification sound for new messages
      if (messageList.length > 0 && messages.length > 0) {
        const lastMessage = messageList[messageList.length - 1];
        if (
          lastMessage.sender === "other" && 
          (messages.length === 0 || lastMessage.id !== messages[messages.length - 1]?.id)
        ) {
          const audio = document.getElementById("message-received") as HTMLAudioElement;
          if (audio) audio.play().catch(() => {});
        }
      }
      
      // Mark messages as read
      messageList.forEach(msg => {
        if (msg.sender === "other" && !msg.read && msg.id) {
          update(ref(database, `rooms/${chatRoomId}/messages/${msg.id}`), { read: true });
        }
      });
    });
    
    // Listen for partner's typing status
    const partnerTypingRef = ref(database, `rooms/${chatRoomId}/typing`);
    const unsubscribeTyping = onValue(partnerTypingRef, (snapshot) => {
      const typingData = snapshot.val() || {};
      const userIds = Object.keys(typingData);
      
      // Check if any other user is typing (not the current user)
      const someoneElseTyping = userIds.some(id => 
        id !== user.uid && typingData[id]?.isTyping === true
      );
      
      setIsTyping(someoneElseTyping);
    });
    
    // Listen for partner's online status
    const onlineStatusRef = ref(database, `rooms/${chatRoomId}/online`);
    const unsubscribeOnline = onValue(onlineStatusRef, (snapshot) => {
      const onlineData = snapshot.val() || {};
      const userIds = Object.keys(onlineData);
      
      // Check if any other user is online (not the current user)
      const someoneElseOnline = userIds.some(id => 
        id !== user.uid && onlineData[id]?.isOnline === true
      );
      
      setIsPartnerOnline(someoneElseOnline);
    });
    
    // Clean up listeners when component unmounts
    return () => {
      unsubscribeMessages();
      unsubscribeTyping();
      unsubscribeOnline();
      
      // Update user's online status to false when leaving
      update(onlineRef, { isOnline: false });
    };
  }, [user, messagesRef]);
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
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