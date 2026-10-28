// RENZ MANGA Firebase configuration
// Isi nilai di bawah menggunakan Firebase Console > Project settings > Your apps.
// Jangan menaruh private service-account keys atau server secrets di file ini.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAJ6GeIYgjCiKxIIZsw2EltOqxP6cHjnZg",
  authDomain: "simulasi-login.firebaseapp.com",
  projectId: "simulasi-login",
  storageBucket: "simulasi-login.firebasestorage.app",
  messagingSenderId: "232187268251",
  appId: "1:232187268251:web:71c1fa5b8b403368ef4a3e"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
