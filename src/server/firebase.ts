import fs from 'fs';
import path from 'path';
import { isRealValue } from './crypto';

// Service account parsing helper supporting raw JSON, base64, objects, double-escaped newlines, and quotes
function parseServiceAccount(rawInput: any): any {
  if (!rawInput) return null;
  
  // If already parsed as object by runtime or framework
  if (typeof rawInput === 'object') {
    if (rawInput.private_key || rawInput.client_email || rawInput.project_id) {
      if (rawInput.private_key && typeof rawInput.private_key === 'string') {
        rawInput.private_key = rawInput.private_key.replace(/\\n/g, '\n');
      }
      return rawInput;
    }
  }

  if (typeof rawInput !== 'string') return null;
  let str = rawInput.trim();
  while ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
    str = str.slice(1, -1).trim();
  }

  const tryValidate = (obj: any) => {
    if (typeof obj === 'string') {
      try { obj = JSON.parse(obj); } catch (e) {}
    }
    if (obj && typeof obj === 'object') {
      if (obj.private_key || obj.client_email || obj.project_id) {
        if (obj.private_key && typeof obj.private_key === 'string') {
          obj.private_key = obj.private_key.replace(/\\n/g, '\n');
        }
        return obj;
      }
    }
    return null;
  };

  // 1. Direct JSON parse
  try {
    const parsed = tryValidate(JSON.parse(str));
    if (parsed) return parsed;
  } catch (e) {}

  // 2. Unescape newlines / escaped control characters
  try {
    const unescaped = str.replace(/\\n/g, '\n').replace(/\r/g, '');
    const parsed = tryValidate(JSON.parse(unescaped));
    if (parsed) return parsed;
  } catch (e) {}

  // 3. Replace literal raw newlines inside strings
  try {
    const sanitized = str.replace(/\n/g, '\\n').replace(/\r/g, '');
    const parsed = tryValidate(JSON.parse(sanitized));
    if (parsed) return parsed;
  } catch (e) {}

  // 4. Base64 decoded JSON parse
  try {
    const decoded = Buffer.from(str, 'base64').toString('utf8').trim();
    const parsed = tryValidate(JSON.parse(decoded));
    if (parsed) return parsed;
  } catch (e) {}

  throw new Error('Invalid JSON format in Service Account variable');
}

let cachedRawFirebaseConfig: any = null;

export function getRawFirebaseConfig(): any {
  if (cachedRawFirebaseConfig) {
    return cachedRawFirebaseConfig;
  }

  const getValidEnv = (val1?: string, val2?: string, val3?: string) => {
    for (const val of [val1, val2, val3]) {
      if (isRealValue(val)) return val;
    }
    return "";
  };

  let envProjectId = getValidEnv(process.env.VITE_FIREBASE_PROJECT_ID, process.env.VITE_FIREBASE_JECT_ID, process.env.FIREBASE_PROJECT_ID);
  const envDbId = getValidEnv(process.env.VITE_FIREBASE_DATABASE_ID, process.env.VITE_FIREBASE_BASE_ID, process.env.FIREBASE_DATABASE_ID);
  let envApiKey = getValidEnv(process.env.VITE_FIREBASE_API_KEY, process.env.FIREBASE_API_KEY, process.env.API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
  const envAuthDomain = getValidEnv(process.env.VITE_FIREBASE_AUTH_DOMAIN, process.env.VITE_FIREBASE_DOMAIN, process.env.FIREBASE_AUTH_DOMAIN);
  const envAppId = getValidEnv(process.env.VITE_FIREBASE_APP_ID, process.env.FIREBASE_APP_ID);
  const envStorageBucket = getValidEnv(process.env.VITE_FIREBASE_STORAGE_BUCKET, process.env.FIREBASE_STORAGE_BUCKET);
  const envMessagingSenderId = getValidEnv(process.env.VITE_FIREBASE_MESSAGING_ID, process.env.FIREBASE_MESSAGING_SENDER_ID);

  let fileConfig: any = {};
  try {
    fileConfig = require('../../firebase-applet-config.json');
  } catch (err) {
    // Proceed
  }

  const DEFAULT_FALLBACK_API_KEY = "AIzaSyBey9sUbeWrcXS2kl4ewOzkTy4arg03Ok";
  const finalApiKey = envApiKey || fileConfig.apiKey || DEFAULT_FALLBACK_API_KEY;

  const resolveDbId = (rawDbId?: string, pId?: string) => {
    if (!rawDbId || !isRealValue(rawDbId) || rawDbId === pId || rawDbId === '(default)') {
      return '(default)';
    }
    return rawDbId;
  };

  // 1. Check environment variables first
  if (envProjectId) {
    cachedRawFirebaseConfig = {
      projectId: envProjectId,
      appId: envAppId || fileConfig.appId,
      apiKey: finalApiKey,
      authDomain: envAuthDomain || fileConfig.authDomain,
      firestoreDatabaseId: resolveDbId(envDbId || fileConfig.firestoreDatabaseId || fileConfig.databaseId, envProjectId),
      storageBucket: envStorageBucket || fileConfig.storageBucket,
      messagingSenderId: envMessagingSenderId || fileConfig.messagingSenderId
    };
    return cachedRawFirebaseConfig;
  }

  // 2. Try firebase-applet-config.json
  if (fileConfig.projectId && isRealValue(fileConfig.projectId)) {
    fileConfig.firestoreDatabaseId = resolveDbId(fileConfig.firestoreDatabaseId || fileConfig.databaseId || envDbId, fileConfig.projectId);
    fileConfig.apiKey = finalApiKey;
    cachedRawFirebaseConfig = fileConfig;
    return fileConfig;
  }

  // 3. Fallback configuration
  const defaultProjectId = "ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a";
  const defaultDbId = "ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a";
  cachedRawFirebaseConfig = {
    projectId: defaultProjectId,
    appId: envAppId || "1:103973989874:web:733a6afd8e837224900f6b",
    apiKey: finalApiKey,
    authDomain: envAuthDomain || "ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a.firebaseapp.com",
    firestoreDatabaseId: resolveDbId(envDbId || defaultDbId, defaultProjectId),
    storageBucket: envStorageBucket || "ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a.firebasestorage.app",
    messagingSenderId: envMessagingSenderId || "103973989874"
  };
  return cachedRawFirebaseConfig;
}

let cachedAdminDb: any = null;
let lastAdminSdkStatusMsg = "";

export function getAdminSdkDiagnostics(): { active: boolean; message: string; envVarName?: string } {
  if (cachedAdminDb) {
    return { active: true, message: lastAdminSdkStatusMsg || "Admin SDK initialized and active" };
  }
  return { active: false, message: lastAdminSdkStatusMsg || "Admin SDK inactive" };
}

export function getFirebaseAdminDb(): any {
  if (cachedAdminDb) return cachedAdminDb;

  try {
    const admin = require('firebase-admin');
    const config = getRawFirebaseConfig();

    if (admin.apps.length === 0) {
      const serviceAccountPath = path.join(process.cwd(), 'community-service-account.json');
      if (fs.existsSync(serviceAccountPath)) {
        const sa = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));
        admin.initializeApp({
          credential: admin.credential.cert(sa),
          projectId: sa.project_id
        });
        cachedAdminDb = admin.firestore();
        console.log('[Admin SDK] Initialized using local community-service-account.json for project:', sa.project_id);
        return cachedAdminDb;
      }
      let serviceAccountRaw: any = null;
      let detectedVarName = "";

      const possibleEnvVars = [
        'FIREBASE_SERVICE_ACCOUNT',
        'FIREBASE_ACCOUNT',
        'FIREBASE_SERVICE_ACCOUNT_JSON',
        'FIREBASE_CREDENTIALS',
        'FIREBASE_ADMIN_KEY',
        'FIREBASE_SECRET',
        'SERVICE_ACCOUNT_JSON',
        'SERVICE_ACCOUNT',
        'GCP_SERVICE_ACCOUNT',
        'GOOGLE_SERVICE_ACCOUNT'
      ];

      for (const envName of possibleEnvVars) {
        if (process.env[envName] && String(process.env[envName]).trim() !== '') {
          serviceAccountRaw = process.env[envName];
          detectedVarName = envName;
          break;
        }
      }

      // Fallback to local service-account.json file
      if (!serviceAccountRaw) {
        const localCredPath = path.join(process.cwd(), 'service-account.json');
        if (fs.existsSync(localCredPath)) {
          serviceAccountRaw = fs.readFileSync(localCredPath, 'utf8');
          detectedVarName = 'service-account.json (local)';
        }
      }

      if (serviceAccountRaw) {
        try {
          const serviceAccount = parseServiceAccount(serviceAccountRaw);
          if (!serviceAccount) {
            lastAdminSdkStatusMsg = `Found ${detectedVarName}, but parsing returned null`;
            return null;
          }
          
          // CRITICAL: Always use the projectId from the service account if it exists
          const targetProjectId = serviceAccount.project_id || config?.projectId;
          
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: targetProjectId
          });
          
          lastAdminSdkStatusMsg = `Initialized successfully for project ${targetProjectId} using ${detectedVarName}`;
          console.log(`[Admin SDK] Initialized for ${targetProjectId} using ${detectedVarName}`);
        } catch (parseErr: any) {
          lastAdminSdkStatusMsg = `Failed parsing ${detectedVarName}: ${parseErr.message}`;
          console.error(`[Admin SDK] Failed to parse ${detectedVarName}:`, parseErr.message);
          return null;
        }
      } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        admin.initializeApp({ projectId: config?.projectId });
        lastAdminSdkStatusMsg = "Initialized using GOOGLE_APPLICATION_CREDENTIALS";
        console.log('[Admin SDK] Initialized with GOOGLE_APPLICATION_CREDENTIALS.');
      } else {
        lastAdminSdkStatusMsg = "No Service Account variable found on server. Looked for FIREBASE_ACCOUNT, FIREBASE_SERVICE_ACCOUNT, etc.";
        console.warn('[Admin SDK] No service account env var found. Admin SDK in REST fallback mode.');
        return null;
      }
    }

    // Determine the correct Database ID
    const envDbId = config?.firestoreDatabaseId || config?.databaseId || process.env.VITE_FIREBASE_DATABASE_ID || process.env.FIREBASE_DATABASE_ID;
    const defaultAiStudioDbId = 'ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a';
    
    let dbId = defaultAiStudioDbId;
    if (envDbId && envDbId.trim() !== '' && envDbId !== '(default)' && envDbId !== 'ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a') {
      dbId = envDbId;
    }

    if (dbId && dbId !== '(default)') {
      const { getFirestore } = require('firebase-admin/firestore');
      cachedAdminDb = getFirestore(admin.apps[0], dbId);
    } else {
      cachedAdminDb = admin.firestore();
    }

    const activeProjectId = admin.apps[0]?.options?.projectId || 'ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a';
    console.log(`[Admin SDK] Firestore initialized for project: ${activeProjectId}, database: ${dbId}`);
    return cachedAdminDb;
  } catch (err: any) {
    lastAdminSdkStatusMsg = `Initialization thrown exception: ${err.message || err}`;
    console.warn('[Admin SDK] Initialization failed:', err.message || err);
    return null;
  }
}


let cachedCommunityDb: any = null;

export function getCommunityAdminDb(): any {
  // Always prefer the primary initialized Firestore admin DB
  const mainDb = getFirebaseAdminDb();
  if (mainDb) return mainDb;

  if (cachedCommunityDb) return cachedCommunityDb;

  try {
    const admin = require('firebase-admin');
    
    // Check if community app is already initialized
    const existingApp = admin.apps.find((app: any) => app.name === 'communityApp');
    if (existingApp) {
      cachedCommunityDb = existingApp.firestore();
      return cachedCommunityDb;
    }

    // Initialize community app
    const serviceAccountPath = path.join(process.cwd(), 'community-service-account.json');
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));
      const communityApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id
      }, 'communityApp');
      
      cachedCommunityDb = communityApp.firestore();
      console.log('[Community Admin SDK] Firestore initialized successfully.');
      return cachedCommunityDb;
    } else {
      console.warn('[Community Admin SDK] No Firestore DB available.');
      return null;
    }
  } catch (err: any) {
    console.warn('[Community Admin SDK] Initialization failed:', err.message || err);
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

export async function writeFirestoreRestDoc(docId: string, data: any, authToken?: string, merge: boolean = true, collectionPath: string = 'store_data'): Promise<boolean> {
  try {
    const config = getRawFirebaseConfig();
    if (!config || !config.projectId) {
      console.warn(`[SERVER] Cannot write REST doc ${docId}: Missing project ID`);
      return false;
    }
    const dbId = config.firestoreDatabaseId || config.databaseId || '(default)';
    const queryParams: string[] = [];
    if (config.apiKey) queryParams.push(`key=${encodeURIComponent(config.apiKey)}`);
    if (merge && data && typeof data === 'object') {
      Object.keys(data).forEach(key => {
        queryParams.push(`updateMask.fieldPaths=${encodeURIComponent(key)}`);
      });
    }
    const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
    const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${dbId}/documents/${collectionPath}/${docId}${queryString}`;

    const fields = convertToFirestoreFields(data);
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (authToken && authToken.trim() !== '') {
      headers['Authorization'] = authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`;
    }

    const res = await fetch(url, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ fields })
    });
    if (!res.ok) {
      if (res.status === 429) {
        // Quota / Rate limit reached on Firestore REST
        return false;
      }
      const errText = await res.text();
      console.warn(`[SERVER] writeFirestoreRestDoc notice for store_data/${docId} (HTTP ${res.status}):`, errText.substring(0, 150));
      return false;
    }
    console.log(`[SERVER] writeFirestoreRestDoc successfully written store_data/${docId}`);
    return true;
  } catch (err: any) {
    console.error(`[SERVER] writeFirestoreRestDoc exception for ${docId}:`, err.message || err);
    return false;
  }
}

export async function deleteFirestoreRestDoc(docId: string, authToken?: string, collectionPath: string = 'store_data'): Promise<boolean> {
  try {
    const config = getRawFirebaseConfig();
    if (!config || !config.projectId) return false;
    const dbId = config.firestoreDatabaseId || config.databaseId || '(default)';
    const apiKeyParam = config.apiKey ? `?key=${config.apiKey}` : '';
    const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${dbId}/documents/${collectionPath}/${docId}${apiKeyParam}`;

    const headers: Record<string, string> = {};
    if (authToken && authToken.trim() !== '') {
      headers['Authorization'] = authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`;
    }

    const res = await fetch(url, {
      method: 'DELETE',
      headers
    });
    return res.ok;
  } catch (err) {
    return false;
  }
}

export async function readFirestoreRestCollection(collectionPath: string, authToken?: string): Promise<any[]> {
  try {
    const config = getRawFirebaseConfig();
    if (!config || !config.projectId) return [];
    
    const dbId = config.firestoreDatabaseId || config.databaseId || '(default)';
    const apiKeyParam = config.apiKey ? `?key=${config.apiKey}` : '';
    const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${dbId}/documents/${collectionPath}${apiKeyParam}`;

    const headers: Record<string, string> = {};
    if (authToken && authToken.trim() !== '') {
      headers['Authorization'] = authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`;
    }

    const res = await fetch(url, { headers });
    if (!res.ok) {
      console.warn(`[SERVER] readFirestoreRestCollection failed for ${collectionPath} (HTTP ${res.status})`);
      return [];
    }

    const data = await res.json();
    const documents = data.documents || [];
    
    return documents.map((doc: any) => {
      const id = doc.name.split('/').pop();
      return { id, ...parseFirestoreFields(doc.fields) };
    });
  } catch (err) {
    console.error(`[SERVER] readFirestoreRestCollection exception for ${collectionPath}:`, err);
    return [];
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
