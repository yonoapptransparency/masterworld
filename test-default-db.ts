import { getFirebaseAdminDb } from './src/server/firebase';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const admin = require('firebase-admin');
  const app = admin.apps.length > 0 ? admin.apps[0] : null;
  if (app) {
    const db = app.firestore();
    const snap = await db.collection('reviews').limit(10).get();
    console.log('Default DB reviews count:', snap.size);
  }
}
// Trigger init
getFirebaseAdminDb();
run().catch(console.error);
