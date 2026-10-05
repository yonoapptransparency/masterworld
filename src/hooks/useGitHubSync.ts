import React, { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, isFirebaseReal, handleFirestoreError, OperationType } from '../lib/firebase';
import { adminFetch, getValidAdminToken, loadSession } from '../services/adminAuthService';
import { GitConfig, generateStaticDataFileCode, generateCommunityReviewsFileCode, commitFileToGitHub, commitMultiFilesToGitHub, encryptUrlIfNeeded } from '../lib/githubSync';
import { getAesSecret, safeDecrypt, safeEncrypt } from '../lib/cryptoUtils';
import { generateAllSitemaps } from '../lib/sitemapGenerator';
import { ensureDefaultSettings } from '../lib/defaultLegalContent';
import { AppConfig, GlobalSettings, NewsItem, VideoItem } from '../types';
import { getResolvedCommunityFirebaseConfig, parseFirestoreFields } from '../lib/communityFirebase';

import communityCatalogStats from '../lib/communityCatalogStats.json';
import communityStaticReviews from '../lib/communityStaticReviews.json';

export function useGitHubSync(
  apps: AppConfig[],
  settings: GlobalSettings,
  news: NewsItem[],
  videos: VideoItem[],
  updateLocalContainerBackup: any
) {
  const [gitConfig, setGitConfig] = useState<GitConfig | null>(null);
  const [gitConfigLoading, setGitConfigLoading] = useState(false);

  const getAdminToken = async (): Promise<string> => {
    try {
      if (auth?.currentUser) {
        const tok = await auth.currentUser.getIdToken();
        if (tok) return tok;
      }
    } catch (e) {}
    try {
      const validTok = await getValidAdminToken();
      if (validTok) return validTok;
    } catch (e) {}
    return loadSession()?.idToken || '';
  };

  // Load Git Sync Configuration on mount
  useEffect(() => {
    let isMounted = true;
    const loadConfig = async () => {
      setGitConfigLoading(true);
      try {
        // 1. Fetch from server API endpoint (uses Admin SDK)
        const res = await adminFetch('/api/github-sync/config');
        if (res.ok) {
          const data = await res.json();
          if (data.config && isMounted) {
            setGitConfig(data.config);
            try {
              localStorage.setItem('cached_git_config', JSON.stringify(data.config));
            } catch (e) {}
            return;
          }
        }
      } catch (e) {
        console.warn("[GitHub Sync] Failed to fetch config from server:", e);
      }

      // 2. Fallback to localStorage
      try {
        const cached = localStorage.getItem('cached_git_config');
        if (cached && isMounted) {
          setGitConfig(JSON.parse(cached));
          return;
        }
      } catch (e) {}

      // 3. Fallback default
      if (isMounted) {
        setGitConfig({
          owner: "yonoapptransparency",
          repo: "Dex",
          branch: "main",
          token: "",
          autoSync: false
        });
      }
      setGitConfigLoading(false);
    };

    loadConfig();
    return () => {
      isMounted = false;
    };
  }, []);

  const saveGitConfig = useCallback(async (newConfig: GitConfig) => {
    try {
      setGitConfig(newConfig);
      try {
        localStorage.setItem('cached_git_config', JSON.stringify(newConfig));
      } catch (e) {}

      // Try saving to server endpoint (Admin SDK) if running on full Express server
      try {
        await adminFetch('/api/github-sync/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newConfig)
        });
      } catch (serverErr) {
        // Ignored on static hosts (Cloudflare Pages / Vercel Edge)
        console.warn("[GitHub Sync] Server config sync skipped (static host or edge):", serverErr);
      }
    } catch (err: any) {
      console.error("Save Git Config Error:", err);
      throw err;
    }
  }, []);

  const pushAllToGitHub = useCallback(async (
    customConfig?: GitConfig, 
    onProgress?: (msg: string) => void, 
    overrideApps?: any[],
    overrideSettings?: any,
    overrideNews?: any[],
    overrideVideos?: any[]
  ) => {
    const configToUse = customConfig || gitConfig;
    if (!configToUse) {
      throw new Error("GitHub synchronization is not configured.");
    }
    const log = (msg: string) => {
      console.log(msg);
      if (onProgress) onProgress(msg);
    };

    log("GitHub Sync: Querying live database for complete catalog (Apps, News, Settings, Videos)...");
    let liveBackup: any = null;
    try {
      const liveRes = await fetch('/api/v1/public/backup-data-full');
      if (liveRes.ok) {
        liveBackup = await liveRes.json();
        log("GitHub Sync: Live complete catalog retrieved from server backup.");
      } else {
        const fallbackRes = await fetch('/api/v1/public/backup-data');
        if (fallbackRes.ok) {
          liveBackup = await fallbackRes.json();
        }
      }
    } catch (e) {
      log("GitHub Sync Notice: Could not fetch server backup endpoint, querying Firestore directly.");
    }

    // Direct Firestore multi-chunk read to guarantee all 230+ apps, settings, faqs, news, videos are retrieved
    if (isFirebaseReal && db) {
      try {
        log("GitHub Sync: Pulling live chunks directly from Firestore (chunks 0 to 15)...");
        const { doc, getDoc } = await import('firebase/firestore');
        const chunkPromises = Array.from({ length: 16 }, (_, i) => 
          getDoc(doc(db, 'store_data', `apps_chunk_${i}`)).catch(() => null)
        );
        const [
          chunks, 
          settingsSnap, 
          publicSettingsSnap, 
          faqsSnap, 
          devsSnap, 
          linksSnap, 
          newsSnap, 
          videosSnap,
          secureLinksSnap
        ] = await Promise.all([
          Promise.all(chunkPromises),
          getDoc(doc(db, 'store_data', 'settings')).catch(() => null),
          getDoc(doc(db, 'store_data', 'public_settings')).catch(() => null),
          getDoc(doc(db, 'store_data', 'faqs')).catch(() => null),
          getDoc(doc(db, 'store_data', 'developers')).catch(() => null),
          getDoc(doc(db, 'store_data', 'quick_links')).catch(() => null),
          getDoc(doc(db, 'store_data', 'news')).catch(() => null),
          getDoc(doc(db, 'store_data', 'videos')).catch(() => null),
          getDoc(doc(db, 'store_data', 'secure_links')).catch(() => null)
        ]);

        let firestoreApps: any[] = [];
        const seenKeys = new Set<string>();
        chunks.forEach((chunk) => {
          if (chunk && chunk.exists && chunk.exists()) {
            const cData = chunk.data();
            const items = cData?.items || cData?.apps || [];
            if (Array.isArray(items)) {
              items.forEach((item: any) => {
                const k = item.id || item.slug;
                if (k && !seenKeys.has(k)) {
                  seenKeys.add(k);
                  firestoreApps.push(item);
                }
              });
            }
          }
        });

        let fsSettings: any = {};
        if (settingsSnap && settingsSnap.exists && settingsSnap.exists()) {
          fsSettings = { ...fsSettings, ...settingsSnap.data() };
        }
        if (publicSettingsSnap && publicSettingsSnap.exists && publicSettingsSnap.exists()) {
          fsSettings = { ...fsSettings, ...publicSettingsSnap.data() };
        }
        if (faqsSnap && faqsSnap.exists && faqsSnap.exists()) {
          const fData = faqsSnap.data();
          if (Array.isArray(fData?.items)) fsSettings.website_faqs = fData.items;
        }
        if (devsSnap && devsSnap.exists && devsSnap.exists()) {
          const dData = devsSnap.data();
          if (Array.isArray(dData?.items)) fsSettings.developers = dData.items;
        }
        if (linksSnap && linksSnap.exists && linksSnap.exists()) {
          const lData = linksSnap.data();
          if (Array.isArray(lData?.items)) fsSettings.quick_links = lData.items;
        }

        let fsNews: any[] = [];
        if (newsSnap && newsSnap.exists && newsSnap.exists()) {
          const nData = newsSnap.data();
          if (Array.isArray(nData?.items)) fsNews = nData.items;
          else if (Array.isArray(nData?.news)) fsNews = nData.news;
        }

        let fsVideos: any[] = [];
        if (videosSnap && videosSnap.exists && videosSnap.exists()) {
          const vData = videosSnap.data();
          if (Array.isArray(vData?.items)) fsVideos = vData.items;
          else if (Array.isArray(vData?.videos)) fsVideos = vData.videos;
        }

        const secureMap = new Map();
        if (secureLinksSnap && secureLinksSnap.exists && secureLinksSnap.exists()) {
          const sData = secureLinksSnap.data();
          if (Array.isArray(sData?.items)) {
            sData.items.forEach((it: any) => {
              if (it?.id && it?.url) secureMap.set(it.id, it.url);
              if (it?.slug && it?.url) secureMap.set(it.slug, it.url);
            });
          }
        }

        if (firestoreApps.length > 0) {
          log(`GitHub Sync: Pulled ${firestoreApps.length} live app(s) directly from Firestore across all chunks.`);
          if (secureMap.size > 0) {
            firestoreApps = firestoreApps.map((a: any) => ({
              ...a,
              more_information_url: a.more_information_url || secureMap.get(a.id) || secureMap.get(a.slug) || ''
            }));
          }
        }

        if (!liveBackup) {
          liveBackup = {
            apps: firestoreApps,
            settings: fsSettings,
            news: fsNews,
            videos: fsVideos
          };
        } else {
          if (firestoreApps.length > (liveBackup.apps?.length || 0)) {
            liveBackup.apps = firestoreApps;
          }
          liveBackup.settings = { ...fsSettings, ...(liveBackup.settings || {}) };
          if (fsNews.length > (liveBackup.news?.length || 0)) liveBackup.news = fsNews;
          if (fsVideos.length > (liveBackup.videos?.length || 0)) liveBackup.videos = fsVideos;
        }
      } catch (directFsErr: any) {
        log(`GitHub Sync Notice: Direct Firestore query note: ${directFsErr?.message || directFsErr}`);
      }
    }

    const stateApps = (overrideApps && Array.isArray(overrideApps) && overrideApps.length > 0) ? overrideApps : apps;
    const stateSettings = overrideSettings || settings;
    const stateNews = (overrideNews && Array.isArray(overrideNews) && overrideNews.length > 0) ? overrideNews : news;
    const stateVideos = (overrideVideos && Array.isArray(overrideVideos) && overrideVideos.length > 0) ? overrideVideos : videos;

    // Direct Live Firestore is authoritative; merge with any explicit admin overrides
    let targetApps: any[] = [];
    if (Array.isArray(liveBackup?.apps) && liveBackup.apps.length > 0) {
      targetApps = liveBackup.apps;
      log(`GitHub Sync: Using ${targetApps.length} live application(s) directly from Firestore.`);
    } else if (Array.isArray(stateApps) && stateApps.length > 0) {
      targetApps = stateApps;
    }

    const targetSettings = {
      ...(stateSettings || {}),
      ...(liveBackup?.settings || {})
    };
    if (liveBackup?.settings?.website_faqs && (!targetSettings.website_faqs || targetSettings.website_faqs.length === 0)) {
      targetSettings.website_faqs = liveBackup.settings.website_faqs;
    }
    if (liveBackup?.settings?.developers && (!targetSettings.developers || targetSettings.developers.length === 0)) {
      targetSettings.developers = liveBackup.settings.developers;
    }
    if (liveBackup?.settings?.quick_links && (!targetSettings.quick_links || targetSettings.quick_links.length === 0)) {
      targetSettings.quick_links = liveBackup.settings.quick_links;
    }

    const targetNews = (Array.isArray(liveBackup?.news) && liveBackup.news.length > 0) 
      ? liveBackup.news 
      : ((Array.isArray(stateNews) && stateNews.length > 0) ? stateNews : []);
    const targetVideos = (Array.isArray(liveBackup?.videos) && liveBackup.videos.length > 0) 
      ? liveBackup.videos 
      : ((Array.isArray(stateVideos) && stateVideos.length > 0) ? stateVideos : []);

    let finalApps = targetApps;
    if (targetApps.length > 0) {
      log("GitHub Sync: Performing secure merge with local and cloud backups...");
      try {
        const idToken = await getAdminToken();
        if (idToken) {
          const bkRes = await adminFetch('/api/v1/admin/backup-links-get', {
            headers: { 'Authorization': `Bearer ${idToken}` }
          });
          if (bkRes.ok) {
            const bkText = await bkRes.text();
            let bkJSON;
            try {
              bkJSON = JSON.parse(bkText);
            } catch (e) {
              throw new Error(`Backup server returned invalid data (${bkRes.status})`);
            }
            
            if (bkJSON && bkJSON.items) {
              const secureMap = new Map();
              bkJSON.items.forEach((it: any) => {
                if (it.url) secureMap.set(it.id, it.url);
              });
              finalApps = targetApps.map((a: any) => {
                const backupUrl = secureMap.get(a.id) || '';
                return {
                  ...a,
                  more_information_url: a.more_information_url || backupUrl
                };
              });
              log("GitHub Sync: Secure link verification and merging completed.");
            }
          }
        }
      } catch (bkErr: any) {
        log(`GitHub Sync Warning: Secure link merge bypass: ${bkErr.message}`);
      }
    }

    // Pull live community reviews, comments, and atomic rating distributions
    let communityStatsPayload: any = null;
    let communityReviewsPayload: Record<string, any> = {};
    const appReviewsMap: Record<string, any[]> = {};
    const appCountsMap: Record<string, any> = {};

    try {
      log("GitHub Sync: Querying live community reviews, comments, and atomic ratings...");
      try {
        const statsRes = await adminFetch('/api/v1/admin/community/export-stats');
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          if (statsData?.stats) {
            communityStatsPayload = statsData.stats;
            if (statsData.stats.appCounts) {
              Object.assign(appCountsMap, statsData.stats.appCounts);
            }
          }
        }
      } catch (_) {}

      try {
        const revRes = await adminFetch('/api/v1/admin/community/export-static-reviews');
        if (revRes.ok) {
          const revData = await revRes.json();
          if (revData?.reviews && Object.keys(revData.reviews).length > 0) {
            Object.assign(appReviewsMap, revData.reviews);
          }
        }
      } catch (_) {}

      // If server route returned empty reviews, query Community Firestore REST directly
      if (Object.keys(appReviewsMap).length === 0) {
        try {
          const { fetchAllFirestoreRestReviews } = await import('../lib/adminCommunityFirebase');
          const directRevs = await fetchAllFirestoreRestReviews();
          if (Array.isArray(directRevs) && directRevs.length > 0) {
            const pubOnly = directRevs.filter(r => (r.status || 'published') === 'published');
            pubOnly.forEach(r => {
              const keys = [r.appId, r.appSlug].filter(Boolean) as string[];
              keys.forEach(k => {
                const lower = k.toLowerCase().trim();
                if (!appReviewsMap[lower]) appReviewsMap[lower] = [];
                // Deduplicate by ID
                if (!appReviewsMap[lower].some(existing => existing.id === r.id)) {
                  appReviewsMap[lower].push({
                    id: r.id,
                    appId: r.appId,
                    appSlug: r.appSlug || '',
                    appName: r.appName || '',
                    userName: r.userName || (r as any).username || 'Player',
                    rating: Number(r.rating) || 5,
                    reviewText: r.reviewText || (r as any).comment || '',
                    timestamp: r.timestamp || (r as any).created_at || new Date().toISOString(),
                    helpful_count: Number(r.helpful_count) || 0,
                    isPinned: Boolean(r.isPinned),
                    adminReply: r.adminReply || null
                  });
                }
              });
            });
            log(`GitHub Sync: Pulled ${pubOnly.length} published reviews directly from Community Firestore into atomic bundle.`);
          }
        } catch (fErr) {
          log(`GitHub Sync Notice: Direct community Firestore query note: ${(fErr as any)?.message || fErr}`);
        }
      }

      // Zero-Quota Fallback: Use verified atomic catalog stats & static reviews to prevent burning Firestore quota
      if (!communityStatsPayload || Object.keys(appReviewsMap).length === 0) {
        log("GitHub Sync: Using verified atomic catalog stats & static reviews (Zero-Quota Read)...");
        try {
          if (communityCatalogStats && (communityCatalogStats as any).appCounts) {
            communityStatsPayload = communityCatalogStats;
            Object.assign(appCountsMap, (communityCatalogStats as any).appCounts);
          }
          if (communityStaticReviews && typeof communityStaticReviews === 'object') {
            Object.assign(appReviewsMap, communityStaticReviews as any);
          }
        } catch (_) {}
      }

      // Sort and slice top 5 per app for central communityReviewsPayload (SSR prerender bundle)
      // Index by both exact key and lowercase key so every app gets its reviews seamlessly
      for (const [k, revs] of Object.entries(appReviewsMap)) {
        if (!Array.isArray(revs)) continue;
        revs.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });
        const topSlice = revs.slice(0, 5);
        communityReviewsPayload[k] = topSlice;
        communityReviewsPayload[k.toLowerCase().trim()] = topSlice;
      }

      // Harmonize live community review stats into apps so static data, cards, and SEO have 100% consistent ratings
      const appCounts = communityStatsPayload?.appCounts || {};
      finalApps = finalApps.map((a: any) => {
        const keyId = String(a.id || '').toLowerCase().trim();
        const keySlug = String(a.slug || '').toLowerCase().trim();
        const countInfo = appCounts[keyId] || appCounts[keySlug];
        if (countInfo && (countInfo.published > 0 || countInfo.total > 0)) {
          const realPublished = Number(countInfo.published ?? countInfo.total ?? 0);
          const realRating = Number(countInfo.avgRating || 4.5);
          return {
            ...a,
            rating: realRating,
            review_count: realPublished,
            reviews: realPublished
          };
        }
        return a;
      });
      log(`GitHub Sync: Harmonized live review ratings across all ${finalApps.length} catalog apps.`);
    } catch (e: any) {
      log(`GitHub Sync Notice: Rating harmonization note: ${e?.message || 'bypassed'}`);
    }

    // Filter apps and news based on sync_to_public status (default is true for live public)
    const publicApps = finalApps.filter((app: any) => app.sync_to_public !== false);
    const publicNews = targetNews.filter((item: any) => item.sync_to_public !== false);
    const unpushedAppsCount = finalApps.length - publicApps.length;
    const unpushedNewsCount = targetNews.length - publicNews.length;

    if (unpushedAppsCount > 0 || unpushedNewsCount > 0) {
      log(`GitHub Sync: Kept ${unpushedAppsCount} draft app(s) and ${unpushedNewsCount} draft news item(s) in Admin Only (Public Sync = OFF). Pushing ${publicApps.length} live app(s) and ${publicNews.length} live news item(s) to public website.`);
    }

    const finalSettings = ensureDefaultSettings(targetSettings);
    const updatedCode = generateStaticDataFileCode(publicApps, finalSettings, publicNews, targetVideos);

    const safeBackupApps = JSON.parse(JSON.stringify(publicApps)).map((app: any) => {
      const rawTarget = app.more_information_url || app.download_url || app.encrypted_link || app.encrypted_download_url || '';
      
      // Clean out dummy com.rummydex / com.example URLs from url field
      if (app.url && (app.url.includes('com.rummydex') || app.url.includes('com.example'))) {
        app.url = '';
      }

      const encryptedTarget = encryptUrlIfNeeded(rawTarget);
      
      if (encryptedTarget) {
        app.more_information_url = encryptedTarget;
        app.encrypted_link = encryptedTarget;
      } else {
        delete app.more_information_url;
        delete app.encrypted_link;
      }
      
      delete app.encrypted_download_url;
      delete app.download_url;
      return app;
    });

    // Fallback: If reviews payload is empty, load from existing communityStaticReviews and slice top 5 per app
    if (!communityReviewsPayload || Object.keys(communityReviewsPayload).length === 0) {
      try {
        const existingReviews = await import('../lib/communityStaticReviews.json');
        const rawMap = (existingReviews.default || existingReviews) as Record<string, any[]>;
        const slicedMap: Record<string, any[]> = {};
        for (const [key, list] of Object.entries(rawMap)) {
          if (Array.isArray(list)) {
            slicedMap[key] = list.slice(0, 5);
          }
        }
        communityReviewsPayload = slicedMap;
      } catch (_) {}
    }

    const consolidatedStaticPayload = {
      apps: safeBackupApps,
      mockApps: safeBackupApps,
      settings: finalSettings,
      mockSettings: finalSettings,
      news: publicNews,
      mockNews: publicNews,
      videos: targetVideos,
      mockVideos: targetVideos,
      reviews: []
    };

    // Compact minified JSON encoding to reduce sync payload by 65%+
    const backupJsonCode = JSON.stringify(consolidatedStaticPayload);
    const staticJsonCode = JSON.stringify(consolidatedStaticPayload);
    const catalogStatsCode = JSON.stringify(communityStatsPayload || { appCounts: {}, totalReviews: 0 });
    const staticReviewsCode = JSON.stringify(communityReviewsPayload);

    try {
      const idToken = await getAdminToken();
      if (idToken) {
        log("GitHub Sync: Synchronizing local static files and sitemaps...");
        await adminFetch('/api/v1/admin/sync-local', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` },
          body: JSON.stringify({
            apps: safeBackupApps,
            settings: finalSettings,
            news: publicNews,
            videos: targetVideos,
            catalogStats: communityStatsPayload || null,
            staticReviews: communityReviewsPayload || null
          })
        });
      }
    } catch (localSyncErr: any) {
      log(`GitHub Sync Notice: Local files backup note: ${localSyncErr?.message || 'skipped'}`);
    }

    let targetRepo = configToUse.repo || 'Dex';
    if (targetRepo.toLowerCase() === 'masterworld') {
      targetRepo = 'Dex';
      log('GitHub Sync Info: Admin site (masterworld) is 100% live on Firebase and excluded from static sync. Routing release to public repo "Dex".');
    }

    if (!configToUse.owner) throw new Error("Missing GitHub repository owner configuration.");

    try {
      log(`GitHub Sync: Preparing complete compressed release bundle for "${targetRepo}"...`);

      // 1. Pre-build AES Encrypted Vault & Public API bundle so all files can be committed together
      let vaultCode = "";
      let apiBundleContent = "";

      try {
        log(`GitHub Sync: Building AES Encrypted Vault...`);
        let vaultCiphertext = "";

        try {
          const idToken = await getAdminToken();
          const vaultRes = await adminFetch('/api/v1/admin/seal-vault', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json', ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {}) },
             body: JSON.stringify({ items: publicApps })
          });

          if (vaultRes.ok) {
            const vaultData = await vaultRes.json();
            if (vaultData.ciphertext) {
              vaultCiphertext = vaultData.ciphertext;
            }
          }
        } catch (_) {}

        // Fallback: If server returned 405 (static host / edge), seal vault directly on client
        if (!vaultCiphertext) {
          const AES_SECRET = getAesSecret();
          const vaultArray: any[] = [];
          publicApps.forEach((item: any) => {
            const id = String(item.id || '').trim();
            const slug = String(item.slug || '').trim();
            const rawUrl = item.more_information_url || item.encrypted_link || item.url || '';
            if (!rawUrl || typeof rawUrl !== 'string') return;
            const trimmed = rawUrl.trim();
            if (trimmed.toLowerCase().includes('mediafire.com') || trimmed.includes('com.rummydex') || trimmed.includes('com.example')) return;
            const plainUrl = trimmed.startsWith('U2FsdGVkX1') ? (safeDecrypt(trimmed, AES_SECRET) || trimmed) : trimmed;
            const encUrl = trimmed.startsWith('U2FsdGVkX1') ? trimmed : safeEncrypt(plainUrl, AES_SECRET);
            vaultArray.push({
              id,
              slug,
              name: item.name || '',
              more_information_url: encUrl,
              encrypted_link: encUrl
            });
          });
          vaultCiphertext = safeEncrypt(JSON.stringify(vaultArray), AES_SECRET);
        }

        if (vaultCiphertext) {
          vaultCode = `export const ENCRYPTED_LINKS = "${vaultCiphertext}";\n`;
          log(`GitHub Sync: ✅ AES Encrypted Vault sealed.`);

          try {
            log(`GitHub Sync: Building fresh public API bundle for Vercel...`);
            const idToken = await getAdminToken();
            const apiRes = await adminFetch('/api/v1/admin/build-public-api', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {}) },
              body: JSON.stringify({ ciphertext: vaultCiphertext })
            });
            if (apiRes.ok) {
              const apiData = await apiRes.json();
              if (apiData.content) {
                apiBundleContent = apiData.content;
                log(`GitHub Sync: ✅ Fresh public API bundle prepared.`);
              }
            }
          } catch (_) {}
        }
      } catch (vaultErr: any) {
        log(`GitHub Sync Warning (Vault build): ${vaultErr?.message || 'skipped'}`);
      }

      // 2. Assemble ALL primary files together for 1 single atomic commit
      const primaryBatchFiles: { path: string; content: string }[] = [
        {
          path: 'src/lib/staticData.ts',
          content: updatedCode
        },
        {
          path: 'src/lib/communityCatalogStats.json',
          content: catalogStatsCode
        },
        {
          path: 'src/lib/communityStaticReviews.json',
          content: staticReviewsCode
        },
        {
          path: 'src/lib/public_backup.json',
          content: backupJsonCode
        },
        {
          path: 'src/lib/staticData.json',
          content: staticJsonCode
        },
        {
          path: 'public-api/staticData.json',
          content: staticJsonCode
        }
      ];

      // Pull latest public core source code (App.tsx, lazyWithRetry, GlobalErrorBoundary, PublicFooter) for Dex
      try {
        const idToken = await getAdminToken();
        const coreRes = await adminFetch('/api/github-sync/public-core-files', {
          headers: idToken ? { 'Authorization': `Bearer ${idToken}` } : {}
        });
        if (coreRes.ok) {
          const coreData = await coreRes.json();
          if (coreData?.files) {
            for (const [fPath, fContent] of Object.entries(coreData.files)) {
              if (fContent && typeof fContent === 'string') {
                primaryBatchFiles.push({ path: fPath, content: fContent });
              }
            }
            log(`GitHub Sync: Added ${Object.keys(coreData.files).length} public core source files to sync bundle.`);
          }
        }
      } catch (coreErr: any) {
        log(`GitHub Sync Note: Core files fetch note: ${coreErr?.message || 'skipped'}`);
      }

      if (vaultCode) {
        primaryBatchFiles.push({
          path: 'src/lib/secureVault.ts',
          content: vaultCode
        });
      }

      if (apiBundleContent) {
        primaryBatchFiles.push({
          path: 'api/index.js',
          content: apiBundleContent
        });
      }

      // Generate XML sitemaps for instant static hosting and search engine discoverability
      try {
        const sitemaps = generateAllSitemaps({
          apps: publicApps,
          settings: finalSettings,
          news: publicNews,
          videos: targetVideos
        });
        for (const [filename, xmlContent] of Object.entries(sitemaps)) {
          primaryBatchFiles.push({
            path: `public/${filename}`,
            content: xmlContent
          });
        }

        const robotsContent = `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /admin/\nDisallow: /login/\nDisallow: /masterworld/\nSitemap: https://www.rummydex.com/sitemap.xml\n`;
        primaryBatchFiles.push({
          path: 'public/robots.txt',
          content: robotsContent
        });
      } catch (sitemapErr) {
        log(`GitHub Sync Warning: Could not auto-generate public XML sitemaps: ${(sitemapErr as any)?.message}`);
      }

      // 3. Push ALL primary files together in 1 SINGLE ATOMIC COMMIT to Public Website Repo
      await commitMultiFilesToGitHub({
        owner: configToUse.owner,
        repo: targetRepo,
        token: configToUse.token,
        branch: configToUse.branch || 'main',
        files: primaryBatchFiles,
        message: `Public Release: Complete Catalog, Community Data & Secure Vault Synchronization`,
        onProgress: (m) => log(m)
      });
      log(`GitHub Sync: ✅ Success! All ${primaryBatchFiles.length} files committed together to public repo "${targetRepo}" in 1 commit (Exactly 1 deployment). Admin remains fully isolated on Firebase.`);
    } catch (err: any) {
      throw new Error(`Failed to sync data to public repository (${targetRepo}): ${err.message}`);
    }

    try {
      await updateLocalContainerBackup(finalApps, targetSettings, targetNews, targetVideos);
    } catch (err: any) {}

    return { success: true, targetRepo, timestamp: new Date().toISOString() };
  }, [gitConfig, apps, settings, news, videos, updateLocalContainerBackup]);

  return {
    gitConfig,
    gitConfigLoading,
    saveGitConfig,
    pushAllToGitHub,
    getAdminToken
  };
}
