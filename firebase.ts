// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
   apiKey: "AIzaSyACDOCzVHcA_3frvxAujPTOXuF2AhrxKIw",
   authDomain: "stamponitapp.firebaseapp.com",
   projectId: "stamponitapp",
   storageBucket: "stamponitapp.firebasestorage.app",
   messagingSenderId: "884950373029",
   appId: "1:884950373029:web:cb36bce7a36123ae37f34c",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
