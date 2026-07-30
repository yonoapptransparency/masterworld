import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Video, Sparkles, LayoutGrid, Newspaper, Info } from 'lucide-react';

export function PublicBottomNav() {
  const { pathname } = useLocation();
  const triggerHaptic = () => {
    if (window.navigator && window.navigator.vibrate) {
      setTimeout(() => {
        try {
          window.navigator.vibrate(15);
        } catch (e) {}
      }, 0);
    }
  };

  const isActive = (path: string) => pathname === path;

  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 flex justify-center pointer-events-none md:hidden pb-safe px-4">
      <div className="flex items-center gap-1.5 p-1.5 pointer-events-auto bg-transparent w-auto max-w-full overflow-x-auto no-scrollbar scroll-smooth">
        {[
          { icon: Video, label: 'Videos', path: '/videos' },
          { icon: Sparkles, label: 'New', path: '/new-apps' },
          { icon: LayoutGrid, label: 'Home', path: '/' },
          { icon: Newspaper, label: 'News', path: '/news' },
          { icon: Info, label: 'Help', path: '/contact' }
        ].map((item) => {
          const active = isActive(item.path);
          return (
            <Link 
              key={item.path}
              to={item.path} 
              onClick={triggerHaptic} 
              className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all active:scale-[0.85] ${
                active 
                  ? 'bg-transparent text-blue-600 dark:text-blue-400 font-extrabold' 
                  : 'bg-transparent text-zinc-700 dark:text-zinc-300'
              }`}
            >
              <item.icon className={`w-[18px] h-[18px] ${active ? '' : 'opacity-80'}`} />
              <span className={`text-[11px] font-bold tracking-tight transition-all duration-300 ${active ? 'max-w-[40px] opacity-100' : 'max-w-0 opacity-0 overflow-hidden'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default PublicBottomNav;
