// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBAMriRPBrgSpa_1wDATjddoC1OMZXkU2Y",
  authDomain: "studysync-6db14.firebaseapp.com",
  projectId: "studysync-6db14",
  storageBucket: "studysync-6db14.appspot.com",
  messagingSenderId: "342130002403",
  appId: "1:342130002403:web:be184bfb45b219fa2bf8d6",
  measurementId: "G-D4L79SG6YK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);