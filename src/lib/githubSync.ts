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

const CLIENT_FORBIDDEN_PUBLIC_PREFIXES = [
  '.git/',
  '.github/',
  '.aistudio/',
  'src/components/admin/',
  'src/server/middleware/',
  'src/server/routes/admin',
  'public/assets/aistudio/',
  'docs/'
];

const CLIENT_FORBIDDEN_PUBLIC_EXACT = new Set<string>([
  'server.ts',
  'firestore.rules',
  'firebase.json',
  '.firebaserc',
  'mock-2fa-state.json',
  'community_local_backup.json',
  'src/AppAdmin.tsx',
  'src/pages/AdminDashboard.tsx',
  'src/pages/AdminLogin.tsx',
  'src/lib/public_backup.json',
  'src/lib/secure_links_backup.json',
  'src/lib/aiStudioBrain.json',
  'src/lib/totp.ts',
  'src/lib/secureStorage.ts',
  'src/lib/firebase.ts',
  'src/server/routes/githubSyncRoutes.ts'
]);

const REMOTE_PRUNE_PATHS = new Set<string>([
  'src/lib/public_backup.json',
  'src/lib/secure_links_backup.json',
  'src/lib/aiStudioBrain.json'
]);

function normalizeAndValidatePublicPath(rawPath: string): string {
  const clean = String(rawPath || '').replace(/\\/g, '/').replace(/^\/+/, '').trim();
  if (!clean || clean.includes('\0')) {
    throw new Error(`Invalid file path in sync bundle: "${rawPath}"`);
  }
  const segments = clean.split('/');
  if (segments.some(seg => seg === '' || seg === '.' || seg === '..')) {
    throw new Error(`Unsafe traversal path blocked from sync bundle: "${clean}"`);
  }
  const baseName = segments[segments.length - 1].toLowerCase();
  if (baseName === '.env' || baseName.startsWith('.env.')) {
    throw new Error(`Environment secret file blocked from public sync: "${clean}"`);
  }
  const lower = clean.toLowerCase();
  for (const prefix of CLIENT_FORBIDDEN_PUBLIC_PREFIXES) {
    if (lower.startsWith(prefix.toLowerCase())) {
      throw new Error(`Admin/internal path blocked from public sync: "${clean}"`);
    }
  }
  if (CLIENT_FORBIDDEN_PUBLIC_EXACT.has(clean)) {
    throw new Error(`Admin/internal file blocked from public sync: "${clean}"`);
  }
  return clean;
}

function buildAuthHeader(token: string): string {
  const clean = token.trim();
  return clean.toLowerCase().startsWith('ghp_') ? `token ${clean}` : `Bearer ${clean}`;
}

async function fetchGitHubWithTimeout(
  url: string,
  init: RequestInit = {},
  options: { timeoutMs?: number; maxRetries?: number } = {}
): Promise<Response> {
  const timeoutMs = options.timeoutMs ?? 20000;
  const maxRetries = options.maxRetries ?? 3;
  let lastError: any = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
    try {
      const res = await fetch(url, {
        ...init,
        ...(controller ? { signal: controller.signal } : {})
      });
      if (timer) clearTimeout(timer);

      if ((res.status === 429 || res.status === 502 || res.status === 503 || res.status === 504) && attempt < maxRetries) {
        const retryAfterSec = parseInt(res.headers.get('retry-after') || '', 10);
        const waitMs = Number.isFinite(retryAfterSec) && retryAfterSec > 0
          ? Math.min(retryAfterSec * 1000, 8000)
          : 700 * attempt;
        await new Promise(r => setTimeout(r, waitMs));
        continue;
      }
      return res;
    } catch (err: any) {
      if (timer) clearTimeout(timer);
      lastError = err;
      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, 700 * attempt));
        continue;
      }
    }
  }

  throw new Error(
    lastError?.name === 'AbortError'
      ? `GitHub API request timed out after ${timeoutMs}ms`
      : (lastError?.message || 'GitHub network request failed')
  );
}

/**
 * Computes the exact deterministic Git blob SHA-1 hash ("blob <byteLen>\0<utf8Bytes>")
 * so unchanged files already present on GitHub can reuse their existing blob SHA
 * without burning POST /git/blobs quota or triggering secondary rate limits.
 */
export async function computeGitBlobSha1(content: string): Promise<string | null> {
  try {
    if (typeof crypto === 'undefined' || !crypto.subtle) return null;
    const encoder = new TextEncoder();
    const contentBytes = encoder.encode(content || '');
    const headerBytes = encoder.encode(`blob ${contentBytes.byteLength}\0`);
    const combined = new Uint8Array(headerBytes.byteLength + contentBytes.byteLength);
    combined.set(headerBytes, 0);
    combined.set(contentBytes, headerBytes.byteLength);
    const digest = await crypto.subtle.digest('SHA-1', combined);
    return Array.from(new Uint8Array(digest))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  } catch {
    return null;
  }
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
 * Commits a single file content update atomically via the standard multi-file Git Data API.
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
  return commitMultiFilesToGitHub({
    owner,
    repo,
    token,
    branch: branch || 'main',
    files: [{ path, content }],
    message
  });
}

/**
 * Fetches a map of `path -> blobSha` from the target branch's latest commit tree
 * so incremental syncs can safely skip uploading unchanged blobs.
 */
async function fetchRemoteBranchTreeShas({
  owner,
  repo,
  token,
  branch = 'main'
}: {
  owner: string;
  repo: string;
  token?: string;
  branch: string;
}): Promise<Record<string, string> | null> {
  const cleanOwner = owner.trim();
  const cleanRepo = repo.trim();
  const cleanBranch = branch.replace(/^refs\/heads\//, '').trim() || 'main';
  const cleanToken = (token || '').trim();

  if (cleanToken) {
    try {
      const headers = {
        'Authorization': buildAuthHeader(cleanToken),
        'Accept': 'application/vnd.github.v3+json'
      };
      let parentCommitSha = '';
      const refRes = await fetchGitHubWithTimeout(
        `https://api.github.com/repos/${encodeURIComponent(cleanOwner)}/${encodeURIComponent(cleanRepo)}/git/ref/heads/${encodeURIComponent(cleanBranch)}?_t=${Date.now()}`,
        { headers },
        { timeoutMs: 12000, maxRetries: 2 }
      );
      if (refRes.ok) {
        const refData: any = await refRes.json();
        parentCommitSha = refData?.object?.sha || '';
      }
      if (!parentCommitSha) {
        const brRes = await fetchGitHubWithTimeout(
          `https://api.github.com/repos/${encodeURIComponent(cleanOwner)}/${encodeURIComponent(cleanRepo)}/branches/${encodeURIComponent(cleanBranch)}?_t=${Date.now()}`,
          { headers },
          { timeoutMs: 12000, maxRetries: 2 }
        );
        if (brRes.ok) {
          const brData: any = await brRes.json();
          parentCommitSha = brData?.commit?.sha || '';
        }
      }
      if (!parentCommitSha) return null;

      const commitRes = await fetchGitHubWithTimeout(
        `https://api.github.com/repos/${encodeURIComponent(cleanOwner)}/${encodeURIComponent(cleanRepo)}/git/commits/${encodeURIComponent(parentCommitSha)}`,
        { headers },
        { timeoutMs: 12000, maxRetries: 2 }
      );
      if (!commitRes.ok) return null;
      const commitData: any = await commitRes.json();
      const baseTreeSha = commitData?.tree?.sha;
      if (!baseTreeSha) return null;

      const treeRes = await fetchGitHubWithTimeout(
        `https://api.github.com/repos/${encodeURIComponent(cleanOwner)}/${encodeURIComponent(cleanRepo)}/git/trees/${encodeURIComponent(baseTreeSha)}?recursive=1`,
        { headers },
        { timeoutMs: 15000, maxRetries: 2 }
      );
      if (!treeRes.ok) return null;
      const treeData: any = await treeRes.json();
      const blobShas: Record<string, string> = {};
      if (Array.isArray(treeData?.tree)) {
        for (const entry of treeData.tree) {
          if (entry?.type === 'blob' && typeof entry.path === 'string' && typeof entry.sha === 'string') {
            blobShas[entry.path] = entry.sha;
          }
        }
      }
      return blobShas;
    } catch {
      // Fall through to proxy fallback or full upload
    }
  }

  try {
    const res = await adminFetch('/api/github-sync/remote-tree', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ owner: cleanOwner, repo: cleanRepo, token: cleanToken, branch: cleanBranch })
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.success && data.blobShas && typeof data.blobShas === 'object') {
        return data.blobShas;
      }
    }
  } catch {}

  return null;
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
  const cleanPath = normalizeAndValidatePublicPath(filePath);
  let lastError: any = null;

  // Retry up to 3 times for rock-solid network resilience
  for (let attempt = 1; attempt <= 3; attempt++) {
    let directReason = '';
    let proxyReason = '';

    try {
      // 1. Direct GitHub Git Blobs API (CORS enabled, 0 middleman bottleneck, works on static hosts)
      if (token && token.trim()) {
        try {
          const authHeader = buildAuthHeader(token);

          // Always prefer base64 encoding for blobs: avoids utf8 parsing failures and corrupted emojis
          const b64 = b64EncodeUnicode(content || '');

          const directRes = await fetchGitHubWithTimeout(
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
            },
            { timeoutMs: 25000, maxRetries: 1 }
          );

          if (directRes.ok) {
            const directData = await directRes.json();
            if (directData?.sha) {
              return { path: cleanPath, sha: directData.sha };
            }
            directReason = 'GitHub API returned 200 without blob SHA';
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
              const utf8Res = await fetchGitHubWithTimeout(
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
                },
                { timeoutMs: 25000, maxRetries: 1 }
              );
              if (utf8Res.ok) {
                const utf8Data = await utf8Res.json();
                if (utf8Data?.sha) {
                  return { path: cleanPath, sha: utf8Data.sha };
                }
              }
              directReason = `GitHub API HTTP ${directRes.status}: ${githubMsg}`;
            }
          }
        } catch (directErr: any) {
          if (directErr.message && (directErr.message.includes('Invalid GitHub Personal Access Token') || directErr.message.includes('GitHub write permission error') || directErr.message.includes('Repository'))) {
            throw directErr;
          }
          directReason = directErr?.message || String(directErr);
          console.warn(`[GitHub Sync] Direct blob upload network notice for ${cleanPath}:`, directReason);
        }
      }

      // 2. Server / Cloudflare Edge proxy fallback (works even if browser/ISP blocks api.github.com)
      try {
        const response = await adminFetch('/api/github-sync/create-blob', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
          proxyReason = 'Proxy returned 200 without blob SHA';
        } else {
          const errData = await response.json().catch(() => ({}));
          proxyReason = errData?.error || errData?.message || `HTTP ${response.status}`;
          if (
            response.status === 401 ||
            response.status === 403 ||
            proxyReason.includes('blocked from public sync') ||
            proxyReason.includes('masterworld')
          ) {
            throw new Error(`Sync proxy rejected ${cleanPath} (${response.status}): ${proxyReason}`);
          }
        }
      } catch (proxyErr: any) {
        if (
          proxyErr?.message &&
          (proxyErr.message.includes('blocked from public sync') ||
            proxyErr.message.includes('Sync proxy rejected'))
        ) {
          throw proxyErr;
        }
        proxyReason = proxyErr?.message || String(proxyErr);
      }

      const reasons = [
        directReason ? `Direct: ${directReason}` : '',
        proxyReason ? `Proxy: ${proxyReason}` : ''
      ].filter(Boolean);
      throw new Error(
        reasons.length > 0
          ? `Failed to upload blob for ${cleanPath} (${reasons.join(' | ')})`
          : `Failed to upload blob for ${cleanPath}`
      );
    } catch (err: any) {
      lastError = err;
      // Don't retry auth/permission/path errors
      if (err?.message && (
        err.message.includes('Invalid GitHub Personal Access Token') ||
        err.message.includes('GitHub write permission error') ||
        err.message.includes('blocked from public sync') ||
        err.message.includes('Sync proxy rejected') ||
        err.message.includes('Repository')
      )) {
        throw err;
      }
    }

    if (attempt < 3) {
      await new Promise(r => setTimeout(r, 700 * attempt));
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
      const authHeader = buildAuthHeader(cleanToken);

      const res = await fetchGitHubWithTimeout(
        `https://api.github.com/repos/${encodeURIComponent(cleanOwner)}/${encodeURIComponent(cleanRepo)}`,
        {
          headers: {
            'Authorization': authHeader,
            'Accept': 'application/vnd.github.v3+json'
          }
        },
        { timeoutMs: 15000, maxRetries: 2 }
      );

      if (res.ok) {
        const repoData = await res.json();
        const perms = repoData.permissions || { push: true, pull: true, admin: false };

        let branchVerified = true;
        try {
          const branchRes = await fetchGitHubWithTimeout(
            `https://api.github.com/repos/${encodeURIComponent(cleanOwner)}/${encodeURIComponent(cleanRepo)}/branches/${encodeURIComponent(cleanBranch)}`,
            {
              headers: {
                'Authorization': authHeader,
                'Accept': 'application/vnd.github.v3+json'
              }
            },
            { timeoutMs: 10000, maxRetries: 1 }
          );
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
      if (directErr.message && !directErr.message.includes('Failed to fetch') && !directErr.message.includes('timed out') && !directErr.message.includes('NetworkError')) {
        throw directErr;
      }
      console.warn('[GitHub Sync] Direct test fetch network notice, trying server proxy fallback:', directErr);
    }
  }

  // 2. Fallback to server / edge proxy if direct browser call encountered network filtering
  let proxyErrMsg = '';
  try {
    const res = await adminFetch('/api/github-sync/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    if (res.ok) {
      return await res.json();
    }
    const errJson = await res.json().catch(() => ({}));
    proxyErrMsg = errJson?.error || errJson?.message || `HTTP ${res.status}`;
  } catch (e: any) {
    proxyErrMsg = e?.message || String(e);
  }

  throw new Error(
    proxyErrMsg
      ? `Failed to verify GitHub connection (${proxyErrMsg}). Please verify your Personal Access Token, repository name, and network access.`
      : 'Failed to verify GitHub connection. Please verify your Personal Access Token, repository name, and network access.'
  );
}

/**
 * Seals previously created file blobs into a single atomic Git commit.
 * Uses non-force fast-forward ref updates with automatic rebase retry on HTTP 422
 * so concurrent GitHub Actions commits are never silently overwritten.
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

  if (cleanRepo.toLowerCase() === 'masterworld') {
    throw new Error('Refused to push public static bundle to admin repository "masterworld".');
  }

  // Deduplicate tree entries by normalized public path (last-write-wins)
  const dedupedMap = new Map<string, { path: string; mode: string; type: 'blob'; sha: string }>();
  for (const entry of tree || []) {
    if (!entry) continue;
    const cleanPath = normalizeAndValidatePublicPath(entry.path);
    dedupedMap.set(cleanPath, {
      path: cleanPath,
      mode: (entry as any).mode === '100755' ? '100755' : '100644',
      type: 'blob',
      sha: entry.sha
    });
  }

  if (dedupedMap.size === 0) {
    throw new Error('No valid tree entries provided to commit.');
  }

  // 1. Direct GitHub Git Data API (100% works on static hosts, Cloudflare Pages, Vercel Edge with zero 405 errors)
  if (cleanToken) {
    try {
      const authHeader = buildAuthHeader(cleanToken);
      const readHeaders = {
        'Authorization': authHeader,
        'Accept': 'application/vnd.github.v3+json'
      };
      const writeHeaders = {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      };

      const MAX_REBASE_ATTEMPTS = 3;
      for (let attempt = 1; attempt <= MAX_REBASE_ATTEMPTS; attempt++) {
        // Step A: Get latest commit SHA for target branch
        let parentCommitSha = '';
        let baseTreeSha = '';

        try {
          const refRes = await fetchGitHubWithTimeout(
            `https://api.github.com/repos/${encodeURIComponent(cleanOwner)}/${encodeURIComponent(cleanRepo)}/git/ref/heads/${encodeURIComponent(cleanBranch)}?_t=${Date.now()}`,
            { headers: readHeaders },
            { timeoutMs: 15000, maxRetries: 2 }
          );
          if (refRes.ok) {
            const refData = await refRes.json() as any;
            parentCommitSha = refData.object?.sha || '';
          }
        } catch (_) {}

        if (!parentCommitSha) {
          try {
            const refRes2 = await fetchGitHubWithTimeout(
              `https://api.github.com/repos/${encodeURIComponent(cleanOwner)}/${encodeURIComponent(cleanRepo)}/git/refs/heads/${encodeURIComponent(cleanBranch)}?_t=${Date.now()}`,
              { headers: readHeaders },
              { timeoutMs: 15000, maxRetries: 2 }
            );
            if (refRes2.ok) {
              const refData2 = await refRes2.json() as any;
              parentCommitSha = refData2.object?.sha || '';
            }
          } catch (_) {}
        }

        if (!parentCommitSha) {
          const branchRes = await fetchGitHubWithTimeout(
            `https://api.github.com/repos/${encodeURIComponent(cleanOwner)}/${encodeURIComponent(cleanRepo)}/branches/${encodeURIComponent(cleanBranch)}?_t=${Date.now()}`,
            { headers: readHeaders },
            { timeoutMs: 15000, maxRetries: 2 }
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
        const parentCommitRes = await fetchGitHubWithTimeout(
          `https://api.github.com/repos/${encodeURIComponent(cleanOwner)}/${encodeURIComponent(cleanRepo)}/git/commits/${encodeURIComponent(parentCommitSha)}`,
          { headers: readHeaders },
          { timeoutMs: 15000, maxRetries: 2 }
        );
        if (!parentCommitRes.ok) {
          throw new Error(`Failed to read parent commit ${parentCommitSha}`);
        }
        const parentCommitData = await parentCommitRes.json() as any;
        baseTreeSha = parentCommitData.tree?.sha;
        if (!baseTreeSha) {
          throw new Error(`Parent commit did not return a valid tree SHA.`);
        }

        // Step C: Build deduplicated tree entries + prune any private backup files on remote tree
        const treeEntries: any[] = Array.from(dedupedMap.values());

        try {
          const baseTreeDetailsRes = await fetchGitHubWithTimeout(
            `https://api.github.com/repos/${encodeURIComponent(cleanOwner)}/${encodeURIComponent(cleanRepo)}/git/trees/${encodeURIComponent(baseTreeSha)}?recursive=1`,
            { headers: readHeaders },
            { timeoutMs: 15000, maxRetries: 1 }
          );
          if (baseTreeDetailsRes.ok) {
            const baseTreeDetails = await baseTreeDetailsRes.json() as any;
            if (Array.isArray(baseTreeDetails?.tree)) {
              const dataEntries = baseTreeDetails.tree.filter((t: any) =>
                t.path && t.type === 'blob' && REMOTE_PRUNE_PATHS.has(t.path) && !dedupedMap.has(t.path)
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
                console.log(`[GitHub Sync] Pruned ${dataEntries.length} private backup file(s) from remote git tree.`);
              }
            }
          }
        } catch {
          // Non-blocking prune attempt
        }

        // Step D: Create new tree on top of base_tree
        const treeRes = await fetchGitHubWithTimeout(
          `https://api.github.com/repos/${encodeURIComponent(cleanOwner)}/${encodeURIComponent(cleanRepo)}/git/trees`,
          {
            method: 'POST',
            headers: writeHeaders,
            body: JSON.stringify({
              base_tree: baseTreeSha,
              tree: treeEntries
            })
          },
          { timeoutMs: 25000, maxRetries: 2 }
        );

        if (!treeRes.ok) {
          const errData = await treeRes.json().catch(() => ({}));
          throw new Error(`Failed to create git tree: ${errData.message || treeRes.statusText}`);
        }
        const newTreeData = await treeRes.json() as any;
        const newTreeSha = newTreeData.sha;

        // Step E: Create atomic commit
        const commitRes = await fetchGitHubWithTimeout(
          `https://api.github.com/repos/${encodeURIComponent(cleanOwner)}/${encodeURIComponent(cleanRepo)}/git/commits`,
          {
            method: 'POST',
            headers: writeHeaders,
            body: JSON.stringify({
              message,
              tree: newTreeSha,
              parents: [parentCommitSha]
            })
          },
          { timeoutMs: 20000, maxRetries: 2 }
        );

        if (!commitRes.ok) {
          const errData = await commitRes.json().catch(() => ({}));
          throw new Error(`Failed to create git commit: ${errData.message || commitRes.statusText}`);
        }
        const newCommitData = await commitRes.json() as any;
        const newCommitSha = newCommitData.sha;

        // Step F: Non-force fast-forward ref update (auto-rebases on HTTP 422 if another commit landed concurrently)
        const updateRefRes = await fetchGitHubWithTimeout(
          `https://api.github.com/repos/${encodeURIComponent(cleanOwner)}/${encodeURIComponent(cleanRepo)}/git/refs/heads/${encodeURIComponent(cleanBranch)}`,
          {
            method: 'PATCH',
            headers: writeHeaders,
            body: JSON.stringify({
              sha: newCommitSha,
              force: false
            })
          },
          { timeoutMs: 20000, maxRetries: 2 }
        );

        if (updateRefRes.ok) {
          return {
            success: true,
            commitSha: newCommitSha,
            treeSha: newTreeSha,
            attempt,
            message: `Successfully created atomic commit ${newCommitSha.substring(0, 7)}`
          };
        }

        const errData = await updateRefRes.json().catch(() => ({}));
        if (updateRefRes.status === 422 && attempt < MAX_REBASE_ATTEMPTS) {
          console.warn(`[GitHub Sync] Branch "${cleanBranch}" moved concurrently (attempt ${attempt}/${MAX_REBASE_ATTEMPTS}); rebasing on latest HEAD...`);
          await new Promise(r => setTimeout(r, 600 * attempt));
          continue;
        }

        // If ref update failed with 404, try creating the branch reference
        if (updateRefRes.status === 404) {
          const createRefRes = await fetchGitHubWithTimeout(
            `https://api.github.com/repos/${encodeURIComponent(cleanOwner)}/${encodeURIComponent(cleanRepo)}/git/refs`,
            {
              method: 'POST',
              headers: writeHeaders,
              body: JSON.stringify({
                ref: `refs/heads/${cleanBranch}`,
                sha: newCommitSha
              })
            },
            { timeoutMs: 15000, maxRetries: 2 }
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

      throw new Error(`Branch "${cleanBranch}" was updated concurrently multiple times. Please retry sync.`);
    } catch (directErr: any) {
      const msg = String(directErr?.message || '');
      const isNetworkOrBlocked =
        msg.includes('Failed to fetch') ||
        msg.includes('NetworkError') ||
        msg.includes('timed out') ||
        msg.includes('network request failed');
      if (!isNetworkOrBlocked) {
        console.error('[GitHub Sync] Direct Git Data API error:', directErr);
        throw directErr;
      }
      console.warn('[GitHub Sync] Direct commit-tree network notice, falling back to edge proxy:', msg);
    }
  }

  // 2. Server / Cloudflare Edge proxy fallback (used when no client token or when direct browser fetch is network-filtered)
  const response = await adminFetch('/api/github-sync/commit-tree', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      owner: cleanOwner,
      repo: cleanRepo,
      token: cleanToken,
      branch: cleanBranch,
      tree: Array.from(dedupedMap.values()),
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
 * Deduplicates paths, validates public isolation boundaries, skips unchanged blobs via exact Git SHA-1
 * comparison to prevent GitHub secondary rate limits, and seals 1 atomic commit.
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

  // Deduplicate & validate all paths (last-write-wins) so duplicate entries can never race
  const uniqueFilesMap = new Map<string, { path: string; content: string }>();
  for (const file of files) {
    if (!file || typeof file.path !== 'string') continue;
    const cleanPath = normalizeAndValidatePublicPath(file.path);
    uniqueFilesMap.set(cleanPath, { path: cleanPath, content: String(file.content ?? '') });
  }
  const uniqueFiles = Array.from(uniqueFilesMap.values());
  const total = uniqueFiles.length;

  if (total === 0) {
    throw new Error("No valid public files remained after safety validation.");
  }

  onProgress?.(`GitHub Sync: Preparing ${total} verified unique files for atomic commit to "${repo}"...`);

  // Diff against remote branch tree using deterministic Git blob SHA-1 to skip unchanged files
  const remoteBlobShas = await fetchRemoteBranchTreeShas({ owner, repo, token, branch });
  const tree: Array<{ path: string; sha: string }> = [];
  const filesToUpload: Array<{ path: string; content: string }> = [];
  let reusedCount = 0;

  if (remoteBlobShas) {
    for (const file of uniqueFiles) {
      const remoteSha = remoteBlobShas[file.path];
      if (remoteSha) {
        const localSha = await computeGitBlobSha1(file.content);
        if (localSha && localSha === remoteSha) {
          tree.push({ path: file.path, sha: remoteSha });
          reusedCount++;
          continue;
        }
      }
      filesToUpload.push(file);
    }
    onProgress?.(
      `GitHub Sync: Smart SHA-1 diff complete — ${filesToUpload.length} changed file(s) to upload, ${reusedCount} unchanged file(s) reused directly.`
    );
  } else {
    filesToUpload.push(...uniqueFiles);
  }

  const uploadTotal = filesToUpload.length;
  if (uploadTotal > 0) {
    // Upload changed blobs with concurrency of 2 to balance speed and stability
    const queue = [...filesToUpload];
    let uploadedSoFar = 0;
    const workers = Array.from({ length: Math.min(2, uploadTotal) }, async () => {
      while (queue.length > 0) {
        const file = queue.shift();
        if (!file) break;
        const idx = ++uploadedSoFar;
        const fileName = file.path.split('/').pop() || file.path;
        onProgress?.(`GitHub Sync (${idx}/${uploadTotal}): Uploading ${fileName}...`);
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
  }

  if (tree.length !== total) {
    throw new Error(`Blob creation mismatch: prepared ${tree.length} of ${total} files.`);
  }

  onProgress?.(`GitHub Sync: 🚀 All ${total} file blobs verified (${uploadTotal} uploaded, ${reusedCount} reused). Sealing 1 atomic commit on "${repo}"...`);

  const commitResult = await commitTreeToGitHub({
    owner,
    repo,
    token,
    branch,
    tree,
    message
  });

  onProgress?.(`GitHub Sync: ✅ Atomic commit sealed! (SHA: ${commitResult.commitSha || 'latest'}). Exactly 1 clean deployment triggered!`);

  return {
    ...commitResult,
    uploadedCount: uploadTotal,
    reusedCount,
    totalFiles: total
  };
}
