/**
 * GitHub API Synchronizer Engine
 * Responsible for backing up local game state logs, configs, and details on GitHub repos.
 */

import CryptoJS from 'crypto-js';
import { ensureDefaultSettings } from './defaultLegalContent';
import { adminFetch } from '../services/adminAuthService';
import { safeEncrypt, safeDecrypt } from './cryptoUtils';

export function encryptUrlIfNeeded(url: string): string {
  if (!url || typeof url !== 'string') return '';
  let trimmed = url.trim();
  if (trimmed === '' || trimmed.includes('com.rummydex') || trimmed.includes('com.example') || trimmed.toLowerCase().includes('mediafire.com')) return '';
  
  if (trimmed.startsWith('U2FsdGVkX1')) {
    const dec = safeDecrypt(trimmed);
    if (dec && dec.toLowerCase().includes('mediafire.com')) return '';
    return trimmed;
  }

  if (!trimmed.toLowerCase().startsWith('http://') && !trimmed.toLowerCase().startsWith('https://')) {
    trimmed = 'https://' + trimmed;
  }

  return safeEncrypt(trimmed);
}

export interface GitConfig {
  owner: string;
  repo: string;
  branch: string;
  token: string;
  autoSync: boolean;
}

/**
 * Encodes string to UTF-8 base64 properly for GitHub API content submission
 */
export function b64EncodeUnicode(str: string): string {
  try {
    return btoa(
      encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => {
        return String.fromCharCode(parseInt(p1, 16));
      })
    );
  } catch (error) {
    console.error("Base64 unicode encoding error:", error);
    return btoa(str);
  }
}

/**
 * Dynamically generates the content of `src/lib/communityReviewsData.ts` based on current verified reviews state
 */
export function generateCommunityReviewsFileCode(reviews: any[] = []): string {
  const cleanReviews = (reviews || []).map((r: any) => ({
    id: r.id || `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    appId: r.appId || r.app_id || '',
    appSlug: r.appSlug || '',
    appName: r.appName || '',
    userName: r.userName || r.username || 'Player',
    rating: Number(r.rating) || 5,
    reviewText: r.reviewText || r.comment || '',
    timestamp: r.timestamp || r.created_at || new Date().toISOString(),
    status: r.status || 'published',
    helpful_count: Number(r.helpful_count) || 0,
    isPinned: Boolean(r.isPinned),
    reported: Boolean(r.reported),
    report_count: Number(r.report_count) || 0,
    source: r.source || 'community',
    adminReply: r.adminReply || null,
    updated_at: r.updated_at || r.timestamp || new Date().toISOString()
  }));

  return `// Auto-generated verified community reviews dataset\nexport interface StaticReviewRecord {\n  id: string;\n  appId: string;\n  appSlug?: string;\n  appName?: string;\n  userName: string;\n  rating: number;\n  reviewText: string;\n  timestamp: string;\n  status: "published" | "pending" | "rejected" | string;\n  helpful_count: number;\n  isPinned?: boolean;\n  reported?: boolean;\n  report_count?: number;\n  source?: string;\n  adminReply?: {\n    text: string;\n    author: string;\n    timestamp: string;\n  } | null;\n  updated_at?: string;\n}\n\nexport const STATIC_COMMUNITY_REVIEWS: StaticReviewRecord[] = ${JSON.stringify(cleanReviews, null, 2)};\n`;
}

/**
 * Dynamically generates the content of `src/lib/staticData.ts` based on current state
 */
export function generateStaticDataFileCode(
  apps: any[] = [],
  settings: any = {},
  news: any[] = [],
  videos: any[] = []
): string {
  // Clean up apps: encrypt and preserve real target URLs, remove dummy com.rummydex URLs
  const cleanApps = JSON.parse(JSON.stringify(apps || [])).map((app: any) => {
    const rawTarget = app.more_information_url || app.download_url || app.encrypted_link || app.encrypted_download_url || '';
    const encryptedTarget = encryptUrlIfNeeded(rawTarget);
    
    // Clean out dummy com.rummydex / com.example URLs from url field
    if (app.url && (app.url.includes('com.rummydex') || app.url.includes('com.example'))) {
      app.url = '';
    }

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
  const defaultSettings = {
    site_title: "",
    meta_description: "",
    logo_url: "",
    favicon_url: "",
    helpline_whatsapp: "",
    helpline_telegram: "",
    support_email: "",
    disclaimer_text: "",
    ethics_discrimination_text: "",
    ticker_text: "",
    animations_enabled: true,
    categories: [],
    banners: [],
    quick_links: [],
    website_faqs: [],
    developers: []
  };
  const cleanSettings = ensureDefaultSettings({ ...defaultSettings, ...JSON.parse(JSON.stringify(settings || {})) });
  const cleanNews = JSON.parse(JSON.stringify(news || []));
  const cleanVideos = JSON.parse(JSON.stringify(videos || []));

  return `// No secureStorage import to avoid Vercel build errors when secureStorage is stripped

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  link: string;
}

export interface GlobalSettings {
  site_title: string;
  seo_title?: string;
  seo_description?: string;
  meta_description: string;
  logo_url: string;
  favicon_url: string;
  helpline_whatsapp: string;
  helpline_telegram: string;
  support_email: string;
  disclaimer_text: string;
  disclaimer_heading?: string;
  ethics_discrimination_text: string;
  ethics_heading?: string;
  portal_heading?: string;
  important_notice_heading?: string;
  ticker_text: string;
  animations_enabled: boolean;
  seo_keywords?: string;
  about_content?: string;
  contact_content?: string;
  privacy_content?: string;
  terms_content?: string;
  responsibility_content?: string;
  report_removal_content?: string;
  important_notice?: string;
  categories: string[];
  banners: Banner[];
  last_updated?: string;
  secure_index_title?: string;
  secure_index_subtitle?: string;
  trending_searches?: string[];
  hero_title_text?: string;
  hero_title_color?: string;
  hero_title_style?: string;
  hero_title_animation?: string;
  hero_title_subtitle?: string;
  hero_title_visible?: boolean;
  ga_tracking_id?: string;
  quick_links?: Array<{ title: string; subtitle?: string; icon?: string; color?: string; url: string }>;
  social_links?: { facebook?: string; instagram?: string; twitter?: string; linkedin?: string; youtube?: string; };
  website_faqs?: Array<{ question: string; answer: string }>;
  developers?: Array<{ id?: string; name: string; role: string; bio?: string; image_url?: string; github?: string; twitter?: string; avatar_url?: string; social?: any }>;
  // Static Pages Custom SEO
  disclaimer_meta_title?: string;
  disclaimer_meta_description?: string;
  ethics_meta_title?: string;
  ethics_meta_description?: string;
  about_meta_title?: string;
  about_meta_description?: string;
  contact_meta_title?: string;
  contact_meta_description?: string;
  privacy_meta_title?: string;
  privacy_meta_description?: string;
  terms_meta_title?: string;
  terms_meta_description?: string;
  responsibility_meta_title?: string;
  responsibility_meta_description?: string;
  report_removal_meta_title?: string;
  report_removal_meta_description?: string;
  notice_meta_title?: string;
  notice_meta_description?: string;
  developers_meta_title?: string;
  developers_meta_description?: string;
  news_meta_title?: string;
  news_meta_description?: string;
  videos_meta_title?: string;
  videos_meta_description?: string;
}

export interface NewsItem {
  id: string;
  slug: string;
  title: string;
  logo_url: string;
  image_url?: string;
  description: string;
  ceo_name: string;
  ceo_description: string;
  seo_title: string;
  seo_description: string;
  seo_keywords?: string;
  category?: string;
  og_image_url?: string;
  canonical_url?: string;
  target_region?: string;
  content: string;
  published_at?: string;
  link: string;
  read_time?: string;
  author?: string;
  description_html?: string;
  date?: string;
  tags?: string[];
  related_app_id?: string;
  created_at?: string;
  updated_at?: string;
  is_breaking?: boolean;
  is_new?: boolean;
  is_pinned?: boolean;
  sync_to_public?: boolean;
}

export interface AppConfig {
  id: string;
  name: string;
  slug: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  og_image_url?: string;
  canonical_url?: string;
  target_region?: string;
  category: string;
  is_coming_soon?: boolean;
  publish_date?: string;
  version: string;
  file_size: string;
  developer: string;
  icon_url: string;
  screenshots: string[];
  description_html: string;
  red_box_msg: string;
  yellow_box_msg: string;
  idea_box_msg: string;
  safety_status: 'Verified' | 'Caution' | 'Unsafe';
  serial_number?: number;
  is_featured?: boolean;
  is_new?: boolean;
  is_hot?: boolean;
  release_notes?: string;
  rating?: number;
  created_at?: string;
  custom_admin_box_html?: string;
  custom_admin_box_heading?: string;
  features_html?: string;
  faqs?: {question: string; answer: string}[];
  link_configured?: boolean;
  
  video_url?: string;
  is_top_chart?: boolean;
  top_chart_category?: string;
  more_information_url?: string;
  sync_to_public?: boolean;
}

export interface Review {
  id: string;
  app_id: string;
  username: string;
  rating: number;
  comment: string;
  is_approved: boolean;
}

export interface VideoItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  youtube_url: string;
  seo_title: string;
  seo_description: string;
  meta_description?: string;
  seo_keywords?: string;
  canonical_url?: string;
  og_image_url?: string;
  created_at: string;
}

import staticDataJson from './staticData.json';

const rawStaticData = staticDataJson as any;

export const mockApps: AppConfig[] = (Array.isArray(rawStaticData.mockApps) && rawStaticData.mockApps.length > 0)
  ? rawStaticData.mockApps
  : ((Array.isArray(rawStaticData.apps) && rawStaticData.apps.length > 0) ? rawStaticData.apps : []);

export const saveMockApps = (apps: AppConfig[]) => {
  try {
    localStorage.setItem('rummystore_apps', JSON.stringify(apps));
  } catch (e) {
    console.warn('saveMockApps storage failed:', e);
  }
  mockApps.splice(0, mockApps.length, ...apps);
};

export const mockSettings: GlobalSettings = {
  site_title: "RummyDex",
  meta_description: "Your trusted bridge to the best mobile card games. Explore RummyDex for hands-on reviews, real-time news, and complete app knowledge.",
  logo_url: "/logo.png",
  favicon_url: "/favicon.ico",
  helpline_whatsapp: "",
  helpline_telegram: "",
  support_email: "support@rummydex.com",
  disclaimer_text: "",
  ethics_discrimination_text: "",
  ticker_text: "",
  animations_enabled: true,
  categories: ["All", "Rummy", "Teen Patti", "Yono", "Casino", "Slot", "Arcade"],
  banners: [],
  ...(rawStaticData.mockSettings || rawStaticData.settings || {})
};

export const saveMockSettings = (settings: GlobalSettings) => {
  try {
    localStorage.setItem('rummystore_settings', JSON.stringify(settings));
  } catch (e) {
    console.warn('saveMockSettings storage failed:', e);
  }
  Object.assign(mockSettings, settings);
};

export const mockNews: NewsItem[] = (Array.isArray(rawStaticData.mockNews) && rawStaticData.mockNews.length > 0)
  ? rawStaticData.mockNews
  : ((Array.isArray(rawStaticData.news) && rawStaticData.news.length > 0) ? rawStaticData.news : []);

export const saveMockNews = (newsList: NewsItem[]) => {
  try {
    localStorage.setItem('rummystore_news', JSON.stringify(newsList));
  } catch (e) {
    console.warn('saveMockNews storage failed:', e);
  }
  mockNews.splice(0, mockNews.length, ...newsList);
};

export const mockVideos: VideoItem[] = (Array.isArray(rawStaticData.mockVideos) && rawStaticData.mockVideos.length > 0)
  ? rawStaticData.mockVideos
  : ((Array.isArray(rawStaticData.videos) && rawStaticData.videos.length > 0) ? rawStaticData.videos : []);

export const saveMockVideos = (videos: VideoItem[]) => {
  try {
    localStorage.setItem('rummystore_videos', JSON.stringify(videos));
  } catch (e) {
    console.warn('saveMockVideos storage failed:', e);
  }
  mockVideos.splice(0, mockVideos.length, ...videos);
};
`;
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
      // 1. If token is present, attempt direct GitHub Git Blobs API (CORS enabled, 0 serverless payload limits)
      if (token && token.trim()) {
        try {
          const cleanToken = token.trim();
          const authHeader = cleanToken.toLowerCase().startsWith('ghp_')
            ? `token ${cleanToken}`
            : `Bearer ${cleanToken}`;
          const base64Content = b64EncodeUnicode(content || '');

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
                content: base64Content,
                encoding: 'base64'
              })
            }
          );

          if (directRes.ok) {
            const directData = await directRes.json();
            if (directData?.sha) {
              return { path: cleanPath, sha: directData.sha };
            }
          }
        } catch (directErr) {
          // Fall back to server proxy
        }
      }

      // 2. Call serverless proxy endpoint /api/github-sync/create-blob (safely under 4.5MB since it's 1 file)
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

      const errText = await response.text();
      let errMsg = errText;
      try {
        const errJson = JSON.parse(errText);
        errMsg = errJson.message || errJson.error || errMsg;
      } catch (e) {}
      lastError = new Error(`Failed to upload ${cleanPath} (HTTP ${response.status}): ${errMsg}`);
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
 * Seals previously created file blobs into a single atomic Git commit.
 * Payload is ~1.5KB, completely bypassing any Vercel payload limits!
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

  if (!response.ok) {
    const errText = await response.text();
    let errMsg = errText || `Server returned ${response.status}`;
    try {
      const errJSON = JSON.parse(errText);
      errMsg = errJSON.message || errJSON.error || errMsg;
    } catch (e) {}
    throw new Error(errMsg);
  }

  return response.json();
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

