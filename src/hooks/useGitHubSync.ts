import React, { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, isFirebaseReal, handleFirestoreError, OperationType } from '../lib/firebase';
import { adminFetch, getValidAdminToken, loadSession } from '../services/adminAuthService';
import { GitConfig, generateStaticDataFileCode, commitFileToGitHub } from '../lib/githubSync';
import { ensureDefaultSettings } from '../lib/defaultLegalContent';
import { AppConfig, GlobalSettings, NewsItem, BlogPost, VideoItem } from '../types';

export function useGitHubSync(
  apps: AppConfig[],
  settings: GlobalSettings,
  news: NewsItem[],
  blogs: BlogPost[],
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

  useEffect(() => {
    if (!auth) return;
    const unsubAuth = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        let isAuthorized = false;

        try {
          const idToken = await currentUser.getIdToken();
          const verifyRes = await adminFetch('/api/v1/admin/verify', {
            headers: {
              'Authorization': `Bearer ${idToken}`
            }
          });
          if (verifyRes.ok) {
            const verifyData = await verifyRes.json();
            if (verifyData.authorized) {
              isAuthorized = true;
            }
          }
        } catch (e) {
          console.warn("Server admin verification for GitHub context failed:", e);
        }

        if (isAuthorized) {
          setGitConfigLoading(true);
          try {
            if (isFirebaseReal && db) {
              const configDoc = doc(db, 'sec_git', 'cfg');
              const snap = await getDoc(configDoc);
              if (snap.exists()) {
                setGitConfig(snap.data() as GitConfig);
              } else {
                setGitConfig({ owner: "yonoapptransparency", repo: "Dex", branch: "main", token: "", autoSync: false });
              }
            } else {
              setGitConfig({ owner: "yonoapptransparency", repo: "Dex", branch: "main", token: "", autoSync: false });
            }
          } catch (err) {
            console.warn("Secure GitHub configuration read bypassed or not initialized:", err);
          } finally {
            setGitConfigLoading(false);
          }
        } else {
          setGitConfig(null);
        }
      } else {
        setGitConfig(null);
      }
    });

    return () => unsubAuth();
  }, []);

  const saveGitConfig = useCallback(async (newConfig: GitConfig) => {
    try {
      if (isFirebaseReal && db) {
        const docRef = doc(db, 'sec_git', 'cfg');
        const sanitized = JSON.parse(JSON.stringify(newConfig));
        await setDoc(docRef, sanitized);
      }
      setGitConfig(newConfig);
    } catch (err) {
      console.error("Save Git Config Error:", err);
      handleFirestoreError(err, OperationType.WRITE, 'sec_git/cfg');
    }
  }, []);

  const pushAllToGitHub = useCallback(async (
    customConfig?: GitConfig, 
    onProgress?: (msg: string) => void, 
    overrideApps?: any[],
    overrideSettings?: any,
    overrideNews?: any[],
    overrideBlogs?: any[],
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

    log("GitHub Sync: Querying live Firebase database for complete catalog (Apps, News, Settings, Blogs, Videos)...");
    let liveBackup: any = null;
    try {
      const liveRes = await fetch('/api/v1/public/backup-data');
      if (liveRes.ok) {
        liveBackup = await liveRes.json();
        log("GitHub Sync: Live Firebase content retrieved successfully.");
      }
    } catch (e) {
      log("GitHub Sync Notice: Could not fetch live backup endpoint, using current memory.");
    }

    const stateApps = overrideApps || apps;
    const stateSettings = overrideSettings || settings;
    const stateNews = overrideNews || news;
    const stateBlogs = overrideBlogs || blogs;
    const stateVideos = overrideVideos || videos;

    const targetApps = stateApps || liveBackup?.apps || [];
    const targetSettings = (stateSettings && Object.keys(stateSettings).length > 0) ? stateSettings : (liveBackup?.settings || {});
    const targetNews = stateNews || liveBackup?.news || [];
    const targetBlogs = stateBlogs || liveBackup?.blogs || [];
    const targetVideos = stateVideos || liveBackup?.videos || [];

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

    const finalSettings = ensureDefaultSettings(targetSettings);
    const updatedCode = generateStaticDataFileCode(finalApps, finalSettings, targetNews, targetBlogs, targetVideos);
    const safeBackupApps = JSON.parse(JSON.stringify(finalApps)).map((app: any) => {
      const rawTarget = app.more_information_url || app.download_url || app.encrypted_link || app.encrypted_download_url || '';
      if (app.url && (app.url.includes('com.rummydex') || app.url.includes('com.example'))) {
        app.url = '';
      }
      if (rawTarget && typeof rawTarget === 'string') {
        const trimmed = rawTarget.trim();
        if (trimmed && !trimmed.includes('com.rummydex') && !trimmed.includes('com.example')) {
          app.more_information_url = trimmed.startsWith('U2FsdGVkX1') ? trimmed : trimmed;
          app.encrypted_link = app.more_information_url;
        } else {
          delete app.more_information_url;
          delete app.encrypted_link;
        }
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
      news: targetNews,
      blogs: targetBlogs,
      videos: targetVideos
    }, null, 2);

    let targetRepo = configToUse.repo || 'dex';

    if (!configToUse.owner) throw new Error("Missing GitHub repository owner configuration.");

    try {
      log(`GitHub Sync: Pushing staticData.ts to ${targetRepo}...`);
      await commitFileToGitHub({
        owner: configToUse.owner,
        repo: targetRepo,
        token: configToUse.token,
        branch: configToUse.branch || 'main',
        path: 'src/lib/staticData.ts',
        content: updatedCode,
        message: `Admin Release: Manual content synchronization to ${targetRepo}`
      });
      log(`GitHub Sync: ✅ staticData.ts successfully synced to ${targetRepo}.`);

      log(`GitHub Sync: Pushing public_backup.json to ${targetRepo}...`);
      await commitFileToGitHub({
        owner: configToUse.owner,
        repo: targetRepo,
        token: configToUse.token,
        branch: configToUse.branch || 'main',
        path: 'src/lib/public_backup.json',
        content: backupJsonCode,
        message: `Admin Release: Manual public_backup.json synchronization to ${targetRepo}`
      });
      log(`GitHub Sync: ✅ public_backup.json successfully synced to ${targetRepo}.`);
      
      if (targetRepo.toLowerCase() !== 'masterworld') {
        try {
          await commitFileToGitHub({
            owner: configToUse.owner,
            repo: 'masterworld',
            token: configToUse.token,
            branch: configToUse.branch || 'main',
            path: 'src/lib/staticData.ts',
            content: updatedCode,
            message: `Admin Release: Manual content synchronization to masterworld`
          });
          log(`GitHub Sync: ✅ staticData.ts secondary sync to masterworld complete.`);

          await commitFileToGitHub({
            owner: configToUse.owner,
            repo: 'masterworld',
            token: configToUse.token,
            branch: configToUse.branch || 'main',
            path: 'src/lib/public_backup.json',
            content: backupJsonCode,
            message: `Admin Release: Manual public_backup.json synchronization to masterworld`
          });
          log(`GitHub Sync: ✅ public_backup.json secondary sync to masterworld complete.`);
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
         }
      }
    } catch(err: any) {
        log(`GitHub Sync Error (Vault): ${err.message}`);
    }

    try {
      await updateLocalContainerBackup(finalApps, targetSettings, targetNews, targetBlogs, targetVideos);
    } catch (err: any) {}

    return { success: true, targetRepo, timestamp: new Date().toISOString() };
  }, [gitConfig, apps, settings, news, blogs, videos, updateLocalContainerBackup]);

  return {
    gitConfig,
    gitConfigLoading,
    saveGitConfig,
    pushAllToGitHub,
    getAdminToken
  };
}
