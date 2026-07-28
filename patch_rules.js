const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf8');

const oldStoreData = `    // 5. Store data collection (app catalog, public settings, news, blogs, videos, secure links vault)
    match /store_data/{docId} {
      allow read, write: if true;
    }

    // 6. Secure Git Configuration collection
    match /sec_git/{docId} {
      allow read, write: if true;
    }`;

const newStoreData = `    // 5. Store data collection (app catalog, public settings, news, blogs, videos, secure links vault)
    match /store_data/{docId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // 6. Secure Git Configuration collection
    match /sec_git/{docId} {
      allow read, write: if isAdmin();
    }

    // 8. 2FA State collection
    match /admins_2fa/{docId} {
      allow read, write: if false; // Server-side only via Admin SDK
    }`;

code = code.replace(oldStoreData, newStoreData);
fs.writeFileSync('firestore.rules', code);
