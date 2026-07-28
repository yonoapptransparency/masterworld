const fs = require('fs');
let code = fs.readFileSync('src/contexts/DataContext.tsx', 'utf8');

const oldOrder = `        try {
          for (let i = 0; i < numChunks; i++) {
            const chunk = JSON.parse(JSON.stringify(newApps.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)));
            chunk.forEach((app: any) => { 
              delete app.more_information_url; 
              delete app.encrypted_download_url;
              delete app.download_url;
            });
            await withServerConfirmation(() => setDoc(doc(db, 'store_data', \`apps_chunk_\${i}\`), { items: chunk }), 30000);
          }
          
          const metaRef = doc(db, 'store_data', 'apps_meta');
          await withServerConfirmation(() => setDoc(metaRef, { numChunks, last_updated: now }), 30000);
          console.log("Cloud: Metadata and chunks successfully committed via client SDK.");
        } catch (dbErr: any) {
          throw new Error("Cloud Save Failed: " + dbErr.message);
        }
        
        // Save secure links mapping separately (fully encrypted)
        const secureLinks = newApps.map(a => ({ id: a.id, url: a.more_information_url || '' }));
        let encryptedData = '';
        try {
          console.log("Cloud: Encrypting secure links for vault storage...");
          const encRes = await adminFetch('/api/v1/admin/encrypt-links', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: secureLinks })
          });
          
          if (encRes.ok) {
            const encJSON = await encRes.json();
            encryptedData = encJSON.encrypted;
            console.log("Cloud: Link encryption successful.");
          } else {
            throw new Error("Link encryption failed on server: " + await encRes.text());
          }
        } catch (encErr: any) {
          throw new Error("Failed to reach encryption server: " + encErr.message);
        }`;

const newOrder = `        // FIRST: Save secure links mapping separately (fully encrypted)
        // We do this before modifying Firestore chunks so we don't lose links if encryption fails.
        const secureLinks = newApps.map(a => ({ id: a.id, url: a.more_information_url || '' }));
        let encryptedData = '';
        try {
          console.log("Cloud: Encrypting secure links for vault storage...");
          const encRes = await adminFetch('/api/v1/admin/encrypt-links', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: secureLinks })
          });
          
          if (encRes.ok) {
            const encJSON = await encRes.json();
            encryptedData = encJSON.encrypted;
            console.log("Cloud: Link encryption successful.");
          } else {
            throw new Error("Link encryption failed on server: " + await encRes.text());
          }
        } catch (encErr: any) {
          throw new Error("Failed to reach encryption server: " + encErr.message);
        }

        try {
          for (let i = 0; i < numChunks; i++) {
            const chunk = JSON.parse(JSON.stringify(newApps.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)));
            chunk.forEach((app: any) => { 
              delete app.more_information_url; 
              delete app.encrypted_download_url;
              delete app.download_url;
            });
            await withServerConfirmation(() => setDoc(doc(db, 'store_data', \`apps_chunk_\${i}\`), { items: chunk }), 30000);
          }
          
          const metaRef = doc(db, 'store_data', 'apps_meta');
          await withServerConfirmation(() => setDoc(metaRef, { numChunks, last_updated: now }), 30000);
          console.log("Cloud: Metadata and chunks successfully committed via client SDK.");
        } catch (dbErr: any) {
          throw new Error("Cloud Save Failed: " + dbErr.message);
        }`;

code = code.replace(oldOrder, newOrder);
fs.writeFileSync('src/contexts/DataContext.tsx', code);
