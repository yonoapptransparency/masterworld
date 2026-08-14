import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShieldCheck, MoreVertical, Share2, Flag } from 'lucide-react';
import { cn, safeVibrate } from '../../lib/utilsPublic';
import { getOptimizedImageUrl } from '../../seo/utils';

const AppOptionsMenu = ({ app, onMenuToggle }: { app: any; onMenuToggle?: (isOpen: boolean) => void }) => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    onMenuToggle?.(menuOpen);
  }, [menuOpen, onMenuToggle]);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const appUrl = `${window.location.origin}/app/${app.slug}`;
    if (navigator.share) {
      navigator.share({
        title: app.name,
        text: `Check out ${app.name}!`,
        url: appUrl,
      })
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
    } else {
      navigator.clipboard.writeText(appUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {});
    }
  };

  const handleOpenReport = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(false);
    window.dispatchEvent(new CustomEvent('open-report-modal', { detail: { app } }));
  };

  return (
    <div 
      className={`absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 ${menuOpen ? 'z-[100]' : 'z-20'}`} 
      ref={menuRef} 
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
    >
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setMenuOpen(!menuOpen);
        }}
        className="p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 rounded-full transition-all cursor-pointer relative"
        aria-label="More options"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {menuOpen && (
        <div
          className="absolute right-0 top-full mt-1 w-52 bg-zinc-900 text-white rounded-xl shadow-2xl border border-zinc-700/80 overflow-hidden py-1 z-[120] transition-all duration-150 animate-in fade-in zoom-in-95"
        >
          <button
            onClick={handleShare}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold hover:bg-zinc-800 transition-colors text-left cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-zinc-400" />
            <span>{copied ? 'Link Copied!' : 'Share app'}</span>
          </button>
          <button
            onClick={handleOpenReport}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold hover:bg-zinc-800 transition-colors text-left border-t border-zinc-800/60 h-[44px] cursor-pointer"
          >
            <Flag className="w-3.5 h-3.5 text-zinc-400" />
            <span>Flag as inappropriate</span>
          </button>
        </div>
      )}
    </div>
  );
};

export const AppListItem = React.memo(({ app, index }: { app: any; index?: number }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const displayIndex = index !== undefined ? index : (app.serial_number || 1);
  const isActuallyComingSoon = React.useMemo(() => {
    if (!app.is_coming_soon) return false;
    if (!app.publish_date) return true;
    return new Date(app.publish_date).getTime() > Date.now();
  }, [app.is_coming_soon, app.publish_date]);
  
  return (
    <div
      style={{
        animationDelay: `${((index || 0) % 10) * 15}ms`,
      }}
      className={`animate-list-item-fade cv-auto relative group ${isMenuOpen ? 'z-[60]' : 'z-1'}`}
    >
      <Link 
        to={`/app/${app.slug}`}
        className="flex items-center gap-2.5 sm:gap-4 py-2.5 pl-2 pr-12 sm:pl-4 sm:pr-14 sm:py-3.5 mb-0 sm:mb-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-200 rounded-xl sm:rounded-2xl relative active:bg-black/5 dark:active:bg-white/5 w-full"
      >
        <div className="w-5 sm:w-7 text-[15px] sm:text-[17px] font-black text-zinc-400 dark:text-zinc-500 text-center shrink-0">
          {displayIndex}
        </div>

        <div className="relative w-[72px] h-[72px] sm:w-[84px] sm:h-[84px] shrink-0">
          <div className="w-full h-full rounded-[18px] overflow-hidden bg-white shadow-sm border border-black/5 dark:border-white/10 relative z-10 transition-transform group-hover:-translate-y-0.5 duration-300">
            <img 
              src={getOptimizedImageUrl(app.icon_url, 160) || "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=128&h=128&fit=crop"} 
              alt={`${app.name} app icon`} 
              width={84}
              height={84}
              loading={index !== undefined && index <= 4 ? "eager" : "lazy"}
              fetchPriority={index !== undefined && index <= 4 ? "high" : "low"}
              decoding="async"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=128&h=128&fit=crop";
              }}
            />
          </div>
          {app.is_hot ? (
            <div className="absolute -top-1.5 -right-2.5 z-20 pointer-events-none">
              <span className="bg-[#d32f2f] text-white text-[9px] sm:text-[10px] font-black px-2.5 py-0.5 rounded-[10px] shadow-[0_2px_8px_rgba(0,0,0,0.15)] uppercase tracking-wider block">HOT</span>
            </div>
          ) : app.is_new ? (
            <div className="absolute -top-1.5 -right-2.5 z-20 pointer-events-none">
              <span className="bg-[#008738] text-white text-[9px] sm:text-[10px] font-black px-2.5 py-0.5 rounded-[10px] shadow-[0_2px_8px_rgba(0,0,0,0.15)] uppercase tracking-wider block">NEW</span>
            </div>
          ) : null}
        </div>
        
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
          <h3 className="font-semibold text-base sm:text-[17px] tracking-tight text-zinc-900 dark:text-zinc-100 truncate w-full">{app.name}</h3>
          <div className="text-xs sm:text-[13px] font-normal text-zinc-500 dark:text-zinc-400 truncate">{app.category}</div>
          <div className="flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-zinc-500 dark:text-zinc-400 mt-0.5">
            <span>{app.rating ? app.rating.toFixed(1) : '10.0'}</span>
            <Star className="w-3 h-3 fill-current text-zinc-400" />
            {app.safety_status === 'Verified' && <ShieldCheck className="w-3 h-3 text-blue-500 shrink-0 ml-1" />}
          </div>
        </div>
        
        {isActuallyComingSoon && (
          <div className="shrink-0 pr-1">
            <div className="bg-orange-500/10 text-orange-600 dark:text-orange-400 px-3 py-1 text-[11px] font-black rounded-full tracking-wider">SOON</div>
          </div>
        )}
        
        <div className="absolute bottom-0 right-4 left-[110px] sm:left-[138px] border-b border-black/5 dark:border-white/5 opacity-50 transition-opacity group-hover:opacity-0" />
      </Link>
      <AppOptionsMenu app={app} onMenuToggle={setIsMenuOpen} />
    </div>
  );
});

export const TopChartItem = React.memo(({ rank, app }: { rank: number; app: any }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const isActuallyComingSoon = React.useMemo(() => {
    if (!app.is_coming_soon) return false;
    if (!app.publish_date) return true;
    return new Date(app.publish_date).getTime() > Date.now();
  }, [app.is_coming_soon, app.publish_date]);

  return (
    <div
      style={{
        animationDelay: `${(rank % 10) * 15}ms`,
      }}
      className={`animate-list-item-fade cv-auto relative group ${isMenuOpen ? 'z-[60]' : 'z-1'}`}
    >
      <Link 
        to={`/app/${app.slug}`}
        className="flex items-center gap-2.5 sm:gap-4 py-2.5 pl-2 pr-12 sm:pl-4 sm:pr-14 sm:py-3.5 mb-0 sm:mb-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-200 rounded-xl sm:rounded-2xl relative active:bg-black/5 dark:active:bg-white/5 w-full"
      >
        <div className="w-5 sm:w-7 text-[15px] sm:text-[17px] font-black text-zinc-400 dark:text-zinc-500 text-center shrink-0">
          {rank}
        </div>
        
        <div className="relative w-[72px] h-[72px] sm:w-[84px] sm:h-[84px] shrink-0">
          <div className="w-full h-full rounded-[18px] overflow-hidden bg-white shadow-sm border border-black/5 dark:border-white/10 relative z-10 transition-transform group-hover:-translate-y-0.5 duration-300">
            <img 
              src={getOptimizedImageUrl(app.icon_url, 160) || "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=128&h=128&fit=crop"} 
              alt={`${app.name} app icon`} 
              width={84}
              height={84}
              loading={rank <= 4 ? "eager" : "lazy"}
              fetchPriority={rank <= 4 ? "high" : "low"}
              decoding="async"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=128&h=128&fit=crop";
              }}
            />
          </div>
          {app.is_hot ? (
            <div className="absolute -top-1.5 -right-2.5 z-20 pointer-events-none">
              <span className="bg-[#d32f2f] text-white text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-[10px] shadow-[0_2px_8px_rgba(0,0,0,0.15)] uppercase tracking-wider block">HOT</span>
            </div>
          ) : app.is_new ? (
            <div className="absolute -top-1.5 -right-2.5 z-20 pointer-events-none">
              <span className="bg-[#008738] text-white text-[9px] sm:text-[10px] font-black px-2.5 py-0.5 rounded-[10px] shadow-[0_2px_8px_rgba(0,0,0,0.15)] uppercase tracking-wider block">NEW</span>
            </div>
          ) : null}
        </div>
        
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
          <h3 className="font-semibold text-base sm:text-[17px] tracking-tight text-zinc-900 dark:text-zinc-100 truncate w-full">{app.name}</h3>
          <div className="text-xs sm:text-[13px] font-normal text-zinc-500 dark:text-zinc-400 truncate">{app.category}</div>
          <div className="flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-zinc-500 dark:text-zinc-400 mt-0.5">
            <span>{app.rating ? app.rating.toFixed(1) : '10.0'}</span>
            <Star className="w-3 h-3 fill-current text-zinc-400" />
            {app.safety_status === 'Verified' && <ShieldCheck className="w-3 h-3 text-blue-500 shrink-0 ml-1" />}
          </div>
        </div>
        
        {isActuallyComingSoon && (
          <div className="shrink-0 pr-1">
            <div className="bg-orange-500/10 text-orange-600 dark:text-orange-400 px-3 py-1 text-[11px] font-black rounded-full tracking-wider">SOON</div>
          </div>
        )}
        
        <div className="absolute bottom-0 right-4 left-[110px] sm:left-[138px] border-b border-black/5 dark:border-white/5 opacity-50 transition-opacity group-hover:opacity-0" />
      </Link>
      <AppOptionsMenu app={app} onMenuToggle={setIsMenuOpen} />
    </div>
  );
});

export const AppListItemSkeleton = () => (
  <div className="flex items-center gap-2.5 sm:gap-4 py-2.5 px-2 sm:px-4 sm:py-3.5 mb-0 sm:mb-2 animate-pulse rounded-xl sm:rounded-2xl relative select-none">
    <div className="w-5 sm:w-7 text-center shrink-0">
      <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-4 mx-auto" />
    </div>
    <div className="relative w-[72px] h-[72px] sm:w-[84px] sm:h-[84px] shrink-0">
      <div className="w-full h-full rounded-[18px] bg-zinc-200 dark:bg-zinc-700" />
    </div>
    <div className="flex-1 min-w-0 flex flex-col justify-center gap-2">
      <div className="bg-zinc-200 dark:bg-zinc-800 rounded h-4 w-1/3" />
      <div className="bg-zinc-200 dark:bg-zinc-800 rounded h-3 w-1/4" />
      <div className="bg-zinc-200 dark:bg-zinc-800 rounded h-3 w-8" />
    </div>
    <div className="absolute bottom-0 right-4 left-[110px] sm:left-[138px] border-b border-black/5 dark:border-white/5 opacity-50" />
  </div>
);

export const TopChartItemSkeleton = ({ rank }: { rank: number }) => (
  <div className="flex items-center gap-2.5 sm:gap-4 py-2.5 px-2 sm:px-4 sm:py-3.5 mb-0 sm:mb-2 animate-pulse rounded-xl sm:rounded-2xl relative select-none">
    <div className="w-5 sm:w-7 text-sm font-bold text-zinc-300 dark:text-zinc-700 text-center shrink-0">{rank}</div>
    <div className="relative w-[72px] h-[72px] sm:w-[84px] sm:h-[84px] shrink-0">
      <div className="w-full h-full rounded-[18px] bg-zinc-200 dark:bg-zinc-800" />
    </div>
    <div className="flex-1 min-w-0 flex flex-col justify-center gap-2">
      <div className="bg-zinc-200 dark:bg-zinc-800 rounded h-4 w-1/2" />
      <div className="bg-zinc-200 dark:bg-zinc-800 rounded h-3 w-1/3" />
      <div className="bg-zinc-200 dark:bg-zinc-800 rounded h-3 w-8" />
    </div>
    <div className="absolute bottom-0 right-4 left-[110px] sm:left-[138px] border-b border-black/5 dark:border-white/5 opacity-50" />
  </div>
);

export const NewAdditionItemSkeleton = () => (
  <div className="flex flex-col gap-2 animate-pulse p-1 select-none">
    <div className="aspect-square rounded-[18px] bg-zinc-200 dark:bg-zinc-800 w-full" />
    <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-2/3 mx-auto mt-1" />
  </div>
);
