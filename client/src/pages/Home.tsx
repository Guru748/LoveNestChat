import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { 
  database, 
  encryptMessage, 
  decryptMessage 
} from "@/lib/firebase";
import { ref, onValue, push, serverTimestamp } from "firebase/database";
import { 
  FaSmile, 
  FaSignOutAlt, 
  FaPaperPlane,
  FaPalette
} from "react-icons/fa";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Theme options for the chat
const themes = [
  { name: "Pink Love", class: "theme-pink", color: "#f472b6" },
  { name: "Blue Ocean", class: "theme-blue", color: "#3b82f6" },
  { name: "Purple Dream", class: "theme-purple", color: "#8b5cf6" },
  { name: "Green Nature", class: "theme-green", color: "#10b981" },
  { name: "Orange Sunset", class: "theme-orange", color: "#f97316" },
];

const Home = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem("bearBooTheme") || "theme-pink";
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { currentUser, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Get encryption password from session storage
  const encryptionPassword = sessionStorage.getItem("bearBooPassword") || "";
  
  // Handle logout
  const handleLogout = async () => {
    sessionStorage.removeItem("bearBooPassword");
    const success = await logout();
    if (success) {
      setLocation("/");
    }
  };
  
  // Listen for messages from Firebase
  useEffect(() => {
    if (!currentUser || !encryptionPassword) {
      setLocation("/");
      return;
    }
    
    const messagesRef = ref(database, 'bearboo-messages');
    
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const messageList: any[] = [];
      
      snapshot.forEach((childSnapshot) => {
        const messageData = childSnapshot.val();
        
        // If message is encrypted
        if (messageData && messageData.encrypted) {
          try {
            const decryptedText = decryptMessage(messageData.encrypted, encryptionPassword);
            
            if (decryptedText && decryptedText !== "[encrypted message]") {
              messageList.push({
                id: childSnapshot.key,
                ...messageData,
                text: decryptedText,
                isEncrypted: false
              });
            } else {
              // Message was encrypted with a different password
              messageList.push({
                id: childSnapshot.key,
                ...messageData,
                text: "[encrypted message]",
                isEncrypted: true
              });
            }
          } catch (error) {
            console.error("Error decrypting message:", error);
          }
        }
      });
      
      // Sort messages by timestamp
      messageList.sort((a, b) => a.timestamp - b.timestamp);
      setMessages(messageList);
    });
    
    // Clean up subscription
    return () => unsubscribe();
  }, [currentUser, encryptionPassword, setLocation]);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  
  // Set theme
  useEffect(() => {
    document.body.className = currentTheme;
    localStorage.setItem("bearBooTheme", currentTheme);
  }, [currentTheme]);
  
  // Send message
  const handleSendMessage = () => {
    if (!message.trim() || !currentUser) return;
    
    try {
      // Encrypt the message
      const encrypted = encryptMessage(message, encryptionPassword);
      
      // Push to Firebase
      const messagesRef = ref(database, 'bearboo-messages');
      push(messagesRef, {
        userId: currentUser.uid,
        displayName: currentUser.displayName || 'Anonymous',
        encrypted,
        timestamp: Date.now(),
        read: false
      });
      
      // Clear input
      setMessage("");
      
      // Close emoji picker if open
      if (showEmojiPicker) {
        setShowEmojiPicker(false);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Failed to send",
        description: "Your message couldn't be sent. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Add emoji to message
  const addEmoji = (emoji: string) => {
    setMessage((prev) => prev + emoji);
  };
  
  // Select theme
  const selectTheme = (themeClass: string) => {
    setCurrentTheme(themeClass);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-r from-pink-100 to-pink-50">
      <div className="h-[calc(100vh-2rem)] max-h-[700px] w-full max-w-md flex flex-col relative overflow-hidden bg-white rounded-3xl shadow-xl">
        {/* Chat Header */}
        <div className="bg-pink-500 text-white py-4 px-6 flex justify-between items-center rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center">
              <span className="text-xl">🐻</span>
            </div>
            <div>
              <div className="font-semibold">BearBooLetters</div>
              <div className="text-xs">End-to-end encrypted messages</div>
            </div>
          </div>
          
          <div className="flex gap-2">
            {/* Theme selector */}
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white hover:text-pink-200 transition-colors"
                >
                  <FaPalette />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3" side="bottom" align="end">
                <div className="space-y-2">
                  <h3 className="font-medium text-sm">Choose Theme</h3>
                  <div className="grid grid-cols-5 gap-2">
                    {themes.map((theme) => (
                      <button
                        key={theme.class}
                        className={`w-8 h-8 rounded-full border-2 ${
                          currentTheme === theme.class 
                            ? "border-gray-900" 
                            : "border-gray-200"
                        }`}
                        style={{ backgroundColor: theme.color }}
                        onClick={() => selectTheme(theme.class)}
                        title={theme.name}
                      />
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
            {/* Logout button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:text-pink-200 transition-colors"
              onClick={handleLogout}
            >
              <FaSignOutAlt />
            </Button>
          </div>
        </div>

        {/* Chat Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-pink-50 to-white">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500">
              <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center mb-4">
                <span className="text-3xl">💘</span>
              </div>
              <h3 className="font-semibold text-lg text-pink-500">No messages yet</h3>
              <p className="mt-2">
                Send your first message to start your loving conversation!
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.userId === currentUser?.uid ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-3 ${
                    msg.userId === currentUser?.uid
                      ? "bg-pink-500 text-white"
                      : "bg-white text-gray-800 border border-pink-100"
                  }`}
                >
                  {msg.userId !== currentUser?.uid && (
                    <div className="font-medium text-xs mb-1 text-pink-400">
                      {msg.displayName}
                    </div>
                  )}
                  <p>{msg.text}</p>
                  <div
                    className={`text-xs opacity-70 mt-1 ${
                      msg.userId === currentUser?.uid ? "text-right" : ""
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))
          )}
          
          {/* Auto-scroll reference */}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 bg-white border-t border-pink-100">
          <div className="flex items-end gap-2">
            {/* Emoji picker */}
            <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
              <PopoverTrigger asChild>
                <Button 
                  type="button" 
                  size="icon" 
                  variant="ghost"
                  className="text-pink-500 hover:text-pink-600 transition-colors"
                >
                  <FaSmile />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64" side="top">
                <div className="grid grid-cols-8 gap-2">
                  {["❤️", "💖", "💕", "💓", "💗", "💝", "💘", "😍", 
                    "🥰", "😘", "😚", "😊", "🐻", "🧸", "🌹", "🌷",
                    "🌸", "🌈", "✨", "💫", "⭐", "🔥", "💯", "💦"].map((emoji) => (
                    <button
                      key={emoji}
                      className="w-8 h-8 flex items-center justify-center text-xl hover:bg-pink-100 rounded"
                      onClick={() => addEmoji(emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <div className="flex-1">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Write a love note... ✍️💌"
                className="w-full py-3 px-4 rounded-2xl border-2 border-pink-200 focus:border-pink-500 focus:outline-none"
              />
            </div>

            <Button
              onClick={handleSendMessage}
              className="bg-pink-500 text-white p-3 rounded-xl hover:bg-pink-600 transition-all duration-200"
            >
              <FaPaperPlane />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;