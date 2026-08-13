import fetch from 'node-fetch';

async function getFirebaseLogo() {
  const projectId = 'ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a'; // Default
  const dbId = '(default)';
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbId}/documents/store_data/settings`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log("Firebase settings:", JSON.stringify(data.fields.logo_url, null, 2));
    console.log("Firebase favicon:", JSON.stringify(data.fields.favicon_url, null, 2));
  } catch (err) {
    console.error(err);
  }
}
getFirebaseLogo();
