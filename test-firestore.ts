import { db } from './src/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

async function test() {
  if (db) {
    const snap = await getDoc(doc(db, 'sec_git', 'cfg'));
    console.log(snap.exists() ? snap.data() : 'not found');
  } else {
    console.log('no db');
  }
}
test();
