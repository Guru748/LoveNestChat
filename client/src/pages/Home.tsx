import { useEffect } from "react";
import { useLocation } from "wouter";
import ChatInterface from "@/components/ChatInterface";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const Home = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    // Check if user is logged in via Firebase Auth
    if (!loading && !isAuthenticated) {
      toast({
        title: "Login required",
        description: "Please login to access your private chat",
      });
      setLocation("/");
      return;
    }

    // Check if encryption password is set
    const encryptionPassword = sessionStorage.getItem("bearBooPassword");
    if (!encryptionPassword && isAuthenticated) {
      toast({
        title: "Chat password required",
        description: "Please provide your secret chat password for message encryption",
        variant: "destructive",
      });
      // Redirect to login to get the encryption password
      setLocation("/");
    }
  }, [setLocation, toast, isAuthenticated, loading]);

  // Show loading state while auth is being checked
  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-r from-[hsl(var(--theme-pink-light))] to-pink-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto relative">
            <div className="absolute inset-0 flex items-center justify-center animate-heart-beat">
              <span className="text-4xl">💖</span>
            </div>
          </div>
          <div className="text-[hsl(var(--primary))] font-semibold">
            Loading your love messages...
          </div>
        </div>
      </div>
    );
  }

  // Only render chat interface if authenticated and encryption password exists
  return isAuthenticated ? <ChatInterface /> : null;
};

export default Home;
