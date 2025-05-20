import { useState, useEffect, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";

// Define message type
interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: number;
  type?: "text" | "image";
  imageUrl?: string;
  encryptedText?: string;
}

const SimpleRoom = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [username, setUsername] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
  
  // Load messages from localStorage
  useEffect(() => {
    if (!isLoggedIn || !roomCode) return;
    
    const storedMessages = localStorage.getItem(`bearBoo_${roomCode}_messages`);
    if (storedMessages) {
      try {
        const parsedMessages = JSON.parse(storedMessages) as any[];
        const decryptedMessages = parsedMessages.map(msg => ({
          ...msg,
          text: decrypt(msg.encryptedText)
        }));
        setMessages(decryptedMessages);
      } catch (error) {
        console.error("Error loading messages:", error);
      }
    }
    
    // Set up interval to check for new messages
    const interval = setInterval(() => {
      const storedMessages = localStorage.getItem(`bearBoo_${roomCode}_messages`);
      if (storedMessages) {
        try {
          const parsedMessages = JSON.parse(storedMessages) as any[];
          if (parsedMessages.length !== messages.length) {
            const decryptedMessages = parsedMessages.map(msg => ({
              ...msg,
              text: decrypt(msg.encryptedText)
            }));
            setMessages(decryptedMessages);
          }
        } catch (error) {
          console.error("Error checking messages:", error);
        }
      }
    }, 2000);
    
    return () => clearInterval(interval);
  }, [isLoggedIn, roomCode, password, messages.length]);
  
  // Handle image upload
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please select an image file (JPEG, PNG, etc.)",
        variant: "destructive"
      });
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive"
      });
      return;
    }
    
    // Create a preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImagePreview(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };
  
  // Cancel image upload
  const cancelImageUpload = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Add emoji to message
  const addEmoji = (emoji: string) => {
    setMessage((prev) => prev + emoji);
  };
  
  // Show typing indicator (simulated for demo)
  const handleTyping = () => {
    // Randomly show typing indicator occasionally
    if (Math.random() > 0.9) {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 3000);
    }
  };
  
  // Send a message
  const handleSendMessage = () => {
    if ((!message.trim() && !imagePreview) || !isLoggedIn) return;
    
    try {
      // Create message object
      let newMessage: Message;
      
      if (imagePreview) {
        // Image message
        newMessage = {
          id: Date.now().toString(),
          text: message || "Sent an image 📷",
          sender: username,
          timestamp: Date.now(),
          type: "image",
          imageUrl: imagePreview,
          encryptedText: encrypt(JSON.stringify({
            text: message || "Sent an image 📷",
            imageUrl: imagePreview
          }))
        };
        // Reset image preview
        setImagePreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        // Text message
        newMessage = {
          id: Date.now().toString(),
          text: message,
          sender: username,
          timestamp: Date.now(),
          type: "text",
          encryptedText: encrypt(message)
        };
      }
      
      // Add to messages
      const updatedMessages = [...messages, newMessage];
      
      // Save to localStorage
      localStorage.setItem(`bearBoo_${roomCode}_messages`, JSON.stringify(updatedMessages));
      
      // Update state
      setMessages(updatedMessages);
      
      // Clear input
      setMessage("");
      
      // Show typing indicator occasionally
      handleTyping();
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Failed to send",
        description: "Your message couldn't be sent. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-r from-pink-100 to-pink-50">
        <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="rounded-2xl w-24 h-24 flex items-center justify-center shadow-md bg-pink-100">
              <span className="text-5xl">🐻</span>
            </div>
          </div>
          
          <h1 className="text-3xl text-center mb-6 text-pink-500 font-bold">
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
                className="w-full py-3 px-4 rounded-xl border-2 border-pink-200 focus:border-pink-500 focus:outline-none"
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
                className="w-full py-3 px-4 rounded-xl border-2 border-pink-200 focus:border-pink-500 focus:outline-none"
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
                className="w-full py-3 px-4 rounded-xl border-2 border-pink-200 focus:border-pink-500 focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                This password encrypts your messages. Share it only with your partner.
              </p>
            </div>
            
            <Button
              onClick={handleLogin}
              className="w-full py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-all duration-200"
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
        <div className="bg-pink-500 text-white py-4 px-6 flex justify-between items-center rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center">
              <span className="text-xl">🐻</span>
            </div>
            <div>
              <div className="font-semibold">BearBooLetters 💕</div>
              <div className="text-xs">Room: {roomCode}</div>
            </div>
          </div>
          
          <div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:text-pink-200 transition-colors"
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
                <span className="text-3xl animate-bounce-slow">💘</span>
              </div>
              <h3 className="font-semibold text-lg text-pink-500 animate-pulse-slow">No messages yet</h3>
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
                      ? "bg-pink-500 text-white"
                      : "bg-white text-gray-800 border border-pink-100"
                  }`}
                >
                  {msg.sender !== username && (
                    <div className="font-medium text-xs mb-1 text-pink-400">
                      {msg.sender}
                    </div>
                  )}
                  
                  {/* If message has an image */}
                  {msg.type === "image" && msg.imageUrl && (
                    <div className="mb-2">
                      <img 
                        src={msg.imageUrl} 
                        alt="Shared image" 
                        className="rounded-xl max-h-64 w-auto"
                      />
                    </div>
                  )}
                  
                  {/* Message text */}
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
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-800 border border-pink-100 rounded-2xl p-3 px-4">
                <div className="flex space-x-1">
                  <div className="typing-dot w-2 h-2 rounded-full bg-pink-400"></div>
                  <div className="typing-dot w-2 h-2 rounded-full bg-pink-400"></div>
                  <div className="typing-dot w-2 h-2 rounded-full bg-pink-400"></div>
                </div>
              </div>
            </div>
          )}
          
          {/* Auto-scroll reference */}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 bg-white border-t border-pink-100">
          {/* Image preview area */}
          {imagePreview && (
            <div className="mb-3 relative">
              <div className="relative rounded-xl overflow-hidden border border-pink-200">
                <img 
                  src={imagePreview} 
                  alt="Image preview" 
                  className="max-h-48 w-auto mx-auto"
                />
                <Button 
                  className="absolute top-2 right-2 bg-pink-500 hover:bg-pink-600 text-white rounded-full h-8 w-8 p-0"
                  onClick={cancelImageUpload}
                >
                  ✕
                </Button>
              </div>
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a caption to your image... ✨"
                className="mt-2 py-2 px-4 rounded-2xl border-2 border-pink-200 focus:border-pink-500 focus:outline-none"
              />
            </div>
          )}
          
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
                  😊
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64" side="top">
                <div className="grid grid-cols-8 gap-2">
                  {["❤️", "💖", "💕", "💓", "💗", "💝", "💘", "😍", 
                    "🥰", "😘", "😚", "😊", "🐻", "🧸", "🌹", "🌷",
                    "🌸", "🌈", "✨", "💫", "⭐", "🔥", "💯", "💦",
                    "👋", "👍", "👏", "👀", "💪", "🙌", "🤗", "😂"].map((emoji) => (
                    <button
                      key={emoji}
                      className="w-8 h-8 flex items-center justify-center text-xl hover:bg-pink-100 rounded"
                      onClick={() => {
                        addEmoji(emoji);
                        setShowEmojiPicker(false);
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            
            {/* Image upload button */}
            <Button 
              type="button" 
              size="icon" 
              variant="ghost"
              className="text-pink-500 hover:text-pink-600 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              📷
            </Button>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageUpload}
            />
            
            {!imagePreview && (
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
                  className="w-full py-3 px-4 rounded-2xl border-2 border-pink-200 focus:border-pink-500 focus:outline-none"
                />
              </div>
            )}

            <Button
              onClick={handleSendMessage}
              className="bg-pink-500 text-white p-3 rounded-xl hover:bg-pink-600 transition-all duration-200 animate-pulse-slow"
            >
              📨
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleRoom;