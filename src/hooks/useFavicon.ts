import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AppConfig, GlobalSettings } from '../types';

export function useFavicon(settings: GlobalSettings | null, apps: AppConfig[]) {
  const location = useLocation();

  useEffect(() => {
    if (!settings) return;
    
    // Always use the official website favicon / logo URL across all pages
    const officialFavicon = settings.favicon_url || settings.logo_url || "https://res.cloudinary.com/diewalae4/image/upload/v1786556304/1000134161_11zon_fgqzz6.png";
    
    const syncFavicons = (doc: Document) => {
      const allIcons = Array.from(doc.querySelectorAll<HTMLLinkElement>('link[rel*="icon"]'));
      
      if (allIcons.length > 0) {
        allIcons.forEach((link) => {
          link.href = officialFavicon;
        });
      } else {
        const rels = ['icon', 'shortcut icon', 'apple-touch-icon', 'apple-touch-icon-precomposed'];
        rels.forEach((rel) => {
          const newLink = doc.createElement('link');
          newLink.rel = rel;
          if (rel === 'icon') newLink.type = 'image/png';
          newLink.href = officialFavicon;
          doc.head.appendChild(newLink);
        });
      }
    };

    syncFavicons(document);

    try {
      if (window.parent && window.parent !== window && window.parent.document) {
        syncFavicons(window.parent.document);
      }
    } catch (e) {}
  }, [settings, location.pathname]);
}
