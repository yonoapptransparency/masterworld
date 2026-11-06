import { ensureDefaultSettings } from './defaultLegalContent';
import { safeEncrypt, safeDecrypt } from './cryptoUtils';
import { structureHtmlFragment } from './safeHtmlPublic';
import { formatNewsDate, calculateReadingTime, getPlainTextSnippet } from './newsUtils';
import { formatPageTitle, cleanSettingsMetaTitles } from './seoUtils';

export function encryptUrlIfNeeded(url: string, existingCiphertext?: string): string {
  if (!url || typeof url !== 'string') return '';
  let trimmed = url.trim();
  if (trimmed === '' || trimmed.includes('com.rummydex') || trimmed.includes('com.example') || trimmed.toLowerCase().includes('mediafire.com')) return '';

  if (trimmed.startsWith('U2FsdGVkX1')) {
    const dec = safeDecrypt(trimmed);
    if (dec && dec.toLowerCase().includes('mediafire.com')) return '';
    if (dec && (dec.startsWith('http://') || dec.startsWith('https://'))) {
      return trimmed;
    }
    return trimmed;
  }

  if (!trimmed.toLowerCase().startsWith('http://') && !trimmed.toLowerCase().startsWith('https://')) {
    trimmed = 'https://' + trimmed;
  }

  if (existingCiphertext && typeof existingCiphertext === 'string' && existingCiphertext.trim().startsWith('U2FsdGVkX1')) {
    const existingDec = safeDecrypt(existingCiphertext.trim());
    if (existingDec === trimmed) {
      return existingCiphertext.trim();
    }
  }

  return safeEncrypt(trimmed);
}

/**
 * Canonical App Hygiene & Normalization Compiler
 * Preserves 100% of Admin's exact copy while normalizing embedded HTML headings (<h1> -> <h2>),
 * stripping inline style pollution, removing auto-appended brand suffixes, and optionally sealing/stripping download URLs for public bundles.
 */
export function compileCanonicalApp(app: any, options?: { stripDownloadLinks?: boolean }): any {
  if (!app || typeof app !== 'object') return app;
  const copy = JSON.parse(JSON.stringify(app));
  if (typeof copy.slug === 'string') {
    copy.slug = copy.slug.trim().replace(/^\/+|\/+$/g, '');
  }
  if (typeof copy.id === 'string') {
    copy.id = copy.id.trim();
  }
  const rawTarget = copy.more_information_url || copy.download_url || copy.encrypted_link || copy.encrypted_download_url || '';
  const existingCipher = [copy.encrypted_link, copy.more_information_url, copy.encrypted_download_url]
    .find(v => typeof v === 'string' && v.trim().startsWith('U2FsdGVkX1')) || '';
  const encryptedTarget = encryptUrlIfNeeded(rawTarget, existingCipher);

  if (copy.url && (String(copy.url).includes('com.rummydex') || String(copy.url).includes('com.example'))) {
    copy.url = '';
  }

  copy.has_secure_link = Boolean(encryptedTarget || copy.has_secure_link || copy.url);

  if (options?.stripDownloadLinks) {
    delete copy.more_information_url;
    delete copy.encrypted_link;
    delete copy.encrypted_download_url;
    delete copy.download_url;
  } else {
    if (encryptedTarget) {
      copy.more_information_url = encryptedTarget;
      copy.encrypted_link = encryptedTarget;
    } else {
      delete copy.more_information_url;
      delete copy.encrypted_link;
    }
    delete copy.encrypted_download_url;
    delete copy.download_url;
  }

  // Keep seo_title and meta_title clean and strictly synchronized without trailing "| RummyDex" or "- RummyDex"
  const rawTitle = (copy.seo_title !== undefined ? copy.seo_title : (copy.meta_title || '')).trim();
  const cleanTitle = rawTitle ? formatPageTitle(rawTitle, '') : '';
  copy.seo_title = cleanTitle;
  copy.meta_title = cleanTitle;

  // Keep seo_description and meta_description strictly synchronized
  const cleanDesc = (copy.seo_description !== undefined ? copy.seo_description : (copy.meta_description || '')).trim();
  copy.seo_description = cleanDesc;
  copy.meta_description = cleanDesc;

  // Preserve stable per-app timestamp so unchanged apps never trigger full-catalog sitemap re-crawls
  if (!copy.updated_at) {
    copy.updated_at = copy.published_at || copy.publish_date || copy.created_at || copy.added_date || copy.date || '2026-09-01T00:00:00.000Z';
  }

  if (typeof copy.description_html === 'string' && copy.description_html.trim()) {
    copy.description_html = structureHtmlFragment(copy.description_html);
  }
  if (typeof copy.features_html === 'string' && copy.features_html.trim()) {
    copy.features_html = structureHtmlFragment(copy.features_html);
  }
  if (typeof copy.custom_admin_box_html === 'string' && copy.custom_admin_box_html.trim()) {
    copy.custom_admin_box_html = structureHtmlFragment(copy.custom_admin_box_html);
  }
  if (Array.isArray(copy.faqs)) {
    copy.faqs = copy.faqs.map((f: any) => {
      if (!f || typeof f !== 'object') return f;
      return {
        ...f,
        question: typeof f.question === 'string' ? f.question.trim() : '',
        answer: typeof f.answer === 'string' && f.answer.trim() ? structureHtmlFragment(f.answer) : (f.answer || '')
      };
    });
  }

  return copy;
}

/**
 * Canonical News Hygiene & Pre-Computed Metadata Compiler
 * Normalizes embedded HTML headings/styles and pre-computes deterministic UTC dates, reading time, and excerpt.
 */
export function compileCanonicalNews(item: any): any {
  if (!item || typeof item !== 'object') return item;
  const copy = JSON.parse(JSON.stringify(item));
  if (typeof copy.id === 'string') {
    copy.id = copy.id.trim();
  }
  if (!copy.id) {
    copy.id = Math.random().toString(36).substring(2, 11);
  }
  if (typeof copy.title === 'string' && copy.title.trim()) {
    copy.title = formatPageTitle(copy.title, copy.title.trim());
  }
  if (typeof copy.slug === 'string') {
    copy.slug = copy.slug.trim().replace(/^\/+|\/+$/g, '');
  }
  if (!copy.slug) {
    const slugFromTitle = String(copy.title || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    copy.slug = slugFromTitle || `news-${copy.id}`;
  }

  // Prefer explicit HTML body fields (content, description_html, content_html) before falling back to short description
  const rawHtmlField = copy.content ?? copy.description_html ?? copy.content_html ?? '';
  const rawBody = (typeof rawHtmlField === 'string' && rawHtmlField.trim())
    ? rawHtmlField
    : (typeof copy.description === 'string' ? copy.description : '');

  if (typeof rawBody === 'string' && rawBody.trim()) {
    const cleanHtml = structureHtmlFragment(rawBody);
    copy.content = cleanHtml;
    copy.description_html = cleanHtml;
    copy.content_html = cleanHtml;
  } else {
    copy.content = '';
    copy.description_html = '';
    copy.content_html = '';
  }

  // Synchronize cover image fields across all consumers
  const coverImg = String(copy.image_url || copy.logo_url || copy.image || '').trim();
  copy.image_url = coverImg;
  copy.logo_url = coverImg;
  if (copy.image !== undefined || coverImg) {
    copy.image = coverImg;
  }

  // Synchronize pin & status flags
  const isPinned = Boolean(copy.is_pinned ?? copy.pinned);
  copy.is_pinned = isPinned;
  copy.pinned = isPinned;

  const isDraft = copy.status === 'draft' || copy.sync_to_public === false;
  copy.status = isDraft ? 'draft' : 'published';
  copy.sync_to_public = !isDraft;

  // Synchronize author fields
  const authorName = String(copy.ceo_name || copy.author || 'RummyDex Editorial Team').trim();
  copy.ceo_name = authorName;
  copy.author = authorName;

  // Normalize tags (always string[]) and seo_keywords (comma-separated string)
  let tagsArray: string[] = [];
  if (Array.isArray(copy.tags)) {
    tagsArray = copy.tags.map((t: any) => String(t || '').trim()).filter(Boolean);
  } else if (typeof copy.tags === 'string' && copy.tags.trim()) {
    tagsArray = copy.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
  } else if (typeof copy.seo_keywords === 'string' && copy.seo_keywords.trim()) {
    tagsArray = copy.seo_keywords.split(',').map((t: string) => t.trim()).filter(Boolean);
  }
  copy.tags = tagsArray;
  if (!copy.seo_keywords && tagsArray.length > 0) {
    copy.seo_keywords = tagsArray.join(', ');
  }

  const rawSeoTitle = (copy.seo_title !== undefined ? copy.seo_title : (copy.meta_title || '')).trim();
  const cleanSeoTitle = rawSeoTitle ? formatPageTitle(rawSeoTitle, '') : '';
  copy.seo_title = cleanSeoTitle;
  copy.meta_title = cleanSeoTitle;

  const rawSeoDesc = (copy.seo_description !== undefined ? copy.seo_description : (copy.meta_description || '')).trim();
  if (rawSeoDesc) {
    copy.seo_description = rawSeoDesc;
    copy.meta_description = rawSeoDesc;
  }
  const dateSource = copy.published_at || copy.created_at || copy.date || '';
  if (!copy.updated_at) {
    copy.updated_at = dateSource || '2026-09-01T00:00:00.000Z';
  }
  copy.formatted_date = formatNewsDate(dateSource);
  copy.reading_time = calculateReadingTime(rawBody);
  copy.read_time = copy.read_time || copy.reading_time;
  copy.excerpt = copy.seo_description || copy.description || getPlainTextSnippet(rawBody, 160);
  if (!copy.description && copy.excerpt) {
    copy.description = copy.excerpt;
  }
  return copy;
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
 * Strips server-only secrets (such as turnstile_secret_key) from public settings objects
 * before writing staticData.json / staticData.ts or serving public endpoints.
 */
export function sanitizePublicSettings(settings: any): any {
  if (!settings || typeof settings !== 'object') return {};
  const copy = JSON.parse(JSON.stringify(settings));
  delete copy.turnstile_secret_key;
  delete copy.admin_password;
  delete copy.admin_totp_secret;
  delete copy.cloudinary_api_secret;
  delete copy.gemini_api_key;
  return copy;
}

export function generateSecureVaultFile(ciphertext: string, encryptedTurnstileSecret?: string): string {
  const safeCipher = JSON.stringify(String(ciphertext || '').trim());
  const defaultTurnstileSecret = "U2FsdGVkX18Cro3bhTovzwBCm82B7Hhy8T4ckWY3frEOQEr7Nx6x2mbVr3TjI0FwFKuUa2DvDvFIAtlwGo4H+w==";
  const safeTsSecret = JSON.stringify(String(encryptedTurnstileSecret || defaultTurnstileSecret).trim());
  return [
    "import {",
    "  getEnvSecretKeys,",
    "  getAesSecret,",
    "  encryptData,",
    "  decryptData,",
    "  safeEncrypt,",
    "  safeDecrypt,",
    "} from './cryptoUtils';",
    "",
    "export { getEnvSecretKeys, getAesSecret, encryptData, decryptData, safeEncrypt, safeDecrypt };",
    "",
    "export function encryptLinks(linksMap: Record<string, string>, secretKey?: string): string {",
    "  return safeEncrypt(JSON.stringify(linksMap), secretKey);",
    "}",
    "",
    "export function decryptLinks(ciphertext: string, secretKey?: string): Record<string, string> {",
    "  if (!ciphertext || typeof ciphertext !== 'string' || !ciphertext.trim()) return {};",
    "  const dec = safeDecrypt(ciphertext.trim(), secretKey);",
    "  if (!dec) return {};",
    "  try {",
    "    const parsed = JSON.parse(dec);",
    "    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;",
    "  } catch {}",
    "  return {};",
    "}",
    "",
    "export function generateSecureVaultFile(c: string, ts?: string): string {",
    `  const defTs = ${safeTsSecret};`,
    "  return `export { getEnvSecretKeys, getAesSecret, encryptData, decryptData, safeEncrypt, safeDecrypt } from './cryptoUtils';\\nexport const ENCRYPTED_LINKS = ${JSON.stringify(String(c || '').trim())};\\nexport const ENCRYPTED_VAULT = ENCRYPTED_LINKS;\\nexport const ENCRYPTED_TURNSTILE_SECRET = ${JSON.stringify(String(ts || defTs).trim())};\\n`;",
    "}",
    "",
    `export const ENCRYPTED_LINKS = ${safeCipher};`,
    "export const ENCRYPTED_VAULT = ENCRYPTED_LINKS;",
    `export const ENCRYPTED_TURNSTILE_SECRET = ${safeTsSecret};`,
    "",
  ].join('\n');
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
  // Compile canonical public apps with zero download link leakage (links live exclusively in sealed server vault)
  const cleanApps = (apps || []).map((app: any) => compileCanonicalApp(app, { stripDownloadLinks: true }));
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
  const cleanSettings = sanitizePublicSettings(
    cleanSettingsMetaTitles(ensureDefaultSettings({ ...defaultSettings, ...JSON.parse(JSON.stringify(settings || {})) }))
  );
  const cleanNews = (news || []).map((item: any) => compileCanonicalNews(item));
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
  has_secure_link?: boolean;
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

export const mockApps: any[] = ${JSON.stringify(cleanApps, null, 2)};

export const saveMockApps = (apps: any[]) => {
  try {
    localStorage.setItem('rummystore_apps', JSON.stringify(apps));
  } catch (e) {
    console.warn('saveMockApps storage failed:', e);
  }
  mockApps.splice(0, mockApps.length, ...apps);
};

export const mockSettings: any = ${JSON.stringify(cleanSettings, null, 2)};

export const saveMockSettings = (settings: any) => {
  try {
    localStorage.setItem('rummystore_settings', JSON.stringify(settings));
  } catch (e) {
    console.warn('saveMockSettings storage failed:', e);
  }
  Object.assign(mockSettings, settings);
};

export const mockNews: any[] = ${JSON.stringify(cleanNews, null, 2)};

export const saveMockNews = (newsList: any[]) => {
  try {
    localStorage.setItem('rummystore_news', JSON.stringify(newsList));
  } catch (e) {
    console.warn('saveMockNews storage failed:', e);
  }
  mockNews.splice(0, mockNews.length, ...newsList);
};

export const mockVideos: any[] = ${JSON.stringify(cleanVideos, null, 2)};

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
