import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';

export function PublicBackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const isVisible = window.scrollY > window.innerHeight / 2;
          setVisible(prev => {
            if (prev !== isVisible) return isVisible;
            return prev;
          });
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    if (window.navigator && window.navigator.vibrate) {
      try {
        window.navigator.vibrate(50);
      } catch (e) {}
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-24 md:bottom-8 right-6 z-50 p-4 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-full shadow-lg border border-black/5 dark:border-white/10 transition-all duration-300 hover:scale-110 active:scale-95 ${
        visible ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 translate-y-5 scale-90 pointer-events-none'
      }`}
      aria-label="Back to top"
    >
      <ArrowRight className="w-5 h-5 -rotate-90 opacity-70" />
    </button>
  );
}

export default PublicBackToTop;
