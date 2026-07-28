const fs = require('fs');
let code = fs.readFileSync('src/contexts/DataContext.tsx', 'utf8');

const tripleWriteRegex = /await Promise\.all\(\[\s*setDoc\(doc\(db, 'store_data', 'secure_links'\), payload\),\s*setDoc\(doc\(db, 'store_data', 'sec_vault'\), payload\),\s*setDoc\(doc\(db, 'store_data', 'sec_links_vault_3'\), payload\),\s*\]\)\.catch\(e => console\.warn\("Vault write warning:", e\)\);/;
const singleWrite = `await setDoc(doc(db, 'store_data', 'secure_links'), payload).catch(e => console.warn("Vault write warning:", e));`;
code = code.replace(tripleWriteRegex, singleWrite);


const oldSecureLinksMap = `const secureLinks = newApps.map(a => ({ id: a.id, url: a.more_information_url || '' }));`;
const newSecureLinksMap = `const secureLinks = newApps
      .filter(a => {
        const oldApp = apps.find(o => o.id === a.id);
        return !oldApp || oldApp.more_information_url !== a.more_information_url;
      })
      .map(a => ({ id: a.id, url: a.more_information_url || '' }));

    if (secureLinks.length === 0) {
      console.log("No secure link changes detected, skipping vault write.");
      updateLocalContainerBackup(newApps, settings, news, blogs, videos).catch(err => {
        console.warn("Background local sync error:", err);
      });
      console.log("Save Apps: Firestore write complete.");
      return;
    }`;
    
code = code.replace(oldSecureLinksMap, newSecureLinksMap);
fs.writeFileSync('src/contexts/DataContext.tsx', code);
