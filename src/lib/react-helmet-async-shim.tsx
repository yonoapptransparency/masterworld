import React, { useEffect } from 'react';

export function HelmetProvider({ children }: { children: React.ReactNode; context?: any }) {
  return <>{children}</>;
}

interface HelmetProps {
  children?: React.ReactNode;
}

export function Helmet({ children }: HelmetProps) {
  useEffect(() => {
    if (typeof document !== 'undefined') {
      // Remove server-side static data-rh="true" tags once client React mounts
      // This prevents duplicate <title> or <meta> tags in the browser DOM
      const serverRhElements = document.querySelectorAll('[data-rh="true"]');
      serverRhElements.forEach(el => el.remove());
    }
  }, []);

  return <>{children}</>;
}


