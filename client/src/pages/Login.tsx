import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [chatPassword, setChatPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { currentUser, login, register } = useAuth();
  
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Check if user is already logged in
  useEffect(() => {
    if (currentUser) {
      // If encryption password exists
      const storedPassword = sessionStorage.getItem("bearBooPassword");
      if (storedPassword) {
        setLocation("/chat");
      }
    }
  }, [currentUser, setLocation]);

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim() || !chatPassword.trim()) {
      toast({
        title: "All fields required",
        description: "Please fill in all fields 💕",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const success = await login(email, password);
      
      if (success) {
        // Store the encryption password in session storage
        sessionStorage.setItem("bearBooPassword", chatPassword);
        
        // Redirect to chat
        setLocation("/chat");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim() || !confirmPassword.trim() || 
        !displayName.trim() || !chatPassword.trim()) {
      toast({
        title: "All fields required",
        description: "Please fill in all fields 💕",
        variant: "destructive",
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match 💖",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await register(email, password, displayName);
      
      if (success) {
        // Store the encryption password in session storage
        sessionStorage.setItem("bearBooPassword", chatPassword);
        
        // Redirect to chat
        toast({
          title: "Registration successful!",
          description: "Welcome to BearBooLetters 💌",
        });
        
        setLocation("/chat");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-r from-pink-100 to-pink-50">
      <Card className="w-full max-w-md shadow-xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full w-16 h-16 flex items-center justify-center shadow-md bg-pink-100">
              <span className="text-3xl">🐻</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-pink-500">BearBooLetters</CardTitle>
          <CardDescription>
            Your secure, cute chat portal for couples 💌
          </CardDescription>
        </CardHeader>
        
        <Tabs defaultValue="login" onValueChange={(value) => setIsLogin(value === "login")}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Password</label>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Chat Secret Password
                    <span className="text-xs text-gray-500 ml-1">
                      (for encryption)
                    </span>
                  </label>
                  <Input
                    type="password"
                    placeholder="Enter secret password for chat"
                    value={chatPassword}
                    onChange={(e) => setChatPassword(e.target.value)}
                    required
                  />
                  <p className="text-xs text-gray-500">
                    This password encrypts your messages. Share it only with your partner.
                  </p>
                </div>
              </CardContent>
              
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Logging in..." : "Login"}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
          
          <TabsContent value="register">
            <form onSubmit={handleRegister}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Display Name</label>
                  <Input
                    type="text"
                    placeholder="Enter your name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Password</label>
                  <Input
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Confirm Password</label>
                  <Input
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Chat Secret Password
                    <span className="text-xs text-gray-500 ml-1">
                      (for encryption)
                    </span>
                  </label>
                  <Input
                    type="password"
                    placeholder="Create a secret password for chat"
                    value={chatPassword}
                    onChange={(e) => setChatPassword(e.target.value)}
                    required
                  />
                  <p className="text-xs text-gray-500">
                    This password encrypts your messages. Share it only with your partner.
                  </p>
                </div>
              </CardContent>
              
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Registering..." : "Register"}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Login;