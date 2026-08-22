const admin = require('firebase-admin');

async function run() {
  const serviceAccount = require('./community-service-account.json');
  
  const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  
  const token = await app.options.credential.getAccessToken();
  
  const res = await fetch(`https://firebase.googleapis.com/v1beta1/projects/${serviceAccount.project_id}/webApps`, {
    headers: { Authorization: `Bearer ${token.access_token}` }
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
run().catch(console.error);
