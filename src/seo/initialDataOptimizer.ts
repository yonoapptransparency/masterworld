import { getField } from './utils';
import { structureHtmlFragment } from '../lib/safeHtmlPublic';

export function optimizeInitialDataForRoute(
  data: any,
  cleanPathLower: string,
  targetApp: any,
  targetNews: any,
  targetVideo: any,
  seoReviewsFeed?: any
): any {
  if (!data) return {};

  const isAppDetailPage = cleanPathLower.startsWith('/app/');
  const isNewsDetailPage = cleanPathLower.startsWith('/news/') && cleanPathLower !== '/news';
  const isNewsIndexPage = cleanPathLower === '/news';
  const isHomePage = cleanPathLower === '/' || cleanPathLower === '';

  const isAdminPath = cleanPathLower.startsWith('/admin') || cleanPathLower.startsWith('/masterworld') || cleanPathLower === '/login' || cleanPathLower.startsWith('/login/');
  const baseApps = Array.isArray(data.apps) ? data.apps : (Array.isArray(data.mockApps) ? data.mockApps : []);

  if (isAdminPath) {
    return {
      apps: baseApps,
      settings: data.settings || {},
      news: data.news || [],
      videos: data.videos || [],
      developers: data.developers || data.settings?.developers || []
    };
  }

  const targetAppSlug = targetApp ? (getField(targetApp, 'slug') || getField(targetApp, 'id'))?.toLowerCase().trim() : null;
  const targetAppId = targetApp ? String(getField(targetApp, 'id') || '').toLowerCase().trim() : '';
  const targetNewsSlug = targetNews ? (getField(targetNews, 'slug') || getField(targetNews, 'id'))?.toLowerCase().trim() : null;

  // Optimized Apps Payload:
  // - If on an App Details page or targetApp is present: Target app has 100% full rich fields (pre-structured HTML, screenshots, faqs, custom boxes).
  // - Non-target apps on App Details, News Detail, or News Index pages carry ultra-lean card fields for Similar Applications & Instant Search.
  // - All other routes contain structured catalog card fields so Home, Categories, and Instant Search work with 0ms latency.
  // - Zero download links (more_information_url / encrypted_link) are ever exposed in window.__INITIAL_DATA__.
  const optimizedApps = baseApps.map((app: any) => {
    if (!app || app.sync_to_public === false) return null;
    const s = (getField(app, 'slug') || '').toLowerCase().trim();
    const id = String(getField(app, 'id') || '').toLowerCase().trim();
    const isTarget = Boolean(targetApp) && (
      (targetAppSlug && (s === targetAppSlug || id === targetAppSlug)) ||
      (targetAppId && (id === targetAppId || s === targetAppId))
    );
    const hasSecureLink = Boolean(
      app.has_secure_link ||
      app.link_configured ||
      app.more_information_url ||
      app.encrypted_link ||
      app.download_url
    );

    if (isTarget) {
      const structuredFaqs = Array.isArray(app.faqs)
        ? app.faqs.map((f: any) => f && typeof f === 'object' ? {
            ...f,
            answer: f.answer ? structureHtmlFragment(String(f.answer)) : ''
          } : f)
        : [];

      return {
        id: app.id,
        name: app.name,
        slug: app.slug,
        icon_url: app.icon_url || '',
        category: app.category || '',
        rating: Number(app.rating) || 4.5,
        version: app.version || '1.0',
        file_size: app.file_size || '45 MB',
        safety_status: app.safety_status || 'Verified',
        developer: app.developer || '',
        review_count: Number(app.review_count) || (typeof app.reviews === 'number' ? app.reviews : 0),
        reviews: typeof app.reviews === 'number' ? app.reviews : Number(app.review_count) || 0,
        short_description: app.short_description || '',
        seo_title: app.seo_title || '',
        seo_description: app.seo_description || '',
        meta_description: app.meta_description || '',
        og_image_url: app.og_image_url || '',
        canonical_url: app.canonical_url || '',
        description_html: app.description_html ? structureHtmlFragment(String(app.description_html)) : '',
        features_html: app.features_html ? structureHtmlFragment(String(app.features_html)) : '',
        screenshots: Array.isArray(app.screenshots) ? app.screenshots : [],
        faqs: structuredFaqs,
        custom_admin_box_html: app.custom_admin_box_html ? structureHtmlFragment(String(app.custom_admin_box_html)) : '',
        custom_admin_box_heading: app.custom_admin_box_heading || '',
        yellow_box_msg: app.yellow_box_msg || '',
        red_box_msg: app.red_box_msg || '',
        idea_box_msg: app.idea_box_msg || '',
        release_notes: app.release_notes || '',
        video_url: app.video_url || '',
        serial_number: app.serial_number !== undefined ? Number(app.serial_number) : 0,
        is_featured: Boolean(app.is_featured),
        is_new: Boolean(app.is_new),
        is_hot: Boolean(app.is_hot),
        is_top_chart: Boolean(app.is_top_chart),
        top_chart_category: app.top_chart_category || '',
        publish_date: app.publish_date || '',
        updated_at: app.updated_at || '',
        created_at: app.created_at || '',
        has_secure_link: hasSecureLink,
        link_configured: hasSecureLink
      };
    }

    if (isAppDetailPage || isNewsDetailPage || isNewsIndexPage) {
      return {
        id: app.id,
        name: app.name,
        slug: app.slug,
        icon_url: app.icon_url || '',
        category: app.category || '',
        developer: app.developer || '',
        version: app.version || '1.0',
        file_size: app.file_size || '45 MB',
        rating: Number(app.rating) || 4.5,
        serial_number: app.serial_number !== undefined ? Number(app.serial_number) : 0,
        is_new: Boolean(app.is_new),
        is_hot: Boolean(app.is_hot),
        popular: Boolean(app.popular),
        active: app.active !== false,
        has_secure_link: hasSecureLink,
        link_configured: hasSecureLink
      };
    }

    return {
      id: app.id,
      name: app.name,
      slug: app.slug,
      icon_url: app.icon_url || '',
      category: app.category || '',
      rating: Number(app.rating) || 4.5,
      version: app.version || '1.0',
      file_size: app.file_size || '45 MB',
      safety_status: app.safety_status || 'Verified',
      developer: app.developer || '',
      review_count: Number(app.review_count) || (typeof app.reviews === 'number' ? app.reviews : 0),
      reviews: typeof app.reviews === 'number' ? app.reviews : Number(app.review_count) || 0,
      serial_number: app.serial_number !== undefined ? Number(app.serial_number) : 0,
      is_featured: Boolean(app.is_featured),
      is_new: Boolean(app.is_new),
      is_hot: Boolean(app.is_hot),
      popular: Boolean(app.popular),
      active: app.active !== false,
      tags: Array.isArray(app.tags) ? app.tags : [],
      is_top_chart: Boolean(app.is_top_chart),
      top_chart_category: app.top_chart_category || '',
      publish_date: app.publish_date || '',
      created_at: app.created_at || '',
      updated_at: app.updated_at || '',
      short_description: typeof app.short_description === 'string' ? app.short_description.slice(0, 150) : '',
      seo_title: app.seo_title || '',
      seo_description: app.seo_description || '',
      canonical_url: app.canonical_url || '',
      has_secure_link: hasSecureLink,
      link_configured: hasSecureLink
    };
  }).filter(Boolean);

  // Optimized News:
  // - On /news/:slug (News Detail): Send ONLY the 1 active target news article with full pre-structured content!
  // - On /news (News Index): Send card summaries for all articles (stripping heavy HTML content bodies).
  // - On / (Home): Send top 8 news card summaries (stripping heavy HTML content bodies).
  // - On /app/:slug: Send only lightweight stubs matching targetApp for relatedNewsCount.
  const rawNews = (Array.isArray(data.news) ? data.news : (Array.isArray(data.mockNews) ? data.mockNews : []))
    .filter((item: any) => item && item.sync_to_public !== false);

  let optimizedNews: any[] = [];
  if (isNewsDetailPage) {
    const matchedNews = rawNews.filter((item: any) => {
      const itemSlug = (item.slug || item.id || '').toLowerCase().trim();
      const itemId = String(item.id || '').toLowerCase().trim();
      return Boolean(targetNewsSlug) && (itemSlug === targetNewsSlug || itemId === targetNewsSlug);
    });
    const sourceList = matchedNews.length > 0 ? matchedNews : (targetNews ? [targetNews] : []);
    optimizedNews = sourceList.map((item: any) => {
      const rawBody = item.content || item.description_html || item.description || '';
      const structuredBody = rawBody ? structureHtmlFragment(String(rawBody)) : '';
      return {
        id: item.id,
        slug: item.slug,
        title: item.title,
        logo_url: item.logo_url || item.image_url || '',
        image_url: item.image_url || item.logo_url || '',
        description: item.description || '',
        content: structuredBody,
        description_html: structuredBody,
        ceo_name: item.ceo_name || item.author || 'Admin Team',
        ceo_description: item.ceo_description || 'Transparency & Security Analyst',
        author: item.author || item.ceo_name || 'Admin Team',
        category: item.category || 'General',
        published_at: item.published_at || item.created_at || item.date || '',
        date: item.date || item.published_at || item.created_at || '',
        read_time: item.read_time || '3 min read',
        is_breaking: Boolean(item.is_breaking),
        is_new: Boolean(item.is_new),
        is_pinned: Boolean(item.is_pinned),
        seo_title: item.seo_title || '',
        seo_description: item.seo_description || '',
        seo_keywords: item.seo_keywords || '',
        og_image_url: item.og_image_url || '',
        canonical_url: item.canonical_url || '',
        target_region: item.target_region || 'India',
        link: item.link || '',
        tags: Array.isArray(item.tags) ? item.tags : [],
        related_app_id: item.related_app_id || '',
        created_at: item.created_at || item.date || '',
        updated_at: item.updated_at || item.date || ''
      };
    });
  } else if (isNewsIndexPage || isHomePage) {
    const sliceLimit = isHomePage ? 8 : rawNews.length;
    optimizedNews = rawNews.slice(0, sliceLimit).map((item: any) => ({
      id: item.id,
      slug: item.slug,
      title: item.title,
      logo_url: item.logo_url || item.image_url || '',
      image_url: item.image_url || item.logo_url || '',
      description: item.description || '',
      content: '',
      description_html: '',
      ceo_name: item.ceo_name || item.author || 'Admin Team',
      author: item.author || item.ceo_name || 'Admin Team',
      category: item.category || 'General',
      published_at: item.published_at || item.created_at || item.date || '',
      date: item.date || item.published_at || item.created_at || '',
      read_time: item.read_time || '3 min read',
      is_breaking: Boolean(item.is_breaking),
      is_new: Boolean(item.is_new),
      is_pinned: Boolean(item.is_pinned),
      link: item.link || '',
      tags: Array.isArray(item.tags) ? item.tags : [],
      related_app_id: item.related_app_id || '',
      created_at: item.created_at || item.date || '',
      updated_at: item.updated_at || item.date || ''
    }));
  } else if (isAppDetailPage && targetApp) {
    const appNameLower = String(getField(targetApp, 'name') || '').toLowerCase().trim();
    const appIdStr = String(getField(targetApp, 'id') || '');
    optimizedNews = rawNews
      .filter((n: any) => {
        if (appIdStr && n.related_app_id === appIdStr) return true;
        if (!appNameLower) return false;
        return (
          n.title?.toLowerCase().includes(appNameLower) ||
          n.description?.toLowerCase().includes(appNameLower) ||
          (Array.isArray(n.tags) && n.tags.some((t: string) => String(t).toLowerCase() === appNameLower))
        );
      })
      .map((item: any) => ({
        id: item.id,
        slug: item.slug,
        title: item.title,
        related_app_id: item.related_app_id || '',
        tags: Array.isArray(item.tags) ? item.tags : []
      }));
  }

  // Optimized Videos: Omit on App Details and News Detail pages to keep initial HTML and JSON.parse ultra-light
  const rawVideos = (isAppDetailPage || isNewsDetailPage)
    ? []
    : (Array.isArray(data.videos) ? data.videos : (Array.isArray(data.mockVideos) ? data.mockVideos : []));
  const optimizedVideos: any[] = rawVideos.map((item: any) => {
    if (!item) return null;
    return {
      id: item.id,
      slug: item.slug,
      title: item.title,
      seo_title: item.seo_title || '',
      seo_description: item.seo_description || '',
      meta_description: item.meta_description || '',
      og_image_url: item.og_image_url || '',
      thumbnail_url: item.thumbnail_url || '',
      video_url: item.video_url || '',
      duration: item.duration || '',
      category: item.category || ''
    };
  }).filter(Boolean);

  // Public Settings: On App Details & News Detail pages, omit heavy legal HTML blobs, website_faqs, banners, and developers
  const rawSettings = data.settings || data.mockSettings || {};
  const optimizedSettings: any = {};
  const detailPageKeys = [
    'site_title', 'logo_url', 'favicon_url', 'seo_title', 'seo_description', 'seo_keywords',
    'meta_title', 'meta_description', 'social_links', 'categories', 'trending_searches',
    'ticker_text', 'support_email', 'last_updated', 'animations_enabled',
    'quick_links', 'turnstile_site_key', 'helpline_whatsapp', 'helpline_telegram',
    'news_meta_title', 'news_meta_description'
  ];
  const fullAllowedKeys = [
    ...detailPageKeys,
    'hero_title_text', 'hero_title_subtitle', 'hero_title_color', 'hero_title_animation',
    'hero_title_visible', 'hero_title_style', 'portal_heading', 'secure_index_title',
    'secure_index_subtitle', 'banners',
    'about_meta_title', 'about_meta_description', 'about_content', 'about_us',
    'contact_meta_title', 'contact_meta_description', 'contact_content',
    'privacy_meta_title', 'privacy_meta_description', 'privacy_content',
    'terms_meta_title', 'terms_meta_description', 'terms_content',
    'responsibility_meta_title', 'responsibility_meta_description', 'responsibility_content',
    'report_removal_meta_title', 'report_removal_meta_description', 'report_removal_content',
    'notice_meta_title', 'notice_meta_description', 'important_notice', 'important_notice_heading',
    'ethics_meta_title', 'ethics_meta_description', 'ethics_discrimination_text', 'ethics_heading',
    'disclaimer_meta_title', 'disclaimer_meta_description', 'disclaimer_text', 'disclaimer_heading',
    'developers_meta_title', 'developers_meta_description', 'developers',
    'website_faqs', 'faq_meta_title', 'faq_meta_description',
    'videos_meta_title', 'videos_meta_description'
  ];

  const allowedKeys = (isAppDetailPage || isNewsDetailPage) ? detailPageKeys : fullAllowedKeys;

  const htmlContentKeys = new Set([
    'about_content', 'about_us', 'contact_content', 'privacy_content', 'terms_content',
    'responsibility_content', 'report_removal_content', 'important_notice',
    'ethics_discrimination_text', 'disclaimer_text'
  ]);

  for (const k of allowedKeys) {
    if (rawSettings[k] !== undefined) {
      const val = rawSettings[k];
      if (htmlContentKeys.has(k) && typeof val === 'string' && val.length > 0) {
        optimizedSettings[k] = val
          .replace(/<!DOCTYPE[^>]*>/gi, '')
          .replace(/<head\b[^>]*>[\s\S]*?<\/head>/gi, '')
          .replace(/<\/?(html|head|body)[^>]*>/gi, '')
          .replace(/<(meta|link)\b[^>]*>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, '')
          .trim();
      } else {
        optimizedSettings[k] = val;
      }
    }
  }

  // Ensure developers array is available when not on detail pages
  if (!isAppDetailPage && !isNewsDetailPage && !optimizedSettings.developers && Array.isArray(data.developers)) {
    optimizedSettings.developers = data.developers;
  }

  let appReviewsData: any = null;
  if (seoReviewsFeed && (targetAppSlug || targetAppId)) {
    const revList = Array.isArray(seoReviewsFeed.reviews) ? seoReviewsFeed.reviews : [];
    const totalCount = Number(seoReviewsFeed.stats?.totalReviews) || revList.length;
    appReviewsData = {
      appId: targetAppId,
      appSlug: targetAppSlug,
      reviews: revList.slice(0, 5),
      stats: seoReviewsFeed.stats || null,
      hasMore: totalCount > 5
    };
  }

  return {
    apps: optimizedApps,
    news: optimizedNews,
    videos: optimizedVideos,
    settings: optimizedSettings,
    ...(appReviewsData ? { appReviews: appReviewsData } : {})
  };
}


