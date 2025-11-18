
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyApjz50mcs0l8k3qdMUUwZUa-ZP_eACT0s",
  authDomain: "ai-english-content-generator.firebaseapp.com",
  projectId: "ai-english-content-generator",
  storageBucket: "ai-english-content-generator.appspot.com",
  messagingSenderId: "734365758140",
  appId: "1:734365758140:web:adf3ef43dbc11d904556b9",
  measurementId: "G-PRDT6EG2Y5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);