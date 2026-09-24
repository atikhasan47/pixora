// firebase-sync.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, doc, setDoc, getDoc, updateDoc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ⬇️ এখানে আপনার Firebase Config বসান (Firebase Console থেকে কপি করে)
const firebaseConfig = {
  apiKey: "AIzaSy...", // আপনার আসল API Key
  authDomain: "atik-xxxx.firebaseapp.com",
  projectId: "atik-xxxx",
  storageBucket: "atik-xxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:xxxxx"
};

// Firebase ইনিশিয়ালাইজ
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// গ্লোবালি এক্সপোর্ট করুন যাতে অন্য স্ক্রিপ্ট থেকে ব্যবহার করা যায়
window.db = db;
window.firestoreFns = { collection, addDoc, doc, setDoc, getDoc, updateDoc, onSnapshot, query, orderBy };

console.log("✅ Firebase Connected Successfully!");

// ==================================================
// ইউজার সাইড থেকে ডেটা পাঠানোর ফাংশন
// ==================================================
window.syncToFirebase = async function(collectionName, data) {
  if (!window.db) return;
  try {
    await addDoc(collection(window.db, collectionName), {
      ...data,
      timestamp: new Date().toISOString(),
      status: data.status || 'pending'
    });
    console.log("✅ Synced: " + collectionName);
  } catch (e) {
    console.error("❌ Sync Error:", e);
  }
};

// ইউজারের প্রোফাইল সেভ/আপডেট
window.syncUserProfile = async function(user) {
  if (!window.db) return;
  try {
    await setDoc(doc(window.db, "users", user.email), {
      name: user.name || '',
      email: user.email || '',
      username: user.username || '',
      balance: user.balance || 0,
      totalEarned: user.totalEarned || 0,
      adsWatched: user.adsWatched || 0,
      verified: user.verified || false,
      lastUpdate: new Date().toISOString()
    }, { merge: true });
  } catch (e) {
    console.error("❌ User Sync Error:", e);
  }
};

// ==================================================
// ইউজারের ব্যালেন্স রিয়েল-টাইমে লিসেন করা
// ==================================================
window.listenUserBalance = function(email, callback) {
  if (!window.db) return;
  onSnapshot(doc(window.db, "users", email), (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data());
    }
  });
};
