import { useState, useEffect, useRef } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured, isFirebaseReal } from '../lib/firebase';
import { adminFetch } from '../services/adminAuthService';
import { sessionStore } from '../lib/sessionStore';

export const useAdminApps = (apps: any[], loading: boolean, isAdminUser: boolean | null) => {
  const [appsList, setAppsList] = useState<any[]>(apps || []);
  const [fetchFailed, setFetchFailed] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const cachedSecureMapRef = useRef(new Map());
  const latestMockAppsRef = useRef(apps);
  const deletedAppIdsRef = useRef(new Set<string>());

  useEffect(() => {
    latestMockAppsRef.current = apps;
  }, [apps]);

  const recordAppDeletion = (id: string) => {
    deletedAppIdsRef.current.add(id);
    setAppsList(prev => prev.filter(a => a.id !== id));
  };

  const syncSecureVault = async (force = false) => {
    if (!isInitialized) return;
    try {
      const items = Array.from(cachedSecureMapRef.current.entries()).map(([k, v]) => {
        const app = appsList.find(a => a.id === k || a.slug === k);
        return {
          id: app?.id || k,
          slug: app?.slug || k,
          url: v
        };
      });
      const idToken = await auth?.currentUser?.getIdToken();
      console.log("[DEBUG] syncSecureVault called. Items:", items.length, "Token exists:", !!idToken);
      const res = await adminFetch('/api/v1/admin/encrypt-links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ items })
      });
      console.log("[DEBUG] syncSecureVault res.ok:", res.ok);
      if (res.ok) {
        const { encrypted } = await res.json();
        const payload = { encryptedData: encrypted, lastUpdated: new Date().toISOString() };
        console.log("[DEBUG] syncSecureVault writing to Firestore client...");
        await setDoc(doc(db, 'store_data', 'sec_vault'), payload);
        await setDoc(doc(db, 'store_data', 'secure_links'), payload);
        await setDoc(doc(db, 'store_data', 'sec_public_links'), payload);
        console.log("[DEBUG] syncSecureVault finished Firestore client writes.");
      } else {
         console.warn("[DEBUG] syncSecureVault failed:", await res.text());
      }
    } catch (e: any) {
      console.warn("Failed to sync secure vault:", e.message || e);
    }
  };

  useEffect(() => {
    if (!loading && isAdminUser === true && !isInitialized) {
      const loadVault = async () => {
        if (!isFirebaseConfigured || !db) {
          setIsInitialized(true);
          return;
        }
        try {
          const snap = await getDoc(doc(db, 'store_data', 'sec_public_links'));
          let secureMap = new Map();
          let snapData = snap.exists() ? snap.data() : null;
          const hadPublicLinks = snap.exists() && snap.data()?.encryptedData;
          
          if (!snapData || (!snapData.encryptedData && !snapData.items)) {
              const slSnap = await getDoc(doc(db, 'store_data', 'secure_links'));
              if (slSnap.exists()) snapData = slSnap.data();
              else {
                const vSnap = await getDoc(doc(db, 'store_data', 'sec_vault'));
                if (vSnap.exists()) snapData = vSnap.data();
              }
          }

          if (snapData) {
            if (snapData.encryptedData) {
              try {
                const idToken = await auth?.currentUser?.getIdToken();
                const res = await adminFetch('/api/v1/admin/decrypt-links', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                  },
                  body: JSON.stringify({ encryptedData: snapData.encryptedData })
                });
                if (res.ok) {
                  const decrypted = await res.json();
                  if (decrypted.items) decrypted.items.forEach((it: any) => secureMap.set(it.id, it.url));
                } else {
                  if (isFirebaseReal) setFetchFailed(true);
                }
              } catch (decErr: any) {
                if (isFirebaseReal) setFetchFailed(true);
              }
            } else if (snapData.items) {
              snapData.items.forEach((it: any) => secureMap.set(it.id, it.url));
            }
          }

          // Fallback from container backup
          try {
            const idToken = await auth?.currentUser?.getIdToken();
            if (idToken) {
              const bkRes = await adminFetch('/api/v1/admin/backup-links-get', {
                headers: { 'Authorization': `Bearer ${idToken}` }
              });
              if (bkRes.ok) {
                const bkJSON = await bkRes.json();
                if (bkJSON && bkJSON.items) bkJSON.items.forEach((it: any) => { if (it.url) secureMap.set(it.id, it.url); });
              }
            }
          } catch (bkErr) {}

          // Session recovery
          try {
            const recoveredStr = sessionStore.getItem('rummystore_recovered_links');
            if (recoveredStr) {
              const recovered = JSON.parse(recoveredStr);
              Object.entries(recovered).forEach(([id, url]) => {
                if (url && typeof url === 'string' && !secureMap.has(id)) secureMap.set(id, url);
              });
            }
          } catch (e) {}

          cachedSecureMapRef.current = secureMap;
          const mergedApps = (latestMockAppsRef.current || []).map(a => ({
            ...a, 
            more_information_url: secureMap.get(a.id) || a.more_information_url 
          }));
          setAppsList(mergedApps);
          setIsInitialized(true);

          if (!hadPublicLinks && secureMap.size > 0 && !fetchFailed && isFirebaseReal) {
            syncSecureVault();
          }
        } catch (err) {
          if (isFirebaseReal) setFetchFailed(true);
          setAppsList(latestMockAppsRef.current || []);
          setIsInitialized(true);
        }
      };
      loadVault();
    } else if (isInitialized && Array.isArray(apps) && apps.length > 0) {
      const secureMap = cachedSecureMapRef.current;
      setAppsList(prev => {
        if (!prev || prev.length === 0) {
          return apps.map(a => ({
            ...a,
            more_information_url: secureMap.get(a.id) || a.more_information_url
          }));
        }

        const prevMap = new Map(prev.map(item => [item.id, item]));
        const incomingMap = new Map(apps.map(item => [item.id, item]));
        const merged: any[] = [];

        // 1. Keep existing local apps (preserves local additions & edits) if not explicitly deleted
        for (const prevItem of prev) {
          if (deletedAppIdsRef.current.has(prevItem.id)) continue;
          const incoming = incomingMap.get(prevItem.id);
          if (!incoming) {
            // Newly added local app that hasn't synced back yet
            merged.push(prevItem);
          } else {
            // Item exists in both: merge, giving local edits precedence
            const link = secureMap.get(prevItem.id) || prevItem.more_information_url || incoming.more_information_url;
            merged.push({
              ...incoming,
              ...prevItem,
              more_information_url: link
            });
          }
        }

        // 2. Add brand new apps from incoming that aren't in prev & not deleted
        for (const incomingItem of apps) {
          if (!prevMap.has(incomingItem.id) && !deletedAppIdsRef.current.has(incomingItem.id)) {
            const link = secureMap.get(incomingItem.id) || incomingItem.more_information_url;
            merged.push({
              ...incomingItem,
              more_information_url: link
            });
          }
        }

        if (JSON.stringify(prev) === JSON.stringify(merged)) return prev;
        return merged;
      });
    }
  }, [loading, apps, isAdminUser, isInitialized]);

  return {
    appsList,
    setAppsList,
    fetchFailed,
    cachedSecureMapRef,
    syncSecureVault,
    recordAppDeletion,
    deletedAppIdsRef
  };
};
