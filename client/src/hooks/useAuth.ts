import { useState, useEffect } from 'react';
import { 
  auth, 
  loginWithEmail, 
  registerWithEmail, 
  logout, 
  type FirebaseUser 
} from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

export function useAuth() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const result = await loginWithEmail(email, password);
      
      if (result.success) {
        toast({
          title: "Login successful",
          description: "Welcome back! 💕",
        });
        return true;
      } else {
        let message = "Failed to login. Please check your credentials.";
        if (result.error?.includes('user-not-found') || result.error?.includes('wrong-password')) {
          message = "Incorrect email or password. Please try again.";
        }
        toast({
          title: "Login failed",
          description: message,
          variant: "destructive",
        });
        return false;
      }
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (email: string, password: string, displayName: string) => {
    try {
      setLoading(true);
      const result = await registerWithEmail(email, password, displayName);
      
      if (result.success) {
        toast({
          title: "Registration successful",
          description: "Welcome to BearBooLetters! 💖",
        });
        return true;
      } else {
        let message = "Failed to register. Please try again.";
        if (result.error?.includes('email-already-in-use')) {
          message = "This email is already registered. Try logging in instead.";
        } else if (result.error?.includes('weak-password')) {
          message = "Password is too weak. Please use a stronger password.";
        }
        toast({
          title: "Registration failed",
          description: message,
          variant: "destructive",
        });
        return false;
      }
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const handleLogout = async () => {
    try {
      const result = await logout();
      
      if (result.success) {
        toast({
          title: "Logged out",
          description: "Hope to see you soon! 👋",
        });
        return true;
      } else {
        toast({
          title: "Logout failed",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    user,
    loading,
    login,
    register,
    logout,
    sendPasswordReset,
    isAuthenticated: !!user
  };
}