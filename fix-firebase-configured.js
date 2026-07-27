const fs = require('fs');
const file = 'src/lib/firebase.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace("export const isFirebaseConfigured = isAdminEnabled && !!firebaseConfig;", "export const isFirebaseConfigured = isAdminEnabled && !!firebaseConfig?.apiKey;");

fs.writeFileSync(file, content);
