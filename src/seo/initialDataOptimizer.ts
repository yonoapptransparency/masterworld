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

  const targetAppSlug = targetApp ? (getField(targetApp, 'slug') || getField(targetApp, 'id'))?.toLowerCase().trim() : null;
  const targetAppId = targetApp ? String(getField(targetApp, 'id') || '').toLowerCase().trim() : '';
  const targetNewsSlug = targetNews ? (getField(targetNews, 'slug') || getField(targetNews, 'id'))?.toLowerCase().trim() : null;

  const baseApps = Array.isArray(data.apps) ? data.apps : (Array.isArray(data.mockApps) ? data.mockApps : []);

  // Optimized Apps Payload:
  // - If on an App Details page or targetApp is present: Target app has 100% full rich fields (HTML, screenshots, faqs, custom boxes).
  // - All other apps contain structured catalog fields so Home, Categories, and Instant Search work seamlessly with 0ms latency.
  const optimizedApps = baseApps.map((app: any) => {
    if (!app) return null;
    const s = (getField(app, 'slug') || '').toLowerCase().trim();
    const id = String(getField(app, 'id') || '').toLowerCase().trim();
    const isTarget = Boolean(targetApp) && (
      (targetAppSlug && (s === targetAppSlug || id === targetAppSlug)) ||
      (targetAppId && (id === targetAppId || s === targetAppId))
    );

    if (isTarget) {
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
        video_url: app.video_url || '',
        serial_number: app.serial_number !== undefined ? Number(app.serial_number) : 0,
        is_featured: Boolean(app.is_featured),
        is_new: Boolean(app.is_new),
        is_hot: Boolean(app.is_hot),
        is_top_chart: Boolean(app.is_top_chart),
        top_chart_category: app.top_chart_category || '',
        publish_date: app.publish_date || '',
        updated_at: app.updated_at || '',
        created_at: app.created_at || ''
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

  // Optimized News: Include news when on news routes or home page
  const rawNews = Array.isArray(data.news) ? data.news : (Array.isArray(data.mockNews) ? data.mockNews : []);
  let optimizedNews: any[] = [];
  if (isNewsDetailPage || cleanPathLower.startsWith('/news') || cleanPathLower === '/' || cleanPathLower === '') {
    optimizedNews = rawNews
      .filter((item: any) => item && item.sync_to_public !== false)
      .map((item: any) => {
        const itemSlug = (item.slug || item.id || '').toLowerCase().trim();
        const itemId = String(item.id || '').toLowerCase().trim();
        const isTargetNewsArticle = Boolean(targetNews) && (
          (targetNewsSlug && (itemSlug === targetNewsSlug || itemId === targetNewsSlug)) ||
          (item.slug && targetNewsSlug && item.slug.toLowerCase().trim() === targetNewsSlug)
        );

        return {
          id: item.id,
          slug: item.slug,
          title: item.title,
          logo_url: item.logo_url || item.image_url || '',
          image_url: item.image_url || item.logo_url || '',
          description: item.description || '',
          content: isTargetNewsArticle ? (item.content || item.description_html || item.description || '') : (item.description || ''),
          description_html: isTargetNewsArticle ? (item.description_html || item.content || item.description || '') : (item.description || ''),
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

  // Optimized Videos: Only include when on video pages or home page
  const rawVideos = Array.isArray(data.videos) ? data.videos : (Array.isArray(data.mockVideos) ? data.mockVideos : []);
  let optimizedVideos: any[] = [];
  if (cleanPathLower.startsWith('/video') || cleanPathLower === '/' || cleanPathLower === '') {
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

  // Public Settings: Include core UI settings + route-specific content only, keeping initial payload super lightweight
  const rawSettings = data.settings || data.mockSettings || {};
  const optimizedSettings: any = {};
  const coreUiKeys = [
    'site_title', 'logo_url', 'favicon_url', 'seo_title', 'seo_description', 'seo_keywords',
    'meta_title', 'meta_description', 'social_links', 'categories', 'hero_title_text',
    'hero_title_subtitle', 'hero_title_color', 'hero_title_animation', 'hero_title_visible',
    'hero_title_style', 'portal_heading', 'secure_index_title', 'secure_index_subtitle',
    'trending_searches', 'ticker_text', 'support_email', 'last_updated', 'animations_enabled',
    'banners', 'quick_links', 'turnstile_site_key'
  ];

  const routeSpecificKeys: string[] = [];
  if (cleanPathLower.startsWith('/about')) routeSpecificKeys.push('about_meta_title', 'about_meta_description', 'about_content', 'about_us');
  if (cleanPathLower.startsWith('/contact')) routeSpecificKeys.push('contact_meta_title', 'contact_meta_description', 'contact_content');
  if (cleanPathLower.startsWith('/privacy')) routeSpecificKeys.push('privacy_meta_title', 'privacy_meta_description', 'privacy_content');
  if (cleanPathLower.startsWith('/terms')) routeSpecificKeys.push('terms_meta_title', 'terms_meta_description', 'terms_content');
  if (cleanPathLower.startsWith('/responsibility')) routeSpecificKeys.push('responsibility_meta_title', 'responsibility_meta_description', 'responsibility_content');
  if (cleanPathLower.startsWith('/report-removal')) routeSpecificKeys.push('report_removal_meta_title', 'report_removal_meta_description', 'report_removal_content');
  if (cleanPathLower.startsWith('/notice')) routeSpecificKeys.push('notice_meta_title', 'notice_meta_description', 'important_notice', 'important_notice_heading');
  if (cleanPathLower.startsWith('/ethics')) routeSpecificKeys.push('ethics_meta_title', 'ethics_meta_description', 'ethics_discrimination_text', 'ethics_heading');
  if (cleanPathLower.startsWith('/disclaimer')) routeSpecificKeys.push('disclaimer_meta_title', 'disclaimer_meta_description', 'disclaimer_text', 'disclaimer_heading');
  if (cleanPathLower.startsWith('/developers')) routeSpecificKeys.push('developers_meta_title', 'developers_meta_description', 'developers');
  if (cleanPathLower.startsWith('/faq')) routeSpecificKeys.push('website_faqs');
  if (cleanPathLower.startsWith('/news')) routeSpecificKeys.push('news_meta_title', 'news_meta_description');
  if (cleanPathLower.startsWith('/video')) routeSpecificKeys.push('videos_meta_title', 'videos_meta_description');

  const allowedKeys = [...coreUiKeys, ...routeSpecificKeys];
  for (const k of allowedKeys) {
    if (rawSettings[k] !== undefined) {
      optimizedSettings[k] = rawSettings[k];
    }
  }

  // Ensure developers array is available if present in settings or data for developers page
  if (cleanPathLower.startsWith('/developers') && !optimizedSettings.developers && Array.isArray(data.developers)) {
    optimizedSettings.developers = data.developers;
  }

  return {
    ...data,
    apps: optimizedApps,
    news: optimizedNews,
    videos: optimizedVideos,
    settings: optimizedSettings
  };
}
