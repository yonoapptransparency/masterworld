import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AppConfig, GlobalSettings } from '../types';

export function useFavicon(settings: GlobalSettings | null, apps: AppConfig[]) {
  const location = useLocation();

  useEffect(() => {
    if (!settings) return;
    
    // Always use the official website favicon / logo URL across all pages (Home, About, Disclaimer, News, App pages, etc.)
    const officialFavicon = settings.favicon_url || settings.logo_url || "https://res.cloudinary.com/diewalae4/image/upload/v1785720339/1000132678_1_ro1ftj.png";
    
    const icons = [
      { rel: 'icon', sizes: '192x192', href: officialFavicon, type: 'image/png' },
      { rel: 'icon', sizes: '32x32', href: '/favicon-32x32.png', type: 'image/png' },
      { rel: 'icon', sizes: '16x16', href: '/favicon-16x16.png', type: 'image/png' },
      { rel: 'shortcut icon', href: '/favicon.ico', type: 'image/x-icon' },
      { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png', type: 'image/png' }
    ];
    
    document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]').forEach(el => el.remove());
    
    icons.forEach(iconDef => {
      const newLink = document.createElement('link');
      newLink.rel = iconDef.rel;
      newLink.href = iconDef.href;
      if (iconDef.sizes) newLink.setAttribute('sizes', iconDef.sizes);
      if (iconDef.type) newLink.type = iconDef.type;
      document.head.appendChild(newLink);
    });
    
    try {
      if (window.parent && window.parent !== window && window.parent.document) {
        icons.forEach(iconDef => {
          const rel = iconDef.rel;
          let parentLink: HTMLLinkElement | null = window.parent.document.querySelector(`link[rel="${rel}"]`) || window.parent.document.querySelector(`link[rel*="${rel}"]`);
          if (parentLink) {
            parentLink.href = iconDef.href;
          } else {
            const newLink = window.parent.document.createElement('link');
            newLink.rel = rel;
            newLink.href = iconDef.href;
            window.parent.document.head.appendChild(newLink);
          }
        });
      }
    } catch (e) {}
  }, [settings, location.pathname]);
}
