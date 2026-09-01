import React, { useEffect } from 'react';
import { useData } from '../contexts/DataContextPublic';
import { getCleanCanonicalUrl, formatPageTitle } from '../lib/seoUtils';
import { getOgImageUrl } from '../seo/utils';

interface MetaProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  canonical?: string;
  schema?: any;
  faqSchema?: any;
  breadcrumbSchema?: any;
  noindex?: boolean;
}

const Meta: React.FC<MetaProps> = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  canonical,
  schema,
  faqSchema,
  breadcrumbSchema,
  noindex = false
}) => {
  const { settings } = useData();
  const siteTitle = settings?.site_title || 'RummyDex';
  const fullTitle = formatPageTitle(title, siteTitle);
  const metaDescription = description || settings?.meta_description || '';
  const metaKeywords = keywords || settings?.seo_keywords || '';
  
  const DEFAULT_ICON = 'https://res.cloudinary.com/diewalae4/image/upload/v1786624142/1000134293_sbicyb.png';
  const rawImage = image || settings?.logo_url || settings?.favicon_url || DEFAULT_ICON;
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.rummydex.com';
  const metaImage = getOgImageUrl(rawImage, origin);
  
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
  const canonicalUrl = getCleanCanonicalUrl(canonical || url, currentPath);
  const metaUrl = getCleanCanonicalUrl(url || canonical, currentPath);

  const cleanPathLower = currentPath.toLowerCase().replace(/\/+$/, '') || '/';
  const isDisallowedPrefix = 
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

  const isIndexable = !noindex && !isDisallowedPrefix;
  const robotsDirective = isIndexable 
    ? "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" 
    : "noindex, nofollow, noarchive, nosnippet, noimageindex, notranslate";

  useEffect(() => {
    if (typeof document === 'undefined') return;

    // 1. Update document title
    document.title = fullTitle;

    // Helper to update exactly ONE meta tag in document.head and purge any duplicates (checking both name and property)
    const setMetaTag = (attrName: 'name' | 'property', attrVal: string, contentVal: string) => {
      // Find all matches across name, property, or case variations
      const allMatches = document.head.querySelectorAll(
        `meta[${attrName}="${attrVal}" i], meta[${attrName === 'name' ? 'property' : 'name'}="${attrVal}" i]`
      );
      let primaryMeta: HTMLMetaElement | null = null;
      
      allMatches.forEach((el, index) => {
        if (index === 0) {
          primaryMeta = el as HTMLMetaElement;
        } else {
          el.remove(); // Purge duplicate copies
        }
      });

      if (!primaryMeta) {
        primaryMeta = document.createElement('meta');
        document.head.appendChild(primaryMeta);
      }
      (primaryMeta as HTMLMetaElement).setAttribute(attrName, attrVal);
      (primaryMeta as HTMLMetaElement).setAttribute('content', contentVal || '');
    };

    // 2. Standard Meta Tags
    setMetaTag('name', 'description', metaDescription);
    if (metaKeywords) {
      setMetaTag('name', 'keywords', metaKeywords);
    }
    setMetaTag('name', 'robots', robotsDirective);
    setMetaTag('name', 'googlebot', robotsDirective);
    setMetaTag('name', 'bingbot', robotsDirective);

    // 3. Strict Single Canonical Tag Enforcement in <head>
    const allCanonicals = document.querySelectorAll('link[rel="canonical"]');
    let headCanonical: HTMLLinkElement | null = null;
    allCanonicals.forEach((linkEl) => {
      if (linkEl.parentElement === document.head && !headCanonical) {
        headCanonical = linkEl as HTMLLinkElement;
      } else {
        linkEl.remove();
      }
    });

    if (headCanonical) {
      (headCanonical as HTMLLinkElement).setAttribute('href', canonicalUrl);
    } else {
      const link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      link.setAttribute('href', canonicalUrl);
      document.head.appendChild(link);
    }

    // 4. Strict Single Image Source Link Tag Enforcement
    const allImageLinks = document.querySelectorAll('link[rel="image_src"]');
    let headImageLink: HTMLLinkElement | null = null;
    allImageLinks.forEach((linkEl) => {
      if (linkEl.parentElement === document.head && !headImageLink) {
        headImageLink = linkEl as HTMLLinkElement;
      } else {
        linkEl.remove();
      }
    });
    if (metaImage) {
      if (headImageLink) {
        (headImageLink as HTMLLinkElement).setAttribute('href', metaImage);
      } else {
        const link = document.createElement('link');
        link.setAttribute('rel', 'image_src');
        link.setAttribute('href', metaImage);
        document.head.appendChild(link);
      }
    } else if (headImageLink) {
      (headImageLink as HTMLLinkElement).remove();
    }

    // 5. OpenGraph Tags
    setMetaTag('property', 'og:type', type);
    setMetaTag('property', 'og:url', metaUrl);
    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', metaDescription);
    setMetaTag('property', 'og:image', metaImage);
    setMetaTag('property', 'og:image:secure_url', metaImage);
    setMetaTag('property', 'og:image:type', metaImage.includes('.jpg') || metaImage.includes('f_jpg') ? 'image/jpeg' : 'image/png');
    setMetaTag('property', 'og:image:width', '1200');
    setMetaTag('property', 'og:image:height', '630');
    setMetaTag('property', 'og:site_name', siteTitle);
    setMetaTag('property', 'og:locale', 'en_IN');

    // 6. Twitter Card Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:site', '@RummyDex');
    setMetaTag('name', 'twitter:creator', '@RummyDex');
    setMetaTag('name', 'twitter:url', metaUrl);
    setMetaTag('name', 'twitter:title', fullTitle);
    setMetaTag('name', 'twitter:description', metaDescription);
    setMetaTag('name', 'twitter:image', metaImage);

    // 7. Schema.org JSON-LD Structured Data in <head>
    const schemasToInject: any[] = [];
    if (schema) schemasToInject.push(schema);
    if (faqSchema) schemasToInject.push(faqSchema);
    if (breadcrumbSchema) schemasToInject.push(breadcrumbSchema);

    if (currentPath === '/' && !schema) {
      schemasToInject.push({
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": siteTitle,
        "url": origin,
        "description": metaDescription,
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${origin}/?q={search_term_string}`,
          "query-input": "required name=search_term_string"
        }
      });
    }

    if (schemasToInject.length > 0) {
      // Remove previous dynamic or SSR schemas now that we have fresh schemas to inject
      const allSchemaScripts = document.head.querySelectorAll('script[type="application/ld+json"]');
      allSchemaScripts.forEach((s) => s.remove());

      schemasToInject.forEach((s) => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-dynamic-schema', 'true');
        script.textContent = JSON.stringify(s);
        document.head.appendChild(script);
      });
    }
  }, [fullTitle, metaDescription, metaKeywords, robotsDirective, canonicalUrl, metaUrl, type, metaImage, siteTitle, schema, faqSchema, breadcrumbSchema, currentPath, origin]);

  return null;
};

export default Meta;
