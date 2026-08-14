import fs from 'fs';
import path from 'path';
import { getSafeFirebaseConfig } from './seo/firebaseConfig';
import { syncFromFirestore } from './seo/sync';
import { getField, stripHtml, getYoutubeThumbnail, ensureAbsoluteUrl, getOgImageUrl, isBotUserAgent, escapeHtml } from './seo/utils';
import * as renderers from './seo/renderers';
import { getCleanCanonicalUrl, formatPageTitle } from './lib/seoUtils';

// Dynamically resolve staticData to bypass TSX watcher
const getStaticData = () => {
  try {
    const staticDataModulePath = path.join(process.cwd(), 'src/lib/staticData');
    return require(staticDataModulePath);
  } catch (e) {
    return { mockApps: [], mockSettings: {}, mockNews: [], mockBlogs: [], mockVideos: [] };
  }
};

const staticData = getStaticData();
const mockApps = staticData.mockApps || [];
const mockSettings = staticData.mockSettings || {};
const mockNews = staticData.mockNews || [];
const mockBlogs = staticData.mockBlogs || [];
const mockVideos = staticData.mockVideos || [];

let cachedData: any = null;
let lastFetchTime = 0;
const CACHE_TTL = 15000; // 15 seconds
let isFetchingStoreData = false;

export const SLUG_ALIAS_MAP: Record<string, string> = {
  '567-slots': 'share-slots',
  '777-rummy': '777-game',
  'ind-club': 'jaiho-91',
  'gogo-rummy': 'love-rummy',
  'uno': 'rummy-ludo',
  'slots': 'jaiho-slots',
  'arcade': 'yono-arcade',
  'vip': 'yono-vip'
};

export function resolveAppSlug(rawSlug: string, appsList: any[]): any | null {
  if (!rawSlug) return null;
  let clean = decodeURIComponent(rawSlug).replace(/^\/+|\/+$/g, '').toLowerCase().trim();
  clean = clean.replace(/[-_]+$/g, ''); // Strip trailing hyphens like "uno-" -> "uno"

  if (!clean) return null;

  // 1. Direct slug match
  let matched = appsList.find((a: any) => getField(a, 'slug')?.toLowerCase() === clean);
  if (matched) return matched;

  // 2. Alias match
  const aliasTarget = SLUG_ALIAS_MAP[clean];
  if (aliasTarget) {
    matched = appsList.find((a: any) => getField(a, 'slug')?.toLowerCase() === aliasTarget);
    if (matched) return matched;
  }

  // 3. Partial match
  matched = appsList.find((a: any) => {
    const s = getField(a, 'slug')?.toLowerCase();
    return s && (s.includes(clean) || clean.includes(s));
  });

  return matched || null;
}

export { getField, getSafeFirebaseConfig, syncFromFirestore, getOgImageUrl };

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
        blogs: Array.isArray(backup.blogs) ? backup.blogs : (freshStatic.mockBlogs || []),
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
    blogs: freshStatic.mockBlogs || [],
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
  const { apps = [], settings = {}, news = [], blogs = [], videos = [], developers = [] } = data || {};
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
  } else if (cleanPathLower === '/blogs') {
    bodyContent = renderers.renderBlogsList(blogs, settings);
  } else if (cleanPathLower.startsWith('/blog/') || cleanPathLower.startsWith('/blogs/') || cleanPathLower.startsWith('/article/')) {
    const parts = cleanPath.split('/');
    const slug = parts[parts.length - 1];
    const item = (blogs || []).find((b: any) => getField(b, 'slug')?.toLowerCase() === slug.toLowerCase() || getField(b, 'id')?.toLowerCase() === slug.toLowerCase());
    bodyContent = item ? renderers.renderBlogDetail(slug, blogs, settings) : renderers.render404(urlPath, settings);
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
  } else if (cleanPathLower.startsWith('/info/') || cleanPathLower.startsWith('/moreinfo/') || cleanPathLower.startsWith('/moredetail/')) {
    const parts = cleanPathLower.split('/');
    const slug = parts[parts.length - 1];
    const app = apps.find((a: any) => getField(a, 'slug').toLowerCase() === slug.toLowerCase());
    bodyContent = app ? renderers.renderAppDetails(slug, apps, settings) : renderers.render404(urlPath, settings);
  } else {
    const possibleSlug = cleanPathLower.replace(/^\/app\//, '/').replace(/^\/|\/$/g, '');
    const app = apps.find((a: any) => getField(a, 'slug')?.toLowerCase() === possibleSlug);
    const newsItem = news.find((n: any) => getField(n, 'slug')?.toLowerCase() === possibleSlug);
    const blogItem = (blogs || []).find((b: any) => getField(b, 'slug')?.toLowerCase() === possibleSlug || getField(b, 'id')?.toLowerCase() === possibleSlug);
    const videoItem = videos.find((v: any) => getField(v, 'slug')?.toLowerCase() === possibleSlug);

    if (app) {
      bodyContent = renderers.renderAppDetails(possibleSlug, apps, settings);
    } else if (newsItem) {
      bodyContent = renderers.renderNewsDetail(possibleSlug, news, settings);
    } else if (blogItem) {
      bodyContent = renderers.renderBlogDetail(possibleSlug, blogs, settings);
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
  pageType: 'home' | 'app' | 'news' | 'blog' | 'video' | 'static' | '404';
  title: string;
  description: string;
  url: string;
  logoUrl: string;
  siteTitle: string;
  app?: any;
  newsItem?: any;
  blogItem?: any;
  videoItem?: any;
  settings?: any;
}): string {
  const schemas: any[] = [];

  const hostOrigin = params.url.startsWith('http') ? params.url : `https://${params.url}`;

  if (params.pageType !== '404') {
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
      const faqList = params.settings.website_faqs.map((faq: any) => ({
        "@type": "Question",
        "name": getField(faq, 'question'),
        "acceptedAnswer": {
          "@type": "Answer",
          "text": stripHtml(getField(faq, 'answer'))
        }
      }));
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
    const category = getField(app, 'category') || 'GameApplication';
    const realRating = parseFloat(getField(app, 'rating'));
    const realCount = parseInt(getField(app, 'review_count'), 10);
    const appLogo = getOgImageUrl(getField(app, 'og_image_url') || getField(app, 'icon_url') || params.logoUrl, hostOrigin);
    const desc = getField(app, 'seo_description') || getField(app, 'meta_description') || stripHtml(getField(app, 'description_html')) || params.description;

    const softwareAppSchema: any = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": name,
      "operatingSystem": "Android, iOS",
      "applicationCategory": category,
      "image": appLogo,
      "logo": appLogo,
      "description": desc,
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "INR"
      }
    };

    if (!isNaN(realRating) && realRating > 0 && !isNaN(realCount) && realCount > 0) {
      softwareAppSchema["aggregateRating"] = {
        "@type": "AggregateRating",
        "ratingValue": realRating.toString(),
        "ratingCount": realCount.toString(),
        "bestRating": "5",
        "worstRating": "1"
      };
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
        "url": appLogo,
        "contentUrl": appLogo
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
          "name": name,
          "item": `${hostOrigin}/app/${getField(app, 'slug')}`
        }
      ]
    });

    if (app.faqs && Array.isArray(app.faqs) && app.faqs.length > 0) {
      const faqList = app.faqs.map((faq: any) => ({
        "@type": "Question",
        "name": getField(faq, 'question'),
        "acceptedAnswer": {
          "@type": "Answer",
          "text": getField(faq, 'answer')
        }
      }));
      schemas.push({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqList
      });
    }
  } else if (params.pageType === 'blog' && params.blogItem) {
    const blog = params.blogItem;
    const title = getField(blog, 'title');
    const desc = getField(blog, 'seo_description') || getField(blog, 'description') || getField(blog, 'content', '').substring(0, 160) || params.description;
    const datePublished = getField(blog, 'publish_date') || getField(blog, 'published_at') || getField(blog, 'created_at') || new Date().toISOString();
    const authorName = getField(blog, 'author') || params.siteTitle;
    const cover = getField(blog, 'cover_url') || getField(blog, 'thumbnail_url') || params.logoUrl;
    const coverUrl = getOgImageUrl(cover, hostOrigin);
    const blogSlug = getField(blog, 'slug') || getField(blog, 'id');

    schemas.push({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": title,
      "description": desc,
      "image": [coverUrl],
      "datePublished": datePublished,
      "dateModified": datePublished,
      "author": {
        "@type": "Person",
        "name": authorName
      },
      "publisher": {
        "@type": "Organization",
        "name": params.siteTitle,
        "logo": {
          "@type": "ImageObject",
          "url": params.logoUrl
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `${hostOrigin}/blog/${blogSlug}`
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
          "name": "Guides & Articles",
          "item": `${hostOrigin}/blogs`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": title,
          "item": `${hostOrigin}/blog/${blogSlug}`
        }
      ]
    });
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
    const rawFaqs = params.settings.global_faqs || params.settings.website_faqs;
    if (Array.isArray(rawFaqs) && rawFaqs.length > 0) {
      const globalFaqs = rawFaqs.map((faq: any) => ({
        "@type": "Question",
        "name": getField(faq, 'question'),
        "acceptedAnswer": {
          "@type": "Answer",
          "text": getField(faq, 'answer')
        }
      }));
      if (globalFaqs.length > 0) {
        schemas.push({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": globalFaqs
        });
      }
    }
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
  const blogs = data.blogs || [];
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
  let logoUrl = getField(settings, 'logo_url') || CLOUDINARY_ICON;
  const faviconUrl = getField(settings, 'favicon_url') || CLOUDINARY_ICON;
  const cleanPath = urlPath.split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';
  const cleanPathLower = cleanPath.toLowerCase();

  let isNotFound = false;
  let customCanonicalUrl: string | undefined = undefined;
  let pageType: 'home' | 'app' | 'news' | 'blog' | 'video' | 'static' | '404' = 'static';
  let targetApp: any = null;
  let targetNews: any = null;
  let targetBlog: any = null;
  let targetVideo: any = null;

  if (cleanPathLower === '/' || cleanPathLower === '' || cleanPathLower === '/new-apps') {
    pageType = 'home';
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
  } else if (cleanPathLower === '/blogs') {
    title = `App Updates & Walkthrough Guides | ${siteTitle}`;
    description = `Read expert tutorials, gameplay walkthrough guides, and developer release notes.`;
    pageType = 'static';
  } else if (cleanPathLower.startsWith('/blog/') || cleanPathLower.startsWith('/blogs/') || cleanPathLower.startsWith('/article/')) {
    const parts = cleanPath.split('/');
    const slug = parts[parts.length - 1];
    const blogItem = (blogs || []).find((b: any) => getField(b, 'slug')?.toLowerCase() === slug.toLowerCase() || getField(b, 'id')?.toLowerCase() === slug.toLowerCase());
    if (blogItem) {
      title = getField(blogItem, 'seo_title') || `${getField(blogItem, 'title')} | ${siteTitle}`;
      description = getField(blogItem, 'seo_description') || getField(blogItem, 'description') || getField(blogItem, 'content', '').substring(0, 160);
      customCanonicalUrl = getField(blogItem, 'canonical_url');
      pageType = 'blog';
      targetBlog = blogItem;
    } else {
      isNotFound = true;
      pageType = '404';
    }
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
    if (cleanPathLower === '/about') title = `About Us | ${siteTitle}`;
    else if (cleanPathLower === '/contact') title = `Contact Support | ${siteTitle}`;
    else if (cleanPathLower === '/privacy') title = `Privacy Policy | ${siteTitle}`;
    else if (cleanPathLower === '/report-removal') title = `Report & Removal | ${siteTitle}`;
    else if (cleanPathLower === '/terms') title = `Terms of Service | ${siteTitle}`;
    else if (cleanPathLower === '/notice') title = `Notice | ${siteTitle}`;
    else if (cleanPathLower === '/ethics') title = `Ethics & Safety | ${siteTitle}`;
    else if (cleanPathLower === '/disclaimer') title = `Disclaimer | ${siteTitle}`;
    else if (cleanPathLower === '/responsibility') title = `Responsible Gaming | ${siteTitle}`;
    else if (cleanPathLower === '/developers') title = `Developer Profiles | ${siteTitle}`;
  } else if (cleanPathLower.startsWith('/info/') || cleanPathLower.startsWith('/moreinfo/') || cleanPathLower.startsWith('/moredetail/')) {
    const parts = cleanPathLower.split('/');
    const slug = parts[parts.length - 1];
    const app = resolveAppSlug(slug, apps);
    if (app) {
      title = `More Info: ${getField(app, 'name')} | ${siteTitle}`;
      description = `Detailed information about ${getField(app, 'name')}.`;
      customCanonicalUrl = getField(app, 'canonical_url');
      pageType = 'app';
      targetApp = app;
    } else {
      isNotFound = true;
      pageType = '404';
    }
  } else {
    const appSlug = cleanPathLower.replace(/^\/app\//, '/').replace(/^\/|\/$/g, '');
    const app = resolveAppSlug(appSlug, apps);
    const newsItem = news.find((n: any) => getField(n, 'slug')?.toLowerCase() === appSlug || getField(n, 'slug')?.toLowerCase() === appSlug.replace(/[-_]+$/g, ''));
    const blogItem = (blogs || []).find((b: any) => getField(b, 'slug')?.toLowerCase() === appSlug || getField(b, 'id')?.toLowerCase() === appSlug);
    const videoItem = videos.find((v: any) => getField(v, 'slug')?.toLowerCase() === appSlug || getField(v, 'slug')?.toLowerCase() === appSlug.replace(/[-_]+$/g, ''));

    if (app) {
      title = getField(app, 'seo_title') || `${getField(app, 'name')} | ${siteTitle}`;
      description = cleanSeoDescription(getField(app, 'seo_description') || getField(app, 'meta_description') || stripHtml(getField(app, 'description_html')).substring(0, 160));
      customCanonicalUrl = getField(app, 'canonical_url');
      pageType = 'app';
      targetApp = app;
    } else if (newsItem) {
      title = `${getField(newsItem, 'title')} | ${siteTitle}`;
      description = getField(newsItem, 'description', '').substring(0, 160);
      pageType = 'news';
      targetNews = newsItem;
    } else if (blogItem) {
      title = getField(blogItem, 'seo_title') || `${getField(blogItem, 'title')} | ${siteTitle}`;
      description = getField(blogItem, 'seo_description') || getField(blogItem, 'description') || getField(blogItem, 'content', '').substring(0, 160);
      customCanonicalUrl = getField(blogItem, 'canonical_url');
      pageType = 'blog';
      targetBlog = blogItem;
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
  } else if (pageType === 'blog' && targetBlog) {
    const bSlug = getField(targetBlog, 'slug') || getField(targetBlog, 'id');
    if (bSlug) {
      canonicalPath = `/blog/${bSlug.replace(/^\/+|\/+$/g, '')}`;
    }
  }

  const canonicalUrl = getCleanCanonicalUrl(customCanonicalUrl, canonicalPath);

  let pageOgImage = logoUrl;
  if (targetApp) {
    pageOgImage = getField(targetApp, 'og_image_url') || getField(targetApp, 'icon_url') || logoUrl;
  } else if (targetBlog) {
    pageOgImage = getField(targetBlog, 'cover_url') || getField(targetBlog, 'thumbnail_url') || logoUrl;
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
    blogItem: targetBlog,
    videoItem: targetVideo,
    settings
  });

  const isNoIndexPage = isNotFound ||
    cleanPathLower.startsWith('/s/') ||
    cleanPathLower.startsWith('/dl/') ||
    cleanPathLower.startsWith('/out/') ||
    cleanPathLower.startsWith('/gateway/') ||
    cleanPathLower.startsWith('/info/') ||
    cleanPathLower.startsWith('/moreinfo/') ||
    cleanPathLower.startsWith('/moredetail/') ||
    cleanPathLower.startsWith('/admin') ||
    cleanPathLower.startsWith('/login') ||
    cleanPathLower.startsWith('/masterworld');

  const robotsTag = isNoIndexPage 
    ? '<meta data-rh="true" name="robots" content="noindex, nofollow">' 
    : '<meta data-rh="true" name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">';

  const seoTags = `
    <title data-rh="true">${title}</title>
    <meta data-rh="true" name="description" content="${description}">
    <meta data-rh="true" name="keywords" content="${keywords}">
    <meta data-rh="true" name="application-name" content="${siteTitle}">
    <meta data-rh="true" name="color-scheme" content="light dark">
    ${robotsTag}
    <meta data-rh="true" property="og:site_name" content="${siteTitle}">
    <meta data-rh="true" property="og:locale" content="en_IN">
    <meta data-rh="true" property="og:title" content="${title}">
    <meta data-rh="true" property="og:description" content="${description}">
    <meta data-rh="true" property="og:type" content="${pageType === 'blog' || pageType === 'news' ? 'article' : 'website'}">
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
    <link data-rh="true" rel="shortcut icon" href="${faviconUrl}">
    <link data-rh="true" rel="icon" type="image/png" href="${faviconUrl}">
    <link data-rh="true" rel="icon" type="image/png" sizes="32x32" href="${faviconUrl}">
    <link data-rh="true" rel="icon" type="image/png" sizes="192x192" href="${faviconUrl}">
    <link data-rh="true" rel="apple-touch-icon" href="${faviconUrl}">
    <link data-rh="true" rel="apple-touch-icon" sizes="180x180" href="${faviconUrl}">
    <link data-rh="true" rel="apple-touch-icon-precomposed" href="${faviconUrl}">
    <link data-rh="true" rel="manifest" href="/site.webmanifest">
    ${jsonLdSchema}
  `;

  // Optimize initial data payload size by stripping heavy HTML descriptions from non-target apps for ultra-fast page loads
  let initialDataPayload = data;
  if (data && Array.isArray(data.apps)) {
    const targetSlug = targetApp ? getField(targetApp, 'slug')?.toLowerCase() : null;
    const optimizedApps = data.apps.map((app: any) => {
      const isTarget = targetSlug && getField(app, 'slug')?.toLowerCase() === targetSlug;
      if (isTarget) return app; // Keep full details for the target page app

      // Trim heavy HTML strings for list view items
      return {
        id: app.id,
        name: app.name,
        slug: app.slug,
        icon_url: app.icon_url,
        og_image_url: app.og_image_url,
        rating: app.rating,
        category: app.category,
        is_new: app.is_new,
        file_size: app.file_size,
        developer: app.developer,
        safety_status: app.safety_status,
        updated_at: app.updated_at,
        serial_number: app.serial_number,
        is_coming_soon: app.is_coming_soon,
        version: app.version,
        url: app.url,
        encrypted_link: app.encrypted_link,
        yellow_box_msg: app.yellow_box_msg,
        red_box_msg: app.red_box_msg,
        idea_box_msg: app.idea_box_msg,
        seo_description: app.seo_description,
        seo_keywords: app.seo_keywords
      };
    });
    initialDataPayload = { ...data, apps: optimizedApps };
  }

  const initialDataJson = JSON.stringify(initialDataPayload || {}).replace(/</g, '\\u003c');
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

  const isBot = isBotUserAgent(userAgent);
  const loaderStyle = `
    <style id="app-initial-loader-css">
      @keyframes appLoadPulse { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }
      .app-initial-loader { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background-color: #ffffff; color: #18181b; }
      @media (prefers-color-scheme: dark) {
        .app-initial-loader { background-color: #09090b !important; color: #f4f4f5 !important; }
      }
      html.dark .app-initial-loader { background-color: #09090b !important; color: #f4f4f5 !important; }
    </style>
  `;

  // Inject dynamic SEO tags, styles & initial data script cleanly into <head>
  if (finalHtml.includes('</head>')) {
    finalHtml = finalHtml.replace('</head>', `${loaderStyle}\n${seoTags}\n${initialDataScript}\n</head>`);
  } else {
    finalHtml = `${loaderStyle}\n${seoTags}\n${initialDataScript}\n${finalHtml}`;
  }

  // If a search engine crawler or scraper requests the page, serve 100% full semantic SSR markup inside #root
  // If a regular user visits the site, serve a clean, instant theme-matching loader inside #root with <noscript> fallback
  // This completely eliminates the ugly flash of unstyled/dummy content (FOUC) while preserving 100% SEO indexing
  const rootContent = isBot 
    ? preRenderedBody 
    : `
      <div class="app-initial-loader" style="font-family:system-ui,-apple-system,BlinkMacSystemFont,sans-serif;">
        <div style="display:flex;flex-direction:column;align-items:center;gap:14px;transform:translateY(-12px);">
          ${logoUrl ? `<img src="${escapeHtml(logoUrl)}" width="60" height="60" style="width:60px;height:60px;border-radius:18px;object-fit:contain;box-shadow:0 4px 14px rgba(0,0,0,0.06);" alt="${escapeHtml(siteTitle)}"/>` : ''}
          <div style="width:48px;height:3px;background:rgba(120,120,120,0.15);border-radius:999px;overflow:hidden;position:relative;">
            <div style="position:absolute;top:0;left:0;bottom:0;width:50%;background:#dc2626;border-radius:999px;animation:appLoadPulse 1.1s infinite ease-in-out;"></div>
          </div>
        </div>
      </div>
      <noscript>
        ${preRenderedBody}
      </noscript>
    `;

  if (finalHtml.includes('<div id="root"></div>')) {
    finalHtml = finalHtml.replace('<div id="root"></div>', `<div id="root">${rootContent}</div>`);
  } else {
    finalHtml = finalHtml.replace(/<div\s+id="root"[^>]*>[\s\S]*?<\/div>/i, `<div id="root">${rootContent}</div>`);
  }

  return { html: finalHtml, isNotFound, canonicalUrl, pageType, title, description };
}
