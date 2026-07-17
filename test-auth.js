const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

const app = initializeApp({
  projectId: "gen-lang-client-0825832493",
  appId: "1:103973989874:web:733a6afd8e837224900f6b",
  apiKey: "AIzaSyBey9sUbeWlrcXS2kl4ewOzkTy4arg03Ok",
  authDomain: "gen-lang-client-0825832493.firebaseapp.com"
});

const auth = getAuth(app);
signInWithEmailAndPassword(auth, "defentechscholar@gmail.com", "admin123")
  .then(() => console.log("Success!"))
  .catch(e => console.error("Error:", e.message));
