import { db } from './firebase.js';
import { collection, addDoc, onSnapshot, query, where, doc, updateDoc, serverTimestamp, setDoc, getDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

export async function createUserProfile(user, role) {
    await setDoc(doc(db, "users", user.uid), { email: user.email, role });
}

export async function getUserRole(user) {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) return userDoc.data().role;
    throw new Error("User profile not found.");
}

export async function addDonation(user, { foodName, quantity, phone, address }) {
    await addDoc(collection(db, "donations"), {
        donorId: user.uid,
        foodName, quantity, phone, address,
        status: 'available',
        createdAt: serverTimestamp(),
        recipientId: null,
        recipientEmail: null
    });
}

export function listenToDonations(user, role, callback) {
    let q = role === 'donor'
        ? query(collection(db, "donations"), where("donorId", "==", user.uid))
        : query(collection(db, "donations"), where("status", "==", "available"));
    return onSnapshot(q, (snap) => {
        callback(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
}

export function listenToClaimedDonations(user, callback) {
    const q = query(collection(db, "donations"), where("status", "==", "claimed"), where("recipientId", "==", user.uid));
    return onSnapshot(q, (snap) => {
        callback(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
}

export async function claimDonation(donationId, user) {
    await updateDoc(doc(db, "donations", donationId), {
        status: 'claimed', recipientId: user.uid, recipientEmail: user.email
    });
}

export async function deleteDonation(donationId) {
    await deleteDoc(doc(db, "donations", donationId));
}
