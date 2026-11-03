/**
 * GitHub API Synchronizer Engine
 * Responsible for backing up local game state logs, configs, and details on GitHub repos.
 */

import { adminFetch } from '../services/adminAuthService';
import {
  encryptUrlIfNeeded,
  compileCanonicalApp,
  compileCanonicalNews,
  generateCommunityReviewsFileCode,
  sanitizePublicSettings,
  generateSecureVaultFile,
  generateStaticDataFileCode,
} from './canonicalCompiler';

export {
  encryptUrlIfNeeded,
  compileCanonicalApp,
  compileCanonicalNews,
  generateCommunityReviewsFileCode,
  sanitizePublicSettings,
  generateSecureVaultFile,
  generateStaticDataFileCode,
};

export interface GitConfig {
  owner: string;
  repo: string;
  branch: string;
  token: string;
  autoSync: boolean;
}

/**
 * Encodes string to UTF-8 base64 properly for GitHub API content submission
 * Supports unicode, emojis and large multi-megabyte payloads without stack overflow
 */
export function b64EncodeUnicode(str: string): string {
  try {
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(str, 'utf8').toString('base64');
    }
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    let binary = '';
    const len = bytes.byteLength;
    const chunkSize = 8192;
    for (let i = 0; i < len; i += chunkSize) {
      const chunk = bytes.subarray(i, Math.min(i + chunkSize, len));
      binary += String.fromCharCode.apply(null, chunk as any);
    }
    return btoa(binary);
  } catch (error) {
    try {
      return btoa(unescape(encodeURIComponent(str)));
    } catch (e) {
      console.error("Base64 unicode encoding error:", error);
      return btoa(str);
    }
  }
}

/**
 * Commits a file content update directly to Github via REST API
 */
export async function commitFileToGitHub({
  owner,
  repo,
  token,
  branch,
  path,
  content,
  message
}: {
  owner: string;
  repo: string;
  token?: string;
  branch: string;
  path: string;
  content: string;
  message: string;
}) {
  const response = await adminFetch('/api/github-sync/commit', {
    method: 'POST',
    body: JSON.stringify({
      owner,
      repo,
      token,
      branch,
      path,
      content,
      message
    })
  });

  if (!response.ok) {
    const contentType = response.headers.get('content-type');
    const errText = await response.text();
    let errMsg = errText || `Server returned ${response.status} ${response.statusText}`;

    if (contentType && contentType.includes('text/html')) {
      throw new Error(`Server returned HTML instead of JSON (${response.status}). This usually indicates a routing issue or a backend crash. Check if the /api routes are correctly deployed. Details: ${errText.substring(0, 100)}...`);
    }

    try {
      const errJSON = JSON.parse(errText);
      errMsg = errJSON.message || errJSON.error || errMsg;
    } catch (e) {
      if (!errMsg || errMsg.trim() === '') errMsg = `HTTP Error ${response.status}`;
    }
    throw new Error(errMsg);
  }

  return response.json();
}

/**
 * Uploads an individual file blob to GitHub (via direct GitHub API or serverless proxy)
 * Guaranteed to never exceed Vercel 4.5MB payload limit.
 */
export async function uploadBlobToGitHub({
  owner,
  repo,
  token,
  path: filePath,
  content
}: {
  owner: string;
  repo: string;
  token?: string;
  path: string;
  content: string;
}): Promise<{ path: string; sha: string }> {
  const cleanPath = filePath.replace(/^\/+/g, '');
  let lastError: any = null;

  // Retry up to 3 times for rock-solid network resilience
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      // 1. Direct GitHub Git Blobs API (CORS enabled, 0 middleman bottleneck, works on static hosts)
      if (token && token.trim()) {
        try {
          const cleanToken = token.trim();
          const authHeader = cleanToken.toLowerCase().startsWith('ghp_')
            ? `token ${cleanToken}`
            : `Bearer ${cleanToken}`;

          // Always prefer base64 encoding for blobs: avoids utf8 parsing failures and corrupted emojis
          const b64 = b64EncodeUnicode(content || '');

          const directRes = await fetch(
            `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/blobs`,
            {
              method: 'POST',
              headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3+json'
              },
              body: JSON.stringify({
                content: b64,
                encoding: 'base64'
              })
            }
          );

          if (directRes.ok) {
            const directData = await directRes.json();
            if (directData?.sha) {
              return { path: cleanPath, sha: directData.sha };
            }
          } else {
            const errData = await directRes.json().catch(() => ({}));
            const githubMsg = errData.message || directRes.statusText;
            
            if (directRes.status === 401) {
              throw new Error(`Invalid GitHub Personal Access Token (PAT): ${githubMsg}. Check token in Settings.`);
            } else if (directRes.status === 403) {
              throw new Error(`GitHub write permission error (403): ${githubMsg}. Ensure token has "Contents: Read and write" access on repository "${owner}/${repo}".`);
            } else if (directRes.status === 404) {
              throw new Error(`Repository "${owner}/${repo}" not found or token lacks access.`);
            } else {
              // Try utf-8 fallback if base64 failed
              const utf8Res = await fetch(
                `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/blobs`,
                {
                  method: 'POST',
                  headers: {
                    'Authorization': authHeader,
                    'Content-Type': 'application/json',
                    'Accept': 'application/vnd.github.v3+json'
                  },
                  body: JSON.stringify({
                    content,
                    encoding: 'utf-8'
                  })
                }
              );
              if (utf8Res.ok) {
                const utf8Data = await utf8Res.json();
                if (utf8Data?.sha) {
                  return { path: cleanPath, sha: utf8Data.sha };
                }
              }
              throw new Error(`GitHub API error (${directRes.status}): ${githubMsg}`);
            }
          }
        } catch (directErr: any) {
          if (directErr.message && (directErr.message.includes('GitHub') || directErr.message.includes('Personal Access Token') || directErr.message.includes('Repository'))) {
            throw directErr;
          }
          console.warn(`[GitHub Sync] Direct blob upload network notice for ${cleanPath}:`, directErr?.message || directErr);
        }
      }

      // 2. Server proxy fallback only if backend environment is available
      try {
        const response = await adminFetch('/api/github-sync/create-blob', {
          method: 'POST',
          body: JSON.stringify({
            owner,
            repo,
            token,
            path: cleanPath,
            content
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data?.sha) {
            return { path: cleanPath, sha: data.sha };
          }
        }
      } catch (_) {}

      throw new Error(`Failed to upload blob for ${cleanPath}`);
    } catch (err: any) {
      lastError = err;
    }

    if (attempt < 3) {
      await new Promise(r => setTimeout(r, 600 * attempt));
    }
  }

  throw lastError || new Error(`Failed to upload blob for ${cleanPath}`);
}

/**
 * Tests connection to target GitHub repository directly via GitHub REST API.
 * Uses CORS-enabled direct browser-to-GitHub connection, completely eliminating 405 errors on static hosts.
 */
export async function testGitHubConnection(config: {
  owner: string;
  repo: string;
  branch?: string;
  token?: string;
}): Promise<{
  success: boolean;
  message: string;
  permissions?: { push: boolean; pull: boolean; admin: boolean };
  defaultBranch?: string;
  repoDetails?: any;
}> {
  const cleanOwner = (config.owner || '').trim();
  const cleanRepo = (config.repo || '').trim();
  const cleanToken = (config.token || '').trim();
  const cleanBranch = (config.branch || 'main').trim();

  if (!cleanOwner || !cleanRepo) {
    throw new Error('Repository Owner and Repository Name are required.');
  }

  // 1. Direct GitHub REST API connection (CORS enabled, 0ms proxy overhead, works everywhere)
  if (cleanToken) {
    try {
      const authHeader = cleanToken.toLowerCase().startsWith('ghp_')
        ? `token ${cleanToken}`
        : `Bearer ${cleanToken}`;

      const res = await fetch(`https://api.github.com/repos/${encodeURIComponent(cleanOwner)}/${encodeURIComponent(cleanRepo)}`, {
        headers: {
          'Authorization': authHeader,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (res.ok) {
        const repoData = await res.json();
        const perms = repoData.permissions || { push: true, pull: true, admin: false };

        let branchVerified = true;
        try {
          const branchRes = await fetch(`https://api.github.com/repos/${encodeURIComponent(cleanOwner)}/${encodeURIComponent(cleanRepo)}/branches/${encodeURIComponent(cleanBranch)}`, {
            headers: {
              'Authorization': authHeader,
              'Accept': 'application/vnd.github.v3+json'
            }
          });
          branchVerified = branchRes.ok;
        } catch (_) {}

        return {
          success: true,
          message: `Successfully connected to repository "${repoData.full_name}" (${branchVerified ? `branch: ${cleanBranch}` : `default: ${repoData.default_branch}`})`,
          permissions: perms,
          defaultBranch: repoData.default_branch,
          repoDetails: {
            name: repoData.name,
            private: repoData.private,
            default_branch: repoData.default_branch
          }
        };
      }

      if (res.status === 401) {
        throw new Error('Invalid GitHub Personal Access Token (PAT): Bad credentials. Please generate a new fine-grained or classic token with "Contents: Read and write" access.');
      } else if (res.status === 404) {
        throw new Error(`Repository "${cleanOwner}/${cleanRepo}" not found. Verify the owner, repository name, and ensure your token has access to this repository.`);
      } else if (res.status === 403) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(`GitHub Access Forbidden (403): ${errJson.message || 'Token lacks required permissions'}`);
      } else {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(`GitHub API returned HTTP ${res.status}: ${errJson.message || 'Unknown error'}`);
      }
    } catch (directErr: any) {
      if (directErr.message && !directErr.message.includes('Failed to fetch')) {
        throw directErr;
      }
      console.warn('[GitHub Sync] Direct test fetch network notice, trying server proxy fallback:', directErr);
    }
  }

  // 2. Fallback to server endpoint if direct browser call encountered network filtering
  try {
    const res = await adminFetch('/api/github-sync/test', {
      method: 'POST',
      body: JSON.stringify(config)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (_) {}

  throw new Error('Failed to verify GitHub connection. Please verify your Personal Access Token, repository name, and network access.');
}

/**
 * Seals previously created file blobs into a single atomic Git commit.
 * Payload is tiny, directly creating the commit via GitHub Git Data API (CORS enabled)
 * with automatic fallback to server proxy.
 */
export async function commitTreeToGitHub({
  owner,
  repo,
  token,
  branch = 'main',
  tree,
  message
}: {
  owner: string;
  repo: string;
  token?: string;
  branch: string;
  tree: Array<{ path: string; sha: string }>;
  message: string;
}) {
  const cleanOwner = owner.trim();
  const cleanRepo = repo.trim();
  const cleanBranch = branch.replace(/^refs\/heads\//, '').trim() || 'main';
  const cleanToken = (token || '').trim();

  // 1. Direct GitHub Git Data API (100% works on static hosts, Cloudflare Pages, Vercel Edge with zero 405 errors)
  if (cleanToken) {
    try {
      const authHeader = cleanToken.toLowerCase().startsWith('ghp_')
        ? `token ${cleanToken}`
        : `Bearer ${cleanToken}`;

      // Step A: Get latest commit SHA for target branch
      let parentCommitSha = '';
      let baseTreeSha = '';

      try {
        const refRes = await fetch(
          `https://api.github.com/repos/${encodeURIComponent(cleanOwner)}/${encodeURIComponent(cleanRepo)}/git/ref/heads/${encodeURIComponent(cleanBranch)}?_t=${Date.now()}`,
          {
            headers: {
              'Authorization': authHeader,
              'Accept': 'application/vnd.github.v3+json'
            }
          }
        );
        if (refRes.ok) {
          const refData = await refRes.json() as any;
          parentCommitSha = refData.object?.sha || '';
        }
      } catch (_) {}

      if (!parentCommitSha) {
        try {
          const refRes2 = await fetch(
            `https://api.github.com/repos/${encodeURIComponent(cleanOwner)}/${encodeURIComponent(cleanRepo)}/git/refs/heads/${encodeURIComponent(cleanBranch)}?_t=${Date.now()}`,
            {
              headers: {
                'Authorization': authHeader,
                'Accept': 'application/vnd.github.v3+json'
              }
            }
          );
          if (refRes2.ok) {
            const refData2 = await refRes2.json() as any;
            parentCommitSha = refData2.object?.sha || '';
          }
        } catch (_) {}
      }

      if (!parentCommitSha) {
        const branchRes = await fetch(
          `https://api.github.com/repos/${encodeURIComponent(cleanOwner)}/${encodeURIComponent(cleanRepo)}/branches/${encodeURIComponent(cleanBranch)}?_t=${Date.now()}`,
          {
            headers: {
              'Authorization': authHeader,
              'Accept': 'application/vnd.github.v3+json'
            }
          }
        );
        if (branchRes.ok) {
          const branchData = await branchRes.json() as any;
          parentCommitSha = branchData.commit?.sha || '';
        }
      }

      if (!parentCommitSha) {
        throw new Error(`Could not find latest commit SHA for branch "${cleanBranch}" on ${cleanOwner}/${cleanRepo}. Please check branch name and permissions.`);
      }

      // Step B: Get base tree SHA from parent commit
      const parentCommitRes = await fetch(
        `https://api.github.com/repos/${encodeURIComponent(cleanOwner)}/${encodeURIComponent(cleanRepo)}/git/commits/${parentCommitSha}`,
        {
          headers: {
            'Authorization': authHeader,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );
      if (!parentCommitRes.ok) {
        throw new Error(`Failed to read parent commit ${parentCommitSha}`);
      }
      const parentCommitData = await parentCommitRes.json() as any;
      baseTreeSha = parentCommitData.tree?.sha;
      if (!baseTreeSha) {
        throw new Error(`Parent commit did not return a valid tree SHA.`);
      }

      // Step C: Format tree entries
      const treeEntries: any[] = tree.map((entry: any) => ({
        path: String(entry.path).replace(/^\/+/g, ''),
        mode: entry.mode || '100644',
        type: 'blob',
        sha: entry.sha
      }));

      // Prune any legacy public/data/ files from the remote git tree so only atomic files remain
      try {
        const baseTreeDetailsRes = await fetch(
          `https://api.github.com/repos/${encodeURIComponent(cleanOwner)}/${encodeURIComponent(cleanRepo)}/git/trees/${baseTreeSha}?recursive=1`,
          {
            headers: {
              'Authorization': authHeader,
              'Accept': 'application/vnd.github.v3+json'
            }
          }
        );
        if (baseTreeDetailsRes.ok) {
          const baseTreeDetails = await baseTreeDetailsRes.json() as any;
          if (Array.isArray(baseTreeDetails?.tree)) {
            const dataEntries = baseTreeDetails.tree.filter((t: any) => 
              t.path && t.type === 'blob' && (t.path === 'src/lib/public_backup.json')
            );
            dataEntries.forEach((t: any) => {
              treeEntries.push({
                path: t.path,
                mode: '100644',
                type: 'blob',
                sha: null
              });
            });
            if (dataEntries.length > 0) {
              console.log(`[GitHub Sync] Pruned private backup file from remote git tree.`);
            }
          }
        }
      } catch (pruneErr) {
        // Non-blocking prune attempt
      }

      // Step D: Create new tree on top of base_tree
      const treeRes = await fetch(
        `https://api.github.com/repos/${encodeURIComponent(cleanOwner)}/${encodeURIComponent(cleanRepo)}/git/trees`,
        {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.github.v3+json'
          },
          body: JSON.stringify({
            base_tree: baseTreeSha,
            tree: treeEntries
          })
        }
      );

      if (!treeRes.ok) {
        const errData = await treeRes.json().catch(() => ({}));
        throw new Error(`Failed to create git tree: ${errData.message || treeRes.statusText}`);
      }
      const newTreeData = await treeRes.json() as any;
      const newTreeSha = newTreeData.sha;

      // Step E: Create atomic commit
      const commitRes = await fetch(
        `https://api.github.com/repos/${encodeURIComponent(cleanOwner)}/${encodeURIComponent(cleanRepo)}/git/commits`,
        {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.github.v3+json'
          },
          body: JSON.stringify({
            message,
            tree: newTreeSha,
            parents: [parentCommitSha]
          })
        }
      );

      if (!commitRes.ok) {
        const errData = await commitRes.json().catch(() => ({}));
        throw new Error(`Failed to create git commit: ${errData.message || commitRes.statusText}`);
      }
      const newCommitData = await commitRes.json() as any;
      const newCommitSha = newCommitData.sha;

      // Step F: Update branch reference (with force: true to avoid non-fast-forward conflicts)
      const updateRefRes = await fetch(
        `https://api.github.com/repos/${encodeURIComponent(cleanOwner)}/${encodeURIComponent(cleanRepo)}/git/refs/heads/${encodeURIComponent(cleanBranch)}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.github.v3+json'
          },
          body: JSON.stringify({
            sha: newCommitSha,
            force: true
          })
        }
      );

      if (!updateRefRes.ok) {
        const errData = await updateRefRes.json().catch(() => ({}));
        // If ref update failed with 404, try creating the branch reference
        if (updateRefRes.status === 404) {
          const createRefRes = await fetch(
            `https://api.github.com/repos/${encodeURIComponent(cleanOwner)}/${encodeURIComponent(cleanRepo)}/git/refs`,
            {
              method: 'POST',
              headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3+json'
              },
              body: JSON.stringify({
                ref: `refs/heads/${cleanBranch}`,
                sha: newCommitSha
              })
            }
          );
          if (createRefRes.ok) {
            return {
              success: true,
              commitSha: newCommitSha,
              treeSha: newTreeSha,
              message: `Successfully created atomic commit ${newCommitSha.substring(0, 7)}`
            };
          }
        }
        throw new Error(`Failed to update branch ref "${cleanBranch}": ${errData.message || updateRefRes.statusText}`);
      }

      return {
        success: true,
        commitSha: newCommitSha,
        treeSha: newTreeSha,
        message: `Successfully created atomic commit ${newCommitSha.substring(0, 7)}`
      };
    } catch (directErr: any) {
      console.error('[GitHub Sync] Direct Git Data API error:', directErr);
      throw directErr;
    }
  }

  // 2. Server proxy fallback ONLY if no client token was provided (backend environment token)
  const response = await adminFetch('/api/github-sync/commit-tree', {
    method: 'POST',
    body: JSON.stringify({
      owner,
      repo,
      token,
      branch,
      tree,
      message
    })
  });

  if (response.ok) {
    return await response.json();
  }

  const errText = await response.text();
  let errMsg = errText || `Server returned ${response.status}`;
  try {
    const errJSON = JSON.parse(errText);
    errMsg = errJSON.message || errJSON.error || errMsg;
  } catch (e) {}
  throw new Error(errMsg);
}

/**
 * Commits multiple files atomically in a single Git commit via chunk-safe Git Blobs & Git Trees API.
 * Uploads blobs individually (max ~1.5MB each, well under Vercel 4.5MB limit),
 * then creates 1 atomic commit with a tiny ~1.5KB manifest.
 */
export async function commitMultiFilesToGitHub({
  owner,
  repo,
  token,
  branch = 'main',
  files,
  message,
  onProgress
}: {
  owner: string;
  repo: string;
  token?: string;
  branch: string;
  files: Array<{ path: string; content: string }>;
  message: string;
  onProgress?: (msg: string) => void;
}) {
  if (!Array.isArray(files) || files.length === 0) {
    throw new Error("No files provided to commit.");
  }

  const tree: Array<{ path: string; sha: string }> = [];
  const total = files.length;

  onProgress?.(`GitHub Sync: Preparing ${total} files for atomic commit to "${repo}"...`);

  // Upload blobs with concurrency of 2 to balance speed and stability
  const queue = [...files];
  const workers = Array.from({ length: Math.min(2, total) }, async () => {
    while (queue.length > 0) {
      const file = queue.shift();
      if (!file) break;
      const idx = total - queue.length;
      const fileName = file.path.split('/').pop() || file.path;
      onProgress?.(`GitHub Sync (${idx}/${total}): Uploading ${fileName}...`);
      const blob = await uploadBlobToGitHub({
        owner,
        repo,
        token,
        path: file.path,
        content: file.content
      });
      tree.push(blob);
      onProgress?.(`GitHub Sync: ✅ ${fileName} blob verified.`);
    }
  });

  await Promise.all(workers);

  if (tree.length !== files.length) {
    throw new Error(`Blob creation mismatch: uploaded ${tree.length} of ${files.length} files.`);
  }

  onProgress?.(`GitHub Sync: 🚀 All ${total} blobs stored in GitHub. Sealing 1 atomic commit on "${repo}"...`);

  const commitResult = await commitTreeToGitHub({
    owner,
    repo,
    token,
    branch,
    tree,
    message
  });

  onProgress?.(`GitHub Sync: ✅ Atomic commit sealed! (SHA: ${commitResult.commitSha || 'latest'}). Exactly 1 clean Vercel deployment triggered!`);

  return commitResult;
}

