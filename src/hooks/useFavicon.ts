import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AppConfig, GlobalSettings } from '../types';

export function useFavicon(settings: GlobalSettings | null, apps: AppConfig[]) {
  const location = useLocation();

  useEffect(() => {
    if (!settings) return;
    
    // Always use the official website favicon / logo URL across all pages
    const officialFavicon = settings.favicon_url || settings.logo_url || "/favicon.png";
    
    const icons = [
      { rel: 'icon', sizes: '192x192', href: officialFavicon, type: 'image/png' },
      { rel: 'icon', sizes: '32x32', href: '/favicon-32x32.png', type: 'image/png' },
      { rel: 'icon', sizes: '16x16', href: '/favicon-16x16.png', type: 'image/png' },
      { rel: 'shortcut icon', href: '/favicon.ico', type: 'image/x-icon' },
      { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png', type: 'image/png' }
    ];
    
    icons.forEach(iconDef => {
      let link = document.querySelector(`link[rel="${iconDef.rel}"][sizes="${iconDef.sizes || ''}"]`) as HTMLLinkElement ||
                 document.querySelector(`link[rel="${iconDef.rel}"]`) as HTMLLinkElement;
      if (link) {
        link.href = iconDef.href;
      } else {
        link = document.createElement('link');
        link.rel = iconDef.rel;
        link.href = iconDef.href;
        if (iconDef.sizes) link.setAttribute('sizes', iconDef.sizes);
        if (iconDef.type) link.type = iconDef.type;
        document.head.appendChild(link);
      }
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
