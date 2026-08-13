import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useData } from '../contexts/DataContextPublic';
import { getCleanCanonicalUrl, formatPageTitle } from '../lib/seoUtils';
import { ensureAbsoluteUrl, getOgImageUrl } from '../seo/utils';

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
  const metaDescription = description || settings?.meta_description || 'Access application details and specifications.';
  const metaKeywords = keywords || settings?.seo_keywords || '';
  
  const DEFAULT_ICON = 'https://res.cloudinary.com/diewalae4/image/upload/v1786624142/1000134293_sbicyb.png';
  const faviconUrl = (settings?.favicon_url && settings.favicon_url.trim()) || DEFAULT_ICON;
  const rawImage = image || settings?.logo_url || settings?.favicon_url || DEFAULT_ICON;
  const metaImage = getOgImageUrl(rawImage, typeof window !== 'undefined' ? window.location.origin : 'https://www.rummydex.com');
  
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
  const canonicalUrl = getCleanCanonicalUrl(canonical || url, currentPath);
  const metaUrl = getCleanCanonicalUrl(url || canonical, currentPath);

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      {metaKeywords && <meta name="keywords" content={metaKeywords} />}
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover" />
      <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large"} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Favicons & Mobile Icons - Direct Cloudinary icon support */}
      <link rel="shortcut icon" href={faviconUrl} />
      <link rel="icon" type="image/png" href={faviconUrl} />
      <link rel="icon" type="image/png" sizes="32x32" href={faviconUrl} />
      <link rel="icon" type="image/png" sizes="192x192" href={faviconUrl} />
      <link rel="apple-touch-icon" href={faviconUrl} />
      <link rel="apple-touch-icon" sizes="180x180" href={faviconUrl} />
      <link rel="apple-touch-icon-precomposed" href={faviconUrl} />
      <link rel="manifest" href="/site.webmanifest" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={metaUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:image:secure_url" content={metaImage} />
      <meta property="og:image:type" content={metaImage.includes('.jpg') || metaImage.includes('f_jpg') ? 'image/jpeg' : 'image/png'} />
      <meta property="og:site_name" content={siteTitle} />
      <link rel="image_src" href={metaImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={metaUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />

      {/* Mobile Fitness / Theme */}
      <meta name="theme-color" content="#dc2626" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

      {/* JSON-LD Structured Data */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
      {faqSchema && (
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      )}

      {/* Default WebSite Schema if on Home */}
      {window.location.pathname === '/' && !schema && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": siteTitle,
            "url": window.location.origin,
            "description": metaDescription,
            "potentialAction": {
              "@type": "SearchAction",
              "target": `${window.location.origin}/?q={search_term_string}`,
              "query-input": "required name=search_term_string"
            }
          })}
        </script>
      )}
    </Helmet>
  );
};

export default Meta;
