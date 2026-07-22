import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBhPokUO_fHx_eRTgr4zG0T16i1tvAR_rE",
  authDomain: "aquaguard-ai-305d5.firebaseapp.com",
  projectId: "aquaguard-ai-305d5",
  storageBucket: "aquaguard-ai-305d5.firebasestorage.app",
  messagingSenderId: "1093471815024",
  appId: "1:1093471815024:web:cbb0573131a5681a293bb5",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;