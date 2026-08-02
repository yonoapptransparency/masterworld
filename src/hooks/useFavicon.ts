import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AppConfig, GlobalSettings } from '../types';

export function useFavicon(settings: GlobalSettings | null, apps: AppConfig[]) {
  const location = useLocation();

  useEffect(() => {
    if (!settings) return;
    
    let targetUrl = settings.favicon_url || settings.logo_url || "https://res.cloudinary.com/diewalae4/image/upload/v1785648485/ezgif-88d07abd3ef5753f_yz8ytg.webp";
    const path = location.pathname;

    if (path.startsWith('/app/')) {
      const slug = decodeURIComponent(path.split('/app/')[1]?.split('/')[0]?.split('?')[0] || '');
      const app = apps.find((a: any) => a?.slug?.toLowerCase() === slug.toLowerCase());
      if (app && app.icon_url) {
        targetUrl = app.icon_url;
      }
    } else if (path.startsWith('/s/')) {
      const slug = decodeURIComponent(path.split('/s/')[1]?.split('?')[0] || '');
      const app = apps.find((a: any) => a?.slug?.toLowerCase() === slug.toLowerCase());
      if (app && app.icon_url) {
        targetUrl = app.icon_url;
      }
    } else {
      const possibleSlug = decodeURIComponent(path.replace(/^\/|\/$/g, ''));
      if (possibleSlug && possibleSlug !== '' && !['admin', 'news', 'blogs', 'videos', 'about', 'contact', 'privacy', 'terms', 'report-removal', 'ethics', 'disclaimer', 'responsibility', 'notice'].some(p => possibleSlug.toLowerCase().startsWith(p))) {
        const app = apps.find((a: any) => a?.slug?.toLowerCase() === possibleSlug.toLowerCase());
        if (app && app.icon_url) {
          targetUrl = app.icon_url;
        }
      }
    }

    if (targetUrl) {
      const icons = [
        { rel: 'icon' },
        { rel: 'shortcut icon' },
        { rel: 'apple-touch-icon' }
      ];
      
      document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]').forEach(el => el.remove());
      
      icons.forEach(iconDef => {
        const newLink = document.createElement('link');
        newLink.rel = iconDef.rel;
        newLink.href = targetUrl;
        if (targetUrl.includes('.webp')) {
          newLink.type = 'image/webp';
        } else if (targetUrl.includes('.png')) {
          newLink.type = 'image/png';
        } else if (targetUrl.includes('.ico')) {
          newLink.type = 'image/x-icon';
        } else if (targetUrl.includes('.svg')) {
          newLink.type = 'image/svg+xml';
        }
        document.head.appendChild(newLink);
      });
      
      try {
        if (window.parent && window.parent !== window && window.parent.document) {
          icons.forEach(iconDef => {
            const rel = iconDef.rel;
            let parentLink: HTMLLinkElement | null = window.parent.document.querySelector(`link[rel="${rel}"]`) || window.parent.document.querySelector(`link[rel*="${rel}"]`);
            if (parentLink) {
              parentLink.href = targetUrl;
            } else {
              const newLink = window.parent.document.createElement('link');
              newLink.rel = rel;
              newLink.href = targetUrl;
              window.parent.document.head.appendChild(newLink);
            }
          });
        }
      } catch (e) {}
    }
  }, [settings, location.pathname, apps]);
}
