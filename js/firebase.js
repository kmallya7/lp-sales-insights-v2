// js/firebase.js

const firebaseConfig = {
  apiKey: "AIzaSyD-JHWOVuWJL8l1jA6a9-VKEO4cGulK1Wk",
  authDomain: "lp-profit-calculator.firebaseapp.com",
  projectId: "lp-profit-calculator",
  storageBucket: "lp-profit-calculator.firebasestorage.app",
  messagingSenderId: "557442999992",
  appId: "1:557442999992:web:9893228dd9b73f2534764d"
};

firebase.initializeApp(firebaseConfig);

// Attach Firestore to the global window object
window.db = firebase.firestore();