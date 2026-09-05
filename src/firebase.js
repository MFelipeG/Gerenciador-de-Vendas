import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCSYPiXjnIyGF1rfyJ0hSNvSelercmpcDc",
  authDomain: "gerenciador-de-vendas-e39f2.firebaseapp.com",
  projectId: "gerenciador-de-vendas-e39f2",
  storageBucket: "gerenciador-de-vendas-e39f2.firebasestorage.app",
  messagingSenderId: "278796221137",
  appId: "1:278796221137:web:39daceb5d0c9c131f563f0"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
