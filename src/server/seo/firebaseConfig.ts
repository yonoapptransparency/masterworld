import fs from 'fs';
import path from 'path';

export const B64_FALLBACK = "ewogICJwcm9qZWN0SWQiOiAiZ2VuLWxhbmctY2xpZW50LTA4MjU4MzI0OTMiLAogICJhcHBJZCI6ICIxOjEwMzk3Mzk4OTg3NDp3ZWI6NzMzYTZhZmQ4ZTgzNzIyNDkwMGY2YiIsCiAgImFwaUtleSI6ICJBSXphU3lCZXk5c1ViZVdscmNYUzJrbDRld096a1R5NGFyZzAzT2siLAogICJhdXRoRG9tYWluIjogImdlbi1sYW5nLWNsaWVudC0wODI1ODMyNDkzLmZpcmViYXNlYXBwLmNvbSIsCiAgImZpcmVzdG9yZURhdGFiYXNlSWQiOiAiYWktc3R1ZGlvLXlvbm9zdG9yZS04ODYzMTVhNC04YjlmLTRmZjYtODk4Ni1hOTBhZDE3MjIxMGEiLAogICJzdG9yYWdlQnVja2V0IjogImdlbi1sYW5nLWNsaWVudC0wODI1ODMyNDkzLmZpcmViYXNlc3RvcmFnZS5hcHAiLAogICJtZXNzYWdpbmdTZW5kZXJJZCI6ICIxMDM5NzM5ODk4NzQiLAogICJtZWFzdXJlbWVudElkIjogIiIsCiAgIm9BdXRoQ2xpZW50SWQiOiAiMTAzOTczOTg5ODc0LXQ0N252ODdrNTMycHQ4NHMyaTF0a2wwdmttYmloOWs2LmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwKICAicmVjYXB0Y2hhU2l0ZUtleSI6ICIiCn0K";

let cachedRawFirebaseConfig: any = null;

export const isRealValue = (id: string | undefined): boolean => {
  if (!id) return false;
  const clean = id.trim();
  if (clean === '' || clean === 'PLACEHOLDER' || clean.includes('REPLACE_WITH_YOUR_REAL_KEY') || clean.includes('YOUR_API_KEY')) return false;
  if (clean.length > 20 && (clean.includes('#') || clean.includes('!') || clean.includes('@'))) return false;
  return true;
};

export function getRawFirebaseConfig(): any {
  if (cachedRawFirebaseConfig) {
    return cachedRawFirebaseConfig;
  }

  try {
    const rawData = fs.readFileSync(path.join(process.cwd(), 'firebase-applet-config.json'), 'utf8');
    const config = JSON.parse(rawData);
    if (config.projectId && isRealValue(config.projectId)) {
      config.firestoreDatabaseId = config.firestoreDatabaseId || config.databaseId || process.env.VITE_FIREBASE_DATABASE_ID;
      config.apiKey = config.apiKey || process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY;
      cachedRawFirebaseConfig = config;
      return config;
    }
  } catch (err) {}

  const envProjectId = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
  const envDbId = process.env.VITE_FIREBASE_DATABASE_ID || process.env.FIREBASE_DATABASE_ID;
  const envApiKey = process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY;
  if (envProjectId && isRealValue(envProjectId)) {
    cachedRawFirebaseConfig = {
      projectId: envProjectId,
      appId: process.env.VITE_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID,
      apiKey: envApiKey,
      authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN,
      firestoreDatabaseId: envDbId || '(default)',
      storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_ID || process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID
    };
    return cachedRawFirebaseConfig;
  }

  try {
    const cleanB64 = B64_FALLBACK.replace(/[^A-Za-z0-9+/=]/g, "");
    const fallbackConfig = JSON.parse(Buffer.from(cleanB64, 'base64').toString('utf8'));
    if (fallbackConfig && fallbackConfig.projectId && isRealValue(fallbackConfig.projectId)) {
      cachedRawFirebaseConfig = fallbackConfig;
      return fallbackConfig;
    }
  } catch (_) {}

  throw new Error('Firebase configuration not found and no environment variables set.');
}

export function parseFirestoreValue(value: any): any {
  if (!value) return null;
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return parseInt(value.integerValue, 10);
  if ('doubleValue' in value) return parseFloat(value.doubleValue);
  if ('booleanValue' in value) return value.booleanValue;
  if ('arrayValue' in value) {
    const list = value.arrayValue.values || [];
    return list.map((item: any) => parseFirestoreValue(item));
  }
  if ('mapValue' in value) {
    const fields = value.mapValue.fields || {};
    const obj: any = {};
    for (const key of Object.keys(fields)) {
      obj[key] = parseFirestoreValue(fields[key]);
    }
    return obj;
  }
  return null;
}

export function parseFirestoreDoc(docFields: any): any {
  if (!docFields) return {};
  const obj: any = {};
  for (const key of Object.keys(docFields)) {
    obj[key] = parseFirestoreValue(docFields[key]);
  }
  return obj;
}

export function getSafeFirebaseConfig(): any {
  try {
    const config = getRawFirebaseConfig();
    if (!config) return null;
    
    const isApiKeyEmptyOrPlaceholder = !config.apiKey || config.apiKey.trim() === "" || config.apiKey.includes("YOUR_API_KEY");
    
    if (isApiKeyEmptyOrPlaceholder) {
      return {
        projectId: "placeholder-project-id",
        appId: "placeholder-app-id",
        apiKey: "PLACEHOLDER",
        authDomain: "placeholder-project.firebaseapp.com",
        firestoreDatabaseId: "(default)",
        storageBucket: "placeholder-project.firebasestorage.app",
        messagingSenderId: "000000000",
        measurementId: ""
      };
    }
    return config;
  } catch (error) {
    return null;
  }
}
