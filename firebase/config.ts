import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// =================================================================
// ==== IMPORTANT: REPLACE WITH YOUR FIREBASE PROJECT CONFIGURATION ====
// =================================================================
// 1. Go to your Firebase project console.
// 2. In the project settings, find your web app's configuration object.
// 3. Copy the values and paste them here.
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);