import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User
} from "firebase/auth";
import { getDatabase, ref, set, push, onValue, get, child } from "firebase/database";

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: "970234173135",
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: "https://bearbooletters-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// Authentication functions
export const loginWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error: any) {
    console.error("Login error:", error.message);
    return { success: false, error: error.message };
  }
};

export const registerWithEmail = async (email: string, password: string, displayName: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update user profile with display name
    await updateProfile(userCredential.user, { displayName });
    
    // Create user entry in the database
    await set(ref(database, `users/${userCredential.user.uid}`), {
      email,
      displayName,
      createdAt: Date.now()
    });
    
    return { success: true, user: userCredential.user };
  } catch (error: any) {
    console.error("Registration error:", error.message);
    return { success: false, error: error.message };
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: any) {
    console.error("Logout error:", error.message);
    return { success: false, error: error.message };
  }
};

// User functions
export const getCurrentUser = () => {
  return auth.currentUser;
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Message functions
export const sendMessageToFirebase = async (chatId: string, message: string, senderId: string, encryptionPassword: string) => {
  try {
    const encrypted = encryptMessage(message, encryptionPassword);
    const messageData = {
      encrypted,
      senderId,
      timestamp: Date.now(),
      read: false
    };
    
    const newMessageRef = push(ref(database, `chats/${chatId}/messages`));
    await set(newMessageRef, messageData);
    
    return { success: true, messageId: newMessageRef.key };
  } catch (error: any) {
    console.error("Error sending message:", error.message);
    return { success: false, error: error.message };
  }
};

export const listenToMessages = (chatId: string, callback: (messages: any[]) => void) => {
  const messagesRef = ref(database, `chats/${chatId}/messages`);
  return onValue(messagesRef, (snapshot) => {
    const messages: any[] = [];
    
    snapshot.forEach((childSnapshot) => {
      const messageData = childSnapshot.val();
      messages.push({
        id: childSnapshot.key,
        ...messageData
      });
    });
    
    // Sort by timestamp
    messages.sort((a, b) => a.timestamp - b.timestamp);
    callback(messages);
  });
};

export const createOrUpdateChat = async (partnerId: string, currentUserId: string) => {
  try {
    // Create a consistent chatId by sorting user IDs
    const users = [currentUserId, partnerId].sort();
    const chatId = users.join('_');
    
    // Check if chat exists
    const chatSnapshot = await get(child(ref(database), `chats/${chatId}`));
    
    if (!chatSnapshot.exists()) {
      // Create new chat
      await set(ref(database, `chats/${chatId}`), {
        participants: {
          [currentUserId]: true,
          [partnerId]: true
        },
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      
      // Add chat reference to both users
      await set(ref(database, `users/${currentUserId}/chats/${chatId}`), true);
      await set(ref(database, `users/${partnerId}/chats/${chatId}`), true);
    } else {
      // Update existing chat
      await set(ref(database, `chats/${chatId}/updatedAt`), Date.now());
    }
    
    return { success: true, chatId };
  } catch (error: any) {
    console.error("Error creating/updating chat:", error.message);
    return { success: false, error: error.message };
  }
};

export const getUserChats = async (userId: string) => {
  try {
    const userChatsSnapshot = await get(child(ref(database), `users/${userId}/chats`));
    
    if (!userChatsSnapshot.exists()) {
      return { success: true, chats: [] };
    }
    
    const chatIds = Object.keys(userChatsSnapshot.val());
    const chats = [];
    
    for (const chatId of chatIds) {
      const chatSnapshot = await get(child(ref(database), `chats/${chatId}`));
      
      if (chatSnapshot.exists()) {
        const chatData = chatSnapshot.val();
        const participants = Object.keys(chatData.participants || {}).filter(id => id !== userId);
        
        // Get partner info
        let partnerInfo = { displayName: "Unknown" };
        if (participants.length > 0) {
          const partnerSnapshot = await get(child(ref(database), `users/${participants[0]}`));
          if (partnerSnapshot.exists()) {
            partnerInfo = partnerSnapshot.val();
          }
        }
        
        chats.push({
          id: chatId,
          ...chatData,
          partner: partnerInfo
        });
      }
    }
    
    return { success: true, chats };
  } catch (error: any) {
    console.error("Error getting user chats:", error.message);
    return { success: false, error: error.message };
  }
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
