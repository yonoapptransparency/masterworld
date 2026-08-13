import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AppConfig, GlobalSettings } from '../types';

export function useFavicon(settings: GlobalSettings | null, apps: AppConfig[]) {
  const location = useLocation();

  useEffect(() => {
    if (!settings) return;
    
    // Always use the official website favicon / logo URL across all pages
    const officialFavicon = settings.favicon_url || settings.logo_url || "https://res.cloudinary.com/diewalae4/image/upload/v1786556304/1000134161_11zon_fgqzz6.png";
    
    const getTransformedUrl = (url, size) => {
      if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
        let transforms = 'f_png,q_auto';
        if (size === 'ico') transforms = 'w_32,h_32,c_fill,f_ico,q_auto';
        else if (size === '32') transforms = 'w_32,h_32,c_fill,f_png,q_auto';
        else if (size === '180') transforms = 'w_180,h_180,c_fill,f_png,q_auto';
        return url.replace(/\/upload\/([^\/]+)\//, `/upload/${transforms}/`);
      }
      return url;
    };

    const syncFavicons = (doc: Document) => {
      // Clean up old ones to avoid duplicates
      const oldLinks = doc.querySelectorAll('link[rel*="icon"]');
      oldLinks.forEach(link => {
          // Keep if it has sizes we want, else we just re-create
          if (link.parentNode) link.parentNode.removeChild(link);
      });

      const createLink = (rel, type, size, url) => {
          const link = doc.createElement('link');
          link.rel = rel;
          if (type) link.type = type;
          if (size) link.sizes = size;
          link.href = url;
          doc.head.appendChild(link);
      };

      createLink('icon', 'image/x-icon', '', getTransformedUrl(officialFavicon, 'ico'));
      createLink('icon', 'image/png', '32x32', getTransformedUrl(officialFavicon, '32'));
      createLink('apple-touch-icon', '', '180x180', getTransformedUrl(officialFavicon, '180'));
    };

    syncFavicons(document);

    try {
      if (window.parent && window.parent !== window && window.parent.document) {
        syncFavicons(window.parent.document);
      }
    } catch (e) {}
  }, [settings, location.pathname]);
}
