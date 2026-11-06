import { useState, useEffect, useRef } from 'react';
import { adminFetch } from '../services/adminAuthService';
import { sessionStore } from '../lib/sessionStore';
import { mockApps } from '../lib/staticData';
import { safeDecrypt } from '../lib/cryptoUtils';

const cipherDecryptCache = new Map<string, string>();
function fastDecryptCached(raw: string): string {
  if (!raw || typeof raw !== 'string') return '';
  if (!raw.startsWith('U2FsdGVkX1')) return raw;
  const cached = cipherDecryptCache.get(raw);
  if (cached !== undefined) return cached;
  const dec = safeDecrypt(raw) || '';
  cipherDecryptCache.set(raw, dec);
  return dec;
}

const staticFallbackById = new Map<string, any>();
const staticFallbackBySlug = new Map<string, any>();
if (Array.isArray(mockApps)) {
  for (const m of mockApps as any[]) {
    if (m?.id) staticFallbackById.set(String(m.id), m);
    if (m?.slug) staticFallbackBySlug.set(String(m.slug).toLowerCase(), m);
  }
}

function getStaticAppFallback(app: any) {
  if (!app) return undefined;
  return (app.id && staticFallbackById.get(String(app.id))) ||
    (app.slug && staticFallbackBySlug.get(String(app.slug).toLowerCase()));
}

export const useAdminApps = (apps: any[], loading: boolean, isAdminUser: boolean | null) => {
  const [appsList, setAppsList] = useState<any[]>(() => (Array.isArray(apps) && apps.length > 0 ? apps : (mockApps || [])));
  const [fetchFailed, setFetchFailed] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const cachedSecureMapRef = useRef(new Map<string, string>());
  const deletedAppIdsRef = useRef(new Set<string>());

  const recordAppDeletion = (id: string) => {
    deletedAppIdsRef.current.add(id);
    setAppsList(prev => prev.filter(a => a.id !== id && a.slug !== id));
  };

  const syncSecureVault = async (force = false, latestAppsList?: any[]) => {
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
      if (items.length === 0) return;
      const res = await adminFetch('/api/v1/admin/encrypt-links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ items })
      });
      if (!res.ok) {
        console.warn("[AdminApps] Secure vault sync response notice:", await res.text());
      }
    } catch (e: any) {
      console.warn("[AdminApps] Secure vault sync network error:", e.message || e);
    }
  };

  // 1. Initial vault links loader (runs once on admin login)
  useEffect(() => {
    if (!loading && isAdminUser === true && !isInitialized) {
      const loadVault = async () => {
        try {
          const secureMap = new Map<string, string>();
          
          try {
            const debugRes = await adminFetch('/api/v1/admin/debug-links');
            if (debugRes.ok) {
              const debugData = await debugRes.json();
              if (Array.isArray(debugData.decrypted)) {
                debugData.decrypted.forEach((it: any) => {
                  if (it && it.url) {
                    if (it.id) secureMap.set(String(it.id), it.url);
                    if (it.slug) secureMap.set(String(it.slug), it.url);
                  }
                });
              } else if (debugData.decrypted && typeof debugData.decrypted === 'object') {
                Object.entries(debugData.decrypted).forEach(([k, v]) => {
                  if (k && typeof v === 'string') secureMap.set(k, v);
                });
              }
            }
          } catch (_) {}

          if (secureMap.size === 0) {
            try {
              const bkRes = await adminFetch('/api/v1/admin/backup-links-get');
              if (bkRes.ok) {
                const bkJSON = await bkRes.json();
                if (bkJSON && Array.isArray(bkJSON.items)) {
                  bkJSON.items.forEach((it: any) => {
                    if (it && it.id && it.url && !secureMap.has(it.id)) {
                      secureMap.set(it.id, it.url);
                    }
                  });
                }
              }
            } catch (_) {}
          }

          try {
            const recoveredStr = sessionStore.getItem('rummystore_recovered_links');
            if (recoveredStr) {
              const recovered = JSON.parse(recoveredStr);
              Object.entries(recovered).forEach(([id, url]) => {
                if (url && typeof url === 'string' && !secureMap.has(id)) secureMap.set(id, url);
              });
            }
          } catch (_) {}

          cachedSecureMapRef.current = secureMap;
          
          const sourceApps = (Array.isArray(apps) && apps.length > 0) ? apps : (appsList.length > 0 ? appsList : (mockApps || []));
          const mergedApps = sourceApps.map(a => {
            const rawUrl = a.more_information_url || a.encrypted_link || '';
            const preservedCipher = (rawUrl && typeof rawUrl === 'string' && rawUrl.startsWith('U2FsdGVkX1'))
              ? rawUrl
              : ((a.encrypted_link && typeof a.encrypted_link === 'string' && a.encrypted_link.startsWith('U2FsdGVkX1')) ? a.encrypted_link : '');
            const existingUrl = secureMap.get(a.id) || (a.slug && secureMap.get(a.slug)) || fastDecryptCached(rawUrl) || '';
            if (existingUrl) {
              if (a.id && !secureMap.has(a.id)) secureMap.set(a.id, existingUrl);
              if (a.slug && !secureMap.has(a.slug)) secureMap.set(a.slug, existingUrl);
            }
            const staticFallback = (a.description_html == null || a.features_html == null) ? getStaticAppFallback(a) : undefined;
            const descHtml = a.description_html ?? staticFallback?.description_html ?? '';
            const featHtml = a.features_html ?? staticFallback?.features_html ?? '';

            return {
              ...a, 
              description_html: descHtml,
              features_html: featHtml,
              more_information_url: existingUrl,
              encrypted_link: preservedCipher || a.encrypted_link || ''
            };
          });
          setAppsList(mergedApps);
          setIsInitialized(true);
        } catch (err) {
          setFetchFailed(true);
          setAppsList(prev => (Array.isArray(prev) && prev.length > 0 ? prev : (Array.isArray(apps) && apps.length > 0 ? apps : (mockApps || []))));
          setIsInitialized(true);
        }
      };
      loadVault();
    }
  }, [loading, isAdminUser, isInitialized]);

  // 2. Authoritative Sync: Adopt fresh apps with O(1) lookup and cached decryption
  useEffect(() => {
    if (Array.isArray(apps) && apps.length > 0) {
      const secureMap = cachedSecureMapRef.current;
      setAppsList(prevList => {
        const prevById = new Map<string, any>();
        for (const p of prevList || []) {
          if (p?.id) prevById.set(String(p.id), p);
        }
        return apps
          .filter(a => !deletedAppIdsRef.current.has(a.id) && !deletedAppIdsRef.current.has(a.slug))
          .map(a => {
            const rawLink = a.more_information_url || a.encrypted_link || '';
            const preservedCipher = (rawLink && typeof rawLink === 'string' && rawLink.startsWith('U2FsdGVkX1'))
              ? rawLink
              : ((a.encrypted_link && typeof a.encrypted_link === 'string' && a.encrypted_link.startsWith('U2FsdGVkX1')) ? a.encrypted_link : '');
            const link = secureMap.get(a.id) || (a.slug && secureMap.get(a.slug)) || fastDecryptCached(rawLink) || '';
            if (link) {
              if (a.id && !secureMap.has(a.id)) secureMap.set(a.id, link);
              if (a.slug && !secureMap.has(a.slug)) secureMap.set(a.slug, link);
            }

            const existingApp = a.id ? prevById.get(String(a.id)) : undefined;
            const staticFallback = (a.description_html == null || a.features_html == null) ? getStaticAppFallback(a) : undefined;
            const descHtml = a.description_html ?? existingApp?.description_html ?? staticFallback?.description_html ?? '';
            const featHtml = a.features_html ?? existingApp?.features_html ?? staticFallback?.features_html ?? '';

            return {
              ...a,
              description_html: descHtml,
              features_html: featHtml,
              more_information_url: link,
              encrypted_link: preservedCipher || a.encrypted_link || ''
            };
          });
      });
    }
  }, [apps]);

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

