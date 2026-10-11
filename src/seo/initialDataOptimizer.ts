import { getField } from './utils';

export function optimizeInitialDataForRoute(
  data: any,
  cleanPathLower: string,
  targetApp: any,
  targetNews: any,
  targetVideo: any
): any {
  if (!data) return {};

  const isAppDetailPage = cleanPathLower.startsWith('/app/');
  const isNewsDetailPage = cleanPathLower.startsWith('/news/');

  const targetAppSlug = targetApp ? getField(targetApp, 'slug')?.toLowerCase().trim() : null;
  const targetAppId = targetApp ? String(getField(targetApp, 'id') || '').toLowerCase().trim() : '';
  const targetNewsSlug = targetNews ? (getField(targetNews, 'slug') || getField(targetNews, 'id'))?.toLowerCase().trim() : null;

  const baseApps = Array.isArray(data.apps) ? data.apps : (Array.isArray(data.mockApps) ? data.mockApps : []);

  const isDetailPage = isAppDetailPage || isNewsDetailPage;

  // Optimized Apps Payload:
  // - If on an App or News Details page: only include the target/related app and category similar apps (up to 20) with compact fields.
  // - All other apps contain structured catalog fields so Home, Categories, and Instant Search work seamlessly with 0ms latency.
  let targetCat = '';
  if (isAppDetailPage && targetApp) {
    const rawCat = getField(targetApp, 'category', 'Card Game');
    targetCat = rawCat.split(',')[0]?.trim().toLowerCase();
  } else if (isNewsDetailPage && targetNews) {
    // If news links to an app, use that app's category; otherwise use the news category or default to Yono Apps
    const relAppId = getField(targetNews, 'related_app_id', '');
    const matchedRelApp = relAppId ? baseApps.find((a: any) => 
      (getField(a, 'id') || '').toLowerCase() === relAppId.toLowerCase() || 
      (getField(a, 'slug') || '').toLowerCase() === relAppId.toLowerCase()
    ) : null;
    if (matchedRelApp) {
      targetCat = getField(matchedRelApp, 'category', 'Yono Apps').split(',')[0]?.trim().toLowerCase();
    } else {
      targetCat = getField(targetNews, 'category', 'Yono Apps').split(',')[0]?.trim().toLowerCase();
    }
  }

  let optimizedApps: any[] = [];
  if (isDetailPage) {
    // 1. If there is a target app (from app detail or related app in news), include with full details
    let primaryApp = targetApp;
    if (!primaryApp && isNewsDetailPage && targetNews) {
      const relAppId = getField(targetNews, 'related_app_id', '');
      if (relAppId) {
        primaryApp = baseApps.find((a: any) => 
          (getField(a, 'id') || '').toLowerCase() === relAppId.toLowerCase() || 
          (getField(a, 'slug') || '').toLowerCase() === relAppId.toLowerCase()
        );
      }
    }

    if (primaryApp) {
      optimizedApps.push({
        id: primaryApp.id,
        name: primaryApp.name,
        slug: primaryApp.slug,
        icon_url: primaryApp.icon_url || '',
        category: primaryApp.category || '',
        rating: Number(primaryApp.rating) || 4.5,
        version: primaryApp.version || '1.0',
        file_size: primaryApp.file_size || '45 MB',
        safety_status: primaryApp.safety_status || 'Verified',
        developer: primaryApp.developer || '',
        review_count: Number(primaryApp.review_count) || (typeof primaryApp.reviews === 'number' ? primaryApp.reviews : 0),
        reviews: typeof primaryApp.reviews === 'number' ? primaryApp.reviews : Number(primaryApp.review_count) || 0,
        short_description: primaryApp.short_description || '',
        seo_title: primaryApp.seo_title || '',
        seo_description: primaryApp.seo_description || '',
        meta_description: primaryApp.meta_description || '',
        og_image_url: primaryApp.og_image_url || '',
        canonical_url: primaryApp.canonical_url || '',
        description_html: primaryApp.description_html || '',
        features_html: primaryApp.features_html || '',
        screenshots: Array.isArray(primaryApp.screenshots) ? primaryApp.screenshots : [],
        faqs: Array.isArray(primaryApp.faqs) ? primaryApp.faqs : [],
        custom_admin_box_html: primaryApp.custom_admin_box_html || '',
        custom_admin_box_heading: primaryApp.custom_admin_box_heading || '',
        yellow_box_msg: primaryApp.yellow_box_msg || '',
        red_box_msg: primaryApp.red_box_msg || '',
        idea_box_msg: primaryApp.idea_box_msg || '',
        release_notes: primaryApp.release_notes || '',
        video_url: primaryApp.video_url || '',
        serial_number: primaryApp.serial_number !== undefined ? Number(primaryApp.serial_number) : 0,
        is_featured: Boolean(primaryApp.is_featured),
        is_new: Boolean(primaryApp.is_new),
        is_hot: Boolean(primaryApp.is_hot),
        is_top_chart: Boolean(primaryApp.is_top_chart),
        top_chart_category: primaryApp.top_chart_category || '',
        publish_date: primaryApp.publish_date || '',
        updated_at: primaryApp.updated_at || '',
        created_at: primaryApp.created_at || ''
      });
    }

    // 2. Add category similar apps (up to 20 apps) with compact fields
    const primarySlug = primaryApp ? (getField(primaryApp, 'slug') || '').toLowerCase().trim() : '';
    const primaryId = primaryApp ? String(getField(primaryApp, 'id') || '').toLowerCase().trim() : '';
    let countAdded = 0;
    for (const app of baseApps) {
      if (!app) continue;
      const s = (getField(app, 'slug') || '').toLowerCase().trim();
      const id = String(getField(app, 'id') || '').toLowerCase().trim();
      if ((primarySlug && s === primarySlug) || (primaryId && id === primaryId)) continue;

      const appCat = (getField(app, 'category', '')).toLowerCase();
      const matchesCat = !targetCat || targetCat === 'all' || targetCat === 'all apps' || appCat.includes(targetCat) || targetCat.includes(appCat);
      if (matchesCat || countAdded < 16) {
        optimizedApps.push({
          id: app.id,
          name: app.name,
          slug: app.slug,
          icon_url: app.icon_url || '',
          category: app.category || '',
          rating: Number(app.rating) || 4.5,
          version: app.version || '1.0',
          file_size: app.file_size || '45 MB',
          safety_status: app.safety_status || 'Verified',
          serial_number: app.serial_number !== undefined ? Number(app.serial_number) : 0,
          is_new: Boolean(app.is_new || app.isNew || String(app.badge || '').toLowerCase() === 'new'),
          badge: app.badge || ''
        });
        countAdded++;
        if (countAdded >= 24) break;
      }
    }
  } else {
    optimizedApps = baseApps.map((app: any) => {
      if (!app) return null;
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
        is_top_chart: Boolean(app.is_top_chart),
        top_chart_category: app.top_chart_category || '',
        publish_date: app.publish_date || '',
        updated_at: app.updated_at || '',
        short_description: typeof app.short_description === 'string' ? app.short_description.slice(0, 150) : '',
        seo_title: app.seo_title || '',
        seo_description: app.seo_description || '',
        canonical_url: app.canonical_url || ''
      };
    }).filter(Boolean);
  }

  // Optimized News: On detail pages, target article has 100% full rich content; others are compact stubs
  const rawNews = Array.isArray(data.news) ? data.news : (Array.isArray(data.mockNews) ? data.mockNews : []);
  let optimizedNews: any[] = [];
  if (isAppDetailPage) {
    optimizedNews = rawNews
      .filter((item: any) => item && item.sync_to_public !== false)
      .map((item: any) => ({
        id: item.id,
        slug: item.slug,
        title: item.title,
        related_app_id: item.related_app_id || '',
        tags: Array.isArray(item.tags) ? item.tags : []
      }));
  } else if (isNewsDetailPage && targetNews) {
    // 1. Target news article has full content
    optimizedNews.push({
      id: targetNews.id,
      slug: targetNews.slug,
      title: targetNews.title,
      logo_url: targetNews.logo_url || targetNews.image_url || '',
      image_url: targetNews.image_url || targetNews.logo_url || '',
      description: targetNews.description || '',
      content: targetNews.content || targetNews.description_html || targetNews.description || '',
      description_html: targetNews.description_html || targetNews.content || targetNews.description || '',
      ceo_name: targetNews.ceo_name || targetNews.author || 'Admin Team',
      ceo_description: targetNews.ceo_description || 'Transparency & Security Analyst',
      author: targetNews.author || targetNews.ceo_name || 'Admin Team',
      category: targetNews.category || 'General',
      published_at: targetNews.published_at || targetNews.created_at || targetNews.date || '',
      date: targetNews.date || targetNews.published_at || targetNews.created_at || '',
      read_time: targetNews.read_time || '3 min read',
      is_breaking: Boolean(targetNews.is_breaking),
      is_new: Boolean(targetNews.is_new),
      is_pinned: Boolean(targetNews.is_pinned),
      seo_title: targetNews.seo_title || '',
      seo_description: targetNews.seo_description || '',
      seo_keywords: targetNews.seo_keywords || '',
      og_image_url: targetNews.og_image_url || '',
      canonical_url: targetNews.canonical_url || '',
      target_region: targetNews.target_region || 'India',
      link: targetNews.link || '',
      tags: Array.isArray(targetNews.tags) ? targetNews.tags : [],
      related_app_id: targetNews.related_app_id || '',
      created_at: targetNews.created_at || targetNews.date || '',
      updated_at: targetNews.updated_at || targetNews.date || ''
    });

    // 2. Include up to 6 other recent news items with compact preview stubs (no heavy HTML bodies)
    let extraCount = 0;
    for (const item of rawNews) {
      if (!item || item.sync_to_public === false) continue;
      const itemSlug = (item.slug || item.id || '').toLowerCase().trim();
      const targetSlug = (targetNews.slug || targetNews.id || '').toLowerCase().trim();
      if (itemSlug === targetSlug) continue;

      optimizedNews.push({
        id: item.id,
        slug: item.slug,
        title: item.title,
        logo_url: item.logo_url || item.image_url || '',
        image_url: item.image_url || item.logo_url || '',
        category: item.category || 'General',
        date: item.date || item.published_at || item.created_at || '',
        published_at: item.published_at || item.created_at || item.date || '',
        read_time: item.read_time || '3 min read'
      });
      extraCount++;
      if (extraCount >= 6) break;
    }
  } else {
    optimizedNews = rawNews
      .filter((item: any) => item && item.sync_to_public !== false)
      .map((item: any) => {
        return {
          id: item.id,
          slug: item.slug,
          title: item.title,
          logo_url: item.logo_url || item.image_url || '',
          image_url: item.image_url || item.logo_url || '',
          description: item.description || '',
          content: item.content || item.description_html || item.description || '',
          description_html: item.description_html || item.content || item.description || '',
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
  }

  // Optimized Videos (omit on detail pages to save bandwidth)
  let optimizedVideos: any[] = [];
  if (!isDetailPage) {
    const rawVideos = Array.isArray(data.videos) ? data.videos : (Array.isArray(data.mockVideos) ? data.mockVideos : []);
    optimizedVideos = rawVideos.map((item: any) => {
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
  }

  // Public Settings: Include layout keys; omit bulky legal page texts on detail views
  const rawSettings = data.settings || data.mockSettings || {};
  const optimizedSettings: any = {};
  const publicAllowedKeys = isDetailPage ? [
    'site_title', 'logo_url', 'favicon_url', 'seo_title', 'seo_description', 'seo_keywords',
    'meta_title', 'meta_description', 'social_links', 'categories', 'portal_heading',
    'trending_searches', 'ticker_text', 'turnstile_site_key'
  ] : [
    'site_title', 'logo_url', 'favicon_url', 'seo_title', 'seo_description', 'seo_keywords',
    'meta_title', 'meta_description', 'social_links', 'categories', 'hero_title_text',
    'hero_title_subtitle', 'hero_title_color', 'hero_title_animation', 'hero_title_visible',
    'hero_title_style', 'portal_heading', 'secure_index_title', 'secure_index_subtitle',
    'trending_searches', 'ticker_text', 'support_email', 'last_updated', 'animations_enabled',
    'banners', 'quick_links', 'turnstile_site_key',
    'about_meta_title', 'about_meta_description', 'about_content', 'about_us',
    'contact_meta_title', 'contact_meta_description', 'contact_content',
    'privacy_meta_title', 'privacy_meta_description', 'privacy_content',
    'terms_meta_title', 'terms_meta_description', 'terms_content',
    'news_meta_title', 'news_meta_description', 'videos_meta_title', 'videos_meta_description',
    'developers_meta_title', 'developers_meta_description', 'developers',
    'responsibility_meta_title', 'responsibility_meta_description', 'responsibility_content',
    'report_removal_meta_title', 'report_removal_meta_description', 'report_removal_content',
    'notice_meta_title', 'notice_meta_description', 'important_notice',
    'ethics_meta_title', 'ethics_meta_description', 'ethics_discrimination_text', 'ethics_heading',
    'disclaimer_meta_title', 'disclaimer_meta_description', 'disclaimer_text', 'disclaimer_heading',
    'important_notice_heading', 'website_faqs'
  ];

  for (const k of publicAllowedKeys) {
    if (rawSettings[k] !== undefined) {
      optimizedSettings[k] = rawSettings[k];
    }
  }

  return {
    ...data,
    apps: optimizedApps,
    news: optimizedNews,
    videos: optimizedVideos,
    settings: optimizedSettings
  };
}
