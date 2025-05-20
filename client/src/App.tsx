import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Login from "@/pages/Login";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/chat" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

// This theme class will ensure the theme is applied from the beginning
const setInitialTheme = () => {
  const savedTheme = localStorage.getItem("bearBooTheme") || "theme-pink";
  document.body.className = savedTheme;
};

function App() {
  const [loading, setLoading] = useState(true);
  
  // Set initial theme when app loads
  useEffect(() => {
    setInitialTheme();
    
    // Listen for auth state changes to ensure we don't flash UI
    const unsubscribe = onAuthStateChanged(auth, () => {
      setTimeout(() => {
        setLoading(false);
      }, 500);
    });
    
    return () => unsubscribe();
  }, []);
  
  // Show loading state while app initializes
  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-r from-pink-100 to-pink-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto relative">
            <div className="absolute inset-0 flex items-center justify-center animate-heart-beat">
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
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
