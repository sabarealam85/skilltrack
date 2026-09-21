import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBoxgau8NBuGzLnUvHc9vvLZUsYZWzjj1M",
  authDomain: "skilltrack-35b33.firebaseapp.com",
  projectId: "skilltrack-35b33",
  storageBucket: "skilltrack-35b33.firebasestorage.app",
  messagingSenderId: "420889221166",
  appId: "1:420889221166:web:9be035953d19eb6e6927bf"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);