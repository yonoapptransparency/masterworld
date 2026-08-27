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

  const syncSecureVault = async (force = false, latestAppsList?: any[]) => {
    if (!isInitialized) return;
    try {
      const currentList = latestAppsList || appsList;
      const items = Array.from(cachedSecureMapRef.current.entries()).map(([k, v]) => {
        const app = currentList.find(a => a.id === k || a.slug === k);
        return {
          id: app?.id || k,
          slug: app?.slug || k,
          url: v
        };
      });
      const res = await adminFetch('/api/v1/admin/encrypt-links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ items })
      });
      if (res.ok) {
        const { encrypted } = await res.json();
        const payload = { encryptedData: encrypted, lastUpdated: new Date().toISOString() };
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
        try {
          let secureMap = new Map();
          
          try {
            const debugRes = await adminFetch('/api/v1/admin/debug-links');
            if (debugRes.ok) {
              const debugData = await debugRes.json();
              if (debugData.decrypted && Array.isArray(debugData.decrypted)) {
                debugData.decrypted.forEach((it: any) => {
                  if (it && it.id && it.url) secureMap.set(it.id, it.url);
                });
              }
            }
          } catch (debugErr) {
            console.warn("Failed fetching debug-links, trying fallback...", debugErr);
          }

          // Fallback from container backup
          try {
            const bkRes = await adminFetch('/api/v1/admin/backup-links-get');
            if (bkRes.ok) {
              const bkJSON = await bkRes.json();
              if (bkJSON && bkJSON.items && Array.isArray(bkJSON.items)) {
                bkJSON.items.forEach((it: any) => {
                  if (it && it.id && it.url && !secureMap.has(it.id)) {
                    secureMap.set(it.id, it.url);
                  }
                });
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
          const mergedApps = (latestMockAppsRef.current || []).map(a => {
            const existingUrl = a.more_information_url || secureMap.get(a.id) || '';
            if (existingUrl && !secureMap.has(a.id)) {
              secureMap.set(a.id, existingUrl);
            }
            return {
              ...a, 
              more_information_url: existingUrl 
            };
          });
          setAppsList(mergedApps);
          setIsInitialized(true);
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
          const mapped = apps.map(a => {
            const link = a.more_information_url || secureMap.get(a.id) || '';
            if (link && link !== secureMap.get(a.id)) {
              secureMap.set(a.id, link);
            }
            return {
              ...a,
              more_information_url: link
            };
          });
          syncSecureVault(true, mapped);
          return mapped;
        }

        const prevMap = new Map(prev.map(item => [item.id, item]));
        const incomingMap = new Map(apps.map(item => [item.id, item]));
        const merged: any[] = [];
        let mapChanged = false;

        // 1. Keep existing local apps (preserves local additions & edits) if not explicitly deleted
        for (const prevItem of prev) {
          if (deletedAppIdsRef.current.has(prevItem.id)) continue;
          const incoming = incomingMap.get(prevItem.id);
          if (!incoming) {
            // Newly added local app that hasn't synced back yet
            merged.push(prevItem);
          } else {
            // Item exists in both: merge, giving local edits precedence
            const link = prevItem.more_information_url || incoming.more_information_url || secureMap.get(prevItem.id) || '';
            if (link && link !== secureMap.get(prevItem.id)) {
              secureMap.set(prevItem.id, link);
              mapChanged = true;
            }
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
            const link = incomingItem.more_information_url || secureMap.get(incomingItem.id) || '';
            if (link && link !== secureMap.get(incomingItem.id)) {
              secureMap.set(incomingItem.id, link);
              mapChanged = true;
            }
            merged.push({
              ...incomingItem,
              more_information_url: link
            });
          }
        }
        
        if (mapChanged) {
          syncSecureVault(true, merged);
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
