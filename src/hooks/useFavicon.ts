import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AppConfig, GlobalSettings } from '../types';

export function useFavicon(settings: GlobalSettings | null, apps: AppConfig[]) {
  const location = useLocation();

  useEffect(() => {
    if (!settings) return;
    
    // Always use the official website favicon / logo URL across all pages
    const officialFavicon = settings.favicon_url || settings.logo_url || "https://res.cloudinary.com/diewalae4/image/upload/v1785720339/1000132678_1_ro1ftj.png";
    
    const syncSingleIcon = (doc: Document) => {
      const existingIcons = Array.from(doc.querySelectorAll('link[rel*="icon"]'));
      
      let mainIcon: HTMLLinkElement | null = null;
      
      existingIcons.forEach((el) => {
        const link = el as HTMLLinkElement;
        if (!mainIcon) {
          mainIcon = link;
          link.rel = 'icon';
          link.type = 'image/png';
          link.href = officialFavicon;
          link.removeAttribute('sizes');
        } else {
          // Prune duplicate favicon tags to prevent multiple network requests
          link.remove();
        }
      });

      if (!mainIcon) {
        const newLink = doc.createElement('link');
        newLink.rel = 'icon';
        newLink.type = 'image/png';
        newLink.href = officialFavicon;
        doc.head.appendChild(newLink);
      }
    };

    syncSingleIcon(document);

    try {
      if (window.parent && window.parent !== window && window.parent.document) {
        syncSingleIcon(window.parent.document);
      }
    } catch (e) {}
  }, [settings, location.pathname]);
}
