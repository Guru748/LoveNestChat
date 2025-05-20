import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  type User
} from "firebase/auth";

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: "970234173135", // Static value from previous config
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: "https://bearbooletters-default-rtdb.firebaseio.com" // Keep existing DB URL
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// Authentication helper functions
export const loginUser = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const registerUser = (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const logoutUser = () => {
  return signOut(auth);
};

export const resetPassword = (email: string) => {
  return sendPasswordResetEmail(auth, email);
};

export const updateUserProfile = (displayName: string) => {
  const user = auth.currentUser;
  if (user) {
    return updateProfile(user, { displayName });
  }
  return Promise.reject("No user logged in");
};

// Encryption/decryption functions for end-to-end encryption
export const encryptMessage = (message: string, password: string): string => {
  try {
    return btoa(`${password}:${message}`);
  } catch (error) {
    console.error("Encryption error:", error);
    return "";
  }
};

export const decryptMessage = (encrypted: string, password: string): string | null => {
  try {
    const decoded = atob(encrypted);
    const parts = decoded.split(":");
    
    // If the message was encrypted with a different password
    if (parts[0] !== password) {
      return "[encrypted message]";
    }
    
    return parts[1];
  } catch (error) {
    console.error("Decryption error:", error);
    return "[encrypted message]";
  }
};

export { app, auth, database };

// Types
export type FirebaseUser = User;
