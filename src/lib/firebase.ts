/**
 * Firebase Client API initialization
 * Configures connection states to Firestore DB and Auth endpoints dynamically.
 */

import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// Allow Vite to statically bundle the configuration file
import appletConfig from '../../firebase-applet-config.json';

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
  const clean = id.trim();
  if (clean === '' || clean === 'PLACEHOLDER' || clean.includes('REPLACE_WITH_YOUR_REAL_KEY') || clean.includes('YOUR_API_KEY')) return false;
  
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

class MockUser {
  uid = 'mock-admin-uid-123';
  email = import.meta.env.VITE_ADMIN_EMAIL || 'admin@example.com';
  emailVerified = true;
  isAnonymous = false;
  tenantId = null;
  providerData = [];
  async getIdToken() {
    return 'MOCK_ADMIN_TOKEN';
  }
}

class MockAuth {
  private listeners: Array<(user: any) => void> = [];
  _currentUser: any = null;

  constructor() {
    let isSessionValid = false;
    let email = '';
    if (typeof window !== 'undefined') {
      if (localStorage.getItem('MOCK_ADMIN_SESSION') === 'true') {
        isSessionValid = true;
        email = localStorage.getItem('MOCK_ADMIN_EMAIL') || '';
      } else {
        const raw = sessionStorage.getItem('__adm_session');
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (parsed.idToken && parsed.email) {
              isSessionValid = true;
              email = parsed.email;
              localStorage.setItem('MOCK_ADMIN_SESSION', 'true');
              localStorage.setItem('MOCK_ADMIN_EMAIL', email);
            }
          } catch (_) {}
        }
      }
    }
    if (isSessionValid) {
      this._currentUser = new MockUser();
      if (email) {
        this._currentUser.email = email;
      }
    }
  }

  get currentUser() {
    return this._currentUser;
  }

  onAuthStateChanged(callback: (user: any) => void) {
    this.listeners.push(callback);
    setTimeout(() => {
      callback(this._currentUser);
    }, 0);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  async signInWithEmailAndPassword(email: string, password?: string) {
    if (password !== 'admin123') {
      const err = new Error('auth/wrong-password');
      (err as any).code = 'auth/wrong-password';
      throw err;
    }
    this._currentUser = new MockUser();
    this._currentUser.email = email;
    if (typeof window !== 'undefined') {
      localStorage.setItem('MOCK_ADMIN_SESSION', 'true');
      localStorage.setItem('MOCK_ADMIN_EMAIL', email);
    }
    this.listeners.forEach(l => l(this._currentUser));
    return { user: this._currentUser };
  }

  async signInWithPopup() {
    const err = new Error('auth/operation-not-supported-in-this-environment');
    (err as any).code = 'auth/operation-not-supported-in-this-environment';
    throw err;
  }

  async signOut() {
    this._currentUser = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('MOCK_ADMIN_SESSION');
      localStorage.removeItem('MOCK_ADMIN_EMAIL');
    }
    this.listeners.forEach(l => l(null));
  }
}

const isAdminEnabled = typeof __ADMIN_ENABLED__ !== 'undefined' ? __ADMIN_ENABLED__ : true;

export const isFirebaseConfigured = isAdminEnabled && isRealValue(firebaseConfig.apiKey) && isRealValue(firebaseConfig.projectId);

export const isFirebaseApiKeyReal = (key: string | undefined): boolean => {
  if (!key) return false;
  const clean = key.trim();
  if (clean === '' || clean === 'PLACEHOLDER' || clean.includes('REPLACE_WITH_YOUR_REAL_KEY') || clean.includes('YOUR_API_KEY')) return false;
  // Relaxed regex to allow platform-injected keys that might contain symbols
  return true;
};

export const isFirebaseReal = isFirebaseConfigured && isFirebaseApiKeyReal(firebaseConfig.apiKey);

export const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null as any;

export const auth = (() => {
  if (isFirebaseReal) {
    const realAuth = getAuth(app);
    const originalOnAuthStateChanged = (realAuth as any).onAuthStateChanged;
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
    return new MockAuth() as any;
  }
})();

import { getFirestore, initializeFirestore, doc, getDocFromServer, disableNetwork } from 'firebase/firestore';

let firestoreInstance: any = null;
if (app) {
  const dbId = firebaseConfig.firestoreDatabaseId === '(default)' ? undefined : firebaseConfig.firestoreDatabaseId;
  firestoreInstance = initializeFirestore(app, {
    experimentalForceLongPolling: true,
  }, dbId);

  if (!isFirebaseReal) {
    // If the Firebase configuration is mock/fictional, disable network traffic.
    // This allows the Firestore SDK to operate smoothly in local-only cache mode
    // without attempting network connections to nonexistent servers, eliminating connection errors.
    disableNetwork(firestoreInstance).catch((err) => {
      console.warn("Could not disable network for mock Firestore instance:", err);
    });
  }
}

export const db = firestoreInstance;

async function testConnection() {
  if (!db || !isFirebaseReal) return;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && (error.message.includes('the client is offline') || error.message.includes('offline') || error.message.includes('unavailable'))) {
      console.warn("Firestore connection check: Please check your Firebase configuration or network.");
    }
  }
}
testConnection();

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
  
  const jsonString = JSON.stringify(errInfo);
  console.warn('Firestore Error (Fallback handled): ', jsonString);
  return new Error(jsonString);
}




