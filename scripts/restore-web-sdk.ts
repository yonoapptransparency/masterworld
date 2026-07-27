import { initializeApp } from "firebase/app";
import { getFirestore, setDoc, doc } from "firebase/firestore";
import * as fs from 'fs';
import * as path from 'path';

const configPath = path.resolve(__dirname, '../firebase-applet-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId || '(default)');

const { mockApps, mockSettings, mockNews, mockBlogs, mockVideos } = require('../src/lib/staticData');

async function restore() {
  console.log('Restoring settings...');
  await setDoc(doc(db, 'store_data', 'public_settings'), mockSettings || {});

  console.log('Restoring news...');
  await setDoc(doc(db, 'store_data', 'news'), { items: mockNews || [] });

  console.log('Restoring blogs...');
  await setDoc(doc(db, 'store_data', 'blogs'), { items: mockBlogs || [] });

  console.log('Restoring videos...');
  await setDoc(doc(db, 'store_data', 'videos'), { items: mockVideos || [] });

  console.log('Restoring apps...');
  const apps = mockApps || [];
  const chunkSize = 20;
  const numChunks = Math.ceil(apps.length / chunkSize) || 1;
  
  for (let i = 0; i < numChunks; i++) {
    const chunk = apps.slice(i * chunkSize, (i + 1) * chunkSize);
    await setDoc(doc(db, 'store_data', `apps_chunk_${i}`), { items: chunk });
  }
  
  await setDoc(doc(db, 'store_data', 'apps_meta'), {
    numChunks,
    last_updated: Date.now()
  });

  console.log('Restore complete!');
  process.exit(0);
}

restore().catch(e => {
  console.error(e);
  process.exit(1);
});
