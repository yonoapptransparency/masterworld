import React, { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, isFirebaseReal, handleFirestoreError, OperationType } from '../lib/firebase';
import { adminFetch, getValidAdminToken, loadSession } from '../services/adminAuthService';
import { GitConfig, generateStaticDataFileCode, commitFileToGitHub, encryptUrlIfNeeded } from '../lib/githubSync';
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

    const stateApps = overrideApps || apps;
    const stateSettings = overrideSettings || settings;
    const stateNews = overrideNews || news;
    const stateVideos = overrideVideos || videos;

    // Comprehensive union of stateApps and liveBackup.apps to ensure all newly added apps are included
    const appMap = new Map();
    if (Array.isArray(stateApps)) {
      stateApps.forEach((a: any) => { if (a && (a.id || a.slug)) appMap.set(a.id || a.slug, a); });
    }
    if (Array.isArray(liveBackup?.apps)) {
      liveBackup.apps.forEach((a: any) => {
        const key = a.id || a.slug;
        if (key && !appMap.has(key)) {
          appMap.set(key, a);
        } else if (key && appMap.has(key)) {
          appMap.set(key, { ...appMap.get(key), ...a });
        }
      });
    }
    const targetApps = appMap.size > 0 ? Array.from(appMap.values()) : (stateApps || liveBackup?.apps || []);
    const targetSettings = (stateSettings && Object.keys(stateSettings).length > 0) ? stateSettings : (liveBackup?.settings || {});
    const targetNews = stateNews || liveBackup?.news || [];
    const targetVideos = stateVideos || liveBackup?.videos || [];
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

    const backupJsonCode = JSON.stringify({
      apps: safeBackupApps,
      settings: finalSettings,
      news: publicNews,
      videos: targetVideos
    }, null, 2);

    const staticJsonCode = JSON.stringify({
      mockApps: safeBackupApps,
      mockSettings: finalSettings,
      mockNews: publicNews,
      mockVideos: targetVideos
    }, null, 2);

    let targetRepo = configToUse.repo || 'dex';

    if (!configToUse.owner) throw new Error("Missing GitHub repository owner configuration.");

    try {
      log(`GitHub Sync: Pushing all files to primary repo ${targetRepo}...`);
      
      const primaryCommits = [];
      primaryCommits.push(commitFileToGitHub({
        owner: configToUse.owner,
        repo: targetRepo,
        token: configToUse.token,
        branch: configToUse.branch || 'main',
        path: 'src/lib/staticData.ts',
        content: updatedCode,
        message: `Admin Release: Manual content synchronization to ${targetRepo}`
      }).then(() => log(`GitHub Sync: ✅ staticData.ts successfully synced to ${targetRepo}.`)));

      primaryCommits.push(commitFileToGitHub({
        owner: configToUse.owner,
        repo: targetRepo,
        token: configToUse.token,
        branch: configToUse.branch || 'main',
        path: 'src/lib/public_backup.json',
        content: backupJsonCode,
        message: `Admin Release: Manual public_backup.json synchronization to ${targetRepo}`
      }).then(() => log(`GitHub Sync: ✅ public_backup.json successfully synced to ${targetRepo}.`)));

      primaryCommits.push(commitFileToGitHub({
        owner: configToUse.owner,
        repo: targetRepo,
        token: configToUse.token,
        branch: configToUse.branch || 'main',
        path: 'src/lib/staticData.json',
        content: staticJsonCode,
        message: `Admin Release: Manual staticData.json synchronization to ${targetRepo}`
      }).then(() => log(`GitHub Sync: ✅ staticData.json successfully synced to ${targetRepo}.`)));

      primaryCommits.push(commitFileToGitHub({
        owner: configToUse.owner,
        repo: targetRepo,
        token: configToUse.token,
        branch: configToUse.branch || 'main',
        path: 'public-api/staticData.json',
        content: staticJsonCode,
        message: `Admin Release: Manual public-api/staticData.json synchronization to ${targetRepo}`
      }).then(() => log(`GitHub Sync: ✅ public-api/staticData.json successfully synced to ${targetRepo}.`)).catch(() => {}));

      // Generate XML sitemaps for instant static hosting and search engine discoverability
      try {
        const sitemaps = generateAllSitemaps({
          apps: publicApps,
          settings: finalSettings,
          news: publicNews,
          videos: targetVideos
        });
        for (const [filename, xmlContent] of Object.entries(sitemaps)) {
          primaryCommits.push(commitFileToGitHub({
            owner: configToUse.owner,
            repo: targetRepo,
            token: configToUse.token,
            branch: configToUse.branch || 'main',
            path: `public/${filename}`,
            content: xmlContent,
            message: `Admin Release: Auto-generate ${filename} for ${publicApps.length} apps`
          }).then(() => log(`GitHub Sync: ✅ public/${filename} updated with ${publicApps.length} live apps.`)).catch((err: any) => {
            log(`GitHub Sync Notice: public/${filename} note: ${err?.message || 'skipped'}`);
          }));
        }

        const robotsContent = `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /admin/\nDisallow: /login/\nDisallow: /masterworld/\nSitemap: https://www.rummydex.com/sitemap.xml\n`;
        primaryCommits.push(commitFileToGitHub({
          owner: configToUse.owner,
          repo: targetRepo,
          token: configToUse.token,
          branch: configToUse.branch || 'main',
          path: 'public/robots.txt',
          content: robotsContent,
          message: 'Admin Release: Sync robots.txt with sitemap reference'
        }).then(() => log('GitHub Sync: ✅ public/robots.txt synced.')).catch(() => {}));
      } catch (sitemapErr) {
        log(`GitHub Sync Warning: Could not auto-generate public XML sitemaps: ${(sitemapErr as any)?.message}`);
      }

      await Promise.all(primaryCommits);

      if (targetRepo.toLowerCase() !== 'masterworld') {
        try {
          const secondaryCommits = [];
          
          secondaryCommits.push(commitFileToGitHub({
            owner: configToUse.owner,
            repo: 'masterworld',
            token: configToUse.token,
            branch: configToUse.branch || 'main',
            path: 'src/lib/staticData.ts',
            content: updatedCode,
            message: `Admin Release: Manual content synchronization to masterworld`
          }).then(() => log(`GitHub Sync: ✅ staticData.ts secondary sync to masterworld complete.`)));

          secondaryCommits.push(commitFileToGitHub({
            owner: configToUse.owner,
            repo: 'masterworld',
            token: configToUse.token,
            branch: configToUse.branch || 'main',
            path: 'src/lib/public_backup.json',
            content: backupJsonCode,
            message: `Admin Release: Manual public_backup.json synchronization to masterworld`
          }).then(() => log(`GitHub Sync: ✅ public_backup.json secondary sync to masterworld complete.`)));

          secondaryCommits.push(commitFileToGitHub({
            owner: configToUse.owner,
            repo: 'masterworld',
            token: configToUse.token,
            branch: configToUse.branch || 'main',
            path: 'src/lib/staticData.json',
            content: staticJsonCode,
            message: `Admin Release: Manual staticData.json synchronization to masterworld`
          }).then(() => log(`GitHub Sync: ✅ staticData.json secondary sync to masterworld complete.`)));

          await Promise.all(secondaryCommits);
        } catch (mwErr: any) {
          log(`GitHub Sync Info: Secondary sync to masterworld skipped (Token scoped specifically for '${targetRepo}'). Primary target '${targetRepo}' is fully synced and updated.`);
        }
      }
    } catch (err: any) {
      throw new Error(`Failed to sync static data to primary target (${targetRepo}): ${err.message}`);
    }

    try {
      log(`GitHub Sync: Building AES Encrypted Vault for ${targetRepo}...`);
      const idToken = await getAdminToken();
      const vaultRes = await adminFetch('/api/v1/admin/seal-vault', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json', ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {}) },
         body: JSON.stringify({ items: finalApps })
      });

      if (vaultRes.ok) {
         const vaultData = await vaultRes.json();
         if (vaultData.ciphertext) {
            log(`GitHub Sync: Pushing secureVault.ts to ${targetRepo}...`);
            await commitFileToGitHub({
              owner: configToUse.owner,
              repo: targetRepo,
              token: configToUse.token,
              branch: configToUse.branch || 'main',
              path: 'src/lib/secureVault.ts',
              content: `export const ENCRYPTED_LINKS = "${vaultData.ciphertext}";\n`,
              message: `Admin Release: Secure vault synchronization for ${targetRepo}`
            });
            log(`GitHub Sync: ✅ secureVault.ts successfully synced to ${targetRepo}.`);
            
            if (targetRepo.toLowerCase() !== 'masterworld') {
              try {
                await commitFileToGitHub({
                  owner: configToUse.owner,
                  repo: 'masterworld',
                  token: configToUse.token,
                  branch: configToUse.branch || 'main',
                  path: 'src/lib/secureVault.ts',
                  content: `export const ENCRYPTED_LINKS = "${vaultData.ciphertext}";\n`,
                  message: `Admin Release: Secure vault synchronization for masterworld`
                });
                log(`GitHub Sync: ✅ secureVault.ts secondary sync to masterworld complete.`);
              } catch (mwVaultErr: any) {
                // Secondary vault sync silently skipped if token is scoped to targetRepo only
              }
            }
            
            log(`GitHub Sync: Building fresh public API bundle for Vercel...`);
            const apiRes = await adminFetch('/api/v1/admin/build-public-api', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {}) },
              body: JSON.stringify({ ciphertext: vaultData.ciphertext })
            });
            if (apiRes.ok) {
              const apiData = await apiRes.json();
              if (apiData.content) {
                log(`GitHub Sync: Pushing updated api/index.js to ${targetRepo}...`);
                await commitFileToGitHub({
                  owner: configToUse.owner,
                  repo: targetRepo,
                  token: configToUse.token,
                  branch: configToUse.branch || 'main',
                  path: 'api/index.js',
                  content: apiData.content,
                  message: `Admin Release: Public API bundle synchronization for ${targetRepo}`
                });
                log(`GitHub Sync: ✅ api/index.js successfully synced to ${targetRepo}.`);
              }
            } else {
              log(`GitHub Sync Error: Failed to build API bundle (${apiRes.status})`);
            }
         }
      }
    } catch(err: any) {
        log(`GitHub Sync Error (Vault): ${err.message}`);
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
