import React, { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, isFirebaseReal, handleFirestoreError, OperationType } from '../lib/firebase';
import { adminFetch, getValidAdminToken, loadSession } from '../services/adminAuthService';
import { GitConfig, generateStaticDataFileCode, generateCommunityReviewsFileCode, commitFileToGitHub, commitMultiFilesToGitHub, encryptUrlIfNeeded } from '../lib/githubSync';
import { generateAllSitemaps } from '../lib/sitemapGenerator';
import { ensureDefaultSettings } from '../lib/defaultLegalContent';
import { AppConfig, GlobalSettings, NewsItem, VideoItem } from '../types';

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

      // Save to server endpoint (Admin SDK)
      const res = await adminFetch('/api/github-sync/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || `Server returned error ${res.status}`);
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
        log("GitHub Sync: Live complete catalog retrieved successfully.");
      } else {
        const fallbackRes = await fetch('/api/v1/public/backup-data');
        if (fallbackRes.ok) {
          liveBackup = await fallbackRes.json();
        }
      }
    } catch (e) {
      log("GitHub Sync Notice: Could not fetch live backup endpoint, using current memory.");
    }

    const stateApps = (overrideApps && Array.isArray(overrideApps) && overrideApps.length > 0) ? overrideApps : apps;
    const stateSettings = overrideSettings || settings;
    const stateNews = (overrideNews && Array.isArray(overrideNews) && overrideNews.length > 0) ? overrideNews : news;
    const stateVideos = (overrideVideos && Array.isArray(overrideVideos) && overrideVideos.length > 0) ? overrideVideos : videos;

    // Admin state is the primary single source of truth
    let targetApps: any[] = [];
    if (Array.isArray(stateApps) && stateApps.length > 0) {
      const backupMap = new Map();
      if (Array.isArray(liveBackup?.apps)) {
        liveBackup.apps.forEach((ba: any) => {
          const key = ba.id || ba.slug;
          if (key) backupMap.set(key, ba);
        });
      }
      targetApps = stateApps.map((adminApp: any) => {
        const key = adminApp.id || adminApp.slug;
        const backupApp = backupMap.get(key);
        if (backupApp) {
          // Backup provides fallback for any missing metadata, but adminApp always has 100% precedence
          return { ...backupApp, ...adminApp };
        }
        return adminApp;
      });
    } else if (Array.isArray(liveBackup?.apps) && liveBackup.apps.length > 0) {
      targetApps = liveBackup.apps;
    }
    const targetSettings = {
      ...(liveBackup?.settings || {}),
      ...(stateSettings || {})
    };
    const targetNews = (Array.isArray(stateNews) && stateNews.length > 0) ? stateNews : (liveBackup?.news || []);
    const targetVideos = (Array.isArray(stateVideos) && stateVideos.length > 0) ? stateVideos : (liveBackup?.videos || []);
    let targetReviews: any[] = [];

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

    // Merge live community review stats into apps so static data, cards, and SEO have 100% consistent ratings
    let communityStatsPayload: any = null;
    try {
      log("GitHub Sync: Harmonizing live aggregated review ratings across all apps...");
      const statsRes = await adminFetch('/api/v1/admin/community/app-counts');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        communityStatsPayload = statsData;
        const appCounts = statsData?.appCounts || {};
        finalApps = finalApps.map((a: any) => {
          const keyId = String(a.id || '').toLowerCase().trim();
          const keySlug = String(a.slug || '').toLowerCase().trim();
          const countInfo = appCounts[keyId] || appCounts[keySlug];
          if (countInfo && countInfo.published > 0) {
            const realPublished = Number(countInfo.published);
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
        log("GitHub Sync: Harmonized live review ratings and counts across catalog.");
      }
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

    // Fetch live atomic catalog stats for SEO Schema
    communityStatsPayload = null;
    try {
      log("GitHub Sync: Fetching live atomic ratings for Googlebot Schema...");
      const statsRes = await adminFetch('/api/v1/admin/community/export-stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.success && statsData.stats) {
          communityStatsPayload = statsData.stats;
          const appCount = Object.keys(communityStatsPayload.appCounts || {}).length;
          log(`GitHub Sync: Loaded live atomic ratings summary for ${appCount} app(s).`);
        }
      }
    } catch (e: any) {
      log(`GitHub Sync Notice: Stats export notice: ${e?.message || 'proceeding with base'}`);
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

    const backupJsonCode = JSON.stringify(consolidatedStaticPayload, null, 2);
    const staticJsonCode = JSON.stringify(consolidatedStaticPayload, null, 2);

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
            catalogStats: communityStatsPayload || null
          })
        });
      }
    } catch (localSyncErr: any) {
      log(`GitHub Sync Notice: Local files backup note: ${localSyncErr?.message || 'skipped'}`);
    }

    let targetRepo = configToUse.repo || 'dex';

    if (!configToUse.owner) throw new Error("Missing GitHub repository owner configuration.");

    try {
      log(`GitHub Sync: Preparing complete release bundle for "${targetRepo}"...`);
      
      const catalogStatsCode = communityStatsPayload ? JSON.stringify(communityStatsPayload, null, 2) : '';

      // 1. Pre-build AES Encrypted Vault & Public API bundle so all files can be committed together
      let vaultCode = "";
      let apiBundleContent = "";

      try {
        log(`GitHub Sync: Building AES Encrypted Vault...`);
        const idToken = await getAdminToken();
        const vaultRes = await adminFetch('/api/v1/admin/seal-vault', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json', ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {}) },
           body: JSON.stringify({ items: publicApps })
        });

        if (vaultRes.ok) {
          const vaultData = await vaultRes.json();
          if (vaultData.ciphertext) {
            vaultCode = `export const ENCRYPTED_LINKS = "${vaultData.ciphertext}";\n`;
            log(`GitHub Sync: ✅ AES Encrypted Vault sealed.`);

            log(`GitHub Sync: Building fresh public API bundle for Vercel...`);
            const apiRes = await adminFetch('/api/v1/admin/build-public-api', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {}) },
              body: JSON.stringify({ ciphertext: vaultData.ciphertext })
            });
            if (apiRes.ok) {
              const apiData = await apiRes.json();
              if (apiData.content) {
                apiBundleContent = apiData.content;
                log(`GitHub Sync: ✅ Fresh public API bundle prepared.`);
              }
            }
          }
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

      // 3. Push ALL primary files together in 1 SINGLE ATOMIC COMMIT
      await commitMultiFilesToGitHub({
        owner: configToUse.owner,
        repo: targetRepo,
        token: configToUse.token,
        branch: configToUse.branch || 'main',
        files: primaryBatchFiles,
        message: `Admin Release: Complete Catalog, Community Data & Secure Vault Synchronization`,
        onProgress: (m) => log(m)
      });
      log(`GitHub Sync: ✅ Success! All ${primaryBatchFiles.length} files committed together to "${targetRepo}" in 1 commit (Triggers exactly 1 Vercel deployment)!`);

      // 4. Secondary mirror synchronization to masterworld (also 1 single atomic commit)
      if (targetRepo.toLowerCase() !== 'masterworld') {
        try {
          const secondaryBatchFiles: { path: string; content: string }[] = [
            { path: 'src/lib/staticData.ts', content: updatedCode },
            { path: 'src/lib/communityCatalogStats.json', content: catalogStatsCode },
            { path: 'src/lib/public_backup.json', content: backupJsonCode },
            { path: 'src/lib/staticData.json', content: staticJsonCode }
          ];

          if (vaultCode) {
            secondaryBatchFiles.push({
              path: 'src/lib/secureVault.ts',
              content: vaultCode
            });
          }

          await commitMultiFilesToGitHub({
            owner: configToUse.owner,
            repo: 'masterworld',
            token: configToUse.token,
            branch: configToUse.branch || 'main',
            files: secondaryBatchFiles,
            message: `Admin Release: Complete Catalog & Vault Synchronization for masterworld`,
            onProgress: (m) => log(m)
          });
          log(`GitHub Sync: ✅ Masterworld mirror sync complete (1 atomic commit).`);
        } catch (secErr: any) {
          log(`GitHub Sync Info: Secondary mirror to masterworld note: ${secErr?.message || 'skipped'}`);
        }
      }
    } catch (err: any) {
      throw new Error(`Failed to sync data to target (${targetRepo}): ${err.message}`);
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
