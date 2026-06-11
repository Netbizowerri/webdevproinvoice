import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAr_7d2qNBAYwUO4APdXQigBMEdrUUTxhw",
  authDomain: "zero-to-production-db.firebaseapp.com",
  projectId: "zero-to-production-db",
  storageBucket: "zero-to-production-db.firebasestorage.app",
  messagingSenderId: "61608996348",
  appId: "1:61608996348:web:0830b466f3cf3ecb9f1679"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
