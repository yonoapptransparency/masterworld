import { getField } from './utils';
import { resolveAppSlug } from '../lib/slugResolver';
import * as renderers from './renderers/index';
import { getLocalFallbackReviewsForApp } from './reviewFallback';

function wrapWithLayout(bodyContent: string, settings: any): string {
  const headerHtml = renderers.renderHeader(settings);
  const footerHtml = renderers.renderFooter(settings);
  return `
    <div class="min-h-screen flex flex-col bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 font-sans antialiased selection:bg-blue-500 selection:text-white">
      ${headerHtml}
      <main class="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-6 py-4">
        ${bodyContent}
      </main>
      ${footerHtml}
    </div>
  `;
}

export async function getPagePreRender(urlPath: string, data: any): Promise<string> {
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

  let bodyHtml = '';

  if (cleanPathLower === '/' || cleanPathLower === '') {
    bodyHtml = renderers.renderHome(apps, settings, news, videos);
  } else if (cleanPathLower === '/new-apps') {
    const newAppsList = apps.filter((a: any) => {
      const isNew = a.is_new === true || (a.is_new && typeof a.is_new === 'object' && a.is_new.booleanValue === true);
      const isHot = a.is_hot === true || (a.is_hot && typeof a.is_hot === 'object' && a.is_hot.booleanValue === true);
      return isNew || isHot;
    });
    const displayNew = newAppsList.length > 0 ? newAppsList : [...apps].slice(0, 24);
    bodyHtml = renderers.renderNewApps(displayNew, settings);
  } else if (cleanPathLower === '/categories') {
    const catMap = new Map<string, { name: string; slug: string; count: number }>();
    apps.forEach((a: any) => {
      const rawCat = getField(a, 'category', '');
      if (rawCat) {
        rawCat.split(',').forEach((c: string) => {
          const trimmed = c.trim();
          if (trimmed && trimmed.toLowerCase() !== 'all apps' && trimmed.toLowerCase() !== 'all' && trimmed.toLowerCase() !== 'apps' && trimmed.toLowerCase() !== 'general') {
            const slug = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
            if (!catMap.has(slug)) {
              catMap.set(slug, { name: trimmed, slug, count: 1 });
            } else {
              catMap.get(slug)!.count++;
            }
          }
        });
      }
    });
    const categoriesList = Array.from(catMap.values()).sort((a, b) => b.count - a.count);
    bodyHtml = renderers.renderCategoriesList(categoriesList, settings);
  } else if (cleanPathLower.startsWith('/category/') || cleanPathLower.startsWith('/categories/')) {
    const rawCatSlug = cleanPathLower.replace(/^\/(category|categories)\/?/, '').replace(/^\/|\/$/g, '');
    const catName = rawCatSlug
      ? rawCatSlug.split(/[-_]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
      : 'All Categories';
    const categoryApps = apps.filter((a: any) => {
      const cat = getField(a, 'category', '');
      if (!cat) return false;
      const cats = cat.split(',').map((c: string) => c.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''));
      return cats.some((c: string) => c === rawCatSlug || c.includes(rawCatSlug) || rawCatSlug.includes(c));
    });
    bodyHtml = renderers.renderCategory(catName, rawCatSlug, categoryApps, settings);
  } else if (cleanPathLower === '/news') {
    bodyHtml = renderers.renderNewsList(news, settings);
  } else if (cleanPathLower.startsWith('/news/')) {
    const rawNewsSlug = cleanPath.split('/news/')[1] || '';
    const cleanNewsSlug = decodeURIComponent(rawNewsSlug).toLowerCase().trim().replace(/\/+$/, '').split(/[?#]/)[0];
    const newsItem = news.find((n: any) => {
      const nSlug = (getField(n, 'slug') || '').toLowerCase().trim();
      const nId = (getField(n, 'id') || '').toLowerCase().trim();
      return (nSlug && nSlug === cleanNewsSlug) || (nId && nId === cleanNewsSlug);
    });
    if (newsItem) {
      bodyHtml = renderers.renderNewsDetail(cleanNewsSlug, news, settings, apps);
    } else {
      const matchedApp = apps.find((a: any) => {
        const aSlug = (getField(a, 'slug') || '').toLowerCase().trim();
        const aId = (getField(a, 'id') || '').toLowerCase().trim();
        return (aSlug && aSlug === cleanNewsSlug) || (aId && aId === cleanNewsSlug);
      });
      if (matchedApp) {
        bodyHtml = renderers.renderAppDetails(cleanNewsSlug, apps, settings);
      } else {
        bodyHtml = renderers.render404(urlPath, settings);
      }
    }
  } else if (cleanPathLower === '/videos') {
    bodyHtml = renderers.renderVideosList(videos, settings);
  } else if (cleanPathLower.startsWith('/videos/')) {
    const slug = cleanPath.split('/videos/')[1];
    bodyHtml = renderers.renderVideoDetail(slug, videos, settings);
  } else if (cleanPathLower === '/about') {
    bodyHtml = renderers.renderAbout(settings);
  } else if (cleanPathLower === '/contact') {
    bodyHtml = renderers.renderContact(settings);
  } else if (cleanPathLower === '/privacy') {
    bodyHtml = renderers.renderPrivacy(settings);
  } else if (cleanPathLower === '/terms') {
    bodyHtml = renderers.renderTerms(settings);
  } else if (cleanPathLower === '/responsibility') {
    bodyHtml = renderers.renderResponsibility(settings);
  } else if (cleanPathLower === '/report-removal') {
    bodyHtml = renderers.renderReportRemoval(settings);
  } else if (cleanPathLower === '/notice') {
    bodyHtml = renderers.renderNotice(settings);
  } else if (cleanPathLower === '/ethics') {
    bodyHtml = renderers.renderEthics(settings);
  } else if (cleanPathLower === '/disclaimer') {
    bodyHtml = renderers.renderDisclaimer(settings);
  } else if (cleanPathLower === '/developers') {
    bodyHtml = renderers.renderDevelopersList(developers, settings);
  } else if (cleanPathLower === '/faq') {
    bodyHtml = renderers.renderFaqPage(settings);
  } else if (cleanPathLower.startsWith('/info/') || cleanPathLower.startsWith('/moreinfo/') || cleanPathLower.startsWith('/moredetail/') || cleanPathLower.startsWith('/gateway/') || cleanPathLower.startsWith('/download/')) {
    const parts = cleanPathLower.split('/');
    const slug = parts[parts.length - 1];
    bodyHtml = renderers.renderGateway(slug, settings, apps);
  } else if (cleanPathLower.startsWith('/app/')) {
    const slug = cleanPathLower.replace(/^\/app\//, '/').replace(/^\/|\/$/g, '');
    const matchedApp = resolveAppSlug(slug, apps) || apps.find((a: any) => getField(a, 'slug')?.toLowerCase() === slug.toLowerCase());
    const seoFeed = matchedApp ? getLocalFallbackReviewsForApp(getField(matchedApp, 'id'), getField(matchedApp, 'slug')) : { reviews: [], stats: null };
    bodyHtml = renderers.renderAppDetails(slug, apps, settings, seoFeed.reviews, seoFeed.stats);
  } else if (cleanPathLower.startsWith('/s/')) {
    const slug = cleanPath.split('/s/')[1];
    const matchedApp = resolveAppSlug(slug, apps) || apps.find((a: any) => getField(a, 'slug')?.toLowerCase() === slug.toLowerCase());
    const seoFeed = matchedApp ? getLocalFallbackReviewsForApp(getField(matchedApp, 'id'), getField(matchedApp, 'slug')) : { reviews: [], stats: null };
    bodyHtml = renderers.renderAppDetails(slug, apps, settings, seoFeed.reviews, seoFeed.stats);
  } else {
    const slug = cleanPathLower.replace(/^\/|\/$/g, '');
    const app = resolveAppSlug(slug, apps) || apps.find((a: any) => getField(a, 'slug')?.toLowerCase() === slug);
    const newsItem = news.find((n: any) => getField(n, 'slug')?.toLowerCase() === slug);
    const videoItem = videos.find((v: any) => getField(v, 'slug')?.toLowerCase() === slug);

    if (app) {
      const seoFeed = getLocalFallbackReviewsForApp(getField(app, 'id'), getField(app, 'slug'));
      bodyHtml = renderers.renderAppDetails(slug, apps, settings, seoFeed.reviews, seoFeed.stats);
    } else if (newsItem) {
      bodyHtml = renderers.renderNewsDetail(slug, news, settings, apps);
    } else if (videoItem) {
      bodyHtml = renderers.renderVideoDetail(slug, videos, settings);
    } else {
      bodyHtml = renderers.render404(urlPath, settings);
    }
  }

  return wrapWithLayout(bodyHtml, settings);
}
