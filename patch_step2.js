const fs = require('fs');
let code = fs.readFileSync('src/contexts/DataContext.tsx', 'utf8');

const newSaveApps = `  const saveApps = React.useCallback(async (newApps: AppConfig[]) => {
    console.log("Save Apps: Initiating sync sequence...");
    setApps(newApps);
    localStorage.setItem('rummystore_apps', JSON.stringify(newApps));
    if (!isFirebaseReal || !db) {
      console.warn("Save Apps: Firebase not configured, saved to localStorage only.");
      return;
    }
    const CHUNK_SIZE = 25;
    const numChunks = Math.ceil(newApps.length / CHUNK_SIZE) || 1;
    const now = new Date().toISOString();
    // Write app chunks to Firestore — this is the PRIMARY operation
    try {
      const chunkPromises = [];
      for (let i = 0; i < numChunks; i++) {
        const chunk = JSON.parse(JSON.stringify(newApps.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)));
        chunk.forEach((app: any) => {
          delete app.more_information_url;
          delete app.encrypted_download_url;
          delete app.download_url;
        });
        chunkPromises.push(
          withServerConfirmation(() => setDoc(doc(db, 'store_data', \`apps_chunk_\${i}\`), { items: chunk }), 30000)
        );
      }
      await Promise.all(chunkPromises);
      await withServerConfirmation(() => setDoc(doc(db, 'store_data', 'apps_meta'), { numChunks, last_updated: now }), 30000);
      console.log("Cloud: App chunks and metadata written successfully.");
    } catch (dbErr: any) {
      throw new Error("Cloud Save Failed: " + dbErr.message);
    }
    // Encrypt and save URLs — SECONDARY, non-blocking, runs in background
    const secureLinks = newApps.map(a => ({ id: a.id, url: a.more_information_url || '' }));
    adminFetch('/api/v1/admin/encrypt-links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: secureLinks })
    }).then(async (encRes) => {
      if (encRes.ok) {
        const encJSON = await encRes.json();
        const encryptedData = encJSON.encrypted;
        if (encryptedData && db) {
          const payload = { encryptedData, lastUpdated: new Date().toISOString() };
          await Promise.all([
            setDoc(doc(db, 'store_data', 'secure_links'), payload),
            setDoc(doc(db, 'store_data', 'sec_vault'), payload),
            setDoc(doc(db, 'store_data', 'sec_links_vault_3'), payload),
          ]).catch(e => console.warn("Vault write warning:", e));
          console.log("Cloud: Secure vault written.");
        }
      } else {
        console.warn("URL encryption failed (non-blocking):", await encRes.text());
      }
    }).catch(e => console.warn("URL encryption error (non-blocking):", e));
    // Background server sync
    updateLocalContainerBackup(newApps, settings, news, blogs, videos).catch(err => {
      console.warn("Background local sync error:", err);
    });
    console.log("Save Apps: Firestore write complete.");
  }, [settings, news, blogs, videos, updateLocalContainerBackup, withServerConfirmation]);`;

code = code.replace(/  const saveApps = React\.useCallback\(async \(newApps: AppConfig\[\]\) => \{[\s\S]*?  \}, \[settings, news, blogs, videos, updateLocalContainerBackup, withServerConfirmation\]\);/, newSaveApps);
fs.writeFileSync('src/contexts/DataContext.tsx', code);
