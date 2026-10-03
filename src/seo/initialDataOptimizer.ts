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
  const isNewsPage = cleanPathLower === '/news' || cleanPathLower.startsWith('/news/');
  const isNewsDetailPage = cleanPathLower.startsWith('/news/');
  const isStaticTextPage = [
    '/about', '/contact', '/privacy', '/terms', '/responsibility',
    '/report-removal', '/notice', '/ethics', '/disclaimer', '/developers', '/faq'
  ].includes(cleanPathLower);

  const targetAppSlug = targetApp ? getField(targetApp, 'slug')?.toLowerCase().trim() : null;
  const targetAppId = targetApp ? String(getField(targetApp, 'id') || '').toLowerCase().trim() : '';
  const targetAppName = targetApp ? String(getField(targetApp, 'name') || '').toLowerCase().trim() : '';
  const targetNewsSlug = targetNews ? (getField(targetNews, 'slug') || getField(targetNews, 'id'))?.toLowerCase().trim() : null;

  let optimizedApps: any[] = [];

  if (isStaticTextPage) {
    // Zero apps payload for purely informational text pages to maintain lightweight SSR
    optimizedApps = [];
  } else if (isAppDetailPage && targetApp) {
    // On app detail page, strictly send ONLY the target app (full) + up to 12 similar apps in the same category
    const targetCat = String(getField(targetApp, 'category') || '').toLowerCase().split(',')[0].trim();

    const fullTargetApp: any = {
      id: targetApp.id,
      name: targetApp.name,
      slug: targetApp.slug,
      icon_url: targetApp.icon_url,
      category: targetApp.category,
      rating: Number(targetApp.rating) || 4.5,
      version: targetApp.version || '1.0',
      file_size: targetApp.file_size || '45 MB',
      safety_status: targetApp.safety_status || 'Verified',
      developer: targetApp.developer || '',
      review_count: Number(targetApp.review_count) || (typeof targetApp.reviews === 'number' ? targetApp.reviews : 0),
      reviews: typeof targetApp.reviews === 'number' ? targetApp.reviews : Number(targetApp.review_count) || 0,
      short_description: targetApp.short_description || '',
      seo_title: targetApp.seo_title || '',
      seo_description: targetApp.seo_description || '',
      meta_description: targetApp.meta_description || '',
      og_image_url: targetApp.og_image_url || '',
      canonical_url: targetApp.canonical_url || '',
      description_html: targetApp.description_html || '',
      features_html: targetApp.features_html || '',
      screenshots: Array.isArray(targetApp.screenshots) ? targetApp.screenshots : [],
      faqs: Array.isArray(targetApp.faqs) ? targetApp.faqs : [],
      custom_admin_box_html: targetApp.custom_admin_box_html || '',
      custom_admin_box_heading: targetApp.custom_admin_box_heading || '',
      yellow_box_msg: targetApp.yellow_box_msg || '',
      red_box_msg: targetApp.red_box_msg || '',
      idea_box_msg: targetApp.idea_box_msg || '',
      release_notes: targetApp.release_notes || '',
      video_url: targetApp.video_url || '',
      updated_at: targetApp.updated_at || '',
      created_at: targetApp.created_at || ''
    };

    const allOtherApps = Array.isArray(data.apps) ? data.apps.filter((a: any) => {
      const s = (getField(a, 'slug') || '').toLowerCase().trim();
      const id = String(getField(a, 'id') || '').toLowerCase().trim();
      return s !== targetAppSlug && id !== targetAppId;
    }) : [];

    const categoryMatches = allOtherApps.filter((a: any) => {
      const cat = String(getField(a, 'category') || '').toLowerCase();
      return targetCat ? cat.includes(targetCat) : false;
    });

    const fallbackMatches = allOtherApps.filter((a: any) => !categoryMatches.includes(a));
    const chosenSimilar = [...categoryMatches, ...fallbackMatches].slice(0, 12);

    const similarStubs = chosenSimilar.map((a: any) => ({
      id: a.id,
      name: a.name,
      slug: a.slug,
      icon_url: a.icon_url,
      category: a.category,
      rating: Number(a.rating) || 4.5,
      version: a.version || '1.0',
      file_size: a.file_size || '45 MB'
    }));

    optimizedApps = [fullTargetApp, ...similarStubs];
  } else {
    // 18-item above-the-fold rule: Keep first 18 apps for instant paint and strip heavy fields
    const LIST_VIEW_LIMIT = 18;
    const baseApps = Array.isArray(data.apps) ? data.apps : [];

    const aboveFoldApps = baseApps.slice(0, LIST_VIEW_LIMIT).map((app: any) => ({
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
      is_featured: Boolean(app.is_featured),
      is_new: Boolean(app.is_new),
      is_hot: Boolean(app.is_hot),
      is_top_chart: Boolean(app.is_top_chart),
      top_chart_category: app.top_chart_category || '',
      publish_date: app.publish_date || '',
      updated_at: app.updated_at || '',
      short_description: typeof app.short_description === 'string' ? app.short_description.slice(0, 120) : '',
      description_html: '',
      features_html: '',
      screenshots: [],
      faqs: [],
      custom_admin_box_html: '',
      custom_admin_box_heading: '',
      yellow_box_msg: '',
      red_box_msg: '',
      idea_box_msg: '',
      release_notes: '',
      seo_title: app.seo_title || '',
      seo_description: app.seo_description || '',
      canonical_url: app.canonical_url || ''
    }));

    // For remaining apps, provide ultra-lightweight stubs so client search/filters function immediately without 1MB HTML bloat
    const remainingStubs = baseApps.slice(LIST_VIEW_LIMIT).map((app: any) => ({
      id: app.id,
      name: app.name,
      slug: app.slug,
      icon_url: app.icon_url || '',
      category: app.category || '',
      rating: Number(app.rating) || 4.5,
      version: app.version || '1.0',
      file_size: app.file_size || '',
      safety_status: app.safety_status || 'Verified',
      developer: app.developer || '',
      is_featured: Boolean(app.is_featured),
      is_new: Boolean(app.is_new),
      is_hot: Boolean(app.is_hot),
      is_top_chart: Boolean(app.is_top_chart)
    }));

    optimizedApps = [...aboveFoldApps, ...remainingStubs];
  }

  const optimizedNews = (Array.isArray(data.news) ? data.news : [])
    .filter((item: any) => {
      if (!item || item.sync_to_public === false) return false;
      if (isAppDetailPage && targetApp) {
        const relId = String(item.related_app_id || '').trim();
        const matchesRel = targetAppId && relId === targetAppId;
        const matchesName = targetAppName && (item.title || '').toLowerCase().includes(targetAppName);
        return matchesRel || matchesName;
      }
      if (isStaticTextPage) return false;
      return true;
    })
    .map((item: any) => {
      const itemSlug = (item.slug || item.id || '').toLowerCase().trim();
      const itemId = String(item.id || '').toLowerCase().trim();
      const isTargetNewsArticle = isNewsDetailPage && targetNewsSlug && (
        itemSlug === targetNewsSlug ||
        itemId === targetNewsSlug ||
        (item.slug && item.slug.toLowerCase().trim() === targetNewsSlug)
      );

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

  const optimizedVideos = (isAppDetailPage || isNewsPage || isStaticTextPage) ? [] : (Array.isArray(data.videos) ? data.videos.map((item: any) => {
    const isTarget = targetVideo && (getField(item, 'slug') || getField(item, 'id'))?.toLowerCase() === (getField(targetVideo, 'slug') || getField(targetVideo, 'id'))?.toLowerCase();
    if (isTarget) return item;
    return {
      id: item.id,
      slug: item.slug,
      title: item.title,
      seo_title: item.seo_title,
      seo_description: item.seo_description,
      meta_description: item.meta_description,
      og_image_url: item.og_image_url,
      thumbnail_url: item.thumbnail_url,
      video_url: item.video_url,
      duration: item.duration,
      category: item.category
    };
  }) : []);

  // Strict public settings whitelist to prevent any backend test, token, or secret leakage
  const rawSettings = data.settings || {};
  const optimizedSettings: any = {};
  const publicAllowedKeys = [
    'site_title', 'logo_url', 'favicon_url', 'seo_title', 'seo_description', 'seo_keywords',
    'meta_title', 'meta_description', 'social_links', 'categories', 'hero_title_text',
    'hero_title_subtitle', 'hero_title_color', 'hero_title_animation', 'hero_title_visible',
    'hero_title_style', 'portal_heading', 'secure_index_title', 'secure_index_subtitle',
    'trending_searches', 'ticker_text', 'support_email', 'last_updated', 'animations_enabled',
    'banners', 'quick_links', 'turnstile_site_key',
    'about_meta_title', 'about_meta_description', 'contact_meta_title', 'contact_meta_description',
    'privacy_meta_title', 'privacy_meta_description', 'terms_meta_title', 'terms_meta_description',
    'news_meta_title', 'news_meta_description', 'videos_meta_title', 'videos_meta_description',
    'developers_meta_title', 'developers_meta_description', 'responsibility_meta_title', 'responsibility_meta_description',
    'report_removal_meta_title', 'report_removal_meta_description', 'notice_meta_title', 'notice_meta_description',
    'ethics_meta_title', 'ethics_meta_description', 'disclaimer_meta_title', 'disclaimer_meta_description',
    'ethics_heading', 'disclaimer_heading', 'important_notice_heading'
  ];

  for (const k of publicAllowedKeys) {
    if (rawSettings[k] !== undefined) {
      optimizedSettings[k] = rawSettings[k];
    }
  }

  // Include heavy subpage bodies strictly only when user is on that specific subpage
  if (cleanPathLower === '/about' && rawSettings.about_us) optimizedSettings.about_us = rawSettings.about_us;
  if (cleanPathLower === '/contact' && rawSettings.contact_content) optimizedSettings.contact_content = rawSettings.contact_content;
  if (cleanPathLower === '/privacy' && rawSettings.privacy_content) optimizedSettings.privacy_content = rawSettings.privacy_content;
  if (cleanPathLower === '/terms' && rawSettings.terms_content) optimizedSettings.terms_content = rawSettings.terms_content;
  if (cleanPathLower === '/responsibility' && rawSettings.responsibility_content) optimizedSettings.responsibility_content = rawSettings.responsibility_content;
  if (cleanPathLower === '/report-removal' && rawSettings.report_removal_content) optimizedSettings.report_removal_content = rawSettings.report_removal_content;
  if (cleanPathLower === '/notice' && rawSettings.important_notice) optimizedSettings.important_notice = rawSettings.important_notice;
  if (cleanPathLower === '/ethics' && rawSettings.ethics_discrimination_text) optimizedSettings.ethics_discrimination_text = rawSettings.ethics_discrimination_text;
  if (cleanPathLower === '/disclaimer' && rawSettings.disclaimer_text) optimizedSettings.disclaimer_text = rawSettings.disclaimer_text;
  if (cleanPathLower === '/developers' && rawSettings.developers) optimizedSettings.developers = rawSettings.developers;
  if ((cleanPathLower === '/faq' || cleanPathLower === '/') && rawSettings.website_faqs) optimizedSettings.website_faqs = rawSettings.website_faqs;

  return {
    ...data,
    apps: optimizedApps,
    news: optimizedNews,
    videos: optimizedVideos,
    settings: optimizedSettings
  };
}
