import { useState, useEffect, useRef } from 'react';

export function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | 'top'>('top');
  const [scrolled, setScrolled] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    let ticking = false;

    const updateScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= 20) {
        setScrollDirection(prev => (prev === 'top' ? prev : 'top'));
        setScrolled(prev => (prev === false ? prev : false));
      } else {
        setScrolled(prev => (prev === true ? prev : true));
        const diff = currentScrollY - lastScrollY.current;
        if (Math.abs(diff) > 8) {
          if (diff > 0) {
            setScrollDirection(prev => (prev === 'down' ? prev : 'down'));
          } else {
            setScrollDirection(prev => (prev === 'up' ? prev : 'up'));
          }
        }
      }

      lastScrollY.current = currentScrollY;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return { scrollDirection, scrolled };
}

export default useScrollDirection;
