// firebase-config.js
const firebaseConfig = {
    apiKey: "AIzaSyAQO4sp9IYdyo0nqSS_lc4I0OdgrlILstw",
    authDomain: "univen-findit.firebaseapp.com",
    projectId: "univen-findit",
    storageBucket: "univen-findit.firebasestorage.app",
    messagingSenderId: "844961646054",
    appId: "1:844961646054:web:22035ff53459a5f6638227"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const db = firebase.firestore();
const auth = firebase.auth();

// Make available globally
window.db = db;
window.auth = auth;

