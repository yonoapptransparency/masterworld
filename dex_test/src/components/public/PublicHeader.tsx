import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, Shield, ShieldCheck, Info, X, LayoutGrid, Newspaper, Sparkles, Send, MoreHorizontal, Search, Video, Users, Trash2 } from 'lucide-react';
import { useData } from '../../contexts/DataContextPublic';
import LanguageSelector from '../LanguageSelector';
import SupportWidget from '../SupportWidget';
import GlobalSearch from '../GlobalSearch';

export function PublicHeader() {
  const { settings } = useData();
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const isScrolled = window.scrollY > 20;
          setScrolled(prev => {
            if (prev !== isScrolled) return isScrolled;
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

  const triggerHaptic = () => {
    if (window.navigator && window.navigator.vibrate) {
      setTimeout(() => {
        try {
          window.navigator.vibrate(10);
        } catch (e) {}
      }, 0);
    }
  };

  return (
    <>
      <header 
        className={`sticky top-0 z-50 transition-all duration-300 ease-out backdrop-blur-md ${
          scrolled 
            ? 'bg-white/80 dark:bg-black/80 border-b border-black/10 dark:border-white/10 shadow-sm py-2' 
            : 'bg-white/50 dark:bg-black/50 border-b border-white/20 dark:border-white/10 py-2.5 sm:py-3'
        }`}
      >
        <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 mx-auto relative flex justify-between items-center">
          <Link to="/" onClick={triggerHaptic} className="flex items-center gap-2.5 sm:gap-3 group">
            <div className="p-0 transition-transform group-hover:scale-[1.03] duration-300 shrink-0">
              {settings.logo_url ? <img src={settings.logo_url} width={56} height={56} loading="eager" fetchPriority="high" className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 object-contain drop-shadow-sm" alt="Logo" /> : <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white font-semibold text-lg">{settings.site_title?.substring(0, 1)}</div>}
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">{settings.site_title}</span>
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center gap-4 lg:gap-8 text-sm font-medium">
            <Link to="/" onClick={triggerHaptic} className={`transition-all p-2 tracking-wide relative ${pathname === '/' ? 'text-blue-600' : 'text-zinc-600 hover:text-blue-500 dark:text-zinc-300'}`}>
              {t('Home')}
              {pathname === '/' && <div className="absolute -bottom-1 left-2 right-2 h-[2px] bg-blue-600 rounded-t-full transition-all duration-300" />}
            </Link>
            <Link to="/new-apps" onClick={triggerHaptic} className={`transition-all p-2 tracking-wide flex items-center gap-1.5 relative ${pathname === '/new-apps' ? 'text-blue-600' : 'text-zinc-600 hover:text-blue-500 dark:text-zinc-300'}`}>
              {t('New Releases')} <span className="flex w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              {pathname === '/new-apps' && <div className="absolute -bottom-1 left-2 right-2 h-[2px] bg-blue-600 rounded-t-full transition-all duration-300" />}
            </Link>
            <Link to="/news" onClick={triggerHaptic} className={`transition-all p-2 tracking-wide relative ${pathname === '/news' ? 'text-blue-600' : 'text-zinc-600 hover:text-blue-500 dark:text-zinc-300'}`}>
              {t('News')}
              {pathname === '/news' && <div className="absolute -bottom-1 left-2 right-2 h-[2px] bg-blue-600 rounded-t-full transition-all duration-300" />}
            </Link>
            <div className="relative group/more" onMouseEnter={() => setMoreOpen(true)} onMouseLeave={() => setMoreOpen(false)}>
              <button 
                className={`transition-all p-2 tracking-wide flex items-center gap-1 relative ${['/videos', '/blogs', '/contact', '/privacy', '/report-removal', '/terms', '/about', '/responsibility'].includes(pathname) ? 'text-blue-600' : 'text-zinc-600 hover:text-blue-500 dark:text-zinc-300'}`}
                onClick={triggerHaptic}
              >
                More <MoreHorizontal className="w-4 h-4 ml-1" />
              </button>
              
              {moreOpen && (
                <div 
                  className="absolute top-full right-0 mt-1 w-48 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-2xl shadow-lg overflow-hidden py-2 z-50 transition-all duration-200 animate-in fade-in slide-in-from-top-1"
                >
                  {[
                    { to: '/videos', label: 'Videos', icon: Video },
                    { to: '/blogs', label: 'App Updates', icon: LayoutGrid },
                    { to: '/about', label: 'About Us', icon: Info },
                    { to: '/developers', label: 'Our Team', icon: Users },
                    { to: '/contact', label: 'Contact', icon: Send },
                    { to: '/responsibility', label: 'Safety', icon: ShieldCheck },
                    { to: '/privacy', label: 'Privacy', icon: ShieldCheck },
                    { to: '/report-removal', label: 'Report & Removal', icon: Trash2 },
                    { to: '/terms', label: 'Terms', icon: ShieldCheck },
                    { to: '/notice', label: 'Notice', icon: ShieldCheck },
                    { to: '/ethics', label: 'Ethics', icon: ShieldCheck },
                    { to: '/disclaimer', label: 'Disclaimer', icon: ShieldCheck },
                  ].map((item: any, idx: number) => (
                    item.to ? (
                      <Link 
                        key={`more-link-${item.to}-${idx}`}
                        to={item.to} 
                        onClick={() => { setMoreOpen(false); triggerHaptic(); }}
                        className={`flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium transition-colors ${pathname === item.to ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-zinc-700 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/5'}`}
                      >
                        <item.icon className="w-4 h-4 opacity-70" />
                        {item.label}
                      </Link>
                    ) : (
                      <button 
                        key={`more-btn-${item.label}-${idx}`}
                        onClick={() => { setMoreOpen(false); triggerHaptic(); if (item.action) item.action(); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium transition-colors text-zinc-700 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/5`}
                      >
                        <item.icon className="w-4 h-4 opacity-70" />
                        {item.label}
                      </button>
                    )
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 ml-4 border-l border-zinc-200 dark:border-zinc-800 pl-4 h-6">
              <button 
                onClick={() => { triggerHaptic(); setSearchOpen(true); }}
                className="flex items-center gap-2 bg-zinc-100/50 dark:bg-zinc-800/50 hover:bg-zinc-200/50 transition-all text-left px-4 py-1.5 w-44 lg:w-52 rounded-full group outline-none focus:ring-2 focus:ring-blue-500/20"
                aria-label="Search Store"
              >
                <Search className="w-3.5 h-3.5 text-zinc-400 group-hover:text-blue-500 transition-colors shrink-0" />
                <span className="text-[13px] text-zinc-500 group-hover:text-zinc-800 dark:group-hover:text-zinc-200 transition-colors truncate">{t('Search')}</span>
              </button>

              <div className="w-40">
                <LanguageSelector />
              </div>

              {settings.helpline_telegram && (
                <a 
                  href={settings.helpline_telegram.startsWith('http') ? settings.helpline_telegram : `https://t.me/${settings.helpline_telegram.replace('@', '')}`}
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  className="flex items-center justify-center w-8 h-8 bg-blue-50 text-blue-500 rounded-full hover:bg-blue-100 transition-colors"
                  aria-label="Telegram"
                >
                  <Send className="w-3.5 h-3.5" />
                </a>
              )}
              <SupportWidget />
            </div>
          </nav>

          <div className="md:hidden flex items-center gap-3">
            <button 
              onClick={() => { triggerHaptic(); setSearchOpen(true); }}
              className="flex items-center justify-center w-9 h-9 bg-zinc-100 dark:bg-zinc-800 rounded-full active:scale-95 transition-all text-zinc-500"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            {settings.helpline_telegram && (
              <a 
                href={settings.helpline_telegram.startsWith('http') ? settings.helpline_telegram : `https://t.me/${settings.helpline_telegram.replace('@', '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center w-9 h-9 bg-blue-50 text-blue-500 rounded-full"
                aria-label="Telegram"
              >
                <Send className="w-4 h-4" />
              </a>
            )}
            <SupportWidget />
            <button 
              className="flex items-center justify-center w-9 h-9 bg-zinc-900 dark:bg-white rounded-full active:scale-95 transition-transform"
              onClick={() => { triggerHaptic(); setMenuOpen(true); }}
              aria-label="Open menu"
            >
              <Menu className="w-4 h-4 text-white dark:text-zinc-900" />
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div 
          className="fixed inset-0 z-[60] bg-white/98 dark:bg-slate-950/98 backdrop-blur-2xl flex flex-col px-6 py-8 overflow-y-auto transition-all duration-200 animate-in fade-in slide-in-from-top-2"
        >
            <div className="flex justify-between items-center mb-8 shrink-0">
              <span className="text-xl font-bold flex items-center gap-2.5 tracking-tight text-zinc-900 dark:text-white">
                {settings.logo_url ? <img src={settings.logo_url} loading="lazy" width={48} height={48} className="w-12 h-12 object-contain drop-shadow-sm" alt="Logo" /> : <Shield className="w-6 h-6 text-blue-500" />} {settings.site_title}
              </span>
              <button 
                onClick={() => { triggerHaptic(); setMenuOpen(false); }}
                className="flex items-center justify-center w-10 h-10 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-full active:scale-95 transition-transform"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-6 z-50 relative">
              <LanguageSelector />
            </div>

            <nav className="grid grid-cols-2 gap-3 mb-6 shrink-0 relative z-40">
              {[
                { to: '/', label: 'Home', icon: LayoutGrid },
                { to: '/new-apps', label: 'New Apps', icon: Sparkles, hot: true },
                { to: '/news', label: 'News', icon: Newspaper },
                { to: '/videos', label: 'Videos', icon: Video },
                { to: '/blogs', label: 'App Updates', icon: Menu },
                { to: '/responsibility', label: 'Safety', icon: ShieldCheck },
                { to: '/about', label: 'About Us', icon: Info },
                { to: '/developers', label: 'Our Team', icon: Users },
                { to: '/contact', label: 'Contact', icon: Send },
                { to: '/privacy', label: 'Privacy', icon: ShieldCheck },
                { to: '/report-removal', label: 'Report & Removal', icon: Trash2 },
                { to: '/terms', label: 'Terms', icon: ShieldCheck },
                { to: '/notice', label: 'Notice', icon: ShieldCheck },
                { to: '/ethics', label: 'Ethics', icon: ShieldCheck },
                { to: '/disclaimer', label: 'Disclaimer', icon: ShieldCheck },
              ].map((item: any, idx: number) => {
                const active = item.to && pathname === item.to;
                return item.to ? (
                  <Link 
                    key={`mobile-link-${item.to}-${idx}`}
                    onClick={() => { triggerHaptic(); setMenuOpen(false); }} 
                    to={item.to} 
                    className={`flex items-center gap-3 p-3.5 rounded-2xl transition-all ${active ? 'bg-blue-600 text-white' : 'bg-black/5 dark:bg-white/10 text-zinc-800 dark:text-zinc-200 hover:bg-black/10'}`}
                  >
                    <item.icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-zinc-500 dark:text-zinc-400'}`} />
                    <span className="text-[13px] font-medium truncate">{item.label}</span>
                    {item.hot && <span className="flex w-1.5 h-1.5 rounded-full bg-blue-500 ml-auto shrink-0"></span>}
                  </Link>
                ) : (
                  <button 
                    key={`mobile-btn-${item.label}-${idx}`}
                    onClick={() => { triggerHaptic(); setMenuOpen(false); if (item.action) item.action(); }} 
                    className={`w-full flex items-center text-left gap-3 p-3.5 rounded-2xl transition-all bg-black/5 dark:bg-white/10 text-zinc-800 dark:text-zinc-200 hover:bg-black/10`}
                  >
                    <item.icon className={`w-4 h-4 shrink-0 text-zinc-500 dark:text-zinc-400`} />
                    <span className="text-[13px] font-medium truncate">{item.label}</span>
                    {item.hot && <span className="flex w-1.5 h-1.5 rounded-full bg-blue-500 ml-auto shrink-0"></span>}
                  </button>
                );
              })}
            </nav>
            
            <div className="mt-auto pt-6 border-t border-black/5 dark:border-white/5 text-center shrink-0">
              <span className="text-xs text-zinc-400 font-medium">&copy; {new Date().getFullYear()} {settings.site_title}</span>
            </div>
        </div>
      )}

      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

export default PublicHeader;
