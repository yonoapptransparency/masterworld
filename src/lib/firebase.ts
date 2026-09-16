/**
 * Firebase Client API initialization
 * Configures connection states to Firestore DB and Auth endpoints dynamically.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, Auth } from 'firebase/auth';
import { getAdminPath } from './utils';
// @ts-ignore
import appletConfig from '../../firebase-applet-config.json';

// We rely on environment variables for production.
const isRealValue = (id: string | undefined): boolean => {
  if (!id) return false;
  const clean = String(id).trim();
  if (clean === '' || 
      clean === 'PLACEHOLDER' || 
      clean === 'undefined' ||
      clean === 'null' ||
      clean.includes('REPLACE_WITH_YOUR_REAL_KEY') || 
      clean.includes('YOUR_API_KEY')) return false;
  
  if (clean.includes('#') || clean.includes('!') || clean.includes('@') || clean.includes('&') || clean.includes('*') || clean.includes('$') || clean.includes('^') || clean.includes('+') || clean.includes('proj-U7m') || clean.includes('Db7!Xp2') || clean.includes('Sy8@Kp3')) return false;
  return true;
};

const getEnvVal = (key: string): string | undefined => {
  const getFromEnv = (k: string) => {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[k]) return import.meta.env[k];
    if (typeof process !== 'undefined' && process.env && process.env[k]) return process.env[k];
    return undefined;
  };

  if (key === 'VITE_FIREBASE_PROJECT_ID' || key === 'FIREBASE_PROJECT_ID') {
    return getFromEnv('VITE_FIREBASE_PROJECT_ID') || getFromEnv('VITE_FIREBASE_JECT_ID') || getFromEnv('FIREBASE_PROJECT_ID');
  }
  if (key === 'VITE_FIREBASE_APP_ID' || key === 'FIREBASE_APP_ID') {
    return getFromEnv('VITE_FIREBASE_APP_ID') || getFromEnv('FIREBASE_APP_ID');
  }
  if (key === 'VITE_FIREBASE_API_KEY' || key === 'FIREBASE_API_KEY') {
    return getFromEnv('VITE_FIREBASE_API_KEY') || getFromEnv('FIREBASE_API_KEY');
  }
  if (key === 'VITE_FIREBASE_AUTH_DOMAIN' || key === 'FIREBASE_AUTH_DOMAIN') {
    return getFromEnv('VITE_FIREBASE_AUTH_DOMAIN') || getFromEnv('VITE_FIREBASE_DOMAIN') || getFromEnv('FIREBASE_AUTH_DOMAIN');
  }
  if (key === 'VITE_FIREBASE_DATABASE_ID' || key === 'FIREBASE_DATABASE_ID') {
    return getFromEnv('VITE_FIREBASE_DATABASE_ID') || getFromEnv('VITE_FIREBASE_BASE_ID') || getFromEnv('FIREBASE_DATABASE_ID');
  }
  if (key === 'VITE_FIREBASE_STORAGE_BUCKET' || key === 'FIREBASE_STORAGE_BUCKET') {
    return getFromEnv('VITE_FIREBASE_STORAGE_BUCKET') || getFromEnv('FIREBASE_STORAGE_BUCKET');
  }
  if (key === 'VITE_FIREBASE_MESSAGING_ID' || key === 'FIREBASE_MESSAGING_ID') {
    return getFromEnv('VITE_FIREBASE_MESSAGING_ID') || getFromEnv('FIREBASE_MESSAGING_SENDER_ID') || getFromEnv('FIREBASE_MESSAGING_ID');
  }
  return undefined;
};


const getResolvedConfig = () => {
  const envProjectId = getEnvVal('FIREBASE_PROJECT_ID');
  const envAppId = getEnvVal('FIREBASE_APP_ID');
  const envApiKey = getEnvVal('FIREBASE_API_KEY');
  const envAuthDomain = getEnvVal('FIREBASE_AUTH_DOMAIN');
  const envDatabaseId = getEnvVal('FIREBASE_DATABASE_ID');
  const envStorageBucket = getEnvVal('FIREBASE_STORAGE_BUCKET');
  const envMessagingSenderId = getEnvVal('FIREBASE_MESSAGING_ID');

  const cfg = appletConfig as any || {};

  let resolved = {
    projectId: isRealValue(envProjectId) ? envProjectId! : (cfg.projectId || "gen-lang-client-0825832493"),
    appId: isRealValue(envAppId) ? envAppId! : (cfg.appId || "1:103973989874:web:733a6afd8e837224900f6b"),
    apiKey: isRealValue(envApiKey) ? envApiKey! : (cfg.apiKey || "AIzaSyBey9sUbeWrcXS2kl4ewOzkTy4arg03Ok"),
    authDomain: isRealValue(envAuthDomain) ? envAuthDomain! : (cfg.authDomain || "gen-lang-client-0825832493.firebaseapp.com"),
    firestoreDatabaseId: isRealValue(envDatabaseId) ? envDatabaseId! : (cfg.firestoreDatabaseId || cfg.databaseId || "ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a"),
    storageBucket: isRealValue(envStorageBucket) ? envStorageBucket! : (cfg.storageBucket || "gen-lang-client-0825832493.firebasestorage.app"),
    messagingSenderId: isRealValue(envMessagingSenderId) ? envMessagingSenderId! : (cfg.messagingSenderId || "103973989874"),
  };



  return resolved;
};

const firebaseConfig = getResolvedConfig();

const isAdminEnabled = typeof __ADMIN_ENABLED__ !== 'undefined' ? __ADMIN_ENABLED__ : true;

export const isFirebaseConfigured = isAdminEnabled && !!firebaseConfig?.apiKey;
if (!isFirebaseConfigured && typeof window !== 'undefined') {
  console.error("Firebase is not configured! firebaseConfig:", firebaseConfig, "isAdminEnabled:", isAdminEnabled);
}

export const isFirebaseApiKeyReal = (key: string | undefined): boolean => {
  return isRealValue(key);
};

export const isFirebaseReal = isFirebaseConfigured && isFirebaseApiKeyReal(firebaseConfig?.apiKey);

export const app = isFirebaseConfigured ? (getApps().length === 0 ? initializeApp(firebaseConfig!) : getApp()) : null as any;

let _realAuthInstance: any = null;
const getRealAuth = () => {
  if (!_realAuthInstance && isFirebaseReal && app) {
    try {
      _realAuthInstance = getAuth(app);
      if (_realAuthInstance) {
        const originalOnAuthStateChanged = (_realAuthInstance as any).onAuthStateChanged;
        let isCallingModular = false;
        (_realAuthInstance as any).onAuthStateChanged = (callback: (user: any) => void) => {
          if (isCallingModular) {
            if (typeof originalOnAuthStateChanged === 'function') {
              return originalOnAuthStateChanged.call(_realAuthInstance, callback);
            }
            return () => {};
          }
          isCallingModular = true;
          try {
            return onAuthStateChanged(_realAuthInstance, callback);
          } finally {
            isCallingModular = false;
          }
        };
      }
    } catch (e) {
      console.error(e);
    }
  }
  return _realAuthInstance;
};

export const auth = new Proxy({}, {
  get(_target, prop) {
    const instance = getRealAuth();
    if (!instance) return undefined;
    const value = (instance as any)[prop];
    return typeof value === 'function' ? value.bind(instance) : value;
  }
}) as unknown as Auth;

import { getFirestore, doc, getDocFromServer, disableNetwork } from 'firebase/firestore';

let firestoreInstance: any = null;
if (app && isFirebaseReal) {
  try {
    const rawDbId = firebaseConfig?.firestoreDatabaseId;
    const dbId = (rawDbId && isRealValue(rawDbId)) ? rawDbId : 'ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a';
    firestoreInstance = dbId === '(default)' ? getFirestore(app) : getFirestore(app, dbId);
    console.log('[Firebase] Firestore initialized with database:', dbId);
  } catch(e) {
    console.error('[Firebase] Firestore initialization FAILED:', e);
  }
}
export const db = firestoreInstance;
import { getStorage } from "firebase/storage";
export const storage = isFirebaseReal && app ? getStorage(app) : null;

// No-op connection test. Removed to prevent synchronous blocking on module load.

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const user = auth?.currentUser;
  
  const errInfo: FirestoreErrorInfo = {
    error: errorMessage,
    authInfo: {
      userId: user?.uid || null,
      email: user?.email || null,
      emailVerified: user?.emailVerified || null,
      isAnonymous: user?.isAnonymous || null,
      tenantId: user?.tenantId || null,
      providerInfo: user?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  
  const jsonString = JSON.stringify(errInfo, null, 2);
  console.warn('Firestore Error: ', jsonString);
  
  // Show alert to user for immediate feedback in admin panel
  if (path?.startsWith('store_data')) {
    alert(`Firestore Save Failed!\n\nError: ${errorMessage}\n\nOperation: ${operationType}\nPath: ${path}\n\nCheck console for full details.`);
  }
  
  return new Error(jsonString);
}




