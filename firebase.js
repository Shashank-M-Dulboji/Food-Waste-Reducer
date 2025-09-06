import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBAIz2MBTVoDRQ45ucJLjU3bnNg67K-S_A",
    authDomain: "foodwastereducer-d15c6.firebaseapp.com",
    projectId: "foodwastereducer-d15c6",
    storageBucket: "foodwastereducer-d15c6.appspot.com",
    messagingSenderId: "371616553425",
    appId: "1:371616553425:web:3854225785e229a30ce8f0",
    measurementId: "G-L5MD7RE5MX"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);