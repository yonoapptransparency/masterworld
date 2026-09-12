import fs from 'fs';
import path from 'path';

/**
 * ============================================================================
 * RUMMYDEX COMMUNITY FIREBASE ADMIN SERVICE
 * ============================================================================
 * Source of Truth for the Community Reviews, Ratings, and Reports Firebase project.
 * 
 * PROJECT ID: rummydexcommunity
 * DATABASE ID: (default)
 * 
 * ISOLATION GUARANTEE:
 * This file is 100% isolated from the primary master catalog Firebase (src/server/firebase.ts).
 * It communicates EXCLUSIVELY with the `rummydexcommunity` Firebase project to ensure
 * zero cross-project contamination, zero hallucinations, and zero accidental writes.
 * ============================================================================
 */

export interface CommunityFirebaseConfig {
  projectId: string;
  databaseId: string;
  firestoreDatabaseId: string;
  apiKey: string;
  appId: string;
  messagingSenderId: string;
  measurementId: string;
  authDomain: string;
  storageBucket: string;
}

// 1. Community Firebase Configuration (Strictly rummydexcommunity)
export function getCommunityFirebaseConfig(): CommunityFirebaseConfig {
  const envProjectId = process.env.COMMUNITY_FIREBASE_PROJECT_ID || process.env.VITE_COMMUNITY_FIREBASE_PROJECT_ID || 'rummydexcommunity';
  const envDbId = process.env.COMMUNITY_FIREBASE_DATABASE_ID || process.env.VITE_COMMUNITY_FIREBASE_DATABASE_ID || '(default)';
  const envApiKey = process.env.COMMUNITY_FIREBASE_API_KEY || process.env.VITE_COMMUNITY_FIREBASE_API_KEY || "AIzaSyCzhWEDLQsZ-HL8iVMcINq78lB-RzYPxi0";
  const envAppId = process.env.COMMUNITY_FIREBASE_APP_ID || process.env.VITE_COMMUNITY_FIREBASE_APP_ID || "1:236598070230:web:df8b1b549dea13938d3277";

  return {
    projectId: envProjectId,
    databaseId: envDbId,
    firestoreDatabaseId: envDbId,
    apiKey: envApiKey,
    appId: envAppId,
    messagingSenderId: "236598070230",
    measurementId: "G-2JKRRM48PD",
    authDomain: `${envProjectId}.firebaseapp.com`,
    storageBucket: `${envProjectId}.firebasestorage.app`
  };
}

function parseCommunityServiceAccount(raw: string): any {
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  try {
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      const parsed = JSON.parse(trimmed);
      if (parsed.project_id && parsed.private_key) return parsed;
    }
  } catch (e) {}

  try {
    const decoded = Buffer.from(trimmed, 'base64').toString('utf-8');
    if (decoded.startsWith('{') && decoded.endsWith('}')) {
      const parsed = JSON.parse(decoded);
      if (parsed.project_id && parsed.private_key) return parsed;
    }
  } catch (e) {}

  return null;
}

let cachedCommunityDb: any = null;
let cachedCommunityAccessToken: { token: string; expiresAt: number } | null = null;

// 2. Community Admin SDK Firestore Initializer
export function getCommunityAdminDb(): any {
  if (cachedCommunityDb) return cachedCommunityDb;

  try {
    const admin = require('firebase-admin');
    const { getFirestore } = require('firebase-admin/firestore');

    // Check if communityApp is already initialized
    const existingApp = admin.apps.find((app: any) => app.name === 'communityApp');
    if (existingApp) {
      const config = getCommunityFirebaseConfig();
      const dbId = config.firestoreDatabaseId || '(default)';
      if (dbId && dbId !== '(default)') {
        cachedCommunityDb = getFirestore(existingApp, dbId);
      } else {
        cachedCommunityDb = existingApp.firestore();
      }
      try {
        cachedCommunityDb.settings({ preferRest: true, ignoreUndefinedProperties: true });
      } catch (e) {}
      return cachedCommunityDb;
    }

    // Attempt to load from environment variables
    const possibleEnvVars = [
      'COMMUNITY_FIREBASE_SERVICE_ACCOUNT',
      'COMMUNITY_FIREBASE_ACCOUNT',
      'COMMUNITY_SERVICE_ACCOUNT',
      'COMMUNITY_SERVICE_ACCOUNT_JSON',
      'COMMUNITY_FIREBASE_SECRET',
      'COMMUNITY_FIREBASE_KEY'
    ];

    let communityServiceAccountRaw = '';
    let detectedVar = '';
    for (const vName of possibleEnvVars) {
      if (process.env[vName] && String(process.env[vName]).trim() !== '') {
        communityServiceAccountRaw = String(process.env[vName]);
        detectedVar = vName;
        break;
      }
    }

    if (communityServiceAccountRaw) {
      const serviceAccount = parseCommunityServiceAccount(communityServiceAccountRaw);
      if (serviceAccount) {
        const communityApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: serviceAccount.project_id
        }, 'communityApp');

        const config = getCommunityFirebaseConfig();
        const dbId = config.firestoreDatabaseId || '(default)';
        if (dbId && dbId !== '(default)') {
          cachedCommunityDb = getFirestore(communityApp, dbId);
        } else {
          cachedCommunityDb = communityApp.firestore();
        }

        try {
          cachedCommunityDb.settings({ preferRest: true, ignoreUndefinedProperties: true });
        } catch (e) {}
        console.log(`[Community Admin SDK] Firestore initialized successfully from ${detectedVar} (Project: ${serviceAccount.project_id}).`);
        return cachedCommunityDb;
      }
    }

    // Attempt to load from local service account file
    const serviceAccountPath = path.join(process.cwd(), 'community-service-account.json');
    if (fs.existsSync(serviceAccountPath)) {
      const raw = fs.readFileSync(serviceAccountPath, 'utf-8');
      const serviceAccount = parseCommunityServiceAccount(raw);
      if (serviceAccount) {
        const communityApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: serviceAccount.project_id
        }, 'communityApp');

        const config = getCommunityFirebaseConfig();
        const dbId = config.firestoreDatabaseId || '(default)';
        if (dbId && dbId !== '(default)') {
          cachedCommunityDb = getFirestore(communityApp, dbId);
        } else {
          cachedCommunityDb = communityApp.firestore();
        }

        try {
          cachedCommunityDb.settings({ preferRest: true, ignoreUndefinedProperties: true });
        } catch (e) {}
        console.log(`[Community Admin SDK] Firestore initialized successfully from community-service-account.json (Project: ${serviceAccount.project_id}).`);
        return cachedCommunityDb;
      }
    }

    // CRITICAL: NEVER fallback to the primary app. Return null to trigger REST fallback for rummydexcommunity.
    return null;
  } catch (err: any) {
    console.warn('[Community Admin SDK] Initialization notice:', err.message || err);
    return null;
  }
}

// 3. OAuth / Access Token Helper for Community REST
export async function getCommunityAdminAccessToken(): Promise<string | null> {
  if (cachedCommunityAccessToken && Date.now() < cachedCommunityAccessToken.expiresAt - 60000) {
    return cachedCommunityAccessToken.token;
  }
  try {
    const admin = require('firebase-admin');
    let app = admin.apps.find((a: any) => a.name === 'communityApp');
    if (!app) {
      getCommunityAdminDb();
      app = admin.apps.find((a: any) => a.name === 'communityApp');
    }
    if (app && app.options && app.options.credential && typeof app.options.credential.getAccessToken === 'function') {
      const res = await app.options.credential.getAccessToken();
      if (res && res.access_token) {
        cachedCommunityAccessToken = {
          token: res.access_token,
          expiresAt: Date.now() + ((res.expires_in || 3600) * 1000)
        };
        return res.access_token;
      }
    }
  } catch (e) {
    // Non-blocking
  }
  return null;
}

// 4. Firestore REST Serialization Helpers
export function convertCommunityToFirestoreValue(val: any): any {
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
        values: val.map(item => convertCommunityToFirestoreValue(item))
      }
    };
  }
  if (typeof val === 'object') {
    const mapFields: Record<string, any> = {};
    for (const [k, v] of Object.entries(val)) {
      if (v !== undefined) {
        mapFields[k] = convertCommunityToFirestoreValue(v);
      }
    }
    return { mapValue: { fields: mapFields } };
  }
  return { stringValue: String(val) };
}

export function convertCommunityToFirestoreFields(data: Record<string, any>): Record<string, any> {
  const fields: Record<string, any> = {};
  for (const [k, v] of Object.entries(data)) {
    if (v !== undefined) {
      fields[k] = convertCommunityToFirestoreValue(v);
    }
  }
  return fields;
}

export function parseCommunityFirestoreFields(fields: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  if (!fields || typeof fields !== 'object') return result;

  for (const [key, valueObj] of Object.entries(fields)) {
    if (!valueObj || typeof valueObj !== 'object') continue;

    if ('stringValue' in valueObj) {
      result[key] = valueObj.stringValue;
    } else if ('integerValue' in valueObj) {
      result[key] = parseInt(valueObj.integerValue, 10);
    } else if ('doubleValue' in valueObj) {
      result[key] = parseFloat(valueObj.doubleValue);
    } else if ('booleanValue' in valueObj) {
      result[key] = valueObj.booleanValue;
    } else if ('nullValue' in valueObj) {
      result[key] = null;
    } else if ('timestampValue' in valueObj) {
      result[key] = valueObj.timestampValue;
    } else if ('arrayValue' in valueObj) {
      const arr = valueObj.arrayValue?.values || [];
      result[key] = arr.map((item: any) => {
        if (!item || typeof item !== 'object') return item;
        const parsed = parseCommunityFirestoreFields({ temp: item });
        return parsed.temp;
      });
    } else if ('mapValue' in valueObj) {
      result[key] = parseCommunityFirestoreFields(valueObj.mapValue?.fields || {});
    }
  }
  return result;
}

export const parseFirestoreFields = parseCommunityFirestoreFields;

// 5. REST Document Writers and Readers (Strictly targeting rummydexcommunity)
export async function writeCommunityRestDoc(
  docId: string,
  data: any,
  merge = true,
  collectionPath = 'reviews'
): Promise<boolean> {
  // Try Admin SDK first
  const db = getCommunityAdminDb();
  if (db) {
    try {
      if (merge) {
        await db.collection(collectionPath).doc(docId).set(data, { merge: true });
      } else {
        await db.collection(collectionPath).doc(docId).set(data);
      }
      return true;
    } catch (e) {
      console.warn(`[Community Admin SDK] Failed to write ${collectionPath}/${docId}, falling back to REST:`, e);
    }
  }

  // REST Fallback
  try {
    const config = getCommunityFirebaseConfig();
    const queryParams: string[] = [];
    if (config.apiKey) queryParams.push(`key=${encodeURIComponent(config.apiKey)}`);
    if (merge && data && typeof data === 'object') {
      Object.keys(data).forEach(key => {
        queryParams.push(`updateMask.fieldPaths=${encodeURIComponent(key)}`);
      });
    }

    const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
    const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId}/documents/${collectionPath}/${docId}${queryString}`;

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const commToken = await getCommunityAdminAccessToken();
    if (commToken) headers['Authorization'] = `Bearer ${commToken}`;

    const fields = convertCommunityToFirestoreFields(data);
    const res = await fetch(url, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ fields })
    });

    return res.ok;
  } catch (err) {
    console.error(`[Community REST] Exception writing ${collectionPath}/${docId}:`, err);
    return false;
  }
}

export async function readCommunityRestDoc(
  docId: string,
  collectionPath = 'reviews'
): Promise<any | null> {
  const db = getCommunityAdminDb();
  if (db) {
    try {
      const snap = await db.collection(collectionPath).doc(docId).get();
      if (snap.exists) return { id: snap.id, ...snap.data() };
      return null;
    } catch (e) {
      // Fallback to REST
    }
  }

  try {
    const config = getCommunityFirebaseConfig();
    const finalApiKeyParam = config.apiKey ? `?key=${encodeURIComponent(config.apiKey)}` : '';
    const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId}/documents/${collectionPath}/${docId}${finalApiKeyParam}`;

    const headers: Record<string, string> = {};
    const commToken = await getCommunityAdminAccessToken();
    if (commToken) headers['Authorization'] = `Bearer ${commToken}`;

    const res = await fetch(url, { headers });
    if (!res.ok) return null;

    const doc = await res.json();
    if (!doc || !doc.fields) return null;
    return { id: docId, ...parseCommunityFirestoreFields(doc.fields) };
  } catch (err) {
    return null;
  }
}

export async function deleteCommunityRestDoc(
  docId: string,
  collectionPath = 'reviews'
): Promise<boolean> {
  const db = getCommunityAdminDb();
  if (db) {
    try {
      await db.collection(collectionPath).doc(docId).delete();
      return true;
    } catch (e) {
      // Fallback to REST
    }
  }

  try {
    const config = getCommunityFirebaseConfig();
    const finalApiKeyParam = config.apiKey ? `?key=${encodeURIComponent(config.apiKey)}` : '';
    const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId}/documents/${collectionPath}/${docId}${finalApiKeyParam}`;

    const headers: Record<string, string> = {};
    const commToken = await getCommunityAdminAccessToken();
    if (commToken) headers['Authorization'] = `Bearer ${commToken}`;

    const res = await fetch(url, { method: 'DELETE', headers });
    return res.ok;
  } catch (err) {
    return false;
  }
}

export async function readCommunityRestCollection(
  collectionPath = 'reviews',
  limitCount = 100
): Promise<any[]> {
  const db = getCommunityAdminDb();
  if (db) {
    try {
      const snap = await db.collection(collectionPath).limit(limitCount).get();
      if (snap && snap.docs) {
        return snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
      }
    } catch (e) {
      // Fall through to REST
    }
  }

  try {
    const config = getCommunityFirebaseConfig();
    const runQueryUrl = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId}/documents:runQuery?key=${encodeURIComponent(config.apiKey)}`;
    const queryBody = {
      structuredQuery: {
        from: [{ collectionId: collectionPath }],
        limit: limitCount
      }
    };
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const commToken = await getCommunityAdminAccessToken();
    if (commToken) headers['Authorization'] = `Bearer ${commToken}`;

    const res = await fetch(runQueryUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(queryBody)
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        const results: any[] = [];
        for (const item of data) {
          if (item && item.document && item.document.fields) {
            const id = item.document.name.split('/').pop();
            results.push({ id, ...parseCommunityFirestoreFields(item.document.fields) });
          }
        }
        return results;
      }
    }
    return [];
  } catch (err) {
    return [];
  }
}

/**
 * Highly Optimized Live Per-App Review Query

 * Reads strictly the requested app's reviews (batched in 5 items) directly from live Firestore.
 * Prevents full-collection scans and protects free quota limits.
 */
export async function fetchLiveReviewsForApp(
  appIdentifier: string,
  options: {
    limit?: number;
    cursor?: string;
    filter?: string;
    sortBy?: string;
  } = {}
): Promise<{ reviews: any[]; hasMore: boolean; nextCursor: string | null }> {
  const fetchLimit = Math.min(20, Math.max(1, options.limit || 5));
  const targetId = String(appIdentifier || '').toLowerCase().trim();
  if (!targetId) return { reviews: [], hasMore: false, nextCursor: null };

  const db = getCommunityAdminDb();
  if (db) {
    try {
      let query = db.collection('reviews')
        .where('appId', '==', targetId)
        .where('status', '==', 'published');

      if (options.filter === 'positive') {
        query = query.where('rating', '>=', 4);
      } else if (options.filter === 'critical') {
        query = query.where('rating', '<=', 3);
      }

      // Order
      if (options.sortBy === 'helpful') {
        query = query.orderBy('helpful_count', 'desc');
      } else if (options.sortBy === 'highest') {
        query = query.orderBy('rating', 'desc');
      } else if (options.sortBy === 'lowest') {
        query = query.orderBy('rating', 'asc');
      } else {
        query = query.orderBy('timestamp', 'desc');
      }

      if (options.cursor) {
        const startSnap = await db.collection('reviews').doc(options.cursor).get();
        if (startSnap.exists) {
          query = query.startAfter(startSnap);
        }
      }

      // Fetch 1 extra to determine hasMore
      const snap = await query.limit(fetchLimit + 1).get();
      if (snap && snap.docs) {
        const docs = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
        const hasMore = docs.length > fetchLimit;
        const pageDocs = hasMore ? docs.slice(0, fetchLimit) : docs;
        const nextCursor = hasMore && pageDocs.length > 0 ? pageDocs[pageDocs.length - 1].id : null;

        return { reviews: pageDocs, hasMore, nextCursor };
      }
    } catch (err: any) {
      console.warn(`[Community Store] Live query composite error for ${targetId}:`, err?.message || err);
      // Fallback: simple unindexed where query on appId, then sort/filter in-memory
      try {
        const fallbackSnap = await db.collection('reviews')
          .where('appId', '==', targetId)
          .limit(50)
          .get();
        if (fallbackSnap && fallbackSnap.docs && fallbackSnap.docs.length > 0) {
          let docs = fallbackSnap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
          docs = docs.filter((r: any) => !r.status || r.status === 'published');
          if (options.filter === 'positive') docs = docs.filter((r: any) => (Number(r.rating) || 5) >= 4);
          else if (options.filter === 'critical') docs = docs.filter((r: any) => (Number(r.rating) || 5) <= 3);

          if (options.sortBy === 'helpful') {
            docs.sort((a: any, b: any) => (b.helpful_count || 0) - (a.helpful_count || 0));
          } else if (options.sortBy === 'highest') {
            docs.sort((a: any, b: any) => (Number(b.rating) || 5) - (Number(a.rating) || 5));
          } else if (options.sortBy === 'lowest') {
            docs.sort((a: any, b: any) => (Number(a.rating) || 5) - (Number(b.rating) || 5));
          } else {
            docs.sort((a: any, b: any) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
          }

          let startIndex = 0;
          if (options.cursor) {
            const idx = docs.findIndex((r: any) => r.id === options.cursor);
            if (idx >= 0) startIndex = idx + 1;
          }

          const pageDocs = docs.slice(startIndex, startIndex + fetchLimit);
          const hasMore = startIndex + fetchLimit < docs.length;
          const nextCursor = hasMore && pageDocs.length > 0 ? pageDocs[pageDocs.length - 1].id : null;
          return { reviews: pageDocs, hasMore, nextCursor };
        }
      } catch (fallbackErr: any) {
        console.warn(`[Community Store] Fallback query also failed for ${targetId}:`, fallbackErr?.message || fallbackErr);
      }
    }
  }

  // Check bucket doc fallback in community_store
  try {
    const chunkDoc = await readCommunityRestDoc(`app_reviews_${targetId}_0`, 'community_store');
    if (chunkDoc && Array.isArray(chunkDoc.reviews)) {
      let list = chunkDoc.reviews;
      if (options.filter === 'positive') list = list.filter((r: any) => (r.rating || 5) >= 4);
      else if (options.filter === 'critical') list = list.filter((r: any) => (r.rating || 5) <= 3);

      let startIndex = 0;
      if (options.cursor) {
        const idx = list.findIndex((r: any) => r.id === options.cursor);
        if (idx >= 0) startIndex = idx + 1;
      }
      const pageDocs = list.slice(startIndex, startIndex + fetchLimit);
      const hasMore = startIndex + fetchLimit < list.length;
      const nextCursor = hasMore && pageDocs.length > 0 ? pageDocs[pageDocs.length - 1].id : null;

      return { reviews: pageDocs, hasMore, nextCursor };
    }
  } catch (e) {}

  return { reviews: [], hasMore: false, nextCursor: null };
}
