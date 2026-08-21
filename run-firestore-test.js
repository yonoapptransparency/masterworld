const fetch = require('node-fetch') || globalThis.fetch;
(async () => {
    const FIREBASE_PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || 'gen-lang-client-0825832493';
    const dbId = process.env.VITE_FIREBASE_DATABASE_ID || process.env.FIREBASE_DATABASE_ID || 'ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a';
    const apiKey = process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY || '';
    const apiSuffix = apiKey ? `?key=${apiKey}` : '';
    
    console.log(`URL: https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/${dbId}/documents/store_data/sec_public_links${apiSuffix}`);
    const fsRes = await fetch(`https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/${dbId}/documents/store_data/sec_public_links${apiSuffix}`);
    console.log('Status:', fsRes.status);
    const body = await fsRes.text();
    console.log('Body:', body.substring(0, 100));
})();
