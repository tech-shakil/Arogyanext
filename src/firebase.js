import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";  
// Replace this with your actual Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyAS9xTMhXI8f1ABckkcTsCDnkWAgAddIes",
  authDomain: "arogyanext-ab375.firebaseapp.com",
  projectId: "arogyanext-ab375",
  storageBucket: "arogyanext-ab375.firebasestorage.app",
  messagingSenderId: "285114479631",
  appId: "1:285114479631:web:66c8ddebc520cf15771f7a",
  measurementId: "G-BTQW8VB642"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);