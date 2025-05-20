import { useEffect } from "react";
import { useLocation } from "wouter";
import ChatInterface from "@/components/ChatInterface";
import { useToast } from "@/hooks/use-toast";

const Home = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is logged in
    const password = sessionStorage.getItem("bearBooPassword");
    if (!password) {
      toast({
        title: "Login required",
        description: "Please enter your password to access the chat",
      });
      setLocation("/");
    }
  }, [setLocation, toast]);

  return <ChatInterface />;
};

export default Home;
