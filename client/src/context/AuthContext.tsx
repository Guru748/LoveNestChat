import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  auth, 
  loginUser, 
  registerUser, 
  logoutUser, 
  type FirebaseUser 
} from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

interface AuthContextProps {
  currentUser: FirebaseUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, displayName: string) => Promise<boolean>;
  logout: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextProps | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      await loginUser(email, password);
      toast({
        title: "Login successful",
        description: "Welcome back to BearBooLetters! 💕",
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

  const register = async (email: string, password: string, displayName: string) => {
    try {
      setLoading(true);
      const userCredential = await registerUser(email, password);
      
      // You can update the user profile here if needed
      
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

  const logout = async () => {
    try {
      await logoutUser();
      toast({
        title: "Logged out",
        description: "Come back soon! 👋",
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

  const value = {
    currentUser,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};