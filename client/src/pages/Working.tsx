import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import CompatibilityGame from "@/components/CompatibilityGame";
import Scrapbook from "@/components/Scrapbook";
import SmartMessageSuggestions from "@/components/SmartMessageSuggestions";
import DailyAffirmation from "@/components/DailyAffirmation";
import AnniversaryTracker from "@/components/AnniversaryTracker";
import DateNightPlanner from "@/components/DateNightPlanner";

// Define message type
interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: number;
  type?: "text" | "image" | "memory";
  imageUrl?: string;
  memoryTitle?: string;
}

const Working = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [username, setUsername] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showCompatibilityGame, setShowCompatibilityGame] = useState(false);
  const [showScrapbook, setShowScrapbook] = useState(false);
  const [showDailyAffirmation, setShowDailyAffirmation] = useState(false);
  const [showAnniversaryTracker, setShowAnniversaryTracker] = useState(false);
  const [showDatePlanner, setShowDatePlanner] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showMoodSuggestions, setShowMoodSuggestions] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  // Encrypt a message - Unicode safe version
  const encrypt = (text: string): string => {
    try {
      // First, encode the text as UTF-8
      const utf8Encoded = encodeURIComponent(`${password}:${text}`);
      return utf8Encoded;
    } catch (error) {
      console.error("Encryption error:", error);
      return "";
    }
  };
  
  // Decrypt a message - Unicode safe version
  const decrypt = (encoded: string): string => {
    try {
      // Decode from UTF-8
      const decoded = decodeURIComponent(encoded);
      const parts = decoded.split(":");
      
      if (parts[0] !== password) {
        return "[encrypted message]";
      }
      
      return parts.slice(1).join(":"); // Handles case where message contains colons
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
    
    // Store credentials in localStorage for persistence
    localStorage.setItem("bearBooName", username);
    localStorage.setItem("bearBooPassword", password);
    localStorage.setItem("bearBooRoom", roomCode);
    
    setIsLoggedIn(true);
    
    toast({
      title: "Welcome to your chat!",
      description: `You're now in room: ${roomCode} 💖`,
    });
  };
  
  // Handle logout
  const handleLogout = () => {
    if (confirm("Are you sure you want to log out?")) {
      localStorage.removeItem("bearBooName");
      localStorage.removeItem("bearBooPassword");
      localStorage.removeItem("bearBooRoom");
      
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
    const storedName = localStorage.getItem("bearBooName");
    const storedPassword = localStorage.getItem("bearBooPassword");
    const storedRoom = localStorage.getItem("bearBooRoom");
    
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
  
  // Load messages and room data from localStorage
  useEffect(() => {
    if (!isLoggedIn || !roomCode) return;
    
    // Create room registry if it doesn't exist
    const roomsRegistry = localStorage.getItem('bearBoo_rooms_registry');
    let roomsList = roomsRegistry ? JSON.parse(roomsRegistry) : [];
    
    // Check if room exists in registry
    if (!roomsList.includes(roomCode)) {
      roomsList.push(roomCode);
      localStorage.setItem('bearBoo_rooms_registry', JSON.stringify(roomsList));
      
      // Create empty structures for new room
      localStorage.setItem(`bearBoo_${roomCode}_messages`, JSON.stringify([]));
      localStorage.setItem(`bearBoo_${roomCode}_scrapbook`, JSON.stringify([]));
      localStorage.setItem(`bearBoo_${roomCode}_game`, JSON.stringify({ questions: [] }));
      
      toast({
        title: "New Room Created",
        description: "Welcome to your new private chat room!",
      });
    }
    
    // Load messages 
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
  }, [isLoggedIn, roomCode, password, messages.length, decrypt]);
  
  // Function to add emoji to message
  const addEmoji = (emoji: string) => {
    setMessage(prev => prev + emoji);
  };
  
  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive"
      });
      return;
    }
    
    // Verify it's an image
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please select an image file.",
        variant: "destructive"
      });
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImagePreview(event.target.result as string);
        toast({
          title: "Image ready",
          description: "Add a caption if you'd like, then send!",
        });
      }
    };
    reader.onerror = () => {
      toast({
        title: "Error reading file",
        description: "Please try another image.",
        variant: "destructive"
      });
    };
    reader.readAsDataURL(file);
  };
  
  // Cancel image upload
  const cancelImageUpload = () => {
    setImagePreview(null);
    setMessage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  // Send message (text or image)
  const handleSendMessage = function(customText?: string | React.MouseEvent) {
    // Check if it's a button click event
    // Handle React event objects
  if (customText && typeof customText === 'object' && 'type' in customText) {
      customText = undefined;
    }
    if ((!message.trim() && !imagePreview && !customText) || !isLoggedIn) return;
    
    try {
      const messageText = customText || message;
      
      // Create message object
      let newMessage: any = {
        id: Date.now().toString(),
        sender: username,
        timestamp: Date.now(),
      };
      
      // If sending an image
      if (imagePreview) {
        newMessage = {
          ...newMessage,
          type: "image",
          imageUrl: imagePreview,
          text: messageText || "",
          encryptedText: encrypt(messageText || "")
        };
        
        // Clear image preview after sending
        setTimeout(() => {
          setImagePreview(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }, 100);
      } else {
        // Text message
        newMessage = {
          ...newMessage,
          type: "text",
          text: messageText,
          encryptedText: encrypt(messageText)
        };
      }
      
      // Get existing messages
      const storedMessages = localStorage.getItem(`bearBoo_${roomCode}_messages`);
      let updatedMessages = [];
      
      if (storedMessages) {
        updatedMessages = [...JSON.parse(storedMessages), newMessage];
      } else {
        updatedMessages = [newMessage];
      }
      
      // Save to localStorage
      localStorage.setItem(`bearBoo_${roomCode}_messages`, JSON.stringify(updatedMessages));
      
      // Update state
      setMessages([...messages, {...newMessage}]);
      
      // Show feedback for image message
      if (newMessage.type === "image") {
        toast({
          title: "Image sent!",
          description: "Your cute photo has been shared successfully.",
        });
      }
      
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
  
  // Login screen
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
  
  // Chat interface
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-2 sm:p-4 bg-gradient-to-r from-pink-100 to-pink-50">
      <div className="h-[calc(100vh-1rem)] sm:h-[calc(100vh-2rem)] max-h-[800px] w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl flex flex-col relative overflow-hidden bg-white rounded-3xl shadow-xl">
        {/* Chat Header */}
        <div className="bg-pink-500 text-white py-3 px-4 md:py-4 md:px-6 flex justify-between items-center rounded-t-3xl shadow-md">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/30 flex items-center justify-center animate-float">
              <span className="text-base md:text-xl">🐻</span>
            </div>
            <div>
              <div className="font-semibold text-sm md:text-base">BearBooLetters 💕</div>
              <div className="text-xs">Room: {roomCode}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-end">
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 text-white hover:text-pink-200 hover:bg-pink-600 transition-colors rounded-full"
              onClick={() => setShowCompatibilityGame(true)}
              title="Play Couple's Game"
            >
              <span className="text-sm sm:text-base">💘</span>
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 text-white hover:text-pink-200 hover:bg-pink-600 transition-colors rounded-full"
              onClick={() => setShowScrapbook(true)}
              title="Memories Scrapbook"
            >
              <span className="text-sm sm:text-base">📒</span>
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 text-white hover:text-pink-200 hover:bg-pink-600 transition-colors rounded-full"
              onClick={() => setShowDailyAffirmation(true)}
              title="Daily Love Affirmation"
            >
              <span className="text-sm sm:text-base">✨</span>
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 text-white hover:text-pink-200 hover:bg-pink-600 transition-colors rounded-full"
              onClick={() => setShowAnniversaryTracker(true)}
              title="Special Dates Tracker"
            >
              <span className="text-sm sm:text-base">💕</span>
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 text-white hover:text-pink-200 hover:bg-pink-600 transition-colors rounded-full"
              onClick={() => setShowDatePlanner(true)}
              title="Virtual Date Planner"
            >
              <span className="text-sm sm:text-base">🌙</span>
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 text-white hover:text-pink-200 hover:bg-pink-600 transition-colors rounded-full"
              onClick={handleLogout}
              title="Log Out"
            >
              <span className="text-sm sm:text-base">🚪</span>
            </Button>
          </div>
        </div>

        {/* Chat Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-pink-50 to-white scrollbar-thin scrollbar-thumb-pink-300 scrollbar-track-transparent">
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
                  className={`max-w-[85%] sm:max-w-[80%] rounded-xl sm:rounded-2xl p-2 sm:p-3 ${
                    msg.sender === username
                      ? "message-bubble-me"
                      : "message-bubble-other"
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
                        className="rounded-xl max-w-full max-h-64 w-auto object-contain cursor-pointer"
                        onClick={() => {
                          // Save to scrapbook
                          const scrapbookKey = `bearBoo_${roomCode}_scrapbook`;
                          const storedScrapbook = localStorage.getItem(scrapbookKey);
                          let scrapbook = storedScrapbook ? JSON.parse(storedScrapbook) : [];
                          
                          // Check if already in scrapbook
                          if (!scrapbook.some((item: any) => item.imageUrl === msg.imageUrl)) {
                            scrapbook.push({
                              id: Date.now().toString(),
                              imageUrl: msg.imageUrl,
                              caption: msg.text || "",
                              sender: msg.sender,
                              timestamp: msg.timestamp
                            });
                            
                            localStorage.setItem(scrapbookKey, JSON.stringify(scrapbook));
                            
                            toast({
                              title: "Added to Scrapbook",
                              description: "Image saved to your memories ✨",
                            });
                          }
                        }}
                      />
                    </div>
                  )}
                  
                  {/* For memory card */}
                  {msg.type === "memory" && msg.imageUrl && (
                    <div className="memory-card p-2 bg-pink-50 rounded-lg mb-2">
                      <div className="text-xs font-medium text-pink-600 mb-1">Memory: {msg.memoryTitle || "Special moment"}</div>
                      <img 
                        src={msg.imageUrl} 
                        alt="Memory" 
                        className="rounded-lg w-full h-auto mb-1"
                      />
                      {msg.text && <p className="text-sm">{msg.text}</p>}
                    </div>
                  )}
                  
                  {/* Message text (show only if not memory type and has text) */}
                  {(!msg.type || msg.type === "text" || (msg.type === "image" && msg.text)) && 
                    <p className="text-sm sm:text-base break-words">{msg.text}</p>
                  }
                  
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
        <div className="p-4 bg-white border-t border-pink-100 relative">
          {/* Image preview */}
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
          
          {/* Smart message suggestions popup */}
          {showMoodSuggestions && (
            <SmartMessageSuggestions 
              messages={messages}
              username={username}
              onSelectSuggestion={(suggestion) => setMessage(suggestion)} 
              onClose={() => setShowMoodSuggestions(false)}
            />
          )}
          
          <div className="flex items-end gap-1 sm:gap-2">
            {/* Emoji bar on small screens */}
            <div className="flex overflow-x-auto gap-1 py-1 px-1 -mx-1 mb-2 max-w-[180px] sm:hidden">
              {["❤️", "😘", "🥰", "😊", "💕", "🌹", "✨"].map((emoji) => (
                <button 
                  key={emoji}
                  className="flex-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-pink-100 transition-colors"
                  onClick={() => addEmoji(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
            
            {/* Emoji button */}
            <div className="flex-none">
              <Button 
                type="button" 
                size="icon" 
                variant="ghost"
                className="w-8 h-8 sm:w-10 sm:h-10 text-pink-500 hover:text-pink-600 hover:bg-pink-100 rounded-full transition-colors"
                onClick={() => addEmoji("❤️")}
              >
                <span className="text-base sm:text-lg">❤️</span>
              </Button>
            </div>
            
            {/* Mood suggestions button */}
            <div className="flex-none">
              <Button 
                type="button" 
                size="icon" 
                variant="ghost"
                className="w-8 h-8 sm:w-10 sm:h-10 text-pink-500 hover:text-pink-600 hover:bg-pink-100 rounded-full transition-colors"
                onClick={() => setShowMoodSuggestions(!showMoodSuggestions)}
                title="Message Suggestions"
              >
                <span className="text-base sm:text-lg">💭</span>
              </Button>
            </div>
            
            {/* Image upload button */}
            <div className="flex-none">
              <Button 
                type="button" 
                size="icon" 
                variant="ghost"
                className="w-8 h-8 sm:w-10 sm:h-10 text-pink-500 hover:text-pink-600 hover:bg-pink-100 rounded-full transition-colors"
                onClick={() => fileInputRef.current?.click()}
                title="Share Photo"
              >
                <span className="text-base sm:text-lg">📷</span>
              </Button>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageUpload}
              />
            </div>
            
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
                  className="w-full py-2 sm:py-3 px-3 sm:px-4 rounded-2xl border-2 border-pink-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 text-sm sm:text-base"
                />
              </div>
            )}

            <Button
              onClick={handleSendMessage}
              className="bg-pink-500 text-white w-10 h-10 sm:w-12 sm:h-12 rounded-full hover:bg-pink-600 transition-all duration-200 shadow-md flex items-center justify-center"
              title="Send Message"
            >
              <span className="text-lg sm:text-xl">📨</span>
            </Button>
          </div>
          
          {/* Quick emoji buttons - hidden on mobile, shown on larger screens */}
          <div className="hidden sm:flex justify-center gap-2 mt-2 flex-wrap">
            {["💖", "😍", "🥰", "😘", "🐻", "💕", "💋", "🌹", "🦋", "✨", "💌", "💝", "🔥", "💯"].map(emoji => (
              <button 
                key={emoji}
                onClick={() => addEmoji(emoji)}
                className="w-9 h-9 rounded-full hover:bg-pink-100 active:bg-pink-200 flex items-center justify-center transition-transform hover:scale-110"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Render the compatibility game when showCompatibilityGame is true */}
      {showCompatibilityGame && (
        <CompatibilityGame
          username={username}
          roomCode={roomCode}
          onClose={() => setShowCompatibilityGame(false)}
        />
      )}
      
      {/* Render the scrapbook when showScrapbook is true */}
      {showScrapbook && (
        <Scrapbook
          username={username}
          roomCode={roomCode}
          onClose={() => setShowScrapbook(false)}
          onShareMemory={(memory) => {
            // Create a memory message
            const memoryMessage: Message = {
              id: Date.now().toString(),
              sender: username,
              timestamp: Date.now(),
              type: "memory",
              text: memory.caption || "A special memory",
              memoryTitle: memory.title,
              imageUrl: memory.imageUrl
            };
            
            // Add encrypted version for storage
            const messageForStorage = {
              ...memoryMessage,
              encryptedText: encrypt(memory.caption || "A special memory")
            };
            
            // Get existing messages
            const storedMessages = localStorage.getItem(`bearBoo_${roomCode}_messages`);
            let updatedMessages = [];
            
            if (storedMessages) {
              updatedMessages = [...JSON.parse(storedMessages), messageForStorage];
            } else {
              updatedMessages = [messageForStorage];
            }
            
            // Save to localStorage
            localStorage.setItem(`bearBoo_${roomCode}_messages`, JSON.stringify(updatedMessages));
            
            // Update state
            setMessages([...messages, memoryMessage]);
            
            // Close scrapbook
            setShowScrapbook(false);
          }}
        />
      )}
      
      {/* Render the daily affirmation when showDailyAffirmation is true */}
      {showDailyAffirmation && (
        <DailyAffirmation
          roomCode={roomCode}
          onClose={() => setShowDailyAffirmation(false)}
          onSendAffirmation={(text: string) => {
            // Create and send a message with the affirmation
            handleSendMessage(text);
            setShowDailyAffirmation(false);
          }}
        />
      )}
      
      {/* Render the anniversary tracker when showAnniversaryTracker is true */}
      {showAnniversaryTracker && (
        <AnniversaryTracker
          roomCode={roomCode}
          onClose={() => setShowAnniversaryTracker(false)}
          onShareAnniversary={(text: string) => {
            // Create and send a message with the anniversary info
            handleSendMessage(text);
            setShowAnniversaryTracker(false);
          }}
        />
      )}
      
      {/* Render the date night planner when showDatePlanner is true */}
      {showDatePlanner && (
        <DateNightPlanner
          roomCode={roomCode}
          username={username}
          onClose={() => setShowDatePlanner(false)}
          onSharePlan={(plan) => {
            // Create and send a message with the date plan
            const text = `🌙 Virtual Date: ${plan.title} 🌙\n📅 ${new Date(plan.date).toLocaleString()}\n\n${plan.description}`;
            handleSendMessage(text);
            setShowDatePlanner(false);
          }}
        />
      )}
    </div>
  );
};

export default Working;