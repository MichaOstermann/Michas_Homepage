// Firebase Configuration
// WICHTIG: Ersetze diese Werte mit deinen echten Firebase-Credentials!
// Siehe RATING-SETUP.md für detaillierte Anleitung

const firebaseConfig = {
  apiKey: "AIzaSyApZdGAxx9lsk7wiIhr5Z338xSQZANXwlk",
  authDomain: "codebeats-ratings.firebaseapp.com",
  databaseURL: "https://codebeats-ratings-default-rtdb.firebaseio.com",
  projectId: "codebeats-ratings",
  storageBucket: "codebeats-ratings.firebasestorage.app",
  messagingSenderId: "240507244168",
  appId: "1:240507244168:web:09d083e7025468a229593d"
};

// Firebase initialisieren
let firebaseApp, database;

try {
  firebaseApp = firebase.initializeApp(firebaseConfig);
  database = firebase.database();
  console.log('✅ Firebase erfolgreich initialisiert');
} catch (error) {
  console.error('❌ Firebase Initialisierungsfehler:', error);
}

// Export für andere Module
window.firebaseDB = database;
