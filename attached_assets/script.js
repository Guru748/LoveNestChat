
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBVu_Eaf0k8OcK6XOBDCucvUDAgZXgn7ko",
  authDomain: "bearbooletters.firebaseapp.com",
  projectId: "bearbooletters",
  storageBucket: "bearbooletters.firebasestorage.app",
  messagingSenderId: "970234173135",
  appId: "1:970234173135:web:3a2717ba1672f1d1ea49ba",
  databaseURL: "https://bearbooletters-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const messagesRef = ref(db, 'messages');

let secret = '';
const chat = document.getElementById("chat");
const messages = document.getElementById("messages");

function unlock() {
  secret = document.getElementById("password").value;
  if (secret.length > 0) {
    chat.classList.remove("hidden");
    listenForMessages();
  }
}

function encrypt(message) {
  return btoa(secret + ":" + message);
}

function decrypt(encoded) {
  const decoded = atob(encoded);
  return decoded.split(":")[1];
}

function sendMessage() {
  const msg = document.getElementById("message").value;
  const encrypted = encrypt(msg);
  push(messagesRef, encrypted);
  document.getElementById("message").value = '';
}

function listenForMessages() {
  onValue(messagesRef, (snapshot) => {
    messages.innerHTML = "";
    snapshot.forEach(childSnapshot => {
      const encrypted = childSnapshot.val();
      const li = document.createElement("li");
      li.textContent = decrypt(encrypted);
      messages.appendChild(li);
    });
  });
}

window.unlock = unlock;
window.sendMessage = sendMessage;
