import { getFirebaseAdminDb } from './src/server/firebase';
import dotenv from 'dotenv';
dotenv.config();
async function run() {
  const db = getFirebaseAdminDb();
  if (db) {
    const snap = await db.collection('reviews').limit(10).get();
    console.log('Main DB reviews count:', snap.size);
  }
}
run().catch(console.error);
