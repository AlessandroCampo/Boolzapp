// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCw_3uYrv22iie3ZJ_wudtBlqclKYxtQmM",
    authDomain: "boolzapp2.firebaseapp.com",
    projectId: "boolzapp2",
    storageBucket: "boolzapp2.appspot.com",
    messagingSenderId: "545073900087",
    appId: "1:545073900087:web:ed6b4ccc9836be58382db2",
    measurementId: "G-Y38Y8Y26DQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

import { getAuth } from "firebase/auth"; // Import getAuth function from Firebase Authentication SDK

import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"
const storage = getStorage(app)
export const db = getFirestore(app)
export const auth = getAuth(app)
export { storage }
