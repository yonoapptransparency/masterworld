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
  const rawImage = image || settings?.logo_url || settings?.favicon_url || 'https://res.cloudinary.com/diewalae4/image/upload/v1786556304/1000134161_11zon_fgqzz6.png';
  const metaImage = getOgImageUrl(rawImage, typeof window !== 'undefined' ? window.location.origin : 'https://www.rummydex.com');
  const favIconUrl = settings?.favicon_url || settings?.logo_url || 'https://res.cloudinary.com/diewalae4/image/upload/v1786556304/1000134161_11zon_fgqzz6.png';

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
      <link rel="icon" type="image/x-icon" href={favIconUrl.includes('res.cloudinary.com') ? favIconUrl.replace(/\/upload\/([^\/]+)\//, '/upload/w_32,h_32,c_fill,f_ico,q_auto/') : favIconUrl} />
      <link rel="icon" type="image/png" sizes="32x32" href={favIconUrl.includes('res.cloudinary.com') ? favIconUrl.replace(/\/upload\/([^\/]+)\//, '/upload/w_32,h_32,c_fill,f_png,q_auto/') : favIconUrl} />
      <link rel="apple-touch-icon" sizes="180x180" href={favIconUrl.includes('res.cloudinary.com') ? favIconUrl.replace(/\/upload\/([^\/]+)\//, '/upload/w_180,h_180,c_fill,f_png,q_auto/') : favIconUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={metaUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:image:secure_url" content={metaImage} />
      <meta property="og:image:type" content="image/jpeg" />
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
