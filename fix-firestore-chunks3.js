const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');

const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT;
if (serviceAccountStr) {
    admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(serviceAccountStr)),
        projectId: "gen-lang-client-0825832493"
    });
} else {
    admin.initializeApp({ projectId: "gen-lang-client-0825832493" });
}

const db = getFirestore(admin.apps[0], "ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a");

async function run() {
    console.log("Checking apps_meta");
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
    } else {
        console.log("No apps_meta found");
    }
}

run().catch(console.error);
