import fs from 'fs';
import path from 'path';
import { getSafeFirebaseConfig } from './seo/firebaseConfig';
import { syncFromFirestore } from './seo/sync';
import { getField, stripHtml } from './seo/utils';
import * as renderers from './seo/renderers';

// Dynamically resolve staticData to bypass TSX watcher
const getStaticData = () => {
  try {
    const staticDataModulePath = "./lib/staticData";
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

export { getField, getSafeFirebaseConfig, syncFromFirestore };

async function doFetchStoreData() {
  const now = Date.now();
  const freshStatic = getStaticData();

  const publicBackupPath = path.join(process.cwd(), 'src/lib/public_backup.json');
  if (fs.existsSync(publicBackupPath)) {
    try {
      const backup = JSON.parse(fs.readFileSync(publicBackupPath, 'utf8'));
      if (backup.apps && backup.apps.length > 0) {
        const data = {
          apps: backup.apps || [],
          settings: backup.settings || {},
          news: (backup.news && backup.news.length > 0) ? backup.news : (freshStatic.mockNews || []),
          blogs: (backup.blogs && backup.blogs.length > 0) ? backup.blogs : (freshStatic.mockBlogs || []),
          videos: (backup.videos && backup.videos.length > 0) ? backup.videos : (freshStatic.mockVideos || [])
        };
        cachedData = data;
        lastFetchTime = now;
        return data;
      }
    } catch (e) {
      console.error("Error reading public_backup.json in seoHelper:", e);
    }
  }

  const synced = await syncFromFirestore();
  if (synced) {
    if ((!synced.news || synced.news.length === 0) && freshStatic.mockNews?.length > 0) {
      synced.news = freshStatic.mockNews;
    }
    if ((!synced.blogs || synced.blogs.length === 0) && freshStatic.mockBlogs?.length > 0) {
      synced.blogs = freshStatic.mockBlogs;
    }
    if ((!synced.videos || synced.videos.length === 0) && freshStatic.mockVideos?.length > 0) {
      synced.videos = freshStatic.mockVideos;
    }
    cachedData = synced;
    lastFetchTime = now;
    return synced;
  }

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
  const { apps, settings, news, blogs, videos } = data;
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

  if (cleanPathLower === '/' || cleanPathLower === '') {
    bodyContent = renderers.renderHome(apps, settings, news, blogs, videos);
  } else if (cleanPathLower === '/new-apps') {
    bodyContent = renderers.renderNewApps(apps, settings);
  } else if (cleanPathLower.startsWith('/s/')) {
    const slug = cleanPath.split('/s/')[1];
    bodyContent = renderers.renderGateway(slug, apps, settings);
  } else if (cleanPathLower === '/news') {
    bodyContent = renderers.renderNewsList(news, settings);
  } else if (cleanPathLower.startsWith('/news/')) {
    const slug = cleanPath.split('/news/')[1];
    bodyContent = renderers.renderNewsDetail(slug, news, settings);
  } else if (cleanPathLower === '/videos') {
    bodyContent = renderers.renderVideosList(videos, settings);
  } else if (cleanPathLower.startsWith('/videos/')) {
    const slug = cleanPath.split('/videos/')[1];
    bodyContent = renderers.renderVideoDetail(slug, videos, settings);
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
  } else {
    const possibleSlug = cleanPathLower.replace(/^\/app\//, '/').replace(/^\/|\/$/g, '');
    if (apps.some((a: any) => a.slug?.toLowerCase() === possibleSlug)) {
      bodyContent = renderers.renderAppDetails(possibleSlug, apps, settings);
    } else if (news.some((n: any) => n.slug?.toLowerCase() === possibleSlug)) {
      bodyContent = renderers.renderNewsDetail(possibleSlug, news, settings);
    } else if (blogs.some((b: any) => b.slug?.toLowerCase() === possibleSlug)) {
      bodyContent = renderers.renderBlogDetail(possibleSlug, blogs, settings);
    } else if (videos.some((v: any) => v.slug?.toLowerCase() === possibleSlug)) {
      bodyContent = renderers.renderVideoDetail(possibleSlug, videos, settings);
    } else {
      bodyContent = renderers.renderHome(apps, settings, news, blogs, videos);
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

export interface SeoInjectionResult {
  html: string;
  isNotFound: boolean;
}

export async function injectSeoTags(template: string, urlPath: string, hostUrl?: string, userAgent: string = ''): Promise<SeoInjectionResult> {
  let data = await fetchStoreData();
  if (!data || !data.settings) return { html: template, isNotFound: false };

  const apps = data.apps || [];
  const settings = data.settings || {};
  const news = data.news || [];
  const blogs = data.blogs || [];
  const videos = data.videos || [];
  const siteTitle = getField(settings, 'site_title') || 'Application Store';
  let title = siteTitle;
  let description = getField(settings, 'meta_description', '');
  if (!description) description = "A premium digital platform for applications and tools.";
  
  let keywords = getField(settings, 'seo_keywords', '');
  if (!keywords) keywords = "app clearance, premium applications, digital tools, platform, tech specs, verified apps";
  
  if (keywords) {
    const keywordArray = keywords.split(',').map((k: string) => k.trim()).filter(Boolean);
    if (keywordArray.length > 15) keywords = keywordArray.slice(0, 15).join(', ');
  }

  const logoUrl = getField(settings, 'logo_url') || '/logo.png';
  const cleanPath = urlPath.split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';
  const cleanPathLower = cleanPath.toLowerCase();

  let isAppPage = false;
  let isNewsPage = false;
  let isBlogPage = false;
  let isVideoPage = false;
  let isNotFound = false;

  const currentUrl = hostUrl ? `${hostUrl}${urlPath}` : urlPath;

  if (cleanPathLower === '/' || cleanPathLower === '') {
    // Home page, default title and description apply
  } else if (cleanPathLower.startsWith('/admin') || cleanPathLower.startsWith('/masterworld')) {
    title = `Admin Panel | Masterworld`;
    description = `Masterworld Admin Control Dashboard`;
  } else if (cleanPathLower === '/new-apps') {
    title = `New Additions | ${siteTitle}`;
    description = `Explore the latest verified client lists on ${siteTitle}.`;
  } else if (cleanPathLower.startsWith('/s/')) {
    const slug = cleanPath.split('/s/')[1];
    const app = apps.find((a: any) => getField(a, 'slug').toLowerCase() === slug);
    if (app) {
      title = `Download ${getField(app, 'name')} | ${siteTitle}`;
      description = `Secure download link for ${getField(app, 'name')}.`;
    } else {
      isNotFound = true;
    }
  } else if (cleanPathLower === '/news') {
    title = `News & Updates | ${siteTitle}`;
    description = `The latest gaming news, reports, and transparency updates.`;
  } else if (cleanPathLower === '/blogs') {
    title = `Strategy Guides | ${siteTitle}`;
    description = `Comprehensive strategy guides and analysis for popular clients.`;
  } else if (cleanPathLower === '/videos') {
    title = `Video Reviews | ${siteTitle}`;
    description = `Watch deep-dive reviews and gameplay analysis.`;
  } else if (cleanPathLower.startsWith('/news/')) {
    const slug = cleanPath.split('/news/')[1];
    const newsItem = news.find((n: any) => getField(n, 'slug').toLowerCase() === slug);
    if (newsItem) {
      title = `${getField(newsItem, 'title')} | ${siteTitle}`;
      description = getField(newsItem, 'description', '').substring(0, 160);
      isNewsPage = true;
    } else {
      isNotFound = true;
    }
  } else if (cleanPathLower.startsWith('/blog/')) {
    const slug = cleanPath.split('/blog/')[1];
    const blogItem = blogs.find((b: any) => getField(b, 'slug').toLowerCase() === slug);
    if (blogItem) {
      title = `${getField(blogItem, 'title')} | ${siteTitle}`;
      description = getField(blogItem, 'excerpt') || stripHtml(getField(blogItem, 'content')).substring(0, 160);
      isBlogPage = true;
    } else {
      isNotFound = true;
    }
  } else if (cleanPathLower.startsWith('/videos/')) {
    const slug = cleanPath.split('/videos/')[1];
    const videoItem = videos.find((v: any) => getField(v, 'slug').toLowerCase() === slug);
    if (videoItem) {
      title = `${getField(videoItem, 'title')} | ${siteTitle}`;
      description = getField(videoItem, 'description', '').substring(0, 160);
      isVideoPage = true;
    } else {
      isNotFound = true;
    }
  } else if (cleanPathLower === '/about') {
    title = `About Us | ${siteTitle}`;
    description = `Learn about our mission and transparency standards.`;
  } else if (cleanPathLower === '/contact') {
    title = `Contact Support | ${siteTitle}`;
    description = `Get in touch with our team for assistance.`;
  } else if (cleanPathLower === '/privacy') {
    title = `Privacy Policy | ${siteTitle}`;
  } else if (cleanPathLower === '/report-removal') {
    title = `Report & Removal | ${siteTitle}`;
  } else if (cleanPathLower === '/terms') {
    title = `Terms of Service | ${siteTitle}`;

  } else if (cleanPathLower.startsWith('/info/') || cleanPathLower.startsWith('/moreinfo/') || cleanPathLower.startsWith('/moredetail/')) {
    const parts = cleanPathLower.split('/');
    const slug = parts[parts.length - 1];
    const app = apps.find((a: any) => getField(a, 'slug').toLowerCase() === slug);
    if (app) {
      title = `More Info: ${getField(app, 'name')} | ${siteTitle}`;
      description = `Detailed information about ${getField(app, 'name')}.`;
      isAppPage = true;
    } else {
      isNotFound = true;
    }
  } else {
    const appSlug = cleanPathLower.replace(/^\/app\//, '/').replace(/^\/|\/$/g, '');
    const app = apps.find((a: any) => getField(a, 'slug').toLowerCase() === appSlug);
    if (app) {
      title = `${getField(app, 'name')} | ${siteTitle}`;
      description = cleanSeoDescription(getField(app, 'meta_description') || stripHtml(getField(app, 'description_html')).substring(0, 160));
      isAppPage = true;
    } else {
      isNotFound = true;
    }
  }

  const preRendered = await getPagePreRender(urlPath, data);

  const seoTags = `
    <title>${title}</title>
    <meta name="description" content="${description}">
    <meta name="keywords" content="${keywords}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${currentUrl}">
    <meta property="og:image" content="${logoUrl}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${logoUrl}">
    ${(cleanPathLower.startsWith('/info/') || cleanPathLower.startsWith('/moreinfo/') || cleanPathLower.startsWith('/moredetail/')) ? '<meta name="robots" content="noindex">' : ''}
    <link rel="canonical" href="${currentUrl}">
  `;

  let finalHtml = template
    .replace(/<title>.*?<\/title>/i, seoTags)
    .replace(/<div id="root">([\s\S]*?)<\/div>/i, `<div id="root">${preRendered}</div>`);

  return { html: finalHtml, isNotFound };
}
