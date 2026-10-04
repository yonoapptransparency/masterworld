import fs from 'fs';
import path from 'path';
import { getSafeFirebaseConfig } from './seo/firebaseConfig';
import { syncFromFirestore } from './seo/sync';
import { getField, stripHtml, getYoutubeThumbnail, getOgImageUrl, isBotUserAgent } from './seo/utils';
import { getCleanCanonicalUrl, formatPageTitle } from './lib/seoUtils';
import { resolveAppSlug, SLUG_ALIAS_MAP } from './lib/slugResolver';
import { buildJsonLdSchema } from './seo/schemaBuilder';
import { buildMetaTags } from './seo/metaBuilder';
import { optimizeInitialDataForRoute } from './seo/initialDataOptimizer';
import { getPagePreRender } from './seo/preRenderEngine';
import { getCriticalCss } from './seo/criticalCss';

export { resolveAppSlug, SLUG_ALIAS_MAP };
export { getField, getSafeFirebaseConfig, syncFromFirestore, getOgImageUrl, getYoutubeThumbnail };

// Dynamically resolve staticData directly from filesystem with caching
const getStaticData = () => {
  try {
    const publicBackupPath = path.join(process.cwd(), 'src/lib/public_backup.json');
    if (fs.existsSync(publicBackupPath)) {
      const data = JSON.parse(fs.readFileSync(publicBackupPath, 'utf8'));
      if (data && (Array.isArray(data.apps) && data.apps.length > 0)) {
        return {
          apps: data.apps,
          mockApps: data.apps,
          settings: data.settings || {},
          mockSettings: data.settings || {},
          news: data.news || [],
          mockNews: data.news || [],
          videos: data.videos || [],
          mockVideos: data.videos || [],
          developers: data.developers || data.settings?.developers || []
        };
      }
    }
  } catch (_) {}

  try {
    const staticJsonPath = path.join(process.cwd(), 'src/lib/staticData.json');
    if (fs.existsSync(staticJsonPath)) {
      const data = JSON.parse(fs.readFileSync(staticJsonPath, 'utf8'));
      if (data) {
        return {
          apps: data.mockApps || data.apps || [],
          mockApps: data.mockApps || data.apps || [],
          settings: data.mockSettings || data.settings || {},
          mockSettings: data.mockSettings || data.settings || {},
          news: data.mockNews || data.news || [],
          mockNews: data.mockNews || data.news || [],
          videos: data.mockVideos || data.videos || [],
          mockVideos: data.mockVideos || data.videos || [],
          developers: data.developers || data.mockDevelopers || data.settings?.developers || data.mockSettings?.developers || []
        };
      }
    }
  } catch (_) {}

  try {
    const staticDataModulePath = path.join(process.cwd(), 'src/lib/staticData');
    try {
      delete require.cache[require.resolve(staticDataModulePath)];
    } catch (_) {}
    return require(staticDataModulePath);
  } catch (e) {
    return { mockApps: [], mockSettings: {}, mockNews: [], mockVideos: [] };
  }
};

let cachedData: any = null;
let lastFetchTime = 0;
const CACHE_TTL = 300000; // 5 minutes (prevent quota exhaustion)
let isFetchingStoreData = false;

export function clearSeoCache() {
  cachedData = null;
  lastFetchTime = 0;
}

async function doFetchStoreData() {
  const now = Date.now();
  const freshStatic = getStaticData();
  const data = {
    apps: freshStatic.apps || freshStatic.mockApps || [],
    settings: freshStatic.settings || freshStatic.mockSettings || {},
    news: freshStatic.news || freshStatic.mockNews || [],
    videos: freshStatic.videos || freshStatic.mockVideos || [],
    developers: freshStatic.developers || freshStatic.mockDevelopers || freshStatic.settings?.developers || freshStatic.mockSettings?.developers || []
  };
  
  cachedData = data;
  lastFetchTime = now;
  return data;
}

export async function fetchStoreData() {
  const now = Date.now();
  const isStale = (now - lastFetchTime) > CACHE_TTL;
  const isSuperStale = (now - lastFetchTime) > (CACHE_TTL * 15);

  if (cachedData && !isSuperStale) {
    if (isStale && !isFetchingStoreData) {
      isFetchingStoreData = true;
      doFetchStoreData()
        .then(() => { isFetchingStoreData = false; })
        .catch(e => {
          isFetchingStoreData = false;
          console.warn("Background store fetch failed safely:", e);
        });
    }
    return cachedData;
  }

  return await doFetchStoreData();
}

function cleanSeoDescription(desc: string): string {
  if (!desc) return '';
  const trimmed = desc.trim();
  if (trimmed.startsWith('<') || trimmed.includes('<meta ')) {
    const metaMatch = trimmed.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);
    if (metaMatch && metaMatch[1]) return metaMatch[1].trim();
    const ogMatch = trimmed.match(/<meta\s+property=["']og:description["']\s+content=["'](.*?)["']/i);
    if (ogMatch && ogMatch[1]) return ogMatch[1].trim();
    return stripHtml(trimmed);
  }
  return trimmed;
}

export interface SeoInjectionResult {
  html: string;
  isNotFound: boolean;
  canonicalUrl?: string;
  pageType?: string;
  title?: string;
  description?: string;
}

export async function injectSeoTags(template: string, urlPath: string, hostUrl?: string, userAgent: string = ''): Promise<SeoInjectionResult> {
  const data = await fetchStoreData();
  if (!data || !data.settings) return { html: template, isNotFound: false };

  const apps = data.apps || [];
  const settings = data.settings || {};
  const news = (data.news || []).filter((n: any) => n && n.sync_to_public !== false);
  const videos = data.videos || [];
  const siteTitle = getField(settings, 'site_title') || 'RummyDex';
  let title = getField(settings, 'seo_title') || getField(settings, 'meta_title') || siteTitle;
  let description = getField(settings, 'seo_description') || getField(settings, 'meta_description', '');
  const keywords = getField(settings, 'seo_keywords', '');

  const CLOUDINARY_ICON = 'https://res.cloudinary.com/diewalae4/image/upload/v1786624142/1000134293_sbicyb.png';
  const rawLogoUrl = getField(settings, 'logo_url') || CLOUDINARY_ICON;
  const rawFaviconSetting = getField(settings, 'favicon_url');
  
  const getFaviconWithSize = (url: string, size: number) => {
    if (!url) return '';
    if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
      return url.replace(/\/upload\/(?:[a-zA-Z0-9_.,-]+\/)*(v\d+\/)/, `/upload/f_png,q_auto,w_${size},h_${size},c_fill/$1`);
    }
    return url;
  };

  const isCustomFavicon = rawFaviconSetting && !rawFaviconSetting.includes('1000134293_sbicyb.png');
  const faviconIco = isCustomFavicon ? getFaviconWithSize(rawFaviconSetting, 32) : '/favicon.ico';
  const favicon32 = isCustomFavicon ? getFaviconWithSize(rawFaviconSetting, 32) : '/favicon-32x32.png';
  const favicon16 = isCustomFavicon ? getFaviconWithSize(rawFaviconSetting, 16) : '/favicon-16x16.png';
  const favicon180 = isCustomFavicon ? getFaviconWithSize(rawFaviconSetting, 180) : '/apple-touch-icon.png';
  const logoUrl = getFaviconWithSize(rawLogoUrl, 512);

  const cleanPath = urlPath.split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';
  const cleanPathLower = cleanPath.toLowerCase();

  let isNotFound = false;
  let customCanonicalUrl: string | undefined = undefined;
  let pageType: 'home' | 'app' | 'news' | 'video' | 'static' | 'collection' | 'gateway' | '404' = 'static';
  let targetApp: any = null;
  let targetNews: any = null;
  let targetVideo: any = null;
  let collectionItems: Array<{ name: string; url: string; image?: string; description?: string }> | undefined = undefined;
  let breadcrumbItems: Array<{ name: string; url: string }> | undefined = undefined;

  if (cleanPathLower === '/' || cleanPathLower === '') {
    pageType = 'home';
    title = getField(settings, 'seo_title') || getField(settings, 'meta_title') || siteTitle;
    description = getField(settings, 'seo_description') || getField(settings, 'meta_description', '');
  } else if (cleanPathLower === '/new-apps') {
    pageType = 'collection';
    title = `New Apps & Latest Releases | ${siteTitle}`;
    description = `Explore the newest released Rummy, Teen Patti, and card game apps with verified ratings on ${siteTitle}.`;
    customCanonicalUrl = `https://www.rummydex.com/new-apps`;
    const newAppsList = apps.filter((a: any) => a.is_new === true || (a.is_new && a.is_new.booleanValue === true) || a.is_hot === true).slice(0, 20);
    collectionItems = (newAppsList.length > 0 ? newAppsList : apps.slice(0, 20)).map((a: any) => ({
      name: getField(a, 'name'),
      url: `https://www.rummydex.com/app/${getField(a, 'slug')}`,
      image: getField(a, 'icon_url'),
      description: cleanSeoDescription(getField(a, 'seo_description') || getField(a, 'meta_description') || stripHtml(getField(a, 'description_html')).substring(0, 120))
    }));
    breadcrumbItems = [
      { name: 'Home', url: 'https://www.rummydex.com' },
      { name: 'New Apps', url: 'https://www.rummydex.com/new-apps' }
    ];
  } else if (cleanPathLower === '/categories') {
    pageType = 'collection';
    title = `App Categories & Genres | ${siteTitle}`;
    description = `Browse all gaming and entertainment application categories on ${siteTitle}.`;
    customCanonicalUrl = `https://www.rummydex.com/categories`;
    breadcrumbItems = [
      { name: 'Home', url: 'https://www.rummydex.com' },
      { name: 'Categories', url: 'https://www.rummydex.com/categories' }
    ];
  } else if (cleanPathLower.startsWith('/category/') || cleanPathLower.startsWith('/categories/')) {
    const rawCatSlug = cleanPathLower.replace(/^\/(category|categories)\/?/, '').replace(/^\/|\/$/g, '');
    const catName = rawCatSlug
      ? rawCatSlug.split(/[-_]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
      : 'All Categories';
    pageType = 'collection';
    title = `${catName} - Download & Reviews | ${siteTitle}`;
    description = `Explore top ${catName}, verified reviews, download ratings, and bonus updates on ${siteTitle}.`;
    customCanonicalUrl = `https://www.rummydex.com/category/${rawCatSlug || 'all'}`;
    const categoryApps = apps.filter((a: any) => {
      const cat = getField(a, 'category', '');
      if (!cat) return false;
      const cats = cat.split(',').map((c: string) => c.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''));
      return cats.some((c: string) => c === rawCatSlug || c.includes(rawCatSlug) || rawCatSlug.includes(c));
    }).slice(0, 20);
    collectionItems = (categoryApps.length > 0 ? categoryApps : apps.slice(0, 20)).map((a: any) => ({
      name: getField(a, 'name'),
      url: `https://www.rummydex.com/app/${getField(a, 'slug')}`,
      image: getField(a, 'icon_url'),
      description: cleanSeoDescription(getField(a, 'seo_description') || getField(a, 'meta_description') || stripHtml(getField(a, 'description_html')).substring(0, 120))
    }));
    breadcrumbItems = [
      { name: 'Home', url: 'https://www.rummydex.com' },
      { name: 'Categories', url: 'https://www.rummydex.com/categories' },
      { name: catName, url: `https://www.rummydex.com/category/${rawCatSlug || 'all'}` }
    ];
  } else if (cleanPathLower.startsWith('/admin') || cleanPathLower.startsWith('/masterworld')) {
    title = `Admin Panel | ${siteTitle}`;
    description = `Admin Control Dashboard`;
    pageType = 'static';
  } else if (cleanPathLower.startsWith('/s/')) {
    const slug = cleanPath.split('/s/')[1];
    const app = apps.find((a: any) => getField(a, 'slug').toLowerCase() === slug);
    if (app) {
      title = `Download ${getField(app, 'name')} | ${siteTitle}`;
      description = `Secure download link for ${getField(app, 'name')}.`;
      customCanonicalUrl = getField(app, 'canonical_url');
      pageType = 'app';
      targetApp = app;
    } else {
      isNotFound = true;
      pageType = '404';
    }
  } else if (cleanPathLower === '/news') {
    title = getField(settings, 'news_meta_title') || `News & Updates | ${siteTitle}`;
    description = getField(settings, 'news_meta_description') || `The latest gaming news, reports, and transparency updates.`;
    pageType = 'static';
  } else if (cleanPathLower === '/videos') {
    title = getField(settings, 'videos_meta_title') || `Video Reviews | ${siteTitle}`;
    description = getField(settings, 'videos_meta_description') || `Watch deep-dive reviews and gameplay analysis.`;
    pageType = 'static';
  } else if (cleanPathLower.startsWith('/news/')) {
    const rawNewsSlug = cleanPath.split('/news/')[1] || '';
    const cleanNewsSlug = decodeURIComponent(rawNewsSlug).toLowerCase().trim().replace(/\/+$/, '').split(/[?#]/)[0];

    const newsItem = news.find((n: any) => {
      const nSlug = (getField(n, 'slug') || '').toLowerCase().trim();
      const nId = (getField(n, 'id') || '').toLowerCase().trim();
      return (nSlug && nSlug === cleanNewsSlug) || (nId && nId === cleanNewsSlug);
    });

    if (newsItem) {
      title = getField(newsItem, 'seo_title') || getField(newsItem, 'meta_title') || getField(newsItem, 'title');
      description = cleanSeoDescription(
        getField(newsItem, 'seo_description') || 
        getField(newsItem, 'meta_description') || 
        getField(newsItem, 'description') || 
        stripHtml(getField(newsItem, 'content') || getField(newsItem, 'description_html')).substring(0, 160)
      );
      customCanonicalUrl = getField(newsItem, 'canonical_url');
      pageType = 'news';
      targetNews = newsItem;
    } else {
      const matchedApp = apps.find((a: any) => {
        const aSlug = (getField(a, 'slug') || '').toLowerCase().trim();
        const aId = (getField(a, 'id') || '').toLowerCase().trim();
        return (aSlug && aSlug === cleanNewsSlug) || (aId && aId === cleanNewsSlug);
      });
      if (matchedApp) {
        targetApp = matchedApp;
        pageType = 'app';
        title = getField(matchedApp, 'seo_title') || getField(matchedApp, 'meta_title') || getField(matchedApp, 'name');
        description = cleanSeoDescription(getField(matchedApp, 'seo_description') || getField(matchedApp, 'meta_description') || stripHtml(getField(matchedApp, 'description_html')).substring(0, 160));
        customCanonicalUrl = `https://www.rummydex.com/app/${getField(matchedApp, 'slug') || getField(matchedApp, 'id')}`;
      } else {
        isNotFound = true;
        pageType = '404';
      }
    }
  } else if (cleanPathLower.startsWith('/videos/')) {
    const slug = cleanPath.split('/videos/')[1];
    const videoItem = videos.find((v: any) => getField(v, 'slug').toLowerCase() === slug);
    if (videoItem) {
      title = getField(videoItem, 'seo_title') || getField(videoItem, 'meta_title') || getField(videoItem, 'title');
      description = getField(videoItem, 'seo_description') || getField(videoItem, 'meta_description') || getField(videoItem, 'description', '').substring(0, 160);
      pageType = 'video';
      targetVideo = videoItem;
    } else {
      isNotFound = true;
      pageType = '404';
    }
  } else if (['/about', '/contact', '/privacy', '/report-removal', '/terms', '/notice', '/ethics', '/disclaimer', '/responsibility', '/developers'].includes(cleanPathLower)) {
    pageType = 'static';
    if (cleanPathLower === '/about') {
      title = getField(settings, 'about_meta_title') || `About Us | ${siteTitle}`;
      description = getField(settings, 'about_meta_description') || `Learn more about ${siteTitle}, our mission, and our dedicated team.`;
    } else if (cleanPathLower === '/contact') {
      title = getField(settings, 'contact_meta_title') || `Contact Support | ${siteTitle}`;
      description = getField(settings, 'contact_meta_description') || `Get in touch with ${siteTitle} support for any queries or assistance.`;
    } else if (cleanPathLower === '/privacy') {
      title = getField(settings, 'privacy_meta_title') || `Privacy Policy | ${siteTitle}`;
      description = getField(settings, 'privacy_meta_description') || `Read the Privacy Policy of ${siteTitle} to understand how we protect your data.`;
    } else if (cleanPathLower === '/report-removal') {
      title = getField(settings, 'report_removal_meta_title') || `Report & Removal | ${siteTitle}`;
      description = getField(settings, 'report_removal_meta_description') || `Report content or request removal of specific applications on ${siteTitle}.`;
    } else if (cleanPathLower === '/terms') {
      title = getField(settings, 'terms_meta_title') || `Terms of Service | ${siteTitle}`;
      description = getField(settings, 'terms_meta_description') || `Review the Terms of Service and usage guidelines for ${siteTitle}.`;
    } else if (cleanPathLower === '/notice') {
      title = getField(settings, 'notice_meta_title') || getField(settings, 'important_notice_heading') || `Legal Notice | ${siteTitle}`;
      description = getField(settings, 'notice_meta_description') || `Important legal notices and compliance information for ${siteTitle}.`;
    } else if (cleanPathLower === '/ethics') {
      title = getField(settings, 'ethics_meta_title') || getField(settings, 'ethics_heading') || `Ethics & Safety | ${siteTitle}`;
      description = getField(settings, 'ethics_meta_description') || `Our commitment to ethics, safety, and transparent reviews at ${siteTitle}.`;
    } else if (cleanPathLower === '/disclaimer') {
      title = getField(settings, 'disclaimer_meta_title') || getField(settings, 'disclaimer_heading') || `Disclaimer | ${siteTitle}`;
      description = getField(settings, 'disclaimer_meta_description') || `Read the official disclaimer regarding the content and apps on ${siteTitle}.`;
    } else if (cleanPathLower === '/responsibility') {
      title = getField(settings, 'responsibility_meta_title') || `Responsible Gaming | ${siteTitle}`;
      description = getField(settings, 'responsibility_meta_description') || `Information and resources for responsible gaming and app usage on ${siteTitle}.`;
    } else if (cleanPathLower === '/developers') {
      title = getField(settings, 'developers_meta_title') || `Developer Profiles | ${siteTitle}`;
      description = getField(settings, 'developers_meta_description') || `Browse profiles of top app developers featured on ${siteTitle}.`;
    }
  } else if (cleanPathLower.startsWith('/info/') || cleanPathLower.startsWith('/moreinfo/') || cleanPathLower.startsWith('/moredetail/') || cleanPathLower.startsWith('/gateway/') || cleanPathLower.startsWith('/download/')) {
    const parts = cleanPathLower.split('/');
    const slug = parts[parts.length - 1];
    const app = resolveAppSlug(slug, apps);
    if (app) {
      title = `Verification Portal: ${getField(app, 'name')}`;
      description = `Secure application verification portal.`;
      customCanonicalUrl = `https://www.rummydex.com/app/${getField(app, 'slug')}`;
      pageType = 'gateway';
      targetApp = app;
    } else {
      isNotFound = true;
      pageType = '404';
    }
  } else if (cleanPathLower.startsWith('/app/')) {
    const appSlug = cleanPathLower.replace(/^\/app\//, '/').replace(/^\/|\/$/g, '');
    const app = resolveAppSlug(appSlug, apps);
    if (app) {
      title = getField(app, 'seo_title') || getField(app, 'meta_title') || getField(app, 'name');
      description = cleanSeoDescription(getField(app, 'seo_description') || getField(app, 'meta_description') || stripHtml(getField(app, 'description_html')).substring(0, 160));
      customCanonicalUrl = `https://www.rummydex.com/app/${getField(app, 'slug')}`;
      pageType = 'app';
      targetApp = app;
    } else {
      isNotFound = true;
      pageType = '404';
      title = `404 - Page Not Found | ${siteTitle}`;
      description = `The requested page could not be found on ${siteTitle}.`;
    }
  } else {
    const appSlug = cleanPathLower.replace(/^\/|\/$/g, '');
    const app = resolveAppSlug(appSlug, apps) || apps.find((a: any) => getField(a, 'slug')?.toLowerCase() === appSlug);
    const newsItem = news.find((n: any) => getField(n, 'slug')?.toLowerCase() === appSlug);
    const videoItem = videos.find((v: any) => getField(v, 'slug')?.toLowerCase() === appSlug);

    if (app) {
      title = getField(app, 'seo_title') || getField(app, 'meta_title') || getField(app, 'name');
      description = cleanSeoDescription(getField(app, 'seo_description') || getField(app, 'meta_description') || stripHtml(getField(app, 'description_html')).substring(0, 160));
      customCanonicalUrl = `https://www.rummydex.com/app/${getField(app, 'slug')}`;
      pageType = 'app';
      targetApp = app;
    } else if (newsItem) {
      title = getField(newsItem, 'seo_title') || getField(newsItem, 'meta_title') || getField(newsItem, 'title');
      description = getField(newsItem, 'seo_description') || getField(newsItem, 'meta_description') || getField(newsItem, 'description', '').substring(0, 160);
      pageType = 'news';
      targetNews = newsItem;
    } else if (videoItem) {
      title = getField(videoItem, 'seo_title') || getField(videoItem, 'meta_title') || getField(videoItem, 'title');
      description = getField(videoItem, 'seo_description') || getField(videoItem, 'meta_description') || getField(videoItem, 'description', '').substring(0, 160);
      pageType = 'video';
      targetVideo = videoItem;
    } else {
      isNotFound = true;
      pageType = '404';
      title = `404 - Page Not Found | ${siteTitle}`;
      description = `The requested page could not be found on ${siteTitle}.`;
    }
  }

  if (isNotFound) {
    title = `404 - Page Not Found | ${siteTitle}`;
    description = `The requested page ${cleanPath} could not be found on ${siteTitle}.`;
  }

  title = formatPageTitle(title, siteTitle);

  let canonicalPath = urlPath;
  if (pageType === 'app' && targetApp) {
    const appSlug = getField(targetApp, 'slug');
    if (appSlug) {
      canonicalPath = `/app/${appSlug.replace(/^\/+|\/+$/g, '')}`;
    }
  } else if (pageType === 'news' && targetNews) {
    const nSlug = getField(targetNews, 'slug') || getField(targetNews, 'id');
    if (nSlug) {
      canonicalPath = `/news/${nSlug.replace(/^\/+|\/+$/g, '')}`;
    }
  } else if (pageType === 'video' && targetVideo) {
    const vSlug = getField(targetVideo, 'slug') || getField(targetVideo, 'id');
    if (vSlug) {
      canonicalPath = `/videos/${vSlug.replace(/^\/+|\/+$/g, '')}`;
    }
  }

  const canonicalUrl = (pageType === 'app' && targetApp && getField(targetApp, 'slug'))
    ? (getField(targetApp, 'canonical_url') ? getCleanCanonicalUrl(getField(targetApp, 'canonical_url'), canonicalPath) : `https://www.rummydex.com/app/${getField(targetApp, 'slug')}`)
    : getCleanCanonicalUrl(customCanonicalUrl, canonicalPath);

  let pageOgImage = logoUrl;
  if (targetApp) {
    pageOgImage = getField(targetApp, 'og_image_url') || getField(targetApp, 'icon_url') || logoUrl;
  } else if (targetNews) {
    pageOgImage = getField(targetNews, 'og_image_url') || getField(targetNews, 'logo_url') || getField(targetNews, 'image_url') || logoUrl;
  } else if (targetVideo) {
    const ytThumb = getYoutubeThumbnail(getField(targetVideo, 'youtube_url'));
    if (ytThumb) pageOgImage = ytThumb;
  }

  let domain = 'https://www.rummydex.com';
  try {
    domain = canonicalUrl ? new URL(canonicalUrl).origin : 'https://www.rummydex.com';
  } catch (e) {}
  
  if (!pageOgImage) {
    pageOgImage = logoUrl || `${domain}/logo.png`;
  }
  
  pageOgImage = getOgImageUrl(pageOgImage, domain);

  // Generate full pre-rendered semantic HTML directly from database for 100% crawler compatibility
  const preRenderedBody = await getPagePreRender(urlPath, data);

  // Generate Schema.org JSON-LD structured data
  const jsonLdSchema = await buildJsonLdSchema({
    pageType,
    title,
    description,
    url: canonicalUrl,
    logoUrl,
    siteTitle,
    app: targetApp,
    newsItem: targetNews,
    videoItem: targetVideo,
    settings,
    collectionItems,
    breadcrumbItems
  });

  const seoTags = buildMetaTags({
    title,
    description,
    keywords,
    canonicalUrl,
    pageOgImage,
    siteTitle,
    targetApp,
    settings,
    faviconIco,
    favicon32,
    favicon16,
    favicon180,
    jsonLdSchema,
    isNotFound,
    getField,
    pageType
  });

  const initialDataPayload = optimizeInitialDataForRoute(data, cleanPathLower, targetApp, targetNews, targetVideo);
  let initialDataJson = JSON.stringify(initialDataPayload || {}).replace(/</g, '\\u003c');
  
  initialDataJson = initialDataJson.replace(
    /https:\/\/res\.cloudinary\.com\/diewalae4\/image\/upload\/(?:[a-zA-Z0-9_.,-]+\/)*(v\d+\/[a-zA-Z0-9_-]+\.[a-zA-Z]+)/g,
    'https://res.cloudinary.com/diewalae4/image/upload/f_webp,q_auto,w_256,h_256,c_fill/$1'
  );

  const initialDataScript = `<script>window.__INITIAL_DATA__ = ${initialDataJson};</script>`;

  let finalHtml = template
    .replace(/<title>[\s\S]*?<\/title>/gi, '')
    .replace(/<meta\s+[^>]*name=["']description["'][^>]*\/?>/gi, '')
    .replace(/<meta\s+[^>]*name=["']robots["'][^>]*\/?>/gi, '')
    .replace(/<meta\s+[^>]*name=["']keywords["'][^>]*\/?>/gi, '')
    .replace(/<meta\s+[^>]*name=["']application-name["'][^>]*\/?>/gi, '')
    .replace(/<meta\s+[^>]*name=["']color-scheme["'][^>]*\/?>/gi, '')
    .replace(/<meta\s+[^>]*name=["']theme-color["'][^>]*\/?>/gi, '')
    .replace(/<meta\s+[^>]*property=["']og:[^"']+["'][^>]*\/?>/gi, '')
    .replace(/<meta\s+[^>]*name=["']twitter:[^"']+["'][^>]*\/?>/gi, '')
    .replace(/<link\s+[^>]*rel=["']canonical["'][^>]*\/?>/gi, '')
    .replace(/<link\s+[^>]*rel=["']manifest["'][^>]*\/?>/gi, '')
    .replace(/<link\s+[^>]*rel=["']alternate["'][^>]*\/?>/gi, '')
    .replace(/<link\s+[^>]*rel=["']image_src["'][^>]*\/?>/gi, '')
    .replace(/<link\s+[^>]*rel=["'](?:shortcut\s+)?icon["'][^>]*\/?>/gi, '')
    .replace(/<link\s+[^>]*rel=["']apple-touch-icon[^"']*["'][^>]*\/?>/gi, '')
    .replace(/<script\s+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<script>window\.__INITIAL_DATA__[\s\S]*?<\/script>/gi, '');

  const criticalCss = getCriticalCss();
  const headAdditions = `${seoTags}\n${criticalCss ? criticalCss + '\n' : ''}${initialDataScript}`;

  if (finalHtml.includes('</head>')) {
    finalHtml = finalHtml.replace('</head>', `${headAdditions}\n</head>`);
  } else {
    finalHtml = `${headAdditions}\n${finalHtml}`;
  }

  // High-performance server-side semantic HTML injection:
  // For Search Engine Bots & Crawlers (Googlebot, Bingbot, Ahrefs, Semrush, Twitterbot, WhatsApp, etc.):
  // Injects full semantic HTML directly inside #root so crawlers index 100% of reviews, ratings, and schema immediately.
  // For Real Human Visitors:
  // Keeps #root clean so React SPA mounts seamlessly with window.__INITIAL_DATA__ with ZERO layout shifts,
  // ZERO flickering, and eliminates the jarring raw HTML buffering flash shown in mobile browsers.
  // Non-JS clients still receive 100% content via <noscript>.
  const isBot = isBotUserAgent(userAgent);
  if (preRenderedBody) {
    if (isBot) {
      if (finalHtml.includes('<div id="root"></div>')) {
        finalHtml = finalHtml.replace('<div id="root"></div>', () => `<div id="root">${preRenderedBody}</div>`);
      } else {
        finalHtml = finalHtml.replace(/<div\s+id="root"[^>]*>[\s\S]*?<\/div>/i, () => `<div id="root">${preRenderedBody}</div>`);
      }
    } else {
      const noscriptFallback = `<noscript><div class="seo-crawler-content">${preRenderedBody}</div></noscript>`;
      if (finalHtml.includes('</body>')) {
        finalHtml = finalHtml.replace('</body>', `${noscriptFallback}\n</body>`);
      } else {
        finalHtml = `${finalHtml}\n${noscriptFallback}`;
      }
    }
  }

  return { html: finalHtml, isNotFound, canonicalUrl, pageType, title, description };
}
