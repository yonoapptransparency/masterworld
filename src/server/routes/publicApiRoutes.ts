import { Router } from 'express';
import staticData from '../../lib/staticData.json';
import { fetchStoreData } from '../../seoHelper';
import { resolveAppSlug } from '../../lib/slugResolver';
import { formatNewsDate, calculateReadingTime, getPlainTextSnippet } from '../../lib/newsUtils';
import { sanitizePublicSettings } from '../../lib/canonicalCompiler';

export const publicApiRouter = Router();

function sanitizeAppForPublicClient(app: any, keepRichDetails: boolean): any {
  if (!app) return app;
  const hasSecureLink = Boolean(
    app.has_secure_link ||
    app.link_configured ||
    app.more_information_url ||
    app.download_url ||
    app.encrypted_link ||
    app.encrypted_download_url ||
    (app.url && !String(app.url).includes('com.rummydex') && !String(app.url).includes('com.example'))
  );

  const basePublicApp = {
    id: app.id,
    name: app.name,
    slug: typeof app.slug === 'string' ? app.slug.trim() : app.slug,
    category: app.category,
    icon_url: app.icon_url,
    rating: app.rating,
    reviews: app.reviews,
    review_count: app.review_count,
    downloads: app.downloads,
    size: app.size,
    file_size: app.file_size || app.size,
    version: app.version,
    developer: app.developer,
    safety_status: app.safety_status,
    is_featured: Boolean(app.is_featured),
    is_hot: Boolean(app.is_hot),
    is_new: Boolean(app.is_new),
    is_top_chart: Boolean(app.is_top_chart),
    top_chart_category: app.top_chart_category || '',
    is_coming_soon: Boolean(app.is_coming_soon),
    publish_date: app.publish_date,
    created_at: app.created_at,
    updated_at: app.updated_at,
    serial_number: app.serial_number,
    short_description: app.short_description,
    meta_title: app.meta_title,
    meta_description: app.meta_description,
    seo_title: app.seo_title,
    seo_description: app.seo_description,
    seo_keywords: app.seo_keywords,
    og_image_url: app.og_image_url,
    canonical_url: app.canonical_url,
    has_secure_link: hasSecureLink,
    link_configured: hasSecureLink
  };

  if (keepRichDetails) {
    return {
      ...basePublicApp,
      description_html: app.description_html || '',
      features_html: app.features_html || '',
      screenshots: Array.isArray(app.screenshots) ? app.screenshots : [],
      faqs: Array.isArray(app.faqs) ? app.faqs : [],
      custom_admin_box_html: app.custom_admin_box_html || '',
      custom_admin_box_heading: app.custom_admin_box_heading || '',
      yellow_box_msg: app.yellow_box_msg || '',
      red_box_msg: app.red_box_msg || '',
      idea_box_msg: app.idea_box_msg || '',
      release_notes: app.release_notes || '',
      video_url: app.video_url || ''
    };
  }

  return basePublicApp;
}

function sanitizeNewsCardForPublicList(n: any): any {
  if (!n) return n;
  const rawBody = n.content || n.description_html || n.description || '';
  const excerpt = n.excerpt || n.seo_description || n.description || getPlainTextSnippet(rawBody, 160);
  const dateRaw = n.published_at || n.created_at || n.date || '';
  return {
    id: typeof n.id === 'string' ? n.id.trim() : n.id,
    slug: typeof n.slug === 'string' ? n.slug.trim() : n.slug,
    title: n.title,
    seo_title: n.seo_title,
    meta_title: n.meta_title || n.seo_title,
    description: excerpt,
    excerpt,
    seo_description: n.seo_description || excerpt,
    meta_description: n.meta_description || n.seo_description || excerpt,
    category: n.category,
    logo_url: n.logo_url,
    image_url: n.image_url,
    og_image_url: n.og_image_url,
    published_at: n.published_at,
    created_at: n.created_at,
    updated_at: n.updated_at,
    date: n.date,
    formatted_date: n.formatted_date || formatNewsDate(dateRaw),
    reading_time: n.reading_time || calculateReadingTime(rawBody),
    read_time: n.read_time || n.reading_time || calculateReadingTime(rawBody),
    author: n.author || n.ceo_name,
    ceo_name: n.ceo_name || n.author,
    is_pinned: Boolean(n.is_pinned || n.pinned),
    is_breaking: Boolean(n.is_breaking),
    is_new: Boolean(n.is_new),
    tags: Array.isArray(n.tags) ? n.tags : [],
    related_app_id: n.related_app_id,
    link: n.link
  };
}

function sanitizeNewsDetailForPublicClient(n: any): any {
  if (!n) return n;
  const card = sanitizeNewsCardForPublicList(n);
  return {
    ...card,
    content: n.content || n.description_html || '',
    description_html: n.description_html || n.content || '',
    ceo_description: n.ceo_description || '',
    seo_keywords: n.seo_keywords || '',
    canonical_url: n.canonical_url || '',
    target_region: n.target_region || 'India'
  };
}

function sanitizeVideoForPublicClient(v: any): any {
  if (!v) return v;
  const ytUrl = v.youtube_url || v.video_url || v.url || '';
  return {
    id: v.id,
    slug: v.slug || v.id,
    title: v.title || '',
    description: v.description || '',
    youtube_url: ytUrl,
    video_url: v.video_url || ytUrl,
    url: v.url || ytUrl,
    seo_title: v.seo_title || '',
    seo_description: v.seo_description || '',
    meta_description: v.meta_description || '',
    seo_keywords: v.seo_keywords || '',
    canonical_url: v.canonical_url || '',
    og_image_url: v.og_image_url || '',
    thumbnail_url: v.thumbnail_url || v.thumbnail || '',
    duration: v.duration || '',
    category: v.category || '',
    related_app_id: v.related_app_id || '',
    created_at: v.created_at || v.date || '',
    updated_at: v.updated_at || v.created_at || ''
  };
}

function sanitizeSettingsForPublicClient(settings: any): any {
  return sanitizePublicSettings(settings);
}

publicApiRouter.get('/api/v1/public/app/:slug', async (req, res) => {
  const slugParam = req.params.slug;
  if (!slugParam) {
    return res.status(400).json({ status: 'ERROR', error: 'Slug parameter is required' });
  }

  const data = await fetchStoreData();
  const apps = (data?.apps || (staticData as any)?.apps || []).filter((a: any) => a && a.sync_to_public !== false);
  const app = resolveAppSlug(slugParam, apps);

  if (app) {
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800');
    res.setHeader('CDN-Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    res.setHeader('Cloudflare-CDN-Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    const catalogApps = apps.map((a: any) => sanitizeAppForPublicClient(a, false));
    return res.json({ status: 'OK', app: sanitizeAppForPublicClient(app, true), catalogApps });
  }

  res.status(404).json({ status: 'NOT_FOUND', error: 'App not found' });
});

publicApiRouter.get('/api/v1/public/news', async (req, res) => {
  const data = await fetchStoreData();
  const rawNews = data?.news || (staticData as any)?.news || [];
  const news = Array.isArray(rawNews)
    ? rawNews.filter((n: any) => n && n.sync_to_public !== false).map(sanitizeNewsCardForPublicList)
    : [];
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600, stale-while-revalidate=86400');
  res.json({ status: 'OK', news });
});

publicApiRouter.get('/api/v1/public/news/:slug', async (req, res) => {
  const slugParam = decodeURIComponent(req.params.slug || '').toLowerCase().trim();
  if (!slugParam) {
    return res.status(400).json({ status: 'ERROR', error: 'Slug parameter is required' });
  }

  const data = await fetchStoreData();
  const newsList = (data?.news || (staticData as any)?.news || []).filter((n: any) => n && n.sync_to_public !== false);
  const newsItem = newsList.find((n: any) => {
    const s = String(n.slug || n.id || '').toLowerCase().trim();
    const id = String(n.id || '').toLowerCase().trim();
    return s === slugParam || id === slugParam;
  });

  if (newsItem) {
    res.setHeader('Cache-Control', 'public, max-age=1800, s-maxage=3600, stale-while-revalidate=604800');
    return res.json({ status: 'OK', news: sanitizeNewsDetailForPublicClient(newsItem) });
  }

  res.status(404).json({ status: 'NOT_FOUND', error: 'News item not found' });
});

publicApiRouter.get('/api/v1/public/videos', async (req, res) => {
  const data = await fetchStoreData();
  const rawVideos = data?.videos || (staticData as any)?.videos || [];
  const videos = Array.isArray(rawVideos) ? rawVideos.filter(Boolean).map(sanitizeVideoForPublicClient) : [];
  res.setHeader('Cache-Control', 'public, max-age=600, s-maxage=1200, stale-while-revalidate=86400');
  res.json({ status: 'OK', videos });
});

publicApiRouter.get('/api/v1/public/settings', async (req, res) => {
  const data = await fetchStoreData();
  const settings = sanitizeSettingsForPublicClient(data?.settings || (staticData as any)?.settings || {});
  res.setHeader('Cache-Control', 'public, max-age=600, s-maxage=1800, stale-while-revalidate=86400');
  res.json({ status: 'OK', settings });
});

publicApiRouter.get('/api/v1/public/developers', async (req, res) => {
  const data = await fetchStoreData();
  const developers = data?.developers || data?.settings?.developers || (staticData as any)?.developers || [];
  res.setHeader('Cache-Control', 'public, max-age=1800, s-maxage=3600, stale-while-revalidate=86400');
  res.json({ status: 'OK', developers });
});

publicApiRouter.get('/api/v1/public/faqs', async (req, res) => {
  const data = await fetchStoreData();
  const faqs = data?.settings?.website_faqs || (staticData as any)?.settings?.website_faqs || [];
  res.setHeader('Cache-Control', 'public, max-age=1800, s-maxage=3600, stale-while-revalidate=86400');
  res.json({ status: 'OK', faqs });
});

publicApiRouter.get('/api/v1/public/backup-data', async (req, res) => {
  try {
    const data = await fetchStoreData();
    const staticApps = (staticData as any)?.apps || (staticData as any)?.mockApps || [];
    const sourceApps = (Array.isArray(data?.apps) && data.apps.length >= 50) ? data.apps : staticApps;
    const rawApps = sourceApps.filter((a: any) => a && a.sync_to_public !== false);
    const rawNews = (data?.news || (staticData as any)?.news || (staticData as any)?.mockNews || []).filter((n: any) => n && n.sync_to_public !== false);
    const rawVideos = data?.videos || (staticData as any)?.videos || (staticData as any)?.mockVideos || [];
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
    return res.json({
      apps: Array.isArray(rawApps) ? rawApps.map((a: any) => sanitizeAppForPublicClient(a, false)) : [],
      settings: sanitizeSettingsForPublicClient(data?.settings || (staticData as any)?.settings || (staticData as any)?.mockSettings || {}),
      news: Array.isArray(rawNews) ? rawNews.map(sanitizeNewsCardForPublicList) : [],
      videos: Array.isArray(rawVideos) ? rawVideos.filter(Boolean).map(sanitizeVideoForPublicClient) : [],
      reviews: []
    });
  } catch (err) {
    const fallbackApps = ((staticData as any)?.apps || (staticData as any)?.mockApps || []).filter((a: any) => a && a.sync_to_public !== false);
    const fallbackNews = ((staticData as any)?.news || (staticData as any)?.mockNews || []).filter((n: any) => n && n.sync_to_public !== false);
    const fallbackVideos = (staticData as any)?.videos || (staticData as any)?.mockVideos || [];
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300');
    return res.json({
      apps: Array.isArray(fallbackApps) ? fallbackApps.map((a: any) => sanitizeAppForPublicClient(a, false)) : [],
      settings: sanitizeSettingsForPublicClient((staticData as any)?.settings || (staticData as any)?.mockSettings || {}),
      news: Array.isArray(fallbackNews) ? fallbackNews.map(sanitizeNewsCardForPublicList) : [],
      videos: Array.isArray(fallbackVideos) ? fallbackVideos.filter(Boolean).map(sanitizeVideoForPublicClient) : [],
      reviews: []
    });
  }
});

publicApiRouter.get('/api/v1/public/backup-data-full', async (req, res) => {
  try {
    const data = await fetchStoreData();
    const staticApps = (staticData as any)?.apps || (staticData as any)?.mockApps || [];
    const sourceApps = (Array.isArray(data?.apps) && data.apps.length >= 50) ? data.apps : staticApps;
    const rawApps = sourceApps.filter((a: any) => a && a.sync_to_public !== false);
    const rawNews = (data?.news || (staticData as any)?.news || (staticData as any)?.mockNews || []).filter((n: any) => n && n.sync_to_public !== false);
    const rawVideos = data?.videos || (staticData as any)?.videos || (staticData as any)?.mockVideos || [];
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
    return res.json({
      apps: Array.isArray(rawApps) ? rawApps.map((a: any) => sanitizeAppForPublicClient(a, true)) : [],
      settings: sanitizeSettingsForPublicClient(data?.settings || (staticData as any)?.settings || (staticData as any)?.mockSettings || {}),
      news: Array.isArray(rawNews) ? rawNews.map(sanitizeNewsDetailForPublicClient) : [],
      videos: Array.isArray(rawVideos) ? rawVideos.filter(Boolean).map(sanitizeVideoForPublicClient) : [],
      reviews: []
    });
  } catch (err) {
    const fallbackApps = ((staticData as any)?.apps || (staticData as any)?.mockApps || []).filter((a: any) => a && a.sync_to_public !== false);
    const fallbackNews = ((staticData as any)?.news || (staticData as any)?.mockNews || []).filter((n: any) => n && n.sync_to_public !== false);
    const fallbackVideos = (staticData as any)?.videos || (staticData as any)?.mockVideos || [];
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300');
    return res.json({
      apps: Array.isArray(fallbackApps) ? fallbackApps.map((a: any) => sanitizeAppForPublicClient(a, true)) : [],
      settings: sanitizeSettingsForPublicClient((staticData as any)?.settings || (staticData as any)?.mockSettings || {}),
      news: Array.isArray(fallbackNews) ? fallbackNews.map(sanitizeNewsDetailForPublicClient) : [],
      videos: Array.isArray(fallbackVideos) ? fallbackVideos.filter(Boolean).map(sanitizeVideoForPublicClient) : [],
      reviews: []
    });
  }
});
