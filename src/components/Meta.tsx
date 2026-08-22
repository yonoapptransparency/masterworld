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
  noindex = false
}) => {
  const { settings } = useData();
  const siteTitle = settings?.site_title || 'RummyDex';
  const fullTitle = formatPageTitle(title, siteTitle);
  const metaDescription = description || settings?.meta_description || 'Discover and download verified Rummy applications, APKs, card games, latest news, and features on RummyDex.';
  const metaKeywords = keywords || settings?.seo_keywords || '';
  
  const DEFAULT_ICON = 'https://res.cloudinary.com/diewalae4/image/upload/v1786624142/1000134293_sbicyb.png';
  const faviconUrl = (settings?.favicon_url && settings.favicon_url.trim()) || DEFAULT_ICON;
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

    // Helper to update or create a meta tag in document.head
    const setMetaTag = (attrName: string, attrVal: string, contentVal: string) => {
      let meta = document.head.querySelector(`meta[${attrName}="${attrVal}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attrName, attrVal);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', contentVal);
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
    // Remove ANY duplicate or rogue canonical links anywhere in document
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

    // 4. OpenGraph Tags
    setMetaTag('property', 'og:type', type);
    setMetaTag('property', 'og:url', metaUrl);
    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', metaDescription);
    setMetaTag('property', 'og:image', metaImage);
    setMetaTag('property', 'og:image:secure_url', metaImage);
    setMetaTag('property', 'og:site_name', siteTitle);

    // 5. Twitter Card Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:url', metaUrl);
    setMetaTag('name', 'twitter:title', fullTitle);
    setMetaTag('name', 'twitter:description', metaDescription);
    setMetaTag('name', 'twitter:image', metaImage);

    // 6. JSON-LD Structured Data in <head>
    const existingSchemaScript = document.head.querySelector('script[data-dynamic-schema="true"]');
    if (existingSchemaScript) {
      existingSchemaScript.remove();
    }

    const schemasToInject: any[] = [];
    if (schema) schemasToInject.push(schema);
    if (faqSchema) schemasToInject.push(faqSchema);

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
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-dynamic-schema', 'true');
      script.textContent = schemasToInject.length === 1 ? JSON.stringify(schemasToInject[0]) : JSON.stringify(schemasToInject);
      document.head.appendChild(script);
    }
  }, [fullTitle, metaDescription, metaKeywords, robotsDirective, canonicalUrl, metaUrl, type, metaImage, siteTitle, schema, faqSchema, currentPath, origin]);

  return null;
};

export default Meta;
