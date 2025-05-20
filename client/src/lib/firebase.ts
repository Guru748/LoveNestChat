import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Firebase configuration from attached_assets/script.js
const firebaseConfig = {
  apiKey: "AIzaSyBVu_Eaf0k8OcK6XOBDCucvUDAgZXgn7ko",
  authDomain: "bearbooletters.firebaseapp.com",
  projectId: "bearbooletters",
  storageBucket: "bearbooletters.firebasestorage.app",
  messagingSenderId: "970234173135",
  appId: "1:970234173135:web:3a2717ba1672f1d1ea49ba",
  databaseURL: "https://bearbooletters-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { app, database };
