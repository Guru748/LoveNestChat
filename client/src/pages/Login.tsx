import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim()) {
      toast({
        title: "Password required",
        description: "Please enter your secret password 💕",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      // Store the password in session storage (will be used for message encryption)
      sessionStorage.setItem("bearBooPassword", password);
      
      // Redirect to chat
      setLocation("/chat");
    } catch (err) {
      toast({
        title: "Login failed",
        description: "Oops! That doesn't seem right. Try again! 💕",
        variant: "destructive",
      });
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <div className="bg-[hsl(var(--theme-pink-light))] rounded-3xl p-8 w-full max-w-md shadow-xl mx-auto transition-all duration-300">
        {/* Cute bear illustration */}
        <div className="flex justify-center mb-6">
          <div className="rounded-2xl w-32 h-32 flex items-center justify-center shadow-md bg-white">
            <span className="text-6xl">🐻</span>
          </div>
        </div>

        <h1 className="text-3xl text-center mb-6 text-[hsl(var(--primary))]">
          BearBooLetters 💖
        </h1>
        
        <p className="text-center mb-8 text-[hsl(var(--theme-pink-dark))]">
          Enter your secret password to unlock your love chat!
        </p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <Input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Secret password 🔐"
              className="w-full py-4 px-6 rounded-xl border-2 border-[hsl(var(--secondary))] focus:border-[hsl(var(--primary))] focus:outline-none bg-white/80 text-[hsl(var(--theme-pink-dark))] placeholder:text-[hsl(var(--theme-pink-dark))]/50 h-14"
            />
          </div>
          
          <Button
            type="submit"
            disabled={loading}
            className="w-full py-6 px-6 bg-[hsl(var(--primary))] text-white rounded-xl hover:bg-[hsl(var(--accent))] transition-all duration-200 flex items-center justify-center gap-2 h-14"
          >
            <span>{loading ? "Unlocking..." : "Unlock Our Love Chat"}</span>
            <i className="fas fa-heart"></i>
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-[hsl(var(--theme-pink-dark))]/60 text-sm">
            Your messages are secured with love 💘
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
