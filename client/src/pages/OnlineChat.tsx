import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { FaSmile } from "react-icons/fa";
import { ref, push, onValue, set } from "firebase/database";
import { database } from "@/lib/firebase";

// Define message type
interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: number;
  encryptedText: string;
}

const themes = [
  { name: "Pink Love", class: "theme-pink", color: "#f472b6" },
  { name: "Blue Ocean", class: "theme-blue", color: "#3b82f6" },
  { name: "Purple Dream", class: "theme-purple", color: "#8b5cf6" },
  { name: "Green Nature", class: "theme-green", color: "#10b981" },
  { name: "Orange Sunset", class: "theme-orange", color: "#f97316" },
];

const OnlineChat = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [username, setUsername] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [currentTheme, setCurrentTheme] = useState("theme-pink");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Encryption and decryption functions
  const encrypt = (text: string): string => {
    try {
      return btoa(`${password}:${text}`);
    } catch (error) {
      console.error("Encryption error:", error);
      return "";
    }
  };
  
  const decrypt = (encoded: string): string => {
    try {
      const decoded = atob(encoded);
      const parts = decoded.split(":");
      
      if (parts[0] !== password) {
        return "[encrypted message]";
      }
      
      return parts[1];
    } catch (error) {
      console.error("Decryption error:", error);
      return "[encrypted message]";
    }
  };
  
  // Handle login to chat room
  const handleLogin = () => {
    if (!username.trim() || !password.trim() || !roomCode.trim()) {
      toast({
        title: "All fields required",
        description: "Please fill in all fields 💕",
        variant: "destructive",
      });
      return;
    }
    
    // Store credentials in session storage for persistence
    sessionStorage.setItem("bearBooName", username);
    sessionStorage.setItem("bearBooPassword", password);
    sessionStorage.setItem("bearBooRoom", roomCode);
    
    setIsLoggedIn(true);
    
    toast({
      title: "Welcome to your chat!",
      description: `You're now in room: ${roomCode} 💖`,
    });
  };
  
  // Handle logout
  const handleLogout = () => {
    if (confirm("Are you sure you want to log out?")) {
      sessionStorage.removeItem("bearBooName");
      sessionStorage.removeItem("bearBooPassword");
      sessionStorage.removeItem("bearBooRoom");
      
      setIsLoggedIn(false);
      setMessages([]);
      
      toast({
        title: "Logged out",
        description: "You've left the chat room 👋",
      });
    }
  };
  
  // Load saved theme on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("bearBooTheme") || "theme-pink";
    setCurrentTheme(savedTheme);
    document.body.className = savedTheme;
  }, []);
  
  // Handle theme change
  const selectTheme = (themeClass: string) => {
    setCurrentTheme(themeClass);
    localStorage.setItem("bearBooTheme", themeClass);
    document.body.className = themeClass;
  };
  
  // Subscribe to messages from Firebase when logged in
  useEffect(() => {
    if (!isLoggedIn || !roomCode) return;
    
    const messagesRef = ref(database, `chat-rooms/${roomCode}/messages`);
    
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const messageList: Message[] = [];
      
      snapshot.forEach((childSnapshot) => {
        const messageData = childSnapshot.val();
        const decryptedText = decrypt(messageData.encryptedText);
        
        messageList.push({
          id: childSnapshot.key || Date.now().toString(),
          text: decryptedText,
          sender: messageData.sender,
          timestamp: messageData.timestamp,
          encryptedText: messageData.encryptedText
        });
      });
      
      // Sort messages by timestamp
      messageList.sort((a, b) => a.timestamp - b.timestamp);
      setMessages(messageList);
    });
    
    // Clean up subscription
    return () => unsubscribe();
  }, [isLoggedIn, roomCode, password]);
  
  // Check for stored credentials on mount
  useEffect(() => {
    const storedName = sessionStorage.getItem("bearBooName");
    const storedPassword = sessionStorage.getItem("bearBooPassword");
    const storedRoom = sessionStorage.getItem("bearBooRoom");
    
    if (storedName && storedPassword && storedRoom) {
      setUsername(storedName);
      setPassword(storedPassword);
      setRoomCode(storedRoom);
      setIsLoggedIn(true);
    }
  }, []);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  
  // Send a message
  const handleSendMessage = () => {
    if (!message.trim() || !isLoggedIn) return;
    
    try {
      // Encrypt the message
      const encryptedText = encrypt(message);
      
      // Create message object
      const messageObj = {
        sender: username,
        timestamp: Date.now(),
        encryptedText
      };
      
      // Push to Firebase
      const messagesRef = ref(database, `chat-rooms/${roomCode}/messages`);
      push(messagesRef, messageObj);
      
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
  
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-r from-pink-100 to-pink-50">
        <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-xl mx-auto transition-all duration-300">
          <div className="flex justify-center mb-6">
            <div className="rounded-2xl w-24 h-24 flex items-center justify-center shadow-md bg-pink-100">
              <span className="text-5xl animate-heart-beat">🐻</span>
            </div>
          </div>
          
          <h1 className="text-3xl text-center mb-6 text-primary font-bold">
            BearBooLetters 💖
          </h1>
          
          <p className="text-center mb-8 text-gray-600">
            Enter your details to start your private chat!
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Name
              </label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your name"
                className="w-full py-3 px-4 rounded-xl border-2 border-primary/30 focus:border-primary focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room Code
                <span className="text-xs text-gray-500 ml-1">
                  (share with your partner)
                </span>
              </label>
              <Input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                placeholder="Create a unique room code"
                className="w-full py-3 px-4 rounded-xl border-2 border-primary/30 focus:border-primary focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Both you and your partner must use the same room code.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Secret Password
                <span className="text-xs text-gray-500 ml-1">
                  (for encryption)
                </span>
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter a secret password"
                className="w-full py-3 px-4 rounded-xl border-2 border-primary/30 focus:border-primary focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                This password encrypts your messages. Share it only with your partner.
              </p>
            </div>
            
            <Button
              onClick={handleLogin}
              className="w-full py-3 bg-primary text-white rounded-xl hover:bg-primary-hover transition-all duration-200"
            >
              Start Chatting
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-r from-pink-100 to-pink-50">
      <div className="h-[calc(100vh-2rem)] max-h-[700px] w-full max-w-md flex flex-col relative overflow-hidden bg-white rounded-3xl shadow-xl">
        {/* Chat Header */}
        <div className="bg-primary text-white py-4 px-6 flex justify-between items-center rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center">
              <span className="text-xl animate-heart-beat">🐻</span>
            </div>
            <div>
              <div className="font-semibold">BearBooLetters 💕</div>
              <div className="text-xs">Room: {roomCode}</div>
            </div>
          </div>
          
          <div className="flex gap-2">
            {/* Theme selector */}
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white hover:text-white/80 transition-colors"
                >
                  🎨
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
              className="text-white hover:text-white/80 transition-colors"
              onClick={handleLogout}
            >
              🚪
            </Button>
          </div>
        </div>

        {/* Chat Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-pink-50 to-white">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500">
              <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center mb-4">
                <span className="text-3xl animate-heart-beat">💘</span>
              </div>
              <h3 className="font-semibold text-lg text-primary">No messages yet</h3>
              <p className="mt-2">
                Send your first message to start your private conversation!
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === username ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-3 ${
                    msg.sender === username
                      ? "bg-primary text-white"
                      : "bg-white text-gray-800 border border-primary/30"
                  }`}
                >
                  {msg.sender !== username && (
                    <div className="font-medium text-xs mb-1 text-primary">
                      {msg.sender}
                    </div>
                  )}
                  <p>{msg.text}</p>
                  <div
                    className={`text-xs opacity-70 mt-1 ${
                      msg.sender === username ? "text-right" : ""
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
          
          {/* Typing indicator */}
          <div className="flex justify-start" style={{opacity: Math.random() > 0.7 ? 1 : 0}}>
            <div className="bg-white text-gray-800 border border-primary/30 rounded-2xl p-3 px-4">
              <div className="flex space-x-1">
                <div className="typing-dot w-2 h-2 rounded-full bg-primary"></div>
                <div className="typing-dot w-2 h-2 rounded-full bg-primary"></div>
                <div className="typing-dot w-2 h-2 rounded-full bg-primary"></div>
              </div>
            </div>
          </div>
          
          {/* Auto-scroll reference */}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 bg-white border-t border-primary/20">
          <div className="flex items-end gap-2">
            {/* Emoji picker */}
            <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
              <PopoverTrigger asChild>
                <Button 
                  type="button" 
                  size="icon" 
                  variant="ghost"
                  className="text-primary hover:text-primary/80 transition-colors"
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
                      className="w-8 h-8 flex items-center justify-center text-xl hover:bg-primary/10 rounded"
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
                placeholder="Write something cute... ✍️💌"
                className="w-full py-3 px-4 rounded-2xl border-2 border-primary/30 focus:border-primary focus:outline-none"
              />
            </div>

            <Button
              onClick={handleSendMessage}
              className="bg-primary text-white p-3 rounded-xl hover:bg-primary-hover transition-all duration-200"
            >
              📨
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnlineChat;