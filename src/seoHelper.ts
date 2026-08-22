import fs from 'fs';
import path from 'path';
import { getSafeFirebaseConfig } from './seo/firebaseConfig';
import { syncFromFirestore } from './seo/sync';
import { getField, stripHtml, getYoutubeThumbnail, ensureAbsoluteUrl, getOgImageUrl, isBotUserAgent, escapeHtml, optimizeImageUrl } from './seo/utils';
import * as renderers from './seo/renderers';
import { getCleanCanonicalUrl, formatPageTitle } from './lib/seoUtils';
import { communityStore } from './server/services/communityStoreService';

// Dynamically resolve staticData to bypass TSX watcher
const getStaticData = () => {
  try {
    const staticDataModulePath = path.join(process.cwd(), 'src/lib/staticData');
    return require(staticDataModulePath);
  } catch (e) {
    return { mockApps: [], mockSettings: {}, mockNews: [], mockVideos: [] };
  }
};

const staticData = getStaticData();
const mockApps = staticData.mockApps || [];
const mockSettings = staticData.mockSettings || {};
const mockNews = staticData.mockNews || [];
const mockVideos = staticData.mockVideos || [];

let cachedData: any = null;
let lastFetchTime = 0;
const CACHE_TTL = 15000; // 15 seconds
let isFetchingStoreData = false;

import { resolveAppSlug, SLUG_ALIAS_MAP } from './lib/slugResolver';

export { resolveAppSlug, SLUG_ALIAS_MAP };

export { getField, getSafeFirebaseConfig, syncFromFirestore, getOgImageUrl, getYoutubeThumbnail };

export function clearSeoCache() {
  cachedData = null;
  lastFetchTime = 0;
}

async function doFetchStoreData() {
  const now = Date.now();
  const freshStatic = getStaticData();

  try {
    const fsMod = require('fs'); 
    const pathMod = require('path'); 
    const p = pathMod.join(process.cwd(), 'src/lib/public_backup.json'); 
    const backup = fsMod.existsSync(p) ? JSON.parse(fsMod.readFileSync(p, 'utf8')) : null;
    if (backup) {
      const data = {
        apps: Array.isArray(backup.apps) ? backup.apps : (freshStatic.mockApps || []),
        settings: backup.settings || (freshStatic.mockSettings || {}),
        news: Array.isArray(backup.news) ? backup.news : (freshStatic.mockNews || []),
        videos: Array.isArray(backup.videos) ? backup.videos : (freshStatic.mockVideos || [])
      };
      cachedData = data;
      lastFetchTime = now;
      return data;
    }
  } catch (e) {}

  const data = {
    apps: freshStatic.mockApps || [],
    settings: freshStatic.mockSettings || {},
    news: freshStatic.mockNews || [],
    videos: freshStatic.mockVideos || []
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
    return stripHtml(trimmed).substring(0, 160);
  }
  return trimmed;
}

async function getPagePreRender(urlPath: string, data: any): Promise<string> {
  const { apps = [], settings = {}, news = [], videos = [], developers = [] } = data || {};
  const cleanPath = urlPath.split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';
  const cleanPathLower = cleanPath.toLowerCase();

  if (cleanPathLower.startsWith('/admin') || cleanPathLower.startsWith('/masterworld')) {
    return `
      <div class="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white font-sans">
        <div class="flex flex-col items-center gap-3">
          <div class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span class="text-xs font-mono text-slate-400">Loading Masterworld Admin...</span>
        </div>
      </div>
    `;
  }

  let bodyContent = '';

  if (cleanPathLower === '/' || cleanPathLower === '' || cleanPathLower === '/new-apps') {
    bodyContent = renderers.renderHome(apps, settings, news, videos);
  } else if (cleanPathLower.startsWith('/s/')) {
    const slug = cleanPath.split('/s/')[1];
    const app = apps.find((a: any) => getField(a, 'slug').toLowerCase() === slug.toLowerCase());
    bodyContent = app ? renderers.renderGateway(slug, apps, settings) : renderers.render404(urlPath, settings);
  } else if (cleanPathLower === '/news') {
    bodyContent = renderers.renderNewsList(news, settings);
  } else if (cleanPathLower.startsWith('/news/')) {
    const slug = cleanPath.split('/news/')[1];
    const item = news.find((n: any) => getField(n, 'slug').toLowerCase() === slug.toLowerCase());
    bodyContent = item ? renderers.renderNewsDetail(slug, news, settings) : renderers.render404(urlPath, settings);
  } else if (cleanPathLower === '/videos') {
    bodyContent = renderers.renderVideosList(videos, settings);
  } else if (cleanPathLower.startsWith('/videos/')) {
    const slug = cleanPath.split('/videos/')[1];
    const item = videos.find((v: any) => getField(v, 'slug').toLowerCase() === slug.toLowerCase());
    bodyContent = item ? renderers.renderVideoDetail(slug, videos, settings) : renderers.render404(urlPath, settings);
  } else if (cleanPathLower === '/developers') {
    bodyContent = renderers.renderDevelopersList(developers, settings);
  } else if (cleanPathLower === '/about') {
    bodyContent = renderers.renderAbout(settings);
  } else if (cleanPathLower === '/contact') {
    bodyContent = renderers.renderContact(settings);
  } else if (cleanPathLower === '/privacy') {
    bodyContent = renderers.renderPrivacy(settings);
  } else if (cleanPathLower === '/report-removal') {
    bodyContent = renderers.renderReportRemoval(settings);
  } else if (cleanPathLower === '/terms') {
    bodyContent = renderers.renderTerms(settings);
  } else if (cleanPathLower === '/notice') {
    bodyContent = renderers.renderNotice(settings);
  } else if (cleanPathLower === '/ethics') {
    bodyContent = renderers.renderEthics(settings);
  } else if (cleanPathLower === '/disclaimer') {
    bodyContent = renderers.renderDisclaimer(settings);
  } else if (cleanPathLower === '/responsibility') {
    bodyContent = renderers.renderResponsibility(settings);
  } else if (cleanPathLower.startsWith('/info/') || cleanPathLower.startsWith('/moreinfo/') || cleanPathLower.startsWith('/moredetail/') || cleanPathLower.startsWith('/gateway/') || cleanPathLower.startsWith('/download/')) {
    const parts = cleanPathLower.split('/');
    const slug = parts[parts.length - 1];
    bodyContent = renderers.renderGateway(slug, settings);
  } else if (cleanPathLower.startsWith('/app/')) {
    const possibleSlug = cleanPathLower.replace(/^\/app\//, '/').replace(/^\/|\/$/g, '');
    const app = apps.find((a: any) => getField(a, 'slug')?.toLowerCase() === possibleSlug);
    if (app) {
      bodyContent = renderers.renderAppDetails(possibleSlug, apps, settings);
    } else {
      bodyContent = renderers.render404(urlPath, settings);
    }
  } else {
    const possibleSlug = cleanPathLower.replace(/^\/|\/$/g, '');
    const newsItem = news.find((n: any) => getField(n, 'slug')?.toLowerCase() === possibleSlug);
    const videoItem = videos.find((v: any) => getField(v, 'slug')?.toLowerCase() === possibleSlug);

    if (newsItem) {
      bodyContent = renderers.renderNewsDetail(possibleSlug, news, settings);
    } else if (videoItem) {
      bodyContent = renderers.renderVideoDetail(possibleSlug, videos, settings);
    } else {
      bodyContent = renderers.render404(urlPath, settings);
    }
  }

  const header = renderers.renderHeader(settings);
  const footer = renderers.renderFooter(settings);

  return `
    <div class="flex flex-col min-h-screen">
      ${header}
      <main class="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-1.5 sm:py-3 pb-16 sm:pb-24 overflow-x-hidden relative">
        ${bodyContent}
      </main>
      ${footer}
    </div>
  `;
}

function buildJsonLdSchema(params: {
  pageType: 'home' | 'app' | 'news' | 'video' | 'static' | 'gateway' | '404';
  title: string;
  description: string;
  url: string;
  logoUrl: string;
  siteTitle: string;
  app?: any;
  newsItem?: any;
  videoItem?: any;
  settings?: any;
}): string {
  const schemas: any[] = [];

  let hostOrigin = 'https://www.rummydex.com';
  try {
    const fullUrl = params.url.startsWith('http') ? params.url : `https://${params.url}`;
    hostOrigin = new URL(fullUrl).origin;
  } catch (e) {
    hostOrigin = params.url.startsWith('http') ? params.url : `https://${params.url}`;
  }

  if (params.pageType === 'gateway' || params.pageType === '404') {
    return '';
  }

  schemas.push({
    "@context": "https://schema.org",
    "@type": "WebSite",
      "@id": `${hostOrigin}/#website`,
      "url": hostOrigin,
      "name": params.siteTitle,
      "description": params.description,
      "publisher": {
        "@type": "Organization",
        "@id": `${hostOrigin}/#organization`,
        "name": params.siteTitle,
        "url": hostOrigin,
        "logo": {
          "@type": "ImageObject",
          "url": params.logoUrl
        }
      }
    });

    if (params.settings?.website_faqs && Array.isArray(params.settings.website_faqs) && params.settings.website_faqs.length > 0) {
      const faqList = params.settings.website_faqs
        .filter((faq: any) => getField(faq, 'question')?.trim() && getField(faq, 'answer')?.trim())
        .map((faq: any) => ({
          "@type": "Question",
          "name": stripHtml(getField(faq, 'question')),
          "acceptedAnswer": {
            "@type": "Answer",
            "text": stripHtml(getField(faq, 'answer'))
          }
        }));
      if (faqList.length > 0) {
        schemas.push({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": faqList
        });
      }
    }

  if (params.pageType === 'app' && params.app) {
    const app = params.app;
    const name = getField(app, 'name');
    let category = getField(app, 'category') || 'GameApplication';
    if (!category.includes('Application')) {
      category = 'GameApplication';
    }
    const defaultRating = parseFloat(getField(app, 'rating')) || 0;
    const defaultCount = parseInt(getField(app, 'review_count') || getField(app, 'reviews'), 10) || 0;
    
    // Get live stats from communityStore to ensure real reviews are sent to Googlebot if available
    const liveStats = communityStore.getAppStats(getField(app, 'slug') || getField(app, 'id'), defaultRating);
    
    const ratingVal = liveStats.totalReviews > 0 ? liveStats.averageRating : defaultRating;
    const ratingCountVal = liveStats.totalReviews > 0 ? liveStats.totalReviews : defaultCount;
    const appRawIcon = getField(app, 'icon_url') || getField(app, 'og_image_url') || params.logoUrl;
    const appSquareIcon = optimizeImageUrl(appRawIcon, 512) || appRawIcon;
    const desc = getField(app, 'seo_description') || getField(app, 'meta_description') || stripHtml(getField(app, 'description_html')) || params.description;

    const rawCat = getField(app, 'category');
    const specificCat = rawCat ? rawCat.split(',').map((c: string) => c.trim()).filter((c: string) => c && c.toLowerCase() !== 'all apps' && c.toLowerCase() !== 'all' && c.toLowerCase() !== 'apps' && c.toLowerCase() !== 'general')[0] : '';
    const developer = getField(app, 'developer') || params.siteTitle || 'RummyDex';
    const fileSize = getField(app, 'file_size') || '45 MB';
    const version = getField(app, 'version') || '2.0.6';

    const softwareAppSchema: any = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": name,
      "operatingSystem": "Android",
      "applicationCategory": category,
      "image": appSquareIcon,
      "description": desc,
      "fileSize": fileSize,
      "softwareVersion": version,
      "author": {
        "@type": "Organization",
        "name": developer
      },
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "INR"
      }
    };

    if (ratingCountVal > 0 && ratingVal > 0) {
      softwareAppSchema.aggregateRating = {
        "@type": "AggregateRating",
        "ratingValue": ratingVal.toFixed(1),
        "ratingCount": ratingCountVal.toString(),
        "bestRating": "5",
        "worstRating": "1"
      };
    }

    const appScreenshots = getField(app, 'screenshots');
    if (Array.isArray(appScreenshots) && appScreenshots.length > 0) {
      softwareAppSchema["screenshot"] = appScreenshots.map((s: string) => optimizeImageUrl(s, 1024) || s);
    }

    schemas.push(softwareAppSchema);

    schemas.push({
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${hostOrigin}/app/${getField(app, 'slug')}#webpage`,
      "url": `${hostOrigin}/app/${getField(app, 'slug')}`,
      "name": params.title,
      "description": desc,
      "primaryImageOfPage": {
        "@type": "ImageObject",
        "url": appSquareIcon,
        "contentUrl": appSquareIcon
      }
    });

    const breadcrumbs: any[] = [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": hostOrigin
      }
    ];

    if (specificCat) {
      breadcrumbs.push({
        "@type": "ListItem",
        "position": 2,
        "name": specificCat,
        "item": `${hostOrigin}/?tab=${encodeURIComponent(specificCat)}`
      });
      breadcrumbs.push({
        "@type": "ListItem",
        "position": 3,
        "name": name,
        "item": `${hostOrigin}/app/${getField(app, 'slug')}`
      });
    } else {
      breadcrumbs.push({
        "@type": "ListItem",
        "position": 2,
        "name": name,
        "item": `${hostOrigin}/app/${getField(app, 'slug')}`
      });
    }

    schemas.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbs
    });

    if (app.faqs && Array.isArray(app.faqs) && app.faqs.length > 0) {
      const faqList = app.faqs
        .filter((faq: any) => getField(faq, 'question')?.trim() && getField(faq, 'answer')?.trim())
        .map((faq: any) => ({
          "@type": "Question",
          "name": stripHtml(getField(faq, 'question')),
          "acceptedAnswer": {
            "@type": "Answer",
            "text": stripHtml(getField(faq, 'answer'))
          }
        }));
      if (faqList.length > 0) {
        schemas.push({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": faqList
        });
      }
    }
  } else if (params.pageType === 'news' && params.newsItem) {
    const item = params.newsItem;
    const title = getField(item, 'title');
    const desc = getField(item, 'description') || params.description;
    const datePublished = getField(item, 'created_at') || new Date().toISOString();
    const authorName = getField(item, 'ceo_name', params.siteTitle);

    schemas.push({
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "headline": title,
      "description": desc,
      "image": [params.logoUrl],
      "datePublished": datePublished,
      "dateModified": datePublished,
      "author": {
        "@type": "Organization",
        "name": authorName
      },
      "publisher": {
        "@type": "Organization",
        "name": params.siteTitle,
        "logo": {
          "@type": "ImageObject",
          "url": params.logoUrl
        }
      }
    });

    schemas.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": hostOrigin
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "News",
          "item": `${hostOrigin}/news`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": title,
          "item": `${hostOrigin}/news/${getField(item, 'slug')}`
        }
      ]
    });
  } else if (params.pageType === 'video' && params.videoItem) {
    const v = params.videoItem;
    const youtubeUrl = getField(v, 'youtube_url') || getField(v, 'video_url') || getField(v, 'url');
    schemas.push({
      "@context": "https://schema.org",
      "@type": "VideoObject",
      "name": getField(v, 'title'),
      "description": getField(v, 'description') || getField(v, 'title'),
      "thumbnailUrl": getYoutubeThumbnail(youtubeUrl) || params.logoUrl,
      "uploadDate": getField(v, 'created_at') || new Date().toISOString(),
      "contentUrl": youtubeUrl
    });
    schemas.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": hostOrigin
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Videos",
          "item": `${hostOrigin}/videos`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": getField(v, 'title'),
          "item": `${hostOrigin}/videos/${getField(v, 'slug')}`
        }
      ]
    });
  } else if (params.pageType === 'home' && params.settings) {
    // FAQs are already injected globally, no need to duplicate them here
  }

  return schemas.map(s => `<script type="application/ld+json" data-rh="true">${JSON.stringify(s).replace(/</g, '\\u003c')}</script>`).join('\n');
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
  let data = await fetchStoreData();
  if (!data || !data.settings) return { html: template, isNotFound: false };

  const apps = data.apps || [];
  const settings = data.settings || {};
  const news = data.news || [];
  const videos = data.videos || [];
  const developers = data.developers || [];
  const siteTitle = getField(settings, 'site_title') || 'RummyDex';
  let title = siteTitle;
  let description = getField(settings, 'meta_description', '');
  if (!description) description = "A transparency platform and directory for verified applications.";
  
  let keywords = getField(settings, 'seo_keywords', '');
  if (!keywords) keywords = "app clearance, premium applications, digital tools, platform, tech specs, verified apps";
  
  if (keywords) {
    const keywordArray = keywords.split(',').map((k: string) => k.trim()).filter(Boolean);
    if (keywordArray.length > 15) keywords = keywordArray.slice(0, 15).join(', ');
  }

  const CLOUDINARY_ICON = 'https://res.cloudinary.com/diewalae4/image/upload/v1786624142/1000134293_sbicyb.png';
  let rawLogoUrl = getField(settings, 'logo_url') || CLOUDINARY_ICON;
  const faviconUrl = getField(settings, 'favicon_url') || CLOUDINARY_ICON;
  
  const getFaviconWithSize = (url: string, size: number) => {
    if (!url) return '';
    if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
      return url.replace(/\/upload\/(?:[a-zA-Z0-9_.,-]+\/)*(v\d+\/)/, `/upload/f_png,q_auto,w_${size},h_${size},c_fill/$1`);
    }
    return url;
  };
  const favicon32 = getFaviconWithSize(faviconUrl, 32);
  const favicon180 = getFaviconWithSize(faviconUrl, 180);
  const favicon192 = getFaviconWithSize(faviconUrl, 192);
  
  // Use a properly sized square logo for JSON-LD schemas to prevent raw image pre-fetches
  let logoUrl = getFaviconWithSize(rawLogoUrl, 512);

  const cleanPath = urlPath.split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';
  const cleanPathLower = cleanPath.toLowerCase();

  let isNotFound = false;
  let customCanonicalUrl: string | undefined = undefined;
  let pageType: 'home' | 'app' | 'news' | 'video' | 'static' | 'gateway' | '404' = 'static';
  let targetApp: any = null;
  let targetNews: any = null;
  let targetVideo: any = null;

  if (cleanPathLower === '/' || cleanPathLower === '' || cleanPathLower === '/new-apps') {
    pageType = 'home';
    title = 'Official App Hub & Transparency Directory';
  } else if (cleanPathLower.startsWith('/admin') || cleanPathLower.startsWith('/masterworld')) {
    title = `Admin Panel | Masterworld`;
    description = `Masterworld Admin Control Dashboard`;
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
    title = `News & Updates | ${siteTitle}`;
    description = `The latest gaming news, reports, and transparency updates.`;
    pageType = 'static';
  } else if (cleanPathLower === '/videos') {
    title = `Video Reviews | ${siteTitle}`;
    description = `Watch deep-dive reviews and gameplay analysis.`;
    pageType = 'static';
  } else if (cleanPathLower.startsWith('/news/')) {
    const slug = cleanPath.split('/news/')[1];
    const newsItem = news.find((n: any) => getField(n, 'slug').toLowerCase() === slug);
    if (newsItem) {
      title = `${getField(newsItem, 'title')} | ${siteTitle}`;
      description = getField(newsItem, 'description', '').substring(0, 160);
      customCanonicalUrl = getField(newsItem, 'canonical_url');
      pageType = 'news';
      targetNews = newsItem;
    } else {
      isNotFound = true;
      pageType = '404';
    }
  } else if (cleanPathLower.startsWith('/videos/')) {
    const slug = cleanPath.split('/videos/')[1];
    const videoItem = videos.find((v: any) => getField(v, 'slug').toLowerCase() === slug);
    if (videoItem) {
      title = `${getField(videoItem, 'title')} | ${siteTitle}`;
      description = getField(videoItem, 'description', '').substring(0, 160);
      pageType = 'video';
      targetVideo = videoItem;
    } else {
      isNotFound = true;
      pageType = '404';
    }
  } else if (['/about', '/contact', '/privacy', '/report-removal', '/terms', '/notice', '/ethics', '/disclaimer', '/responsibility', '/developers'].includes(cleanPathLower)) {
    pageType = 'static';
    if (cleanPathLower === '/about') { title = `About Us | ${siteTitle}`; description = `Learn more about ${siteTitle}, our mission, and our dedicated team.`; }
    else if (cleanPathLower === '/contact') { title = `Contact Support | ${siteTitle}`; description = `Get in touch with ${siteTitle} support for any queries or assistance.`; }
    else if (cleanPathLower === '/privacy') { title = `Privacy Policy | ${siteTitle}`; description = `Read the Privacy Policy of ${siteTitle} to understand how we protect your data.`; }
    else if (cleanPathLower === '/report-removal') { title = `Report & Removal | ${siteTitle}`; description = `Report content or request removal of specific applications on ${siteTitle}.`; }
    else if (cleanPathLower === '/terms') { title = `Terms of Service | ${siteTitle}`; description = `Review the Terms of Service and usage guidelines for ${siteTitle}.`; }
    else if (cleanPathLower === '/notice') { title = `Legal Notice | ${siteTitle}`; description = `Important legal notices and compliance information for ${siteTitle}.`; }
    else if (cleanPathLower === '/ethics') { title = `Ethics & Safety | ${siteTitle}`; description = `Our commitment to ethics, safety, and transparent reviews at ${siteTitle}.`; }
    else if (cleanPathLower === '/disclaimer') { title = `Disclaimer | ${siteTitle}`; description = `Read the official disclaimer regarding the content and apps on ${siteTitle}.`; }
    else if (cleanPathLower === '/responsibility') { title = `Responsible Gaming | ${siteTitle}`; description = `Information and resources for responsible gaming and app usage on ${siteTitle}.`; }
    else if (cleanPathLower === '/developers') { title = `Developer Profiles | ${siteTitle}`; description = `Browse profiles of top app developers featured on ${siteTitle}.`; }
  } else if (cleanPathLower.startsWith('/info/') || cleanPathLower.startsWith('/moreinfo/') || cleanPathLower.startsWith('/moredetail/') || cleanPathLower.startsWith('/gateway/') || cleanPathLower.startsWith('/download/')) {
    const parts = cleanPathLower.split('/');
    const slug = parts[parts.length - 1];
    const app = resolveAppSlug(slug, apps);
    if (app) {
      title = `Verification Portal: ${getField(app, 'name')} | ${siteTitle}`;
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
      title = getField(app, 'seo_title') || `${getField(app, 'name')} - Features, Specs & Review | ${siteTitle}`;
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
    const newsItem = news.find((n: any) => getField(n, 'slug')?.toLowerCase() === appSlug || getField(n, 'slug')?.toLowerCase() === appSlug.replace(/[-_]+$/g, ''));
    const videoItem = videos.find((v: any) => getField(v, 'slug')?.toLowerCase() === appSlug || getField(v, 'slug')?.toLowerCase() === appSlug.replace(/[-_]+$/g, ''));

    if (newsItem) {
      title = `${getField(newsItem, 'title')} | ${siteTitle}`;
      description = getField(newsItem, 'description', '').substring(0, 160);
      pageType = 'news';
      targetNews = newsItem;
    } else if (videoItem) {
      title = `${getField(videoItem, 'title')} | ${siteTitle}`;
      description = getField(videoItem, 'description', '').substring(0, 160);
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
    ? `https://www.rummydex.com/app/${getField(targetApp, 'slug')}`
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
  
  if (!pageOgImage || pageOgImage.includes('1000132678_1_ro1ftj') || pageOgImage.includes('ezgif-64180dd8ca74703b') || pageOgImage.includes('ezgif-88d07abd3ef5753f_yz8ytg') || pageOgImage.includes('ezgif-8cbbc4a0aaeb367e_s4k2nb') || pageOgImage.includes('1000134161_11zon_fgqzz6')) {
    pageOgImage = `${domain}/logo.png`;
  }
  
  pageOgImage = getOgImageUrl(pageOgImage, domain);

  // Generate full pre-rendered HTML for search engine crawlers (H1, H2, body content)
  const preRenderedBody = await getPagePreRender(urlPath, data);

  // Generate Schema.org JSON-LD structured data
  const jsonLdSchema = buildJsonLdSchema({
    pageType,
    title,
    description,
    url: canonicalUrl,
    logoUrl,
    siteTitle,
    app: targetApp,
    newsItem: targetNews,
    videoItem: targetVideo,
    settings
  });

  // Ensure meta description is clean and within 160 characters for Google SERP
  if (description) {
    description = stripHtml(description).replace(/\s+/g, ' ').trim();
    if (description.length > 160) {
      const truncated = description.substring(0, 157);
      const lastSpace = truncated.lastIndexOf(' ');
      description = (lastSpace > 100 ? truncated.substring(0, lastSpace) : truncated) + '...';
    }
  }

  const isNoIndexPage = isNotFound ||
    cleanPathLower.startsWith('/s/') ||
    cleanPathLower.startsWith('/dl/') ||
    cleanPathLower.startsWith('/out/') ||
    cleanPathLower.startsWith('/gateway/') ||
    cleanPathLower.startsWith('/info/') ||
    cleanPathLower.startsWith('/moreinfo/') ||
    cleanPathLower.startsWith('/moredetail/') ||
    cleanPathLower.startsWith('/download/') ||
    cleanPathLower.startsWith('/admin') ||
    cleanPathLower.startsWith('/login') ||
    cleanPathLower.startsWith('/masterworld');

  const robotsTag = isNoIndexPage 
    ? '<meta data-rh="true" name="robots" content="noindex, nofollow, noarchive, nosnippet, noimageindex, notranslate">\n    <meta data-rh="true" name="googlebot" content="noindex, nofollow, noarchive, nosnippet, noimageindex, notranslate">\n    <meta data-rh="true" name="bingbot" content="noindex, nofollow, noarchive, nosnippet, noimageindex, notranslate">\n    <meta data-rh="true" name="slurp" content="noindex, nofollow, noarchive, nosnippet">\n    <meta data-rh="true" name="baiduspider" content="noindex, nofollow, noarchive, nosnippet">\n    <meta data-rh="true" name="yandex" content="noindex, nofollow, noarchive, nosnippet">\n    <meta data-rh="true" name="duckduckbot" content="noindex, nofollow, noarchive, nosnippet">' 
    : '<meta data-rh="true" name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">';

  const seoTags = `
    <title>${title}</title>
    <meta name="description" content="${description}">
    <meta data-rh="true" name="keywords" content="${keywords}">
    <meta data-rh="true" name="application-name" content="${siteTitle}">
    <meta data-rh="true" name="color-scheme" content="light dark">
    ${robotsTag}
    <meta data-rh="true" property="og:site_name" content="${siteTitle}">
    <meta data-rh="true" property="og:locale" content="en_IN">
    <meta data-rh="true" property="og:title" content="${title}">
    <meta data-rh="true" property="og:description" content="${description}">
    <meta data-rh="true" property="og:type" content="${pageType === 'news' ? 'article' : 'website'}">
    <meta data-rh="true" property="og:url" content="${canonicalUrl}">
    <meta data-rh="true" property="og:image" content="${pageOgImage}">
    <meta data-rh="true" property="og:image:secure_url" content="${pageOgImage}">
    <meta data-rh="true" property="og:image:type" content="${pageOgImage.includes('.jpg') || pageOgImage.includes('f_jpg') ? 'image/jpeg' : 'image/png'}">
    <meta data-rh="true" property="og:image:width" content="1200">
    <meta data-rh="true" property="og:image:height" content="630">
    <meta data-rh="true" name="twitter:card" content="summary_large_image">
    <meta data-rh="true" name="twitter:site" content="@RummyDex">
    <meta data-rh="true" name="twitter:creator" content="@RummyDex">
    <meta data-rh="true" name="twitter:title" content="${title}">
    <meta data-rh="true" name="twitter:description" content="${description}">
    <meta data-rh="true" name="twitter:image" content="${pageOgImage}">
    <link data-rh="true" rel="alternate" type="application/rss+xml" title="RummyDex News" href="/rss.xml">
    <link data-rh="true" rel="image_src" href="${pageOgImage}">
    <link data-rh="true" rel="canonical" href="${canonicalUrl}">
    <link data-rh="true" rel="shortcut icon" href="${favicon32}">
    <link data-rh="true" rel="icon" type="image/png" href="${favicon32}">
    <link data-rh="true" rel="icon" type="image/png" sizes="32x32" href="${favicon32}">
    <link data-rh="true" rel="icon" type="image/png" sizes="192x192" href="${favicon192}">
    <link data-rh="true" rel="apple-touch-icon" href="${favicon180}">
    <link data-rh="true" rel="apple-touch-icon" sizes="180x180" href="${favicon180}">
    <link data-rh="true" rel="apple-touch-icon-precomposed" href="${favicon180}">
    <link data-rh="true" rel="manifest" href="/site.webmanifest">
    ${jsonLdSchema}
  `;

  // Optimize initial data payload size by stripping heavy HTML descriptions and inner app data from non-target apps for ultra-fast page loads
  let initialDataPayload = data;
  if (data) {
    const targetAppSlug = targetApp ? getField(targetApp, 'slug')?.toLowerCase() : null;
    const optimizedApps = Array.isArray(data.apps) ? data.apps.map((app: any) => {
      const sanitizedApp = { ...app };
      delete sanitizedApp.more_information_url;
      delete sanitizedApp.download_url;
      delete sanitizedApp.encrypted_link;
      delete sanitizedApp.url;

      const isTarget = targetAppSlug && getField(app, 'slug')?.toLowerCase() === targetAppSlug;
      if (isTarget) return sanitizedApp;
      return {
        id: sanitizedApp.id,
        name: sanitizedApp.name,
        slug: sanitizedApp.slug,
        icon_url: sanitizedApp.icon_url,
        og_image_url: sanitizedApp.og_image_url,
        category: sanitizedApp.category,
        rating: sanitizedApp.rating,
        review_count: sanitizedApp.review_count,
        developer: sanitizedApp.developer,
        file_size: sanitizedApp.file_size,
        version: sanitizedApp.version,
        is_featured: sanitizedApp.is_featured,
        is_new: sanitizedApp.is_new,
        is_hot: sanitizedApp.is_hot,
        is_top_chart: sanitizedApp.is_top_chart,
        top_chart_category: sanitizedApp.top_chart_category,
        safety_status: sanitizedApp.safety_status,
        is_coming_soon: sanitizedApp.is_coming_soon,
        publish_date: sanitizedApp.publish_date,
        serial_number: sanitizedApp.serial_number,
        tags: sanitizedApp.tags
      };
    }) : [];

    const targetNewsSlug = targetNews ? getField(targetNews, 'slug')?.toLowerCase() : null;
    const optimizedNews = Array.isArray(data.news) ? data.news.map((item: any) => {
      const isTarget = targetNewsSlug && getField(item, 'slug')?.toLowerCase() === targetNewsSlug;
      if (isTarget) return item;
      return {
        id: item.id,
        slug: item.slug,
        title: item.title,
        logo_url: item.logo_url,
        category: item.category,
        published_at: item.published_at,
        date: item.date,
        read_time: item.read_time,
        is_breaking: item.is_breaking,
        is_new: item.is_new,
        is_pinned: item.is_pinned
      };
    }) : [];

    const optimizedVideos = Array.isArray(data.videos) ? data.videos.map((item: any) => {
      const isTarget = targetVideo && (getField(item, 'slug') || getField(item, 'id'))?.toLowerCase() === (getField(targetVideo, 'slug') || getField(targetVideo, 'id'))?.toLowerCase();
      if (isTarget) return item;
      return {
        id: item.id,
        slug: item.slug,
        title: item.title,
        thumbnail_url: item.thumbnail_url,
        video_url: item.video_url,
        duration: item.duration,
        category: item.category
      };
    }) : [];

    const optimizedSettings = data.settings ? { ...data.settings } : {};
    
    // Prune heavy subpage bodies from initial data unless user is actively on that specific page
    if (cleanPathLower !== '/about') {
      delete optimizedSettings.about_us;
      delete optimizedSettings.about_content;
    }
    if (cleanPathLower !== '/contact') {
      delete optimizedSettings.contact_content;
    }
    if (cleanPathLower !== '/privacy') {
      delete optimizedSettings.privacy_content;
    }
    if (cleanPathLower !== '/terms') {
      delete optimizedSettings.terms_content;
    }
    if (cleanPathLower !== '/responsibility') {
      delete optimizedSettings.responsibility_content;
    }
    if (cleanPathLower !== '/report-removal') {
      delete optimizedSettings.report_removal_content;
    }
    if (cleanPathLower !== '/notice') {
      delete optimizedSettings.important_notice;
    }
    if (cleanPathLower !== '/ethics') {
      delete optimizedSettings.ethics_discrimination_text;
    }
    if (cleanPathLower !== '/disclaimer') {
      delete optimizedSettings.disclaimer_text;
    }
    if (cleanPathLower !== '/developers') {
      delete optimizedSettings.developers;
    }
    if (cleanPathLower !== '/faq' && cleanPathLower !== '/') {
      delete optimizedSettings.website_faqs;
    }

    initialDataPayload = { 
      ...data, 
      apps: optimizedApps,
      news: optimizedNews,
      videos: optimizedVideos,
      settings: optimizedSettings
    };
  }

  let initialDataJson = JSON.stringify(initialDataPayload || {}).replace(/</g, '\\u003c');
  
  // Aggressively rewrite raw Cloudinary URLs in the initial data payload to tiny WebP placeholders.
  // This prevents headless bot scanners (like Pingdom) from discovering and pre-fetching unoptimized 16.7KB raw images.
  initialDataJson = initialDataJson.replace(
    /https:\/\/res\.cloudinary\.com\/diewalae4\/image\/upload\/(?:[a-zA-Z0-9_.,-]+\/)*(v\d+\/[a-zA-Z0-9_-]+\.[a-zA-Z]+)/g,
    'https://res.cloudinary.com/diewalae4/image/upload/f_webp,q_auto,w_256,h_256,c_fill/$1'
  );

  const initialDataScript = `<script>window.__INITIAL_DATA__ = ${initialDataJson};</script>`;

  // Clean up default static title & meta tags from template without destroying scripts or stylesheets
  let finalHtml = template
    .replace(/<title>[\s\S]*?<\/title>/gi, '')
    .replace(/<meta\s+name="description"\s+[^>]*\/?>/gi, '')
    .replace(/<meta\s+name="robots"\s+[^>]*\/?>/gi, '')
    .replace(/<meta\s+property="og:[^"]+"\s+[^>]*\/?>/gi, '')
    .replace(/<meta\s+name="twitter:[^"]+"\s+[^>]*\/?>/gi, '')
    .replace(/<link\s+rel="canonical"\s+[^>]*\/?>/gi, '')
    .replace(/<link\s+rel="(?:shortcut\s+)?icon"\s+[^>]*\/?>/gi, '')
    .replace(/<link\s+rel="apple-touch-icon[^"]*"\s+[^>]*\/?>/gi, '');

  // Inject dynamic SEO tags, styles & initial data script cleanly into <head>
  if (finalHtml.includes('</head>')) {
    finalHtml = finalHtml.replace('</head>', `${seoTags}\n${initialDataScript}\n</head>`);
  } else {
    finalHtml = `${seoTags}\n${initialDataScript}\n${finalHtml}`;
  }

  const isBot = isBotUserAgent(userAgent);

  // If a search engine crawler visits the page, serve semantic SSR markup directly inside #root for 100% SEO indexing.
  // For human browser users, keep #root clean with a <noscript> fallback so React mounts the real website immediately without any flash of different interim markup.
  const rootContent = isBot 
    ? preRenderedBody 
    : `<noscript>${preRenderedBody}</noscript>`;

  if (finalHtml.includes('<div id="root"></div>')) {
    finalHtml = finalHtml.replace('<div id="root"></div>', `<div id="root">${rootContent}</div>`);
  } else {
    finalHtml = finalHtml.replace(/<div\s+id="root"[^>]*>[\s\S]*?<\/div>/i, `<div id="root">${rootContent}</div>`);
  }

  return { html: finalHtml, isNotFound, canonicalUrl, pageType, title, description };
}
