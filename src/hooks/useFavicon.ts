import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AppConfig, GlobalSettings } from '../types';

export function useFavicon(settings: GlobalSettings | null, apps: AppConfig[]) {
  const location = useLocation();

  useEffect(() => {
    if (!settings) return;
    
    let targetUrl = settings.favicon_url || settings.logo_url || "https://res.cloudinary.com/diewalae4/image/upload/v1785720339/1000132678_1_ro1ftj.png";
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
      const isCustomAppIcon = targetUrl !== (settings.favicon_url || settings.logo_url || "https://res.cloudinary.com/diewalae4/image/upload/v1785720339/1000132678_1_ro1ftj.png");
      
      const icons = [
        { rel: 'icon', sizes: '192x192', href: isCustomAppIcon ? targetUrl : '/favicon.png', type: 'image/png' },
        { rel: 'icon', sizes: '32x32', href: isCustomAppIcon ? targetUrl : '/favicon-32x32.png', type: 'image/png' },
        { rel: 'icon', sizes: '16x16', href: isCustomAppIcon ? targetUrl : '/favicon-16x16.png', type: 'image/png' },
        { rel: 'shortcut icon', href: isCustomAppIcon ? targetUrl : '/favicon.ico', type: 'image/x-icon' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: isCustomAppIcon ? targetUrl : '/apple-touch-icon.png', type: 'image/png' }
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
    }
  }, [settings, location.pathname, apps]);
}
