const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config({ path: '/app/.dev.env.json' });

const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
const databaseId = process.env.VITE_FIREBASE_DATABASE_ID || '(default)';
const apiKey = process.env.VITE_FIREBASE_API_KEY;

const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents/sec_git/cfg?key=${apiKey}`;
fetch(url).then(res => res.json()).then(data => {
  console.log(JSON.stringify(data, null, 2));
}).catch(console.error);
