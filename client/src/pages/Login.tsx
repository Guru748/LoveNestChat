import { useState } from "react";
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
import { Label } from "@/components/ui/label";

const Login = () => {
  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [chatPassword, setChatPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [partnerEmail, setPartnerEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auth hook
  const { login, register, loading, currentUser } = useAuth();
  
  const [, setLocation] = useLocation();
  const { toast } = useToast();

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
    
    if (!email.trim() || !password.trim() || !confirmPassword.trim() || !chatPassword.trim()) {
      toast({
        title: "All fields required",
        description: "Please fill in all required fields 💕",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match 💕",
        variant: "destructive",
      });
      return;
    }

    if (chatPassword.length < 6) {
      toast({
        title: "Chat password too short",
        description: "Your secret chat password should be at least 6 characters 🔒",
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
        setLocation("/chat");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-r from-[hsl(var(--theme-pink-light))] to-pink-50">
      <Card className="w-full max-w-md mx-auto bg-white/95 backdrop-blur rounded-3xl shadow-xl border-pink-100">
        {/* Cute bear illustration */}
        <div className="flex justify-center mt-8">
          <div className="rounded-2xl w-24 h-24 flex items-center justify-center shadow-md bg-[hsl(var(--theme-pink-light))]">
            <span className="text-5xl animate-heart-beat">🐻</span>
          </div>
        </div>

        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-3xl font-bold text-[hsl(var(--primary))]">
            BearBooLetters 💖
          </CardTitle>
          <CardDescription className="text-[hsl(var(--theme-pink-dark))]">
            Send private love notes with end-to-end encryption
          </CardDescription>
        </CardHeader>

        <Tabs defaultValue="login" className="w-full">
          <div className="px-6">
            <TabsList className="grid w-full grid-cols-2 bg-[hsl(var(--theme-pink-light))]/30">
              <TabsTrigger value="login" className="data-[state=active]:bg-white">
                Login
              </TabsTrigger>
              <TabsTrigger value="register" className="data-[state=active]:bg-white">
                Register
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Login Tab */}
          <TabsContent value="login">
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="bg-white/80 border-[hsl(var(--theme-pink-light))]" 
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Account Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your account password"
                    className="bg-white/80 border-[hsl(var(--theme-pink-light))]"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chatPassword">
                    Secret Chat Password
                    <span className="text-xs text-[hsl(var(--muted-foreground))] ml-1">
                      (for encryption)
                    </span>
                  </Label>
                  <Input
                    id="chatPassword"
                    type="password"
                    value={chatPassword}
                    onChange={(e) => setChatPassword(e.target.value)}
                    placeholder="Secret password for chats 🔐"
                    className="bg-white/80 border-[hsl(var(--theme-pink-light))]"
                    required
                  />
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    This password encrypts your messages. Share it only with your partner.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col">
                <Button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className="w-full bg-[hsl(var(--primary))] hover:bg-[hsl(var(--accent))]"
                >
                  {isSubmitting ? "Logging In..." : "Login to Chat"}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>

          {/* Register Tab */}
          <TabsContent value="register">
            <form onSubmit={handleRegister}>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="registerEmail">Email</Label>
                  <Input
                    id="registerEmail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="bg-white/80 border-[hsl(var(--theme-pink-light))]"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="displayName">Your Name (Optional)</Label>
                  <Input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="What should we call you?"
                    className="bg-white/80 border-[hsl(var(--theme-pink-light))]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="partnerEmail">Partner's Email (Optional)</Label>
                  <Input
                    id="partnerEmail"
                    type="email"
                    value={partnerEmail}
                    onChange={(e) => setPartnerEmail(e.target.value)}
                    placeholder="your.partner@example.com"
                    className="bg-white/80 border-[hsl(var(--theme-pink-light))]"
                  />
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    We'll connect your accounts automatically
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registerPassword">Account Password</Label>
                  <Input
                    id="registerPassword"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    className="bg-white/80 border-[hsl(var(--theme-pink-light))]"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="bg-white/80 border-[hsl(var(--theme-pink-light))]"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registerChatPassword">
                    Secret Chat Password
                    <span className="text-xs text-[hsl(var(--muted-foreground))] ml-1">
                      (for encryption)
                    </span>
                  </Label>
                  <Input
                    id="registerChatPassword"
                    type="password"
                    value={chatPassword}
                    onChange={(e) => setChatPassword(e.target.value)}
                    placeholder="Secret password for chats 🔐"
                    className="bg-white/80 border-[hsl(var(--theme-pink-light))]"
                    required
                  />
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    This password encrypts your messages. Share it only with your partner.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col">
                <Button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className="w-full bg-[hsl(var(--primary))] hover:bg-[hsl(var(--accent))]"
                >
                  {isSubmitting ? "Creating Account..." : "Create Account"}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>

        <div className="p-6 pt-0 text-center">
          <p className="text-[hsl(var(--muted-foreground))] text-xs">
            Your messages are secured with end-to-end encryption 💘
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Login;
