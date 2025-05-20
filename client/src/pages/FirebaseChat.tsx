import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  auth, 
  database,
  onAuthChange,
  loginWithEmail,
  registerWithEmail,
  logout,
  sendMessageToFirebase,
  listenToMessages,
  createOrUpdateChat,
  getUserChats,
  decryptMessage,
  encryptMessage,
  type FirebaseUser
} from "@/lib/firebase";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { FaSmile, FaPalette, FaSignOutAlt, FaPaperPlane } from "react-icons/fa";

// Theme options
const themes = [
  { name: "Pink Love", class: "theme-pink", color: "#f472b6" },
  { name: "Blue Ocean", class: "theme-blue", color: "#3b82f6" },
  { name: "Purple Dream", class: "theme-purple", color: "#8b5cf6" },
  { name: "Green Nature", class: "theme-green", color: "#10b981" },
  { name: "Orange Sunset", class: "theme-orange", color: "#f97316" },
];

const FirebaseChat = () => {
  // Authentication states
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Auth form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [chatPassword, setChatPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  // Chat states
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [currentTheme, setCurrentTheme] = useState("theme-pink");
  const [chatId, setChatId] = useState<string | null>(null);
  const [partnerEmail, setPartnerEmail] = useState("");
  const [currentStep, setCurrentStep] = useState<"auth" | "setup" | "chat">("auth");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthChange((currentUser) => {
      setUser(currentUser);
      setLoading(false);
      
      if (currentUser) {
        // Check if we have an existing chat
        const storedChatId = localStorage.getItem(`bearBoo_${currentUser.uid}_chatId`);
        const storedChatPassword = localStorage.getItem(`bearBoo_${currentUser.uid}_chatPassword`);
        
        if (storedChatId && storedChatPassword) {
          setChatId(storedChatId);
          setChatPassword(storedChatPassword);
          setCurrentStep("chat");
        } else {
          setCurrentStep("setup");
        }
      } else {
        setCurrentStep("auth");
      }
    });
    
    return () => unsubscribe();
  }, []);
  
  // Load saved theme
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
  
  // Listen for messages when chatId is available
  useEffect(() => {
    if (!user || !chatId || !chatPassword) return;
    
    const unsubscribe = listenToMessages(chatId, (newMessages) => {
      const processedMessages = newMessages.map(msg => {
        let decrypted = "[encrypted message]";
        
        if (msg.encrypted) {
          decrypted = decryptMessage(msg.encrypted, chatPassword) || "[encrypted message]";
        }
        
        return {
          ...msg,
          text: decrypted,
          isMe: msg.senderId === user.uid
        };
      });
      
      setMessages(processedMessages);
    });
    
    return () => unsubscribe();
  }, [user, chatId, chatPassword]);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  
  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      toast({
        title: "Missing fields",
        description: "Please enter your email and password",
        variant: "destructive"
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      const result = await loginWithEmail(email, password);
      
      if (result.success) {
        toast({
          title: "Login successful",
          description: "Welcome back to BearBooLetters! 💕"
        });
      } else {
        toast({
          title: "Login failed",
          description: result.error || "Please check your credentials",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim() || !confirmPassword.trim() || !displayName.trim()) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match",
        variant: "destructive"
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      const result = await registerWithEmail(email, password, displayName);
      
      if (result.success) {
        toast({
          title: "Registration successful",
          description: "Welcome to BearBooLetters! 💖"
        });
      } else {
        toast({
          title: "Registration failed",
          description: result.error || "Please try again",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle setting up chat
  const handleSetupChat = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!partnerEmail.trim() || !chatPassword.trim()) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      // For simplicity, we'll just create a temporary chat ID based on emails
      // In a real app, you would search for the partner's user ID in the database
      
      // For demonstration, we'll create a chat ID from the user's UID and partner email
      // This is just for the demo - in production, you'd look up the partner's actual UID
      const tempPartnerId = btoa(partnerEmail).replace(/[^a-zA-Z0-9]/g, '');
      
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      const result = await createOrUpdateChat(tempPartnerId, user.uid);
      
      if (result.success && result.chatId) {
        // Store chat ID and password in local storage
        localStorage.setItem(`bearBoo_${user.uid}_chatId`, result.chatId);
        localStorage.setItem(`bearBoo_${user.uid}_chatPassword`, chatPassword);
        localStorage.setItem(`bearBoo_${user.uid}_partnerEmail`, partnerEmail);
        
        setChatId(result.chatId);
        setCurrentStep("chat");
        
        toast({
          title: "Chat setup complete",
          description: "You can now start sending messages! 💌"
        });
      } else {
        toast({
          title: "Chat setup failed",
          description: result.error || "Please try again",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error("Chat setup error:", error);
      toast({
        title: "Chat setup failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle sending message
  const handleSendMessage = async () => {
    if (!message.trim() || !user || !chatId || !chatPassword) return;
    
    try {
      const result = await sendMessageToFirebase(chatId, message, user.uid, chatPassword);
      
      if (result.success) {
        setMessage("");
        
        // Close emoji picker if open
        if (showEmojiPicker) {
          setShowEmojiPicker(false);
        }
      } else {
        toast({
          title: "Failed to send",
          description: result.error || "Your message couldn't be sent. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Send message error:", error);
      toast({
        title: "Failed to send",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };
  
  // Add emoji to message
  const addEmoji = (emoji: string) => {
    setMessage((prev) => prev + emoji);
  };
  
  // Handle logout
  const handleLogout = async () => {
    try {
      const result = await logout();
      
      if (result.success) {
        setUser(null);
        setChatId(null);
        setMessages([]);
        setCurrentStep("auth");
        
        toast({
          title: "Logged out",
          description: "Come back soon! 👋"
        });
      } else {
        toast({
          title: "Logout failed",
          description: result.error || "Please try again",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-r from-pink-100 to-pink-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto relative">
            <div className="animate-bounce">
              <span className="text-4xl">💖</span>
            </div>
          </div>
          <div className="text-pink-500 font-semibold">
            Loading BearBooLetters...
          </div>
        </div>
      </div>
    );
  }
  
  // Authentication view
  if (currentStep === "auth") {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-r from-pink-100 to-pink-50">
        <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-xl mx-auto transition-all duration-300">
          <div className="flex justify-center mb-6">
            <div className="rounded-2xl w-24 h-24 flex items-center justify-center shadow-md bg-pink-100">
              <span className="text-5xl">🐻</span>
            </div>
          </div>
          
          <h1 className="text-3xl text-center mb-6 text-pink-500 font-bold">
            BearBooLetters 💖
          </h1>
          
          <p className="text-center mb-8 text-gray-600">
            Your secure, cute chat portal for couples
          </p>
          
          <Tabs defaultValue={isRegistering ? "register" : "login"} onValueChange={(value) => setIsRegistering(value === "register")}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full py-3 px-4 rounded-xl border-2 border-pink-200 focus:border-pink-500 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full py-3 px-4 rounded-xl border-2 border-pink-200 focus:border-pink-500 focus:outline-none"
                  />
                </div>
                
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-all duration-200"
                >
                  {submitting ? "Logging in..." : "Login"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Name
                  </label>
                  <Input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full py-3 px-4 rounded-xl border-2 border-pink-200 focus:border-pink-500 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full py-3 px-4 rounded-xl border-2 border-pink-200 focus:border-pink-500 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    className="w-full py-3 px-4 rounded-xl border-2 border-pink-200 focus:border-pink-500 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="w-full py-3 px-4 rounded-xl border-2 border-pink-200 focus:border-pink-500 focus:outline-none"
                  />
                </div>
                
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-all duration-200"
                >
                  {submitting ? "Registering..." : "Register"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }
  
  // Chat setup view
  if (currentStep === "setup") {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-r from-pink-100 to-pink-50">
        <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-xl mx-auto transition-all duration-300">
          <div className="flex justify-center mb-6">
            <div className="rounded-2xl w-24 h-24 flex items-center justify-center shadow-md bg-pink-100">
              <span className="text-5xl">💌</span>
            </div>
          </div>
          
          <h1 className="text-3xl text-center mb-6 text-pink-500 font-bold">
            One Last Step!
          </h1>
          
          <p className="text-center mb-8 text-gray-600">
            Set up your chat to start messaging
          </p>
          
          <form onSubmit={handleSetupChat} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Partner's Email
              </label>
              <Input
                type="email"
                value={partnerEmail}
                onChange={(e) => setPartnerEmail(e.target.value)}
                placeholder="Enter your partner's email"
                className="w-full py-3 px-4 rounded-xl border-2 border-pink-200 focus:border-pink-500 focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                This is used to connect with your partner
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
                value={chatPassword}
                onChange={(e) => setChatPassword(e.target.value)}
                placeholder="Create a secret password"
                className="w-full py-3 px-4 rounded-xl border-2 border-pink-200 focus:border-pink-500 focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                This password encrypts your messages. Share it only with your partner.
              </p>
            </div>
            
            <Button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-all duration-200"
            >
              {submitting ? "Setting up..." : "Start Chatting"}
            </Button>
            
            <div className="text-center">
              <button
                type="button"
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-pink-500"
              >
                Logout
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
  
  // Chat view
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
              <div className="text-xs">
                {localStorage.getItem(`bearBoo_${user?.uid}_partnerEmail`) || "Your private chat"}
              </div>
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
                className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-3 ${
                    msg.isMe
                      ? "bg-pink-500 text-white"
                      : "bg-white text-gray-800 border border-pink-100"
                  }`}
                >
                  <p>{msg.text}</p>
                  <div
                    className={`text-xs opacity-70 mt-1 ${
                      msg.isMe ? "text-right" : ""
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

export default FirebaseChat;