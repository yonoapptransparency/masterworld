const fs = require('fs');
let code = fs.readFileSync('src/server/firebase.ts', 'utf8');
code = code.replace(
  `      } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        admin.initializeApp({ projectId: config?.projectId });
        lastAdminSdkStatusMsg = "Initialized using GOOGLE_APPLICATION_CREDENTIALS";
        console.log('[Admin SDK] Initialized with GOOGLE_APPLICATION_CREDENTIALS.');
      } else {
        lastAdminSdkStatusMsg = "No Service Account variable found on server. Looked for FIREBASE_ACCOUNT, FIREBASE_SERVICE_ACCOUNT, etc.";
        console.warn('[Admin SDK] No service account env var found. Admin SDK in REST fallback mode.');
        return null;
      }`,
  `      } else {
        // Fallback to Application Default Credentials (ADC) for Cloud Run
        try {
          admin.initializeApp({ projectId: config?.projectId });
          lastAdminSdkStatusMsg = "Initialized using Application Default Credentials (Cloud Run)";
          console.log('[Admin SDK] Initialized with ADC.');
        } catch (e) {
          lastAdminSdkStatusMsg = "ADC Initialization failed: " + e.message;
          console.warn('[Admin SDK] ADC fallback failed.');
          return null;
        }
      }`
);
fs.writeFileSync('src/server/firebase.ts', code);
