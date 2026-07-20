/**
 * Firebase Client API initialization
 * Configures connection states to Firestore DB and Auth endpoints dynamically.
 */

import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getAdminPath } from './utils';

// Dynamic config loading to prevent Vercel build failures when gitignored file is missing
const B64_FALLBACK = "ewogICJwcm9qZWN0SWQiOiAiZ2VuLWxhbmctY2xpZW50LTA4MjU4MzI0OTMiLAogICJhcHBJZCI6ICIxOjEwMzk3Mzk4OTg3NDp3ZWI6NzMzYTZhZmQ4ZTgzNzIyNDkwMGY2YiIsCiAgImFwaUtleSI6ICJBSXphU3lCZXk5c1ViZVdscmNYUzJrbDRld096a1R5NGFyZzAzT2siLAogICJhdXRoRG9tYWluIjogImdlbi1sYW5nLWNsaWVudC0wODI1ODMyNDkzLmZpcmViYXNlYXBwLmNvbSIsCiAgImZpcmVzdG9yZURhdGFiYXNlSWQiOiAiYWktc3R1ZGlvLXlvbm9zdG9yZS04ODYzMTVhNC04YjlmLTRmZjYtODk4Ni1hOTBhZDE3MjIxMGEiLAogICJzdG9yYWdlQnVja2V0IjogImdlbi1sYW5nLWNsaWVudC0wODI1ODMyNDkzLmZpcmViYXNlc3RvcmFnZS5hcHAiLAogICJtZXNzYWdpbmdTZW5kZXJJZCI6ICIxMDM5NzM5ODk4NzQiLAogICJtZWFzdXJlbWVudElkIjogIiIsCiAgIm9BdXRoQ2xpZW50SWQiOiAiMTAzOTczOTg5ODc0LXQ0N252ODdrNTMycHQ4NHMyaTF0a2wwdmttYmloOWs2LmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwKICAicmVjYXB0Y2hhU2l0ZUtleSI6ICIiCn0=";

let appletConfig: any = {};
try {
  if (typeof window !== 'undefined') {
    appletConfig = JSON.parse(atob(B64_FALLBACK));
  } else {
    appletConfig = JSON.parse(Buffer.from(B64_FALLBACK, 'base64').toString('utf8'));
  }
} catch (e) {
  console.error("Failed parsing fallback base64 config:", e);
}

declare global {
  interface Window {
    __FIREBASE_CONFIG__?: {
      projectId?: string;
      appId?: string;
      apiKey?: string;
      authDomain?: string;
      firestoreDatabaseId?: string;
      storageBucket?: string;
      messagingSenderId?: string;
      measurementId?: string;
    };
  }
}

// We rely on either the injected config (for SSR/dynamic routes) or the statically bundled config (for dumb static hosting)
const isRealValue = (id: string | undefined): boolean => {
  if (!id) return false;
  const clean = String(id).trim();
  if (clean === '' || 
      clean === 'PLACEHOLDER' || 
      clean === 'undefined' ||
      clean === 'null' ||
      clean.includes('REPLACE_WITH_YOUR_REAL_KEY') || 
      clean.includes('YOUR_API_KEY')) return false;
  return true;
};

const getClientConfigValue = (envVal: string | undefined, configVal: string | undefined) => {
  if (isRealValue(envVal)) return envVal!;
  if (isRealValue(configVal)) return configVal!;
  return undefined;
};

const config = appletConfig as any;
const getEnvVal = (key: string): string | undefined => {
  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
      return (import.meta as any).env[key];
    }
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key];
    }
  } catch (_) {}
  return undefined;
};

const resolvedProjectId = getClientConfigValue(getEnvVal('VITE_FIREBASE_PROJECT_ID'), config.projectId);
const resolvedAppId = getClientConfigValue(getEnvVal('VITE_FIREBASE_APP_ID'), config.appId);
const resolvedApiKey = getClientConfigValue(getEnvVal('VITE_FIREBASE_API_KEY'), config.apiKey);
const resolvedAuthDomain = getClientConfigValue(getEnvVal('VITE_FIREBASE_AUTH_DOMAIN'), config.authDomain);
const resolvedDatabaseId = getClientConfigValue(getEnvVal('VITE_FIREBASE_DATABASE_ID'), config.firestoreDatabaseId);
const resolvedStorageBucket = getClientConfigValue(getEnvVal('VITE_FIREBASE_STORAGE_BUCKET'), config.storageBucket);
const resolvedMessagingId = getClientConfigValue(getEnvVal('VITE_FIREBASE_MESSAGING_ID'), config.messagingSenderId);

// We first try to read from window.__FIREBASE_CONFIG__ (the dynamic SEO/SSR configuration injected by server.ts), 
// but ensure its fields are non-mocked/real. If it's absent or mocked, fallback to the resolved non-mock values.
const getSafeWindowConfig = (): any => {
  if (typeof window === 'undefined') return null;
  const cfg = window.__FIREBASE_CONFIG__;
  if (!cfg) return null;
  if (!isRealValue(cfg.projectId)) return null;
  return cfg;
};

const firebaseConfig = getSafeWindowConfig() || {
  projectId: resolvedProjectId,
  appId: resolvedAppId,
  apiKey: resolvedApiKey,
  authDomain: resolvedAuthDomain,
  firestoreDatabaseId: resolvedDatabaseId,
  storageBucket: resolvedStorageBucket,
  messagingSenderId: resolvedMessagingId,
};

console.log('--- FIREBASE CONFIG INIT ---', firebaseConfig);

const isAdminEnabled = true;

const isBrowser = typeof window !== 'undefined';
const isBrowserAdminRoute = isBrowser && window.location.pathname.startsWith(`/${getAdminPath()}`);

export const isFirebaseConfigured = isAdminEnabled && 
  isRealValue(firebaseConfig.apiKey) && 
  isRealValue(firebaseConfig.projectId) &&
  (!isBrowser || isBrowserAdminRoute);

export const isFirebaseApiKeyReal = (key: string | undefined): boolean => {
  return isRealValue(key);
};

export const isFirebaseReal = isFirebaseConfigured && isFirebaseApiKeyReal(firebaseConfig.apiKey);

console.log("[FIREBASE] Config resolved:", firebaseConfig);
console.log("[FIREBASE] isFirebaseReal:", isFirebaseReal);

export const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null as any;

export const auth = (() => {
  if (isFirebaseReal) {
    let realAuth = null; try { realAuth = getAuth(app); } catch(e) { console.error(e); }
    if (!realAuth) return null as any; const originalOnAuthStateChanged = (realAuth as any).onAuthStateChanged;
    let isCallingModular = false;

    (realAuth as any).onAuthStateChanged = (callback: (user: any) => void) => {
      if (isCallingModular) {
        if (typeof originalOnAuthStateChanged === 'function') {
          return originalOnAuthStateChanged.call(realAuth, callback);
        }
        return () => {};
      }

      isCallingModular = true;
      try {
        return onAuthStateChanged(realAuth, callback);
      } finally {
        isCallingModular = false;
      }
    };
    return realAuth;
  } else {
    return null as any;
  }
})();

import { getFirestore, initializeFirestore, doc, getDocFromServer, disableNetwork } from 'firebase/firestore';

let firestoreInstance: any = null;
if (app) {
  const dbId = firebaseConfig.firestoreDatabaseId === '(default)' ? undefined : firebaseConfig.firestoreDatabaseId;
  try { firestoreInstance = initializeFirestore(app, {
    experimentalForceLongPolling: true,
  }, dbId); } catch(e) { console.error(e); firestoreInstance = getFirestore(app, dbId); }

  if (!isFirebaseReal && firestoreInstance) {
    // If the Firebase configuration is mock/fictional, disable network traffic.
    // This allows the Firestore SDK to operate smoothly in local-only cache mode
    // without attempting network connections to nonexistent servers, eliminating connection errors.
    disableNetwork(firestoreInstance).catch((err) => {
      console.warn("Could not disable network for mock Firestore instance:", err);
    });
  }
}

export const db = firestoreInstance;

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




