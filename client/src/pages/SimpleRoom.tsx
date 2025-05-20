import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

// Define message type
interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: number;
}

const SimpleRoom = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [username, setUsername] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
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
  
  // Send a message
  const handleSendMessage = () => {
    if (!message.trim() || !isLoggedIn) return;
    
    try {
      // Create message object
      const newMessage = {
        id: Date.now().toString(),
        text: message,
        sender: username,
        timestamp: Date.now(),
        encryptedText: encrypt(message)
      };
      
      // Add to messages
      const updatedMessages = [...messages, newMessage];
      
      // Save to localStorage
      localStorage.setItem(`bearBoo_${roomCode}_messages`, JSON.stringify(updatedMessages));
      
      // Update state
      setMessages(updatedMessages);
      
      // Clear input
      setMessage("");
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
                <span className="text-3xl">💘</span>
              </div>
              <h3 className="font-semibold text-lg text-pink-500">No messages yet</h3>
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
          
          {/* Auto-scroll reference */}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 bg-white border-t border-pink-100">
          <div className="flex items-end gap-2">
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

            <Button
              onClick={handleSendMessage}
              className="bg-pink-500 text-white p-3 rounded-xl hover:bg-pink-600 transition-all duration-200"
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