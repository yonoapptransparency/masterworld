import fs from 'fs';
import path from 'path';
import { isRealValue } from './crypto';

// Service account parsing helper supporting raw JSON, base64, escaped newlines, and quotes
function parseServiceAccount(rawStr: string): any {
  let str = rawStr.trim();
  if ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
    str = str.slice(1, -1).trim();
  }
  try {
    const parsed = JSON.parse(str);
    if (parsed.private_key && typeof parsed.private_key === 'string') {
      parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
    }
    return parsed;
  } catch (e) {
    try {
      const decoded = Buffer.from(str, 'base64').toString('utf8').trim();
      const parsed = JSON.parse(decoded);
      if (parsed.private_key && typeof parsed.private_key === 'string') {
        parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
      }
      return parsed;
    } catch (e2) {
      try {
        const cleaned = str.replace(/\r?\n/g, '\\n');
        const parsed = JSON.parse(cleaned);
        if (parsed.private_key && typeof parsed.private_key === 'string') {
          parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
        }
        return parsed;
      } catch (e3) {
        throw new Error(`Failed to parse Service Account JSON: ${e.message}`);
      }
    }
  }
}

let cachedRawFirebaseConfig: any = null;

export function getRawFirebaseConfig(): any {
  if (cachedRawFirebaseConfig) {
    return cachedRawFirebaseConfig;
  }

  const envProjectId = process.env.VITE_FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_JECT_ID || process.env.FIREBASE_PROJECT_ID;
  const envDbId = process.env.VITE_FIREBASE_DATABASE_ID || process.env.VITE_FIREBASE_BASE_ID || process.env.FIREBASE_DATABASE_ID;
  const envApiKey = process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY;
  const envAuthDomain = process.env.VITE_FIREBASE_AUTH_DOMAIN || process.env.VITE_FIREBASE_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN;

  // 1. Check environment variables first
  if (envProjectId && isRealValue(envProjectId)) {
    cachedRawFirebaseConfig = {
      projectId: envProjectId,
      appId: process.env.VITE_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID || "",
      apiKey: envApiKey || "",
      authDomain: envAuthDomain || "",
      firestoreDatabaseId: envDbId || envProjectId,
      storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET || "",
      messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_ID || process.env.FIREBASE_MESSAGING_SENDER_ID || ""
    };
    return cachedRawFirebaseConfig;
  }

  // 2. Try firebase-applet-config.json
  try {
    const rawData = fs.readFileSync(path.join(process.cwd(), 'firebase-applet-config.json'), 'utf8');
    const config = JSON.parse(rawData);
    if (config.projectId && isRealValue(config.projectId)) {
      config.firestoreDatabaseId = config.firestoreDatabaseId || config.databaseId || envDbId || config.projectId;
      config.apiKey = config.apiKey || envApiKey;
      cachedRawFirebaseConfig = config;
      return config;
    }
  } catch (err) {
    // Proceed
  }

  // 3. Fallback configuration
  const defaultProjectId = "ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a";
  cachedRawFirebaseConfig = {
    projectId: defaultProjectId,
    appId: process.env.VITE_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID || "",
    apiKey: envApiKey || "",
    authDomain: envAuthDomain || "",
    firestoreDatabaseId: envDbId || defaultProjectId,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_ID || ""
  };
  return cachedRawFirebaseConfig;
}

let cachedAdminDb: any = null;
let adminInitFailed = false;

export function getFirebaseAdminDb(): any {
  if (cachedAdminDb) return cachedAdminDb;
  if (adminInitFailed) return null;

  try {
    const admin = require('firebase-admin');
    const config = getRawFirebaseConfig();

    if (admin.apps.length === 0) {
      const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT || 
                                process.env.FIREBASE_ACCOUNT || 
                                process.env.FIREBASE_SERVICE_ACCOUNT_JSON || 
                                process.env.FIREBASE_CREDENTIALS ||
                                process.env.FIREBASE_ADMIN_KEY;

      if (serviceAccountRaw && serviceAccountRaw.trim() !== '') {
        try {
          const serviceAccount = parseServiceAccount(serviceAccountRaw);
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: serviceAccount.project_id || config?.projectId
          });
          console.log('[Admin SDK] Initialized with service account credentials.');
        } catch (parseErr: any) {
          console.error('[Admin SDK] Failed to parse FIREBASE_ACCOUNT / FIREBASE_SERVICE_ACCOUNT:', parseErr.message);
          adminInitFailed = true;
          return null;
        }
      } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        admin.initializeApp({ projectId: config?.projectId });
        console.log('[Admin SDK] Initialized with GOOGLE_APPLICATION_CREDENTIALS.');
      } else {
        console.warn('[Admin SDK] No service account env var found. Admin SDK in REST fallback mode.');
        adminInitFailed = true;
        return null;
      }
    }

    const dbId = config?.firestoreDatabaseId || 'ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a';
    if (dbId && dbId !== '(default)') {
      const { getFirestore } = require('firebase-admin/firestore');
      cachedAdminDb = getFirestore(admin.apps[0], dbId);
    } else {
      cachedAdminDb = admin.firestore();
    }

    console.log(`[Admin SDK] Firestore initialized for database: ${dbId}`);
    return cachedAdminDb;
  } catch (err: any) {
    console.warn('[Admin SDK] Initialization failed:', err.message || err);
    adminInitFailed = true;
    return null;
  }
}

export function convertToFirestoreValue(val: any): any {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === 'boolean') return { booleanValue: val };
  if (typeof val === 'number') {
    if (Number.isInteger(val)) return { integerValue: String(val) };
    return { doubleValue: val };
  }
  if (typeof val === 'string') return { stringValue: val };
  if (Array.isArray(val)) {
    return {
      arrayValue: {
        values: val.map(item => convertToFirestoreValue(item))
      }
    };
  }
  if (typeof val === 'object') {
    const fields: Record<string, any> = {};
    for (const [k, v] of Object.entries(val)) {
      if (v !== undefined) {
        fields[k] = convertToFirestoreValue(v);
      }
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

export function convertToFirestoreFields(obj: Record<string, any>): Record<string, any> {
  const fields: Record<string, any> = {};
  if (!obj || typeof obj !== 'object') return fields;
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) {
      fields[k] = convertToFirestoreValue(v);
    }
  }
  return fields;
}

export async function writeFirestoreRestDoc(docId: string, data: any): Promise<boolean> {
  try {
    const config = getRawFirebaseConfig();
    if (!config || !config.projectId) {
      console.warn(`[SERVER] Cannot write REST doc ${docId}: Missing project ID`);
      return false;
    }
    const dbId = config.firestoreDatabaseId || '(default)';
    const apiKeyParam = config.apiKey ? `?key=${config.apiKey}` : '';
    const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${dbId}/documents/store_data/${docId}${apiKeyParam}`;

    const fields = convertToFirestoreFields(data);
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields })
    });
    if (!res.ok) {
      const errText = await res.text();
      console.warn(`[SERVER] writeFirestoreRestDoc failed for store_data/${docId} (HTTP ${res.status}):`, errText);
      return false;
    }
    console.log(`[SERVER] writeFirestoreRestDoc successfully written store_data/${docId}`);
    return true;
  } catch (err: any) {
    console.error(`[SERVER] writeFirestoreRestDoc exception for ${docId}:`, err.message || err);
    return false;
  }
}

export function toFirestoreValue(val: any): any {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === 'boolean') return { booleanValue: val };
  if (typeof val === 'number') {
    if (Number.isInteger(val)) return { integerValue: val.toString() };
    return { doubleValue: val };
  }
  if (typeof val === 'string') return { stringValue: val };
  if (Array.isArray(val)) {
    return {
      arrayValue: {
        values: val.map(item => toFirestoreValue(item))
      }
    };
  }
  if (typeof val === 'object') {
    const fields: Record<string, any> = {};
    for (const k of Object.keys(val)) {
      fields[k] = toFirestoreValue(val[k]);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

export function toFirestoreDocument(obj: Record<string, any>): any {
  const fields: Record<string, any> = {};
  if (obj && typeof obj === 'object') {
    for (const k of Object.keys(obj)) {
      fields[k] = toFirestoreValue(obj[k]);
    }
  }
  return { fields };
}

export function parseFirestoreValue(val: any): any {
  if (!val || typeof val !== 'object') return val ?? null;
  if ('stringValue' in val) return val.stringValue;
  if ('booleanValue' in val) return val.booleanValue;
  if ('integerValue' in val) return parseInt(val.integerValue, 10);
  if ('doubleValue' in val) return parseFloat(val.doubleValue);
  if ('timestampValue' in val) return val.timestampValue;
  if ('nullValue' in val) return null;
  if ('mapValue' in val) {
    const fields = val.mapValue?.fields || {};
    const res: any = {};
    for (const key of Object.keys(fields)) {
      res[key] = parseFirestoreValue(fields[key]);
    }
    return res;
  }
  if ('arrayValue' in val) {
    const values = val.arrayValue?.values || [];
    return values.map((v: any) => parseFirestoreValue(v));
  }
  return null;
}

export function parseFirestoreFields(fields: any): any {
  if (!fields || typeof fields !== 'object') return {};
  const res: any = {};
  for (const key of Object.keys(fields)) {
    res[key] = parseFirestoreValue(fields[key]);
  }
  return res;
}
