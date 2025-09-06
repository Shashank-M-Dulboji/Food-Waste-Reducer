import { auth } from './firebase.js';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { createUserProfile, getUserRole } from './firestore.js';

let donationsUnsubscribe = null;

export function initAuth(onLogin, onLogout) {
    onAuthStateChanged(auth, async (user) => {
        if (donationsUnsubscribe) {
            donationsUnsubscribe();
            donationsUnsubscribe = null;
        }
        if (user) {
            try {
                const role = await getUserRole(user);
                donationsUnsubscribe = onLogin(user, role);
            } catch {
                onLogout();
            }
        } else {
            onLogout();
        }
    });
}

export async function handleSignup(email, password, role) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await createUserProfile(userCredential.user, role);
}

export async function handleLogin(email, password) {
    await signInWithEmailAndPassword(auth, email, password);
}

export function handleLogout() {
    signOut(auth);
}