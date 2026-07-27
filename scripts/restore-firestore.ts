import * as fs from 'fs';
import * as path from 'path';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
const configPath = path.resolve(__dirname, '../firebase-applet-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

admin.initializeApp({
  projectId: config.projectId
});

const { getFirestore } = require('firebase-admin/firestore');
const db = getFirestore(admin.apps[0], config.firestoreDatabaseId || '(default)');

// Load data
const { mockApps, mockSettings, mockNews, mockBlogs, mockVideos } = require('../src/lib/staticData');

async function restore() {
  console.log('Restoring settings...');
  await db.collection('store_data').doc('public_settings').set(mockSettings || {});

  console.log('Restoring news...');
  await db.collection('store_data').doc('news').set({ items: mockNews || [] });

  console.log('Restoring blogs...');
  await db.collection('store_data').doc('blogs').set({ items: mockBlogs || [] });

  console.log('Restoring videos...');
  await db.collection('store_data').doc('videos').set({ items: mockVideos || [] });

  console.log('Restoring apps...');
  const apps = mockApps || [];
  const chunkSize = 20;
  const numChunks = Math.ceil(apps.length / chunkSize) || 1;
  
  for (let i = 0; i < numChunks; i++) {
    const chunk = apps.slice(i * chunkSize, (i + 1) * chunkSize);
    await db.collection('store_data').doc(`apps_chunk_${i}`).set({ items: chunk });
  }
  
  await db.collection('store_data').doc('apps_meta').set({
    numChunks,
    last_updated: Date.now()
  });

  console.log('Restore complete!');
}

restore().catch(console.error);
