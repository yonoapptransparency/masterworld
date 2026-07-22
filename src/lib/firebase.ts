/**
 * Firebase Client API initialization
 * Configures connection states to Firestore DB and Auth endpoints dynamically.
 */

import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getAdminPath } from './utils';

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
  return true;
};

const getEnvVal = (key: string): string | undefined => {
  if (key === 'VITE_FIREBASE_PROJECT_ID' || key === 'FIREBASE_PROJECT_ID') return (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_FIREBASE_PROJECT_ID : undefined) || (typeof process !== 'undefined' && process.env ? (typeof process !== 'undefined' && process.env ? process.env.VITE_FIREBASE_PROJECT_ID : undefined) || process.env.FIREBASE_PROJECT_ID : undefined);
  if (key === 'VITE_FIREBASE_APP_ID' || key === 'FIREBASE_APP_ID') return (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_FIREBASE_APP_ID : undefined) || (typeof process !== 'undefined' && process.env ? (typeof process !== 'undefined' && process.env ? process.env.VITE_FIREBASE_APP_ID : undefined) || process.env.FIREBASE_APP_ID : undefined);
  if (key === 'VITE_FIREBASE_API_KEY' || key === 'FIREBASE_API_KEY') return (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_FIREBASE_API_KEY : undefined) || (typeof process !== 'undefined' && process.env ? (typeof process !== 'undefined' && process.env ? process.env.VITE_FIREBASE_API_KEY : undefined) || process.env.FIREBASE_API_KEY : undefined);
  if (key === 'VITE_FIREBASE_AUTH_DOMAIN' || key === 'FIREBASE_AUTH_DOMAIN') return (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_FIREBASE_AUTH_DOMAIN : undefined) || (typeof process !== 'undefined' && process.env ? (typeof process !== 'undefined' && process.env ? process.env.VITE_FIREBASE_AUTH_DOMAIN : undefined) || process.env.FIREBASE_AUTH_DOMAIN : undefined);
  if (key === 'VITE_FIREBASE_DATABASE_ID' || key === 'FIREBASE_DATABASE_ID') return (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_FIREBASE_DATABASE_ID : undefined) || (typeof process !== 'undefined' && process.env ? (typeof process !== 'undefined' && process.env ? process.env.VITE_FIREBASE_DATABASE_ID : undefined) || process.env.FIREBASE_DATABASE_ID : undefined);
  if (key === 'VITE_FIREBASE_STORAGE_BUCKET' || key === 'FIREBASE_STORAGE_BUCKET') return (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_FIREBASE_STORAGE_BUCKET : undefined) || (typeof process !== 'undefined' && process.env ? (typeof process !== 'undefined' && process.env ? process.env.VITE_FIREBASE_STORAGE_BUCKET : undefined) || process.env.FIREBASE_STORAGE_BUCKET : undefined);
  if (key === 'VITE_FIREBASE_MESSAGING_ID' || key === 'FIREBASE_MESSAGING_ID') return (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_FIREBASE_MESSAGING_ID : undefined) || (typeof process !== 'undefined' && process.env ? (typeof process !== 'undefined' && process.env ? process.env.VITE_FIREBASE_MESSAGING_ID : undefined) || process.env.FIREBASE_MESSAGING_ID : undefined);
  return undefined;
};

const getResolvedConfig = () => {
  return {
    projectId: "gen-lang-client-0825832493",
    appId: "1:103973989874:web:733a6afd8e837224900f6b",
    apiKey: "AIzaSyBey9sUbeWlrcXS2kl4ewOzkTy4arg03Ok",
    authDomain: "gen-lang-client-0825832493.firebaseapp.com",
    firestoreDatabaseId: "ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a",
    storageBucket: "gen-lang-client-0825832493.firebasestorage.app",
    messagingSenderId: "103973989874",
  };
};

const firebaseConfig = getResolvedConfig();

const isAdminEnabled = typeof __ADMIN_ENABLED__ !== 'undefined' ? __ADMIN_ENABLED__ : true;

export const isFirebaseConfigured = isAdminEnabled && !!firebaseConfig;
if (!isFirebaseConfigured && typeof window !== 'undefined') {
  console.error("Firebase is not configured! firebaseConfig:", firebaseConfig, "isAdminEnabled:", isAdminEnabled);
}

export const isFirebaseApiKeyReal = (key: string | undefined): boolean => {
  return isRealValue(key);
};

console.log("DEBUG FIREBASE:", firebaseConfig, isFirebaseConfigured);
export const isFirebaseReal = isFirebaseConfigured && isFirebaseApiKeyReal(firebaseConfig?.apiKey);

export const app = isFirebaseConfigured ? initializeApp(firebaseConfig!) : null as any;

export const auth = (() => {
  if (isFirebaseReal && app) {
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
  const dbId = firebaseConfig?.firestoreDatabaseId === '(default)' ? undefined : firebaseConfig?.firestoreDatabaseId;
  try { firestoreInstance = initializeFirestore(app, {
    experimentalForceLongPolling: true,
  }, dbId); } catch(e) { console.error("FAILED TO INITIALIZE FIRESTORE:", e); firestoreInstance = getFirestore(app, dbId); }

  if (!isFirebaseReal && firestoreInstance) {
    // No-op for mock Firestore
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




