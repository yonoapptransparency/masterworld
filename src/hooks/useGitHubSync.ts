import React, { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, isFirebaseReal, handleFirestoreError, OperationType } from '../lib/firebase';
import { adminFetch, getValidAdminToken, loadSession } from '../services/adminAuthService';
import { GitConfig, generateStaticDataFileCode, commitFileToGitHub, commitAtomicToGitHub, generateCommunityReviewsFileCode, encryptUrlIfNeeded } from '../lib/githubSync';
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

    const consolidatedStaticPayload = {
      apps: safeBackupApps,
      mockApps: safeBackupApps,
      settings: finalSettings,
      mockSettings: finalSettings,
      news: publicNews,
      mockNews: publicNews,
      videos: targetVideos,
      mockVideos: targetVideos,
      reviews: [] // Reviews handled via communityReviewsData.ts
    };

    
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
            videos: targetVideos
          })
        });
      }
    } catch (localSyncErr: any) {
      log(`GitHub Sync Notice: Local files backup note: ${localSyncErr?.message || 'skipped'}`);
    }

    let targetRepo = configToUse.repo || 'dex';

    if (!configToUse.owner) throw new Error("Missing GitHub repository owner configuration.");

    try {
      log(`GitHub Sync: Preparing release files for primary repository "${targetRepo}"...`);
      
      const primaryFiles: { path: string; content: string; message: string; name: string }[] = [
        {
          path: 'src/lib/staticData.ts',
          content: updatedCode,
          message: `Admin Release: Manual content synchronization to ${targetRepo}`,
          name: 'staticData.ts'
        },
        {
          path: 'src/lib/public_backup.json',
          content: backupJsonCode,
          message: `Admin Release: Manual public_backup.json synchronization to ${targetRepo}`,
          name: 'public_backup.json'
        },
        {
          path: 'src/lib/staticData.json',
          content: staticJsonCode,
          message: `Admin Release: Manual staticData.json synchronization to ${targetRepo}`,
          name: 'staticData.json'
        },
        {
          path: 'public-api/staticData.json',
          content: staticJsonCode,
          message: `Admin Release: Manual public-api/staticData.json synchronization to ${targetRepo}`,
          name: 'public-api/staticData.json'
        }
      ];

      // Generate XML sitemaps for instant static hosting and search engine discoverability
      try {
        const sitemaps = generateAllSitemaps({
          apps: publicApps,
          settings: finalSettings,
          news: publicNews,
          videos: targetVideos
        });
        for (const [filename, xmlContent] of Object.entries(sitemaps)) {
          primaryFiles.push({
            path: `public/${filename}`,
            content: xmlContent,
            message: `Admin Release: Auto-generate ${filename} for ${publicApps.length} apps`,
            name: `public/${filename}`
          });
        }

        const robotsContent = `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /admin/\nDisallow: /login/\nDisallow: /masterworld/\nDisallow: /s/\nDisallow: /s/*\nDisallow: /dl/\nDisallow: /dl/*\nDisallow: /out/\nDisallow: /out/*\nDisallow: /download/\nDisallow: /download/*\nDisallow: /gateway/\nDisallow: /gateway/*\nDisallow: /info/\nDisallow: /info/*\nDisallow: /moreinfo/\nDisallow: /moreinfo/*\nDisallow: /moredetail/\nDisallow: /moredetail/*\nSitemap: https://www.rummydex.com/sitemap.xml\n`;
        primaryFiles.push({
          path: 'public/robots.txt',
          content: robotsContent,
          message: 'Admin Release: Sync robots.txt with sitemap reference',
          name: 'public/robots.txt'
        });
      } catch (sitemapErr) {
        log(`GitHub Sync Warning: Could not auto-generate public XML sitemaps: ${(sitemapErr as any)?.message}`);
      }

      // Execute sequential commits to prevent GitHub branch HEAD ref race-condition conflicts
      
      // Fetch Community Reviews
      try {
        const idToken = await getAdminToken();
        const reviewsRes = await adminFetch('/api/v1/admin/community/reviews?limit=10000', {
          headers: idToken ? { 'Authorization': `Bearer ${idToken}` } : {}
        });
        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json();
          const reviewsCode = generateCommunityReviewsFileCode(reviewsData.reviews || []);
          primaryFiles.push({
            path: 'src/lib/communityReviewsData.ts',
            content: reviewsCode,
            message: `Admin Release: Sync verified community reviews`,
            name: 'communityReviewsData.ts'
          });
        }
      } catch (revErr) {
        log(`GitHub Sync Warning: Could not fetch reviews: ${(revErr as any)?.message}`);
      }

      // Add Secure Vault with ONLY publicApps!
      try {
        log(`GitHub Sync: Building AES Encrypted Vault for ${targetRepo}...`);
        const idToken = await getAdminToken();
        const vaultRes = await adminFetch('/api/v1/admin/seal-vault', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json', ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {}) },
           body: JSON.stringify({ items: publicApps }) // FIX: publicApps instead of finalApps
        });
        if (vaultRes.ok) {
           const vaultData = await vaultRes.json();
           if (vaultData.ciphertext) {
              primaryFiles.push({
                path: 'src/lib/secureVault.ts',
                content: `export const ENCRYPTED_LINKS = "${vaultData.ciphertext}";\n`,
                message: `Admin Release: Secure vault synchronization`,
                name: 'secureVault.ts'
              });
              
              // We will NOT push api/index.js as a giant bundle anymore, skipping build-public-api!
           }
        }
      } catch (vaultErr) {
         log(`GitHub Sync Error (Vault): ${(vaultErr as any)?.message}`);
      }

      // Execute ATOMIC commit
      try {
        log(`GitHub Sync: Initiating ATOMIC commit for ${primaryFiles.length} files to ${targetRepo}...`);
        await commitAtomicToGitHub({
          owner: configToUse.owner,
          repo: targetRepo,
          token: configToUse.token,
          branch: configToUse.branch || 'main',
          files: primaryFiles.map((f: any) => ({ path: f.path, content: f.content })),
          message: `Admin Release: Atomic static update (${primaryFiles.length} files)`
        });
        log(`GitHub Sync: ✅ Atomic commit successfully pushed to ${targetRepo}.`);
      } catch (atomicErr: any) {
        throw new Error(`Atomic commit failed: ${atomicErr.message}`);
      }

      if (targetRepo.toLowerCase() !== 'masterworld') {
        try {
          log("GitHub Sync: Performing secondary mirror synchronization to masterworld...");
          const secondaryFiles = [
            { path: 'src/lib/staticData.ts', content: updatedCode, name: 'staticData.ts' },
            { path: 'src/lib/staticData.json', content: staticJsonCode, name: 'staticData.json' }
          ];

          for (const sFile of secondaryFiles) {
            try {
              await commitFileToGitHub({
                owner: configToUse.owner,
                repo: 'masterworld',
                token: configToUse.token,
                branch: configToUse.branch || 'main',
                path: sFile.path,
                content: sFile.content,
                message: `Admin Release: Manual ${sFile.name} synchronization to masterworld`
              });
              log(`GitHub Sync: ✅ ${sFile.name} secondary sync to masterworld complete.`);
            } catch (secErr: any) {
              log(`GitHub Sync Info: Secondary sync of ${sFile.name} to masterworld skipped.`);
            }
          }
        } catch (mwErr: any) {
          log(`GitHub Sync Info: Secondary sync to masterworld skipped (Token scoped specifically for '${targetRepo}'). Primary target '${targetRepo}' is fully synced and updated.`);
        }
      }
    } catch (err: any) {
      throw new Error(`Failed to sync static data to primary target (${targetRepo}): ${err.message}`);
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
