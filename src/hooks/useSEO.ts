import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AppConfig, GlobalSettings, NewsItem, BlogPost, VideoItem } from '../types';
import { ensureAbsoluteUrl, getYoutubeThumbnail as parseYoutubeThumbnail } from '../seo/utils';

export function useSEO(
  settings: GlobalSettings | null,
  apps: AppConfig[],
  news: NewsItem[],
  blogs: BlogPost[],
  videos: VideoItem[],
  isAdminPath: boolean = false
) {
  const location = useLocation();

  useEffect(() => {
    if (!settings) return;

    const stripHtml = (html: string) => {
      if (!html) return '';
      return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    };

    const siteTitle = settings.site_title || '';
    let pageTitle = siteTitle;
    let pageDesc = settings.meta_description || '';
    let pageKeywords = settings.seo_keywords || '';
    let pageOgImage = settings.logo_url || '';
    let pageAuthor = siteTitle;
    let pageRobots = 'index, follow';

    const path = location.pathname;

    const setMetaTag = (nameOrProperty: string, content: string, isProperty: boolean = false) => {
      const attributeName = isProperty ? 'property' : 'name';
      const selector = `meta[${attributeName}="${nameOrProperty}"]`;
      let element = document.querySelector(selector);
      if (!content) {
        if (element) element.remove();
        return;
      }
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attributeName, nameOrProperty);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    if (isAdminPath) {
      pageTitle = `Admin Dashboard - ${siteTitle}`;
      pageDesc = 'Admin authentication and management portal.';
      pageKeywords = 'admin, dashboard';
      pageRobots = 'noindex, nofollow, noarchive, nosnippet';
    } else if (path === '/' || path === '') {
      pageTitle = siteTitle;
      pageDesc = settings.meta_description || '';
      pageKeywords = settings.seo_keywords || '';
      pageOgImage = settings.logo_url || '';
    } else if (path === '/about') {
      pageTitle = `About Us - ${siteTitle}`;
      pageDesc = settings.meta_description || '';
      pageKeywords = settings.seo_keywords || '';
    } else if (path === '/developers') {
      pageTitle = `Meet Our Team - ${siteTitle}`;
      pageDesc = `Meet the brilliant developers behind ${siteTitle}. Discover our team's expertise and passion.`;
      pageKeywords = 'team, developers, creators';
    } else if (path === '/contact') {
      pageTitle = `Contact Us - ${siteTitle}`;
      pageDesc = settings.meta_description || '';
      pageKeywords = settings.seo_keywords || '';
    } else if (path === '/privacy') {
      pageTitle = `Privacy Policy - ${siteTitle}`;
      pageDesc = settings.meta_description || '';
      pageKeywords = settings.seo_keywords || '';
    } else if (path === '/report-removal') {
      pageTitle = `Report & Removal Policy - ${siteTitle}`;
      pageDesc = `Our official report and removal policy regarding intellectual property, copyrighted works, and DMCA content guidelines.`;
      pageKeywords = `dmca, copyright, report content, content removal, compliance, ${settings.seo_keywords || ''}`;
    } else if (path === '/terms') {
      pageTitle = `Terms and Conditions - ${siteTitle}`;
      pageDesc = settings.meta_description || '';
      pageKeywords = settings.seo_keywords || '';
    } else if (path === '/notice') {
      pageTitle = `${settings.important_notice_heading || 'Notice'} - ${siteTitle}`;
      pageDesc = settings.meta_description || '';
      pageKeywords = settings.seo_keywords || '';
    } else if (path === '/ethics') {
      pageTitle = `${settings.ethics_heading || 'Ethics & Safety'} - ${siteTitle}`;
      pageDesc = settings.meta_description || '';
      pageKeywords = settings.seo_keywords || '';
    } else if (path === '/disclaimer') {
      pageTitle = `${settings.disclaimer_heading || 'Disclaimer'} - ${siteTitle}`;
      pageDesc = settings.meta_description || '';
      pageKeywords = settings.seo_keywords || '';
    } else if (path === '/responsibility') {
      pageTitle = `Responsible Gaming - ${siteTitle}`;
      pageDesc = settings.meta_description || '';
      pageKeywords = settings.seo_keywords || '';
    } else if (path === '/news') {
      pageTitle = `Latest News - ${siteTitle}`;
      pageDesc = 'Read our official news and verified coverage.';
      pageKeywords = settings.seo_keywords || '';
    } else if (path === '/blogs') {
      pageTitle = `App Updates & Release Notes - ${siteTitle}`;
      pageDesc = 'Read the latest app updates, version release notes, changelogs, and patch announcements.';
      pageKeywords = settings.seo_keywords || '';
    } else if (path === '/videos') {
      pageTitle = `Video Interface Walkthroughs - ${siteTitle}`;
      pageDesc = 'Watch video walkthroughs, system reviews, and strategic play-through breakdowns.';
      pageKeywords = settings.seo_keywords || '';
    } else if (path.startsWith('/app/')) {
      const slug = decodeURIComponent(path.split('/app/')[1]?.split('/')[0]?.split('?')[0] || '');
      const app = apps.find((a: any) => a?.slug?.toLowerCase() === slug.toLowerCase());
      if (app) {
        pageTitle = app.seo_title || app.name || siteTitle;
        const rawDesc = app.seo_description || '';
        const rawHtml = app.description_html || '';
        pageDesc = rawDesc ? rawDesc : (rawHtml ? stripHtml(rawHtml).substring(0, 160) : '');
        pageKeywords = app.seo_keywords || '';
        pageOgImage = app.og_image_url || app.icon_url || settings.logo_url || '';
      }
    } else if (path.startsWith('/s/')) {
      const slug = decodeURIComponent(path.split('/s/')[1]?.split('?')[0] || '');
      const app = apps.find((a: any) => a?.slug?.toLowerCase() === slug.toLowerCase());
      if (app) {
        pageTitle = `${app.seo_title || app.name || siteTitle} - Safety Status`;
        const rawDesc = app.seo_description || '';
        const rawHtml = app.description_html || '';
        pageDesc = rawDesc ? rawDesc : (rawHtml ? stripHtml(rawHtml).substring(0, 160) : '');
        pageKeywords = app.seo_keywords || '';
        pageOgImage = app.og_image_url || app.icon_url || settings.logo_url || '';
      }
    } else if (path.startsWith('/news/') && path.length > 6) {
      const slug = decodeURIComponent(path.split('/news/')[1]?.split('/')[0]?.split('?')[0] || '');
      const newsItem = news.find((n: any) => n?.slug?.toLowerCase() === slug.toLowerCase());
      if (newsItem) {
        pageTitle = newsItem.title ? `${newsItem.title} - ${siteTitle}` : siteTitle;
        const rawDesc = newsItem.seo_description || '';
        const rawContent = newsItem.description || '';
        pageDesc = rawDesc ? rawDesc : (rawContent ? stripHtml(rawContent).substring(0, 160) : '');
        pageKeywords = newsItem.seo_keywords || '';
        pageOgImage = newsItem.logo_url || settings.logo_url || '';
        pageAuthor = newsItem.ceo_name || siteTitle;
      }
    } else if (path.startsWith('/blog/') && path.length > 6) {
      const slug = decodeURIComponent(path.split('/blog/')[1]?.split('/')[0]?.split('?')[0] || '');
      const blogItem = blogs.find((b: any) => b?.slug?.toLowerCase() === slug.toLowerCase());
      if (blogItem) {
        pageTitle = blogItem.title ? `${blogItem.title} - ${siteTitle}` : siteTitle;
        const rawDesc = blogItem.seo_description || '';
        const rawContent = blogItem.content || '';
        pageDesc = rawDesc ? rawDesc : (rawContent ? stripHtml(rawContent).substring(0, 160) : '');
        pageKeywords = blogItem.seo_keywords || '';
        pageOgImage = blogItem.cover_url || settings.logo_url || '';
        pageAuthor = blogItem.author || siteTitle;
      }
    } else if (path.startsWith('/videos/') && path.length > 8) {
      const slug = decodeURIComponent(path.split('/videos/')[1]?.split('/')[0]?.split('?')[0] || '');
      const videoItem = videos.find((v: any) => v?.slug?.toLowerCase() === slug.toLowerCase() || v?.id?.toLowerCase() === slug.toLowerCase());
      if (videoItem) {
        pageTitle = videoItem.title ? `${videoItem.title} - ${siteTitle}` : siteTitle;
        pageDesc = videoItem.seo_description || videoItem.description || '';
        pageKeywords = settings.seo_keywords || '';
        pageOgImage = parseYoutubeThumbnail(videoItem.youtube_url) || settings.logo_url || '';
      }
    } else if (path.startsWith('/info/') || path.startsWith('/moreinfo/') || path.startsWith('/moredetail/')) {
      const parts = path.split('/');
      const slug = decodeURIComponent(parts[parts.length - 1]?.split('?')[0] || '');
      const app = apps.find((a: any) => a?.slug?.toLowerCase() === slug.toLowerCase());
      if (app) {
        pageTitle = `More Info: ${app.seo_title || app.name || siteTitle}`;
        pageDesc = `Detailed information about ${app.name}.`;
        pageKeywords = app.seo_keywords || '';
        pageOgImage = app.og_image_url || app.icon_url || settings.logo_url || '';
      }
    } else {
      const cleanSlug = path.replace(/^\/|\/$/g, '').split('?')[0];
      if (cleanSlug) {
        const app = apps.find((a: any) => a?.slug?.toLowerCase() === cleanSlug.toLowerCase());
        if (app) {
          pageTitle = app.seo_title || app.name || siteTitle;
          const rawDesc = app.seo_description || '';
          const rawHtml = app.description_html || '';
          pageDesc = rawDesc ? rawDesc : (rawHtml ? stripHtml(rawHtml).substring(0, 160) : '');
          pageKeywords = app.seo_keywords || '';
          pageOgImage = app.og_image_url || app.icon_url || settings.logo_url || '';
        }
      }
    }

    pageOgImage = ensureAbsoluteUrl(pageOgImage, window.location.origin);

    document.title = pageTitle;

    setMetaTag('description', pageDesc);
    setMetaTag('keywords', pageKeywords);
    setMetaTag('author', pageAuthor);
    setMetaTag('robots', pageRobots);

    setMetaTag('og:title', pageTitle, true);
    setMetaTag('og:description', pageDesc, true);
    setMetaTag('og:image', pageOgImage, true);
    setMetaTag('og:image:secure_url', pageOgImage, true);
    setMetaTag('og:url', window.location.href, true);

    setMetaTag('twitter:title', pageTitle);
    setMetaTag('twitter:description', pageDesc);
    setMetaTag('twitter:image', pageOgImage);

    // Update <link rel="image_src">
    let imgLink = document.querySelector('link[rel="image_src"]');
    if (pageOgImage) {
      if (!imgLink) {
        imgLink = document.createElement('link');
        imgLink.setAttribute('rel', 'image_src');
        document.head.appendChild(imgLink);
      }
      imgLink.setAttribute('href', pageOgImage);
    } else if (imgLink) {
      imgLink.remove();
    }

    try {
      if (window.parent && window.parent !== window && window.parent.document) {
        window.parent.document.title = pageTitle;
      }
    } catch (e) {}

  }, [location.pathname, settings, apps, news, blogs, videos, isAdminPath]);
}
