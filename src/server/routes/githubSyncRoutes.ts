import { Router } from 'express';
import fs from 'fs';
import path from 'path';

export const githubSyncRouter = Router();

// In-memory runtime cache for git config if Firestore/local unavailable
let cachedGitConfig: {
  owner: string;
  repo: string;
  branch: string;
  token: string;
  autoSync: boolean;
} | null = null;

// Strictly validated public core source files synced to the public Dex repository.
// Note: Dynamically generated files (staticData.json, staticData.ts, edgeRouteManifest.json,
// secureVault.ts, robots.txt, sitemaps, community*.json) are intentionally excluded here
// so freshly compiled sync payloads can never race with stale copies on disk.
export const PUBLIC_CORE_CANDIDATE_FILES: readonly string[] = [
  'index.html',
  'vite.config.ts',
  'src/index.css',
  'src/main.tsx',
  'src/typesPublic.ts',
  'src/types.ts',
  'src/i18n.ts',
  'src/lib/canonicalCompiler.ts',
  'src/lib/slugResolver.ts',
  'src/lib/defaultLegalContent.ts',
  'src/lib/utilsPublic.ts',
  'src/lib/utils.ts',
  'src/lib/gateConfig.ts',
  'src/lib/deviceProbe.ts',
  'src/lib/cryptoUtils.ts',
  'src/lib/lazyWithRetry.ts',
  'src/lib/lightFallback.ts',
  'src/lib/preloadHelper.ts',
  'src/lib/routePreloader.ts',
  'src/lib/safeHtmlPublic.ts',
  'src/lib/newsUtils.ts',
  'src/lib/seoUtils.ts',
  'src/lib/sitemapGenerator.ts',
  'src/lib/communityFirebase.ts',
  'src/lib/react-helmet-async-shim.tsx',
  'src/lib/dummyComponent.tsx',
  'src/lib/dummyRenderers.ts',
  'src/lib/dummyAdmin.ts',
  'src/server/crypto.ts',
  'src/server/services/linkService.ts',
  'src/server/security/gateCore.ts',
  'src/server/routes/securityRoutes.ts',
  'src/server/routes/seoRoutes.ts',
  'src/components/GlobalErrorBoundary.tsx',
  'src/components/FallbackRouteMatcher.tsx',
  'src/components/LanguageSelector.tsx',
  'src/components/Meta.tsx',
  'src/components/ClearanceButton.tsx',
  'src/components/NeutralSyncButton.tsx',
  'src/components/PlayStoreUI.tsx',
  'src/components/SupportWidget.tsx',
  'src/components/ReportAppModal.tsx',
  'src/components/Ticker.tsx',
  'src/components/WebsiteTitleHero.tsx',
  'src/components/LightSearch.tsx',
  'src/components/UserReviews.tsx',
  'src/components/playstore/AppListItems.tsx',
  'src/components/playstore/FeaturedBanner.tsx',
  'src/components/playstore/PlayStoreTabs.tsx',
  'src/components/playstore/PromotionSection.tsx',
  'src/components/public/PublicFooter.tsx',
  'src/components/public/PublicHeader.tsx',
  'src/components/public/PublicBottomNav.tsx',
  'src/components/public/PublicBackToTop.tsx',
  'src/components/public/TopProgressBar.tsx',
  'src/components/public/HomeFilterBar.tsx',
  'src/components/public/HomeFaqSection.tsx',
  'src/components/public/NewAdditions.tsx',
  'src/components/public/MobileMenuModal.tsx',
  'src/components/public/YouTubePlayer.tsx',
  'src/components/public/AppHeader.tsx',
  'src/components/public/AppActionButtons.tsx',
  'src/components/public/AppScreenshots.tsx',
  'src/components/public/AppAboutSection.tsx',
  'src/components/public/AppFaqSection.tsx',
  'src/components/public/AppSpecsBar.tsx',
  'src/components/public/AppSafetyBoxes.tsx',
  'src/components/public/AppDetailsSkeleton.tsx',
  'src/components/public/ReviewForm.tsx',
  'src/components/public/ReviewItem.tsx',
  'src/components/public/ReviewScoreSummary.tsx',
  'src/components/public/home/HomeCategoryGrid.tsx',
  'src/components/public/home/HomeSearchResults.tsx',
  'src/components/public/appDetails/AppSimilarCarousel.tsx',
  'src/components/public/appDetails/AppDetailsNavigation.tsx',
  'src/components/public/appDetails/AppNotFound.tsx',
  'src/components/public/appDetails/appDetailsSchemas.ts',
  'src/components/public/news/newsUtils.ts',
  'src/components/public/news/NewsCard.tsx',
  'src/components/public/news/NewsPagination.tsx',
  'src/components/public/newsDetails/NewsArticleHeader.tsx',
  'src/components/public/newsDetails/NewsRelatedAppBox.tsx',
  'src/contexts/DataContextPublic.tsx',
  'src/hooks/useReviews.ts',
  'src/hooks/useTurnstileVerification.ts',
  'src/hooks/useClearanceDispatch.ts',
  'src/hooks/useSEO.ts',
  'src/hooks/useFavicon.ts',
  'src/hooks/useScrollDirection.ts',
  'src/pages/Home.tsx',
  'src/pages/NewsDetailPage.tsx',
  'src/pages/NewsPage.tsx',
  'src/pages/AppDetails.tsx',
  'src/pages/GatewayPage.tsx',
  'src/pages/VideosPage.tsx',
  'src/pages/VideoDetailPage.tsx',
  'src/pages/Developers.tsx',
  'src/pages/About.tsx',
  'src/pages/Contact.tsx',
  'src/pages/Terms.tsx',
  'src/pages/Privacy.tsx',
  'src/pages/Disclaimer.tsx',
  'src/pages/Ethics.tsx',
  'src/pages/Notice.tsx',
  'src/pages/Responsibility.tsx',
  'src/pages/ReportRemoval.tsx',
  'src/pages/FaqPage.tsx',
  'src/pages/SafetyStatus.tsx',
  'src/seoHelper.ts',
  'src/seo/utils.ts',
  'src/seo/sync.ts',
  'src/seo/firebaseConfig.ts',
  'src/seo/preRenderEngine.ts',
  'src/seo/criticalCss.ts',
  'src/seo/initialDataOptimizer.ts',
  'src/seo/metaBuilder.ts',
  'src/seo/schemaBuilder.ts',
  'src/seo/reviewFallback.ts',
  'src/seo/renderers/index.ts',
  'src/seo/renderers/common.ts',
  'src/seo/renderers/newsRenderer.ts',
  'src/seo/renderers/appDetailsRenderer.ts',
  'src/seo/renderers/homeRenderer.ts',
  'src/seo/renderers/staticPageRenderer.ts',
  'src/seo/renderers/gatewayRenderer.ts',
  'src/seo/renderers/videoRenderer.ts',
  'functions/_middleware.js',
  'functions/api/[[catchall]].js',
  'public/_redirects',
  'public/_headers',
  'vercel.json',
  'scripts/prerender.ts',
  'scripts/build-api.js',
  'scripts/compress-dist.ts'
];

// Hard isolation firewall: admin, secret, and internal backup files that must NEVER be committed to public Dex
const FORBIDDEN_PUBLIC_PREFIXES = [
  '.git/',
  '.github/',
  '.aistudio/',
  'src/components/admin/',
  'src/server/middleware/',
  'src/server/routes/admin',
  'public/assets/aistudio/',
  'docs/'
];

const FORBIDDEN_PUBLIC_EXACT = new Set<string>([
  'server.ts',
  'firestore.rules',
  'firebase.json',
  '.firebaserc',
  'mock-2fa-state.json',
  'community_local_backup.json',
  'src/AppAdmin.tsx',
  'src/pages/AdminDashboard.tsx',
  'src/pages/AdminLogin.tsx',
  'src/components/AdminLogin.tsx',
  'src/components/AppsTab.tsx',
  'src/components/NewsTab.tsx',
  'src/components/SecurityTab.tsx',
  'src/components/ImageUpload.tsx',
  'src/components/FirebaseStatusPanel.tsx',
  'src/components/FirebaseStatusIndicator.tsx',
  'src/contexts/DataContext.tsx',
  'src/services/adminAuthService.ts',
  'src/services/firestoreSyncService.ts',
  'src/services/dataService.ts',
  'src/hooks/useAdminAuth.ts',
  'src/hooks/useAdminApps.ts',
  'src/hooks/useAdminSettings.ts',
  'src/hooks/useAppForm.ts',
  'src/hooks/useAppFilters.ts',
  'src/hooks/useGitHubSync.ts',
  'src/hooks/useDataSync.ts',
  'src/hooks/useDataActions.ts',
  'src/server/routes/githubSyncRoutes.ts',
  'src/server/routes/uploadRoutes.ts',
  'src/server/routes/communityRoutes.ts',
  'src/server/routes/reportRoutes.ts',
  'src/server/routes/publicApiRoutes.ts',
  'src/server/services/geminiServerService.ts',
  'src/server/secure_vault.json',
  'src/lib/public_backup.json',
  'src/lib/secure_links_backup.json',
  'src/lib/autopilot_checkpoint.json',
  'src/lib/aiStudioBrain.json',
  'src/lib/githubSync.ts',
  'src/lib/totp.ts',
  'src/lib/secureStorage.ts',
  'src/lib/vaultNode.ts',
  'src/lib/sessionStore.ts',
  'src/lib/firebase.ts',
  'src/lib/adminCommunityFirebase.ts',
  'src/lib/appPdfExport.ts'
]);

const REMOTE_PRUNE_PATHS = new Set<string>([
  'src/lib/public_backup.json',
  'src/lib/secure_links_backup.json',
  'src/lib/aiStudioBrain.json'
]);

export function isValidGitHubSegment(value: string): boolean {
  if (!value || typeof value !== 'string') return false;
  if (value === '.' || value === '..') return false;
  return /^[a-zA-Z0-9._-]{1,100}$/.test(value);
}

export function isValidBranchName(value: string): boolean {
  if (!value || typeof value !== 'string') return false;
  if (value.length > 120) return false;
  if (value.startsWith('/') || value.endsWith('/') || value.startsWith('.') || value.endsWith('.')) return false;
  if (value.includes('..') || value.includes('//') || value.includes('@{')) return false;
  return !/[\s~^:?*\[\\\x00-\x1f\x7f]/.test(value);
}

export interface SafePublicPathResult {
  ok: boolean;
  cleanPath: string;
  reason?: string;
}

export function assertSafePublicRepoPath(rawPath: string): SafePublicPathResult {
  if (!rawPath || typeof rawPath !== 'string') {
    return { ok: false, cleanPath: '', reason: 'File path is required' };
  }
  if (rawPath.includes('\0')) {
    return { ok: false, cleanPath: '', reason: 'Invalid null byte in file path' };
  }
  const normalized = rawPath.replace(/\\/g, '/').replace(/^\/+/, '').trim();
  if (!normalized || normalized.length > 300) {
    return { ok: false, cleanPath: '', reason: 'Invalid file path length' };
  }
  const segments = normalized.split('/');
  if (segments.some(seg => seg === '' || seg === '.' || seg === '..')) {
    return { ok: false, cleanPath: '', reason: `Unsafe path traversal segment in "${normalized}"` };
  }
  const lower = normalized.toLowerCase();
  const baseName = segments[segments.length - 1].toLowerCase();
  if (baseName === '.env' || baseName.startsWith('.env.')) {
    return { ok: false, cleanPath: '', reason: `Environment secret file blocked from public sync: "${normalized}"` };
  }
  for (const prefix of FORBIDDEN_PUBLIC_PREFIXES) {
    if (lower.startsWith(prefix.toLowerCase())) {
      return { ok: false, cleanPath: '', reason: `Admin/internal directory blocked from public sync: "${normalized}"` };
    }
  }
  if (FORBIDDEN_PUBLIC_EXACT.has(normalized)) {
    return { ok: false, cleanPath: '', reason: `Admin/internal file blocked from public sync: "${normalized}"` };
  }
  return { ok: true, cleanPath: normalized };
}

function resolveGitHubToken(reqToken: any): string {
  const provided = typeof reqToken === 'string' ? reqToken.trim() : '';
  if (provided) return provided;
  return (
    cachedGitConfig?.token ||
    process.env.GITHUB_TOKEN ||
    process.env.GITHUB_PAT ||
    ''
  ).trim();
}

function buildGitHubHeaders(token: string, includeJsonContentType = false): Record<string, string> {
  const authHeader = token.toLowerCase().startsWith('ghp_')
    ? `token ${token}`
    : `Bearer ${token}`;
  const headers: Record<string, string> = {
    'Authorization': authHeader,
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'RummyDex-Backend/2.0'
  };
  if (includeJsonContentType) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
}

async function fetchGitHubWithRetry(
  url: string,
  init: RequestInit = {},
  options: { timeoutMs?: number; maxRetries?: number } = {}
): Promise<Response> {
  const timeoutMs = options.timeoutMs ?? 20000;
  const maxRetries = options.maxRetries ?? 3;
  let lastError: any = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...init, signal: controller.signal });
      clearTimeout(timer);

      // Retry only on transient rate limit / upstream server errors
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
      clearTimeout(timer);
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
      : (lastError?.message || 'GitHub API network failure')
  );
}

async function fetchBranchHeadAndTree(
  cleanOwner: string,
  cleanRepo: string,
  cleanBranch: string,
  headers: Record<string, string>
): Promise<{ parentCommitSha: string; baseTreeSha: string }> {
  let parentCommitSha = '';

  const refRes = await fetchGitHubWithRetry(
    `https://api.github.com/repos/${encodeURIComponent(cleanOwner)}/${encodeURIComponent(cleanRepo)}/git/ref/heads/${encodeURIComponent(cleanBranch)}`,
    { headers }
  );
  if (refRes.ok) {
    const refData: any = await refRes.json();
    parentCommitSha = refData.object?.sha || '';
  }

  if (!parentCommitSha) {
    const branchRes = await fetchGitHubWithRetry(
      `https://api.github.com/repos/${encodeURIComponent(cleanOwner)}/${encodeURIComponent(cleanRepo)}/branches/${encodeURIComponent(cleanBranch)}`,
      { headers }
    );
    if (branchRes.ok) {
      const branchData: any = await branchRes.json();
      parentCommitSha = branchData.commit?.sha || '';
    }
  }

  if (!parentCommitSha) {
    throw Object.assign(
      new Error(`Could not find latest commit SHA for branch "${cleanBranch}" on ${cleanOwner}/${cleanRepo}.`),
      { statusCode: 404 }
    );
  }

  const parentCommitRes = await fetchGitHubWithRetry(
    `https://api.github.com/repos/${encodeURIComponent(cleanOwner)}/${encodeURIComponent(cleanRepo)}/git/commits/${encodeURIComponent(parentCommitSha)}`,
    { headers }
  );
  if (!parentCommitRes.ok) {
    throw Object.assign(
      new Error(`Failed to read parent commit ${parentCommitSha}`),
      { statusCode: parentCommitRes.status || 500 }
    );
  }

  const parentCommitData: any = await parentCommitRes.json();
  const baseTreeSha = parentCommitData.tree?.sha || '';
  if (!baseTreeSha) {
    throw Object.assign(new Error('Parent commit did not return a valid tree SHA.'), { statusCode: 500 });
  }

  return { parentCommitSha, baseTreeSha };
}

// GET /api/github-sync/public-core-files
githubSyncRouter.get('/api/github-sync/public-core-files', (req, res) => {
  try {
    const files: Record<string, string> = {};
    const rootDir = process.cwd();

    PUBLIC_CORE_CANDIDATE_FILES.forEach(f => {
      const check = assertSafePublicRepoPath(f);
      if (!check.ok) return;
      const fullPath = path.resolve(rootDir, check.cleanPath);
      if (!fullPath.startsWith(rootDir + path.sep)) return;
      if (fs.existsSync(fullPath)) {
        let content = fs.readFileSync(fullPath, 'utf8');
        // Ensure public Dex repo always builds with __ADMIN_ENABLED__: false
        if (check.cleanPath === 'vite.config.ts') {
          content = content.replace(/__ADMIN_ENABLED__:\s*true\b/g, '__ADMIN_ENABLED__: false');
        }
        files[check.cleanPath] = content;
      }
    });

    // In the public Dex repository, src/App.tsx must be the isolated AppPublic.tsx (never the local dev proxy that imports AppAdmin)
    const appPublicPath = path.join(rootDir, 'src/AppPublic.tsx');
    if (fs.existsSync(appPublicPath)) {
      files['src/App.tsx'] = fs.readFileSync(appPublicPath, 'utf8');
    }

    res.json({ success: true, count: Object.keys(files).length, files });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// GET /api/github-sync/config
githubSyncRouter.get('/api/github-sync/config', (req, res) => {
  try {
    const envOwner = process.env.GITHUB_OWNER || process.env.VITE_GITHUB_OWNER || '';
    const envRepo = process.env.GITHUB_REPO || process.env.VITE_GITHUB_REPO || '';
    const envBranch = process.env.GITHUB_BRANCH || process.env.VITE_GITHUB_BRANCH || 'main';
    const envToken = process.env.GITHUB_TOKEN || process.env.GITHUB_PAT || '';

    const config = cachedGitConfig || {
      owner: envOwner || 'yonoapptransparency',
      repo: envRepo || 'Dex',
      branch: envBranch || 'main',
      token: envToken || '',
      autoSync: false
    };

    res.setHeader('Cache-Control', 'no-store, private');
    res.json({ success: true, config });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// POST /api/github-sync/config
githubSyncRouter.post('/api/github-sync/config', (req, res) => {
  try {
    const newConfig = req.body;
    if (newConfig && typeof newConfig === 'object') {
      const owner = String(newConfig.owner || '').trim();
      const repo = String(newConfig.repo || '').trim();
      const branch = String(newConfig.branch || 'main').replace(/^refs\/heads\//, '').trim() || 'main';
      if (owner && !isValidGitHubSegment(owner)) {
        return res.status(400).json({ success: false, error: 'Invalid GitHub owner name.' });
      }
      if (repo && !isValidGitHubSegment(repo)) {
        return res.status(400).json({ success: false, error: 'Invalid GitHub repository name.' });
      }
      if (!isValidBranchName(branch)) {
        return res.status(400).json({ success: false, error: 'Invalid GitHub branch name.' });
      }
      cachedGitConfig = {
        owner,
        repo,
        branch,
        token: String(newConfig.token || '').trim(),
        autoSync: Boolean(newConfig.autoSync)
      };
    }
    res.json({ success: true, message: 'GitHub configuration saved' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// POST /api/github-sync/test
githubSyncRouter.post('/api/github-sync/test', async (req, res) => {
  try {
    const { owner, repo, branch = 'main', token } = req.body || {};
    const cleanOwner = String(owner || cachedGitConfig?.owner || '').trim();
    const cleanRepo = String(repo || cachedGitConfig?.repo || '').trim();
    const cleanToken = resolveGitHubToken(token);
    const cleanBranch = String(branch || cachedGitConfig?.branch || 'main').replace(/^refs\/heads\//, '').trim() || 'main';

    if (!isValidGitHubSegment(cleanOwner) || !isValidGitHubSegment(cleanRepo)) {
      return res.status(400).json({ success: false, message: 'Valid Owner and Repo are required' });
    }
    if (!isValidBranchName(cleanBranch)) {
      return res.status(400).json({ success: false, message: 'Valid Branch name is required' });
    }
    if (!cleanToken) {
      return res.status(400).json({ success: false, message: 'Personal Access Token (PAT) is required' });
    }

    const headers = buildGitHubHeaders(cleanToken);
    const ghRes = await fetchGitHubWithRetry(
      `https://api.github.com/repos/${encodeURIComponent(cleanOwner)}/${encodeURIComponent(cleanRepo)}`,
      { headers }
    );

    if (!ghRes.ok) {
      const errJson: any = await ghRes.json().catch(() => ({}));
      const msg = errJson.message || ghRes.statusText;
      return res.status(ghRes.status).json({ success: false, message: `GitHub API error (${ghRes.status}): ${msg}` });
    }

    const repoData: any = await ghRes.json();
    let branchExists = true;
    try {
      const bRes = await fetchGitHubWithRetry(
        `https://api.github.com/repos/${encodeURIComponent(cleanOwner)}/${encodeURIComponent(cleanRepo)}/branches/${encodeURIComponent(cleanBranch)}`,
        { headers },
        { maxRetries: 2 }
      );
      branchExists = bRes.ok;
    } catch (_) {}

    return res.json({
      success: true,
      message: `Successfully connected to repository "${repoData.full_name}" (${branchExists ? `branch: ${cleanBranch}` : `default: ${repoData.default_branch}`})`,
      permissions: repoData.permissions || { push: true, pull: true, admin: false },
      defaultBranch: repoData.default_branch,
      branchExists
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Server proxy test error' });
  }
});

// POST /api/github-sync/remote-tree
// Returns existing blob SHAs on target branch so incremental syncs can skip unchanged files safely
githubSyncRouter.post('/api/github-sync/remote-tree', async (req, res) => {
  try {
    const { owner, repo, branch = 'main', token } = req.body || {};
    const cleanOwner = String(owner || cachedGitConfig?.owner || '').trim();
    const cleanRepo = String(repo || cachedGitConfig?.repo || '').trim();
    const cleanToken = resolveGitHubToken(token);
    const cleanBranch = String(branch || cachedGitConfig?.branch || 'main').replace(/^refs\/heads\//, '').trim() || 'main';

    if (!isValidGitHubSegment(cleanOwner) || !isValidGitHubSegment(cleanRepo) || !isValidBranchName(cleanBranch) || !cleanToken) {
      return res.status(400).json({ success: false, error: 'Valid Owner, Repo, Branch, and Token are required' });
    }
    if (cleanRepo.toLowerCase() === 'masterworld') {
      return res.status(403).json({ success: false, error: 'Admin repository "masterworld" is excluded from public static sync.' });
    }

    const headers = buildGitHubHeaders(cleanToken);
    const { parentCommitSha, baseTreeSha } = await fetchBranchHeadAndTree(cleanOwner, cleanRepo, cleanBranch, headers);

    const treeRes = await fetchGitHubWithRetry(
      `https://api.github.com/repos/${encodeURIComponent(cleanOwner)}/${encodeURIComponent(cleanRepo)}/git/trees/${encodeURIComponent(baseTreeSha)}?recursive=1`,
      { headers }
    );

    if (!treeRes.ok) {
      return res.status(treeRes.status).json({ success: false, error: 'Could not inspect remote git tree' });
    }

    const treeData: any = await treeRes.json();
    const blobShas: Record<string, string> = {};
    if (Array.isArray(treeData?.tree)) {
      for (const item of treeData.tree) {
        if (item?.type === 'blob' && typeof item.path === 'string' && typeof item.sha === 'string') {
          blobShas[item.path] = item.sha;
        }
      }
    }

    return res.json({
      success: true,
      parentCommitSha,
      baseTreeSha,
      truncated: Boolean(treeData?.truncated),
      blobShas
    });
  } catch (err: any) {
    return res.status(err?.statusCode || 500).json({ success: false, error: err?.message || 'Remote tree proxy error' });
  }
});

// POST /api/github-sync/create-blob
githubSyncRouter.post('/api/github-sync/create-blob', async (req, res) => {
  try {
    const { owner, repo, token, path: filePath, content } = req.body || {};
    const cleanOwner = String(owner || cachedGitConfig?.owner || '').trim();
    const cleanRepo = String(repo || cachedGitConfig?.repo || '').trim();
    const cleanToken = resolveGitHubToken(token);

    if (!isValidGitHubSegment(cleanOwner) || !isValidGitHubSegment(cleanRepo) || !cleanToken) {
      return res.status(400).json({ success: false, error: 'Valid Owner, Repo and Token are required' });
    }
    if (cleanRepo.toLowerCase() === 'masterworld') {
      return res.status(403).json({ success: false, error: 'Admin repository "masterworld" cannot be overwritten via public sync.' });
    }

    const pathCheck = assertSafePublicRepoPath(String(filePath || ''));
    if (!pathCheck.ok) {
      return res.status(400).json({ success: false, error: pathCheck.reason });
    }
    if (typeof content !== 'string') {
      return res.status(400).json({ success: false, error: `Invalid content payload for ${pathCheck.cleanPath}` });
    }

    const headers = buildGitHubHeaders(cleanToken, true);
    const b64 = Buffer.from(content, 'utf8').toString('base64');

    const ghRes = await fetchGitHubWithRetry(
      `https://api.github.com/repos/${encodeURIComponent(cleanOwner)}/${encodeURIComponent(cleanRepo)}/git/blobs`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          content: b64,
          encoding: 'base64'
        })
      }
    );

    if (!ghRes.ok) {
      const errJson: any = await ghRes.json().catch(() => ({}));
      return res.status(ghRes.status).json({
        success: false,
        error: `GitHub rejected blob for ${pathCheck.cleanPath}: ${errJson.message || ghRes.statusText}`
      });
    }

    const data: any = await ghRes.json();
    return res.json({ success: true, sha: data.sha, path: pathCheck.cleanPath });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Blob creation proxy error' });
  }
});

// POST /api/github-sync/commit-tree
githubSyncRouter.post('/api/github-sync/commit-tree', async (req, res) => {
  try {
    const { owner, repo, token, branch = 'main', tree, message } = req.body || {};
    const cleanOwner = String(owner || cachedGitConfig?.owner || '').trim();
    const cleanRepo = String(repo || cachedGitConfig?.repo || '').trim();
    const cleanToken = resolveGitHubToken(token);
    const cleanBranch = String(branch || cachedGitConfig?.branch || 'main').replace(/^refs\/heads\//, '').trim() || 'main';

    if (!isValidGitHubSegment(cleanOwner) || !isValidGitHubSegment(cleanRepo) || !isValidBranchName(cleanBranch) || !cleanToken) {
      return res.status(400).json({ success: false, error: 'Valid Owner, Repo, Branch and Token are required' });
    }
    if (cleanRepo.toLowerCase() === 'masterworld') {
      return res.status(403).json({ success: false, error: 'Admin repository "masterworld" cannot be overwritten via public sync.' });
    }
    if (!Array.isArray(tree) || tree.length === 0) {
      return res.status(400).json({ success: false, error: 'Non-empty file tree is required for atomic commit.' });
    }

    // Validate & deduplicate tree entries (last-write-wins) so duplicate path race conditions are impossible
    const dedupedEntries = new Map<string, { path: string; mode: string; type: 'blob'; sha: string | null }>();
    for (const entry of tree) {
      if (!entry || typeof entry !== 'object') continue;
      const isDeletion = entry.sha === null;
      const normalizedRaw = String(entry.path || '').replace(/\\/g, '/').replace(/^\/+/, '').trim();

      if (isDeletion) {
        if (!normalizedRaw || normalizedRaw.includes('..') || normalizedRaw.includes('\0')) {
          return res.status(400).json({ success: false, error: `Invalid deletion path: ${normalizedRaw}` });
        }
        dedupedEntries.set(normalizedRaw, {
          path: normalizedRaw,
          mode: '100644',
          type: 'blob',
          sha: null
        });
        continue;
      }

      const pathCheck = assertSafePublicRepoPath(normalizedRaw);
      if (!pathCheck.ok) {
        return res.status(400).json({ success: false, error: pathCheck.reason });
      }
      const sha = String(entry.sha || '').trim();
      if (!/^[0-9a-f]{40}$/i.test(sha)) {
        return res.status(400).json({ success: false, error: `Invalid Git blob SHA for ${pathCheck.cleanPath}` });
      }
      dedupedEntries.set(pathCheck.cleanPath, {
        path: pathCheck.cleanPath,
        mode: entry.mode === '100755' ? '100755' : '100644',
        type: 'blob',
        sha
      });
    }

    if (dedupedEntries.size === 0) {
      return res.status(400).json({ success: false, error: 'No valid tree entries remained after validation.' });
    }

    const readHeaders = buildGitHubHeaders(cleanToken, false);
    const writeHeaders = buildGitHubHeaders(cleanToken, true);
    const commitMsg = String(message || 'Public Release Sync').trim().slice(0, 500) || 'Public Release Sync';

    // Non-force fast-forward commit loop: if another push lands concurrently (HTTP 422),
    // re-fetch the newest HEAD commit & base_tree and cleanly rebase the atomic commit up to 3 times.
    const MAX_REBASE_ATTEMPTS = 3;
    for (let attempt = 1; attempt <= MAX_REBASE_ATTEMPTS; attempt++) {
      const { parentCommitSha, baseTreeSha } = await fetchBranchHeadAndTree(cleanOwner, cleanRepo, cleanBranch, readHeaders);

      const finalTreeEntries: Array<{ path: string; mode: string; type: 'blob'; sha: string | null }> =
        Array.from(dedupedEntries.values());

      // Prune sensitive/private backup artifacts if any ever existed on the remote public tree
      try {
        const baseTreeDetailsRes = await fetchGitHubWithRetry(
          `https://api.github.com/repos/${encodeURIComponent(cleanOwner)}/${encodeURIComponent(cleanRepo)}/git/trees/${encodeURIComponent(baseTreeSha)}?recursive=1`,
          { headers: readHeaders },
          { maxRetries: 2 }
        );
        if (baseTreeDetailsRes.ok) {
          const baseTreeDetails: any = await baseTreeDetailsRes.json();
          if (Array.isArray(baseTreeDetails?.tree)) {
            for (const item of baseTreeDetails.tree) {
              if (item?.type === 'blob' && item?.path && REMOTE_PRUNE_PATHS.has(item.path) && !dedupedEntries.has(item.path)) {
                finalTreeEntries.push({
                  path: item.path,
                  mode: '100644',
                  type: 'blob',
                  sha: null
                });
              }
            }
          }
        }
      } catch (_) {}

      // Create new git tree layered on top of latest base_tree
      const treeRes = await fetchGitHubWithRetry(
        `https://api.github.com/repos/${encodeURIComponent(cleanOwner)}/${encodeURIComponent(cleanRepo)}/git/trees`,
        {
          method: 'POST',
          headers: writeHeaders,
          body: JSON.stringify({
            base_tree: baseTreeSha,
            tree: finalTreeEntries
          })
        }
      );

      if (!treeRes.ok) {
        const errJson: any = await treeRes.json().catch(() => ({}));
        return res.status(treeRes.status).json({
          success: false,
          error: `Failed to create git tree: ${errJson.message || treeRes.statusText}`
        });
      }

      const newTreeData: any = await treeRes.json();
      const newTreeSha = newTreeData.sha;

      // Create atomic commit
      const commitRes = await fetchGitHubWithRetry(
        `https://api.github.com/repos/${encodeURIComponent(cleanOwner)}/${encodeURIComponent(cleanRepo)}/git/commits`,
        {
          method: 'POST',
          headers: writeHeaders,
          body: JSON.stringify({
            message: commitMsg,
            tree: newTreeSha,
            parents: [parentCommitSha]
          })
        }
      );

      if (!commitRes.ok) {
        const errJson: any = await commitRes.json().catch(() => ({}));
        return res.status(commitRes.status).json({
          success: false,
          error: `Failed to create commit: ${errJson.message || commitRes.statusText}`
        });
      }

      const newCommitData: any = await commitRes.json();
      const newCommitSha = newCommitData.sha;

      // Fast-forward ref update (force: false prevents silently erasing concurrent commits)
      const updateRefRes = await fetchGitHubWithRetry(
        `https://api.github.com/repos/${encodeURIComponent(cleanOwner)}/${encodeURIComponent(cleanRepo)}/git/refs/heads/${encodeURIComponent(cleanBranch)}`,
        {
          method: 'PATCH',
          headers: writeHeaders,
          body: JSON.stringify({
            sha: newCommitSha,
            force: false
          })
        }
      );

      if (updateRefRes.ok) {
        return res.json({
          success: true,
          commitSha: newCommitSha,
          treeSha: newTreeSha,
          fileCount: dedupedEntries.size,
          attempt,
          message: `Successfully created atomic commit ${newCommitSha.substring(0, 7)}`
        });
      }

      const errJson: any = await updateRefRes.json().catch(() => ({}));
      if (updateRefRes.status === 422 && attempt < MAX_REBASE_ATTEMPTS) {
        // Concurrent commit landed on branch; rebase cleanly on latest HEAD
        await new Promise(r => setTimeout(r, 500 * attempt));
        continue;
      }

      return res.status(updateRefRes.status).json({
        success: false,
        error: `Failed to update branch ref "${cleanBranch}": ${errJson.message || updateRefRes.statusText}`
      });
    }

    return res.status(409).json({
      success: false,
      error: `Branch "${cleanBranch}" was updated concurrently multiple times. Please retry sync.`
    });
  } catch (err: any) {
    return res.status(err?.statusCode || 500).json({ success: false, error: err?.message || 'Commit tree proxy error' });
  }
});
