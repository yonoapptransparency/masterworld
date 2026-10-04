import { getField, stripHtml, optimizeImageUrl, normalizeSchemaCategory, getYoutubeThumbnail, cleanFaqQuestion } from './utils';
import { fetchSEOReviewsForApp } from './reviewFallback';

export interface BuildSchemaParams {
  pageType: 'home' | 'app' | 'news' | 'video' | 'static' | 'collection' | 'gateway' | '404';
  title: string;
  description: string;
  url: string;
  logoUrl: string;
  siteTitle: string;
  app?: any;
  newsItem?: any;
  videoItem?: any;
  settings?: any;
  collectionItems?: Array<{ name: string; url: string; image?: string; description?: string }>;
  breadcrumbItems?: Array<{ name: string; url: string }>;
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

export async function buildJsonLdSchema(params: BuildSchemaParams): Promise<string> {
  const schemas: any[] = [];
  const hostOrigin = 'https://www.rummydex.com';

  if (params.pageType === 'app' && params.app) {
    const app = params.app;
    const name = getField(app, 'name');
    const category = normalizeSchemaCategory(getField(app, 'category'));
    const rawRating = getField(app, 'rating');
    const configuredRating = parseFloat(rawRating);
    const rawCount = getField(app, 'review_count') || getField(app, 'reviews') || '';
    const configuredCount = parseInt(rawCount, 10);
    
    // Align live rating and count with community reviews and AppDetails
    const appIdentifier = getField(app, 'slug') || getField(app, 'id');
    const seoFeed = await fetchSEOReviewsForApp(appIdentifier, getField(app, 'slug'), !isNaN(configuredRating) && configuredRating > 0 ? configuredRating : 4.5, name);
    const liveStats = seoFeed?.stats || null;
    
    const hasLiveReviews = Boolean(liveStats && Number(liveStats.totalReviews) > 0);
    const finalRating = hasLiveReviews
      ? Math.max(1.0, Math.min(5.0, Number(liveStats.averageRating)))
      : (!isNaN(configuredRating) && configuredRating > 0 ? Math.max(1.0, Math.min(5.0, configuredRating)) : 4.5);
    const clampedRating = Math.max(1.0, Math.min(5.0, finalRating));

    // Strictly real count of reviews present in Firebase / catalog
    const finalCount = hasLiveReviews 
      ? Number(liveStats.totalReviews) 
      : (!isNaN(configuredCount) && configuredCount > 0 ? configuredCount : 0);

    const appRawIcon = getField(app, 'icon_url') || getField(app, 'og_image_url') || params.logoUrl;
    const appSquareIcon = optimizeImageUrl(appRawIcon, 512) || appRawIcon;
    const desc = cleanSeoDescription(getField(app, 'seo_description') || getField(app, 'meta_description') || stripHtml(getField(app, 'description_html')).substring(0, 160) || params.description);

    const rawCat = getField(app, 'category');
    const specificCat = rawCat ? rawCat.split(',').map((c: string) => c.trim()).filter((c: string) => c && c.toLowerCase() !== 'all apps' && c.toLowerCase() !== 'all' && c.toLowerCase() !== 'apps' && c.toLowerCase() !== 'general')[0] : '';
    const developer = getField(app, 'developer') || params.siteTitle || 'RummyDex';
    const fileSize = getField(app, 'file_size') || '45 MB';
    const version = getField(app, 'version') || '1.0';

    const softwareAppSchema: any = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": name,
      "url": `${hostOrigin}/app/${getField(app, 'slug')}`,
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
        "priceCurrency": "INR",
        "availability": "https://schema.org/InStock"
      }
    };

    if (clampedRating > 0 && finalCount > 0) {
      softwareAppSchema["aggregateRating"] = {
        "@type": "AggregateRating",
        "ratingValue": parseFloat(clampedRating.toFixed(1)),
        "ratingCount": Math.round(finalCount),
        "reviewCount": Math.round(finalCount),
        "bestRating": 5,
        "worstRating": 1
      };
    }

    // Include sample reviews if available to boost Google Rich Snippet compliance
    try {
      const feed = await fetchSEOReviewsForApp(appIdentifier, getField(app, 'slug'), clampedRating, name);
      if (feed && Array.isArray(feed.reviews) && feed.reviews.length > 0) {
        const validReviews = feed.reviews
          .filter((rev: any) => rev && stripHtml(rev.reviewText || '').trim().length >= 3)
          .slice(0, 5)
          .map((rev: any) => ({
            "@type": "Review",
            "itemReviewed": {
              "@type": "SoftwareApplication",
              "name": name,
              "operatingSystem": "Android",
              "applicationCategory": specificCat || "GameApplication"
            },
            "author": {
              "@type": "Person",
              "name": rev.userName ? String(rev.userName).trim() : 'Verified Player'
            },
            "datePublished": (rev.timestamp ? new Date(rev.timestamp).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
            "reviewBody": stripHtml(rev.reviewText || '').trim(),
            "reviewRating": {
              "@type": "Rating",
              "ratingValue": Math.max(1, Math.min(5, Number(rev.rating) || 5)),
              "bestRating": 5,
              "worstRating": 1
            }
          }));

        if (validReviews.length > 0) {
          softwareAppSchema["review"] = validReviews;
        }
      }
    } catch (_) {}

    const appScreenshots = getField(app, 'screenshots');
    if (Array.isArray(appScreenshots) && appScreenshots.length > 0) {
      softwareAppSchema["screenshot"] = appScreenshots.map((s: string) => optimizeImageUrl(s, 1024) || s);
    }

    schemas.push(softwareAppSchema);

    // BreadcrumbList navigation schema
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
        "item": `${hostOrigin}/category/${encodeURIComponent(specificCat.toLowerCase().replace(/\s+/g, '-'))}`
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

    // App-specific FAQs
    const appNameForFaq = getField(app, 'name') || 'Application';
    const appSlugForFaq = getField(app, 'slug') || '';
    const appSizeForFaq = getField(app, 'file_size') || 'standard size';
    const rawFaqs = (app.faqs && Array.isArray(app.faqs) && app.faqs.length > 0)
      ? app.faqs
      : [
          {
            question: `How do I download and install ${appNameForFaq} on my Android device?`,
            answer: `To install ${appNameForFaq}, tap the Download button on this page to obtain the verified installation package directly. Once downloaded, open the notification or file in your device Downloads folder and follow the standard prompts to complete setup.`
          },
          {
            question: `Is ${appNameForFaq} safe to use?`,
            answer: `Yes. ${appNameForFaq} listed on RummyDex has been verified to ensure smooth performance, thermal stability, and authentic card gaming mechanics.`
          },
          {
            question: `What are the storage requirements for ${appNameForFaq}?`,
            answer: `${appNameForFaq} has an installation footprint of approximately ${appSizeForFaq} and is optimized for Android devices with minimal battery drain.`
          },
          {
            question: `Can I play card games with friends and family in ${appNameForFaq}?`,
            answer: `Yes, ${appNameForFaq} provides multiplayer tables and responsive matchmaking across mobile networks for card gaming anytime.`
          }
        ];

    const seenAppFaqs = new Set<string>();
    const faqList = rawFaqs
      .filter((faq: any) => {
        const q = cleanFaqQuestion(stripHtml(getField(faq, 'question')).trim());
        const a = stripHtml(getField(faq, 'answer')).trim();
        if (!q || !a || q.length < 5 || seenAppFaqs.has(q.toLowerCase())) return false;
        seenAppFaqs.add(q.toLowerCase());
        return true;
      })
      .map((faq: any) => ({
        "@type": "Question",
        "name": cleanFaqQuestion(stripHtml(getField(faq, 'question')).trim()),
        "acceptedAnswer": {
          "@type": "Answer",
          "text": stripHtml(getField(faq, 'answer')).trim()
        }
      }));

    if (faqList.length > 0) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "@id": `${hostOrigin}/app/${appSlugForFaq}#faq`,
        "url": `${hostOrigin}/app/${appSlugForFaq}`,
        "mainEntity": faqList
      });
    }
  } else if (params.pageType === 'news' && params.newsItem) {
    const item = params.newsItem;
    const title = getField(item, 'title');
    const desc = cleanSeoDescription(
      getField(item, 'seo_description') || 
      getField(item, 'meta_description') || 
      getField(item, 'description') || 
      params.description
    );
    const datePublished = getField(item, 'published_at') || getField(item, 'created_at') || getField(item, 'date') || new Date().toISOString();
    const dateModified = getField(item, 'updated_at') || datePublished;
    const authorName = getField(item, 'author') || getField(item, 'ceo_name') || params.siteTitle;

    const rawNewsImg = getField(item, 'og_image_url') || getField(item, 'image_url') || getField(item, 'logo_url') || params.logoUrl;
    const newsImg = optimizeImageUrl(rawNewsImg, 1200) || rawNewsImg;

    const newsSlugStr = getField(item, 'slug') || getField(item, 'id');
    const canonicalPageUrl = params.url || `${hostOrigin}/news/${newsSlugStr}`;
    const rawArticleBody = stripHtml(getField(item, 'content') || getField(item, 'description_html') || desc);

    schemas.push({
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": canonicalPageUrl
      },
      "headline": title,
      "description": desc,
      "articleBody": rawArticleBody,
      "image": [newsImg],
      "datePublished": datePublished,
      "dateModified": dateModified,
      "articleSection": getField(item, 'category') || 'General',
      "inLanguage": "en",
      "isAccessibleForFree": true,
      "author": {
        "@type": "Person",
        "name": authorName
      },
      "publisher": {
        "@type": "Organization",
        "name": params.siteTitle,
        "url": hostOrigin,
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
          "item": canonicalPageUrl
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
  } else if (params.pageType === 'collection') {
    const collectionSchema: any = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": params.title,
      "description": params.description,
      "url": params.url
    };

    if (params.collectionItems && params.collectionItems.length > 0) {
      collectionSchema.mainEntity = {
        "@type": "ItemList",
        "itemListElement": params.collectionItems.map((item, idx) => ({
          "@type": "ListItem",
          "position": idx + 1,
          "name": item.name,
          "url": item.url,
          ...(item.image ? { "image": item.image } : {}),
          ...(item.description ? { "description": item.description } : {})
        }))
      };
    }
    schemas.push(collectionSchema);

    if (params.breadcrumbItems && params.breadcrumbItems.length > 0) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": params.breadcrumbItems.map((b, idx) => ({
          "@type": "ListItem",
          "position": idx + 1,
          "name": b.name,
          "item": b.url
        }))
      });
    }
  } else {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${hostOrigin}/#website`,
      "url": hostOrigin,
      "name": params.siteTitle,
      "description": params.description,
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${hostOrigin}/?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      },
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
      const seenQuestions = new Set<string>();
      const faqList = params.settings.website_faqs
        .filter((faq: any) => {
          const q = cleanFaqQuestion(stripHtml(getField(faq, 'question')).trim());
          const a = stripHtml(getField(faq, 'answer')).trim();
          if (!q || !a || q.length < 5 || seenQuestions.has(q.toLowerCase())) return false;
          seenQuestions.add(q.toLowerCase());
          return true;
        })
        .map((faq: any) => ({
          "@type": "Question",
          "name": cleanFaqQuestion(stripHtml(getField(faq, 'question')).trim()),
          "acceptedAnswer": {
            "@type": "Answer",
            "text": stripHtml(getField(faq, 'answer')).trim()
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
  }

  return schemas.map(s => `<script type="application/ld+json" data-rh="true">${JSON.stringify(s).replace(/</g, '\\u003c')}</script>`).join('\n');
}
