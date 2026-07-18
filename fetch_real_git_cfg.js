const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');

async function main() {
  try {
    const rawData = fs.readFileSync('firebase-applet-config.json', 'utf8');
    const config = JSON.parse(rawData);
    
    const projectId = config.projectId;
    console.log(`Initializing firebase-admin for project: ${projectId}`);
    
    admin.initializeApp({
      projectId,
      credential: admin.credential.applicationDefault()
    });
    const db = getFirestore(config.firestoreDatabaseId || 'ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a');
    const docRef = db.collection('sec_git').doc('cfg');
    const docSnap = await docRef.get();
    
    if (docSnap.exists) {
      const data = docSnap.data();
      console.log("SUCCESS: Retrieved Git config safely!");
      console.log(`Owner: ${data.owner}`);
      console.log(`Repo: ${data.repo}`);
      console.log(`Branch: ${data.branch}`);
      console.log(`Has Token: ${!!data.token} (Length: ${data.token ? data.token.length : 0})`);
      
      // Save it temporarily in a secure local object, do not log the token to the user
      fs.writeFileSync('.git_config_temp.json', JSON.stringify(data, null, 2));
    } else {
      console.log("No git config found in Firestore collection 'sec_git', doc 'cfg'.");
    }
  } catch (error) {
    console.error("Error fetching git config via firebase-admin:", error);
  }
}

main();
