const admin = require('firebase-admin');
const fs = require('fs');
let config = {};
if (fs.existsSync('firebase-applet-config.json')) {
    config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
}
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT;
if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
    console.log("Using service account");
    admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath)),
        projectId: config.projectId || "ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a"
    });
} else {
    admin.initializeApp({ projectId: config.projectId || "ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a" });
}

const db = admin.firestore();

async function run() {
    const metaSnap = await db.collection('store_data').doc('apps_meta').get();
    if (metaSnap.exists) {
        const numChunks = metaSnap.data().numChunks || 1;
        console.log("Found", numChunks, "chunks");
        for (let i = 0; i < numChunks; i++) {
            const chunkSnap = await db.collection('store_data').doc(`apps_chunk_${i}`).get();
            if (chunkSnap.exists && Array.isArray(chunkSnap.data().items)) {
                const items = chunkSnap.data().items;
                let updated = false;
                for (let j = 0; j < items.length; j++) {
                    const data = items[j];
                    if (data.slug && !data.url) {
                        items[j].url = `https://play.google.com/store/apps/details?id=com.rummydex.${data.slug}`;
                        updated = true;
                    }
                }
                if (updated) {
                    await chunkSnap.ref.update({ items });
                    console.log(`Updated chunk ${i}`);
                }
            }
        }
    }
}

run().catch(console.error);
