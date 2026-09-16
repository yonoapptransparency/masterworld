import express from 'express';
import { verifyAdminToken } from '../middleware/adminAuth';
import { getFirebaseAdminDb } from '../firebase';
import fs from 'fs';
import path from 'path';

export const githubSyncRouter = express.Router();

const LOCAL_GIT_CONFIG_PATH = path.join(process.cwd(), 'src/server/git_config.json');

// GET Git Sync Configuration (Admin Only)
githubSyncRouter.get("/api/github-sync/config", verifyAdminToken, async (req, res) => {
  try {
    let config: any = null;

    // 1. Try reading from Firestore Admin SDK
    try {
      const db = getFirebaseAdminDb();
      if (db) {
        const docSnap = await db.collection('sec_git').doc('cfg').get();
        if (docSnap.exists) {
          config = docSnap.data();
        }
      }
    } catch (dbErr) {
      console.warn("[GitHub Sync] Firestore config read warning:", dbErr);
    }

    // 2. Fallback to local server json
    if (!config && fs.existsSync(LOCAL_GIT_CONFIG_PATH)) {
      try {
        config = JSON.parse(fs.readFileSync(LOCAL_GIT_CONFIG_PATH, 'utf8'));
      } catch (e) {}
    }

    // 3. Fallback defaults
    if (!config) {
      config = {
        owner: "yonoapptransparency",
        repo: "Dex",
        branch: "main",
        token: process.env.PAT || "",
        autoSync: false
      };
    }

    // If token is in process.env.PAT and config token is empty
    if (!config.token && process.env.PAT) {
      config.token = process.env.PAT;
    }

    return res.json({ success: true, config });
  } catch (err: any) {
    console.error("[GitHub Sync] Get config error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST Git Sync Configuration (Admin Only)
githubSyncRouter.post("/api/github-sync/config", verifyAdminToken, async (req, res) => {
  try {
    const { owner, repo, branch = 'main', token, autoSync = false } = req.body || {};
    if (!owner || !repo) {
      return res.status(400).json({ success: false, message: "Owner and Repo are required." });
    }

    const newConfig = {
      owner: String(owner).trim(),
      repo: String(repo).trim(),
      branch: String(branch).trim() || 'main',
      token: token ? String(token).trim() : '',
      autoSync: Boolean(autoSync),
      updatedAt: new Date().toISOString()
    };

    // 1. Persist to Firestore via Admin SDK
    try {
      const db = getFirebaseAdminDb();
      if (db) {
        await db.collection('sec_git').doc('cfg').set(newConfig, { merge: true });
      }
    } catch (dbErr) {
      console.warn("[GitHub Sync] Failed to write config to Firestore:", dbErr);
    }

    // 2. Persist locally to server file
    try {
      fs.writeFileSync(LOCAL_GIT_CONFIG_PATH, JSON.stringify(newConfig, null, 2), 'utf8');
    } catch (fsErr) {
      console.warn("[GitHub Sync] Local config file write warning:", fsErr);
    }

    return res.json({ success: true, message: "GitHub configuration saved successfully.", config: newConfig });
  } catch (err: any) {
    console.error("[GitHub Sync] Save config error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

githubSyncRouter.post("/api/github-sync/test", verifyAdminToken, async (req, res) => {
  try {
    const { owner, repo, token } = req.body || {};

    let activeToken = token || process.env.PAT;
    if (!owner || !repo || !activeToken) {
      return res.status(400).json({ message: "Missing required parameters (owner, repo, token)" });
    }
    const cleanToken = activeToken.trim();
    const authHeader = cleanToken.toLowerCase().startsWith('ghp_')
       ? `token ${cleanToken}`
       : `Bearer ${cleanToken}`;

    const testRes = await fetch(
      `https://api.github.com/repos/${owner.trim()}/${repo.trim()}`,
      {
        headers: {
          'Authorization': authHeader,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'node-fetch'
        }
      }
    );

    if (testRes.ok) {
      const repoData = await testRes.json() as any;
      return res.json({
         ok: true,
         message: `Connection successful! Found repository: ${repoData.full_name}`,
        permissions: repoData.permissions
      });
    } else {
      const errJSON = await testRes.json().catch(() => ({})) as any;
      let tip = "";
      if (testRes.status === 401 || testRes.status === 403) {
        tip = "\n\n💡 Tip: Check if your PAT is valid and has at least 'Metadata' read permissions. For pushing files, you will need 'Contents' write permissions.";
      } else if (testRes.status === 404) {
        tip = "\n\n💡 Tip: Repository not found (or your token lacks permissions to see it). Double check that the Owner and Repository Name are spelled exactly right (e.g. Dex, not Dez), and that your Personal Access Token has access to this repository.";
      }
      return res.status(testRes.status).json({
         ok: false,
         message: (errJSON.message || "Failed to connect to repository") + tip
       });
    }
  } catch (err: any) {
    console.error("GitHub Test Connection error:", err);
    return res.status(500).json({ message: err.message || "Internal server error" });
  }
});

githubSyncRouter.post("/api/github-sync/commit", verifyAdminToken, async (req, res) => {
  try {
    const { owner, repo, token, branch, path: filePath, content, message } = req.body || {};

    let activeToken = token || process.env.PAT;
    if (!owner || !repo || !activeToken || !filePath || !content) {
      return res.status(400).json({ message: "Missing required parameters (owner, repo, token, path, content)" });
    }
    const cleanBranch = branch ? branch.trim() : 'main';
    const cleanPath = filePath.replace(/^\/+/g, '');
    const cleanOwner = owner.trim();
    const cleanToken = activeToken.trim();
    let cleanRepo = repo.trim();

    const authHeader = cleanToken.toLowerCase().startsWith('ghp_')
       ? `token ${cleanToken}`
       : `Bearer ${cleanToken}`;

    const tryCommit = async (targetRepo: string) => {
      const finalRepo = targetRepo;
      const maxRetries = 3;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        let sha = "";
        let getErrorContext = "";

        try {
          const fetchRes = await fetch(
            `https://api.github.com/repos/${cleanOwner}/${finalRepo}/contents/${cleanPath}?ref=${encodeURIComponent(cleanBranch)}&_t=${Date.now()}`,
            {
              headers: {
                'Authorization': authHeader,
                'Accept': 'application/vnd.github.v3+json',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'If-None-Match': '',
                'User-Agent': 'node-fetch'
              }
            }
          );
          if (fetchRes.ok) {
            const data = await fetchRes.json() as any;
            if (data && !Array.isArray(data) && data.sha) {
              sha = data.sha;
              console.log(`GitHub Sync Server: Target branch existing file SHA found (attempt ${attempt}): ${sha}`);
            }
          } else if (fetchRes.status === 404) {
            console.log(`GitHub Sync Server: File not found on branch "${cleanBranch}". Attempting default branch fallback...`);
            const fallbackRes = await fetch(
              `https://api.github.com/repos/${cleanOwner}/${finalRepo}/contents/${cleanPath}?_t=${Date.now()}`,
              {
                headers: {
                  'Authorization': authHeader,
                  'Accept': 'application/vnd.github.v3+json',
                  'Cache-Control': 'no-cache, no-store, must-revalidate',
                  'Pragma': 'no-cache',
                  'If-None-Match': '',
                  'User-Agent': 'node-fetch'
                }
              }
            );
            if (fallbackRes.ok) {
              const fallbackData = await fallbackRes.json() as any;
              if (fallbackData && !Array.isArray(fallbackData) && fallbackData.sha) {
                sha = fallbackData.sha;
                console.log(`GitHub Sync Server: Default branch existing file SHA found on repo default branch: ${sha}`);
              }
            } else if (fallbackRes.status !== 404) {
              const errJSON = await fallbackRes.json().catch(() => ({})) as any;
              let tip = "";
              if (errJSON.message && (errJSON.message.toLowerCase().includes("resource not accessible") || errJSON.message.toLowerCase().includes("permission") || fallbackRes.status === 403)) {
                tip = "\n\n🔑 GitHub Access Denied:\n1. Fine-Grained Token: Under 'Repository access', you MUST select 'All repositories' or specifically select '" + finalRepo + "'.\n2. Permissions: Ensure 'Contents' is set to 'Read and write'.\n3. Organization Policy: If '" + cleanOwner + "' is a GitHub Organization, Fine-grained PATs are often BLOCKED by default. Try using a Classic Personal Access Token (ghp_...) instead.";
              }
              getErrorContext = `Default branch lookup failed with status ${fallbackRes.status}: ${errJSON.message || 'Unknown error'}${tip}`;
            }
          } else {
            const errJSON = await fetchRes.json().catch(() => ({})) as any;
            let tip = "";
            if (errJSON.message && (errJSON.message.toLowerCase().includes("resource not accessible") || errJSON.message.toLowerCase().includes("permission") || fetchRes.status === 403)) {
              tip = "\n\n🔑 GitHub Access Denied:\n1. Fine-Grained Token: Under 'Repository access', you MUST select 'All repositories' or specifically select '" + finalRepo + "'.\n2. Permissions: Ensure 'Contents' is set to 'Read and write'.\n3. Organization Policy: If '" + cleanOwner + "' is a GitHub Organization, Fine-grained PATs are often BLOCKED by default. Try using a Classic Personal Access Token (ghp_...) instead.";
            }
            getErrorContext = `Target branch lookup failed with status ${fetchRes.status}: ${errJSON.message || 'Unknown error'}${tip}`;
          }
        } catch (e: any) {
          console.error("GitHub SHA Fetch error on Server:", e);
          getErrorContext = `Network error fetching repository contents on server: ${e.message || e}`;
        }

        if (getErrorContext && !sha) {
          return {
            success: false,
            status: 400,
            error: `GitHub Sync connection aborted. ${getErrorContext}\n\nPlease check your Repository config and Token permissions.`
          };
        }

        const encodedContent = Buffer.from(content, 'utf8').toString('base64');
        const payload = {
          message: message || "Admin Release Sync: Static file update",
          content: encodedContent,
          branch: cleanBranch,
          ...(sha ? { sha } : {})
        };

        console.log(`GitHub Sync Server: Initiating commit for ${cleanPath} to ${finalRepo} (attempt ${attempt}/${maxRetries})...`);
        const saveRes = await fetch(
          `https://api.github.com/repos/${cleanOwner}/${finalRepo}/contents/${cleanPath}`,
          {
            method: 'PUT',
            headers: {
              'Authorization': authHeader,
              'Content-Type': 'application/json',
              'Accept': 'application/vnd.github.v3+json',
              'User-Agent': 'node-fetch'
            },
            body: JSON.stringify(payload)
          }
        );

        if (!saveRes.ok) {
          const errText = await saveRes.text();
          let errMsg = errText;
          try {
            const errJSON = JSON.parse(errText);
            errMsg = errJSON.message || errJSON.error?.message || errText;
          } catch (_) {}

          const isConflict = saveRes.status === 409 || errMsg.toLowerCase().includes("is at") || errMsg.toLowerCase().includes("does not match") || errMsg.toLowerCase().includes("conflict");
          if (isConflict && attempt < maxRetries) {
            console.warn(`GitHub Sync Server: Ref/SHA conflict detected for ${cleanPath} on attempt ${attempt}. Retrying with fresh SHA in ${attempt * 500}ms...`);
            await new Promise(r => setTimeout(r, attempt * 500));
            continue;
          }

          let enhancedTip = "";
          if (errMsg.toLowerCase().includes("not found")) {
            enhancedTip = "\n\n🔑 Try these checks:\n1. Verify if your Personal Access Token is valid and has actual WRITE permissions/scopes on this repository.\n- Fine-Grained Token: Repository Permissions -> 'Contents' -> set to 'Read and write'\n- Classic Token: Ensure 'repo' checkbox is fully checked.\n2. Verify the repository name is exact: '" + finalRepo + "' (casing-correct).\n3. Verify if your token has access to this organization or account.";
          } else if (errMsg.toLowerCase().includes("credentials") || saveRes.status === 401) {
            enhancedTip = "\n\n🔑 Token is invalid or expired. Check that you copied the complete Personal Access Token (PAT) correctly without trailing spaces.";
          }
          if (!enhancedTip && (errMsg.toLowerCase().includes("resource not accessible") || errMsg.toLowerCase().includes("permission") || saveRes.status === 403)) {
            enhancedTip = "\n\n🔑 GitHub Access Denied (Resource not accessible):\n1. Fine-Grained Token: Under 'Repository access', you MUST select either 'All repositories' or specifically select the repository '" + finalRepo + "'.\n2. Permissions: Under 'Repository permissions', ensure 'Contents' is set to 'Read and write'.\n3. Organization Policy: If '" + cleanOwner + "' is a GitHub Organization, Fine-grained PATs are often BLOCKED by default organization security policies. You should use a Classic Personal Access Token (ghp_...) instead, or ask your Org Owner to approve the token.";
          }
          return {
            success: false,
            status: saveRes.status,
            error: errMsg + enhancedTip
          };
        }

        const result = await saveRes.json() as any;
        return {
          success: true,
          result,
          finalRepo
        };
      }

      return {
        success: false,
        status: 409,
        error: "Conflict updating GitHub file after multiple retry attempts. Please try again."
      };
    };

    let commitResult = await tryCommit(cleanRepo);
    if (!commitResult.success) {
      return res.status(commitResult.status || 400).json({ message: commitResult.error });
    }
    console.log(`GitHub Sync Server: Commit verified and published successfully to "${commitResult.finalRepo}"!`, commitResult.result?.commit?.sha);

    return res.json({
       ...commitResult.result,
       message: `Successfully published to ${commitResult.finalRepo} repository.`,
      targetRepo: commitResult.finalRepo
     });
  } catch (err: any) {
    console.error("Server GitHub commit handler error:", err);
    return res.status(500).json({ message: `Internal server error during GitHub sync: ${err.message || err}` });
  }
});
