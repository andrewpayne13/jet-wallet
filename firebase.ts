// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA761ZioHZ4OCQ21c1MWiT00Xa4ZWjqQec",
  authDomain: "jet-wallet-17fe0.firebaseapp.com",
  projectId: "jet-wallet-17fe0",
  storageBucket: "jet-wallet-17fe0.firebasestorage.app",
  messagingSenderId: "757039775807",
  appId: "1:757039775807:web:69fc74bfd9d9708989388a",
  measurementId: "G-8FTM3DY0ZP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
