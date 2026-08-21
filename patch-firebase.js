const fs = require('fs');
let code = fs.readFileSync('src/server/firebase.ts', 'utf8');

code = code.replace(
  'const envProjectId = getValidEnv(process.env.VITE_FIREBASE_PROJECT_ID, process.env.VITE_FIREBASE_JECT_ID, process.env.FIREBASE_PROJECT_ID);',
  `let envProjectId = getValidEnv(process.env.VITE_FIREBASE_PROJECT_ID, process.env.VITE_FIREBASE_JECT_ID, process.env.FIREBASE_PROJECT_ID);
  if (envProjectId === 'ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a') {
    envProjectId = 'gen-lang-client-0825832493';
  }`
);

fs.writeFileSync('src/server/firebase.ts', code);
console.log("Patched firebase.ts");
