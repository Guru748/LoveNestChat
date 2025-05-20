import { useState, useEffect } from 'react';
import { 
  auth, 
  loginUser, 
  registerUser, 
  logoutUser, 
  resetPassword,
  updateUserProfile,
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
      await loginUser(email, password);
      toast({
        title: "Login successful",
        description: "Welcome back! 💕",
      });
      return true;
    } catch (error: any) {
      let message = "Failed to login. Please check your credentials.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        message = "Incorrect email or password. Please try again.";
      }
      toast({
        title: "Login failed",
        description: message,
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
      const result = await registerUser(email, password);
      
      // Set display name
      if (displayName) {
        await updateUserProfile(displayName);
      }
      
      toast({
        title: "Registration successful",
        description: "Welcome to BearBooLetters! 💖",
      });
      return true;
    } catch (error: any) {
      let message = "Failed to register. Please try again.";
      if (error.code === 'auth/email-already-in-use') {
        message = "This email is already registered. Try logging in instead.";
      } else if (error.code === 'auth/weak-password') {
        message = "Password is too weak. Please use a stronger password.";
      }
      toast({
        title: "Registration failed",
        description: message,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await logoutUser();
      toast({
        title: "Logged out",
        description: "Hope to see you soon! 👋",
      });
      return true;
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Reset password function
  const sendPasswordReset = async (email: string) => {
    try {
      await resetPassword(email);
      toast({
        title: "Reset email sent",
        description: "Check your inbox for password reset instructions.",
      });
      return true;
    } catch (error) {
      toast({
        title: "Password reset failed",
        description: "Failed to send reset email. Please try again.",
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