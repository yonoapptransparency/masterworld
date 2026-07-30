import { Link } from 'react-router-dom';
import { BadgeCheck } from 'lucide-react';
import { NewAdditionItemSkeleton } from '../PlayStoreUI';
import { AppConfig } from '../../types';

interface NewAdditionsProps {
  loading: boolean;
  apps: AppConfig[];
}

export default function NewAdditions({ loading, apps }: NewAdditionsProps) {
  const hasNewApps = loading ? true : apps.some(app => app.is_new);
  
  if (!hasNewApps) return null;

  return (
    <div className="px-0 animate-fade-in">
      <h2 className="text-xl font-bold mb-4 mt-6 text-zinc-900 dark:text-zinc-100 flex items-center px-0">
        New Additions <BadgeCheck className="w-5 h-5 text-blue-500 fill-blue-500/20 ml-1.5" />
      </h2>
      <div className="flex overflow-x-auto gap-3.5 sm:gap-4 px-4 sm:px-1 pt-2.5 pb-2 mb-2 scrollbar-none snap-x snap-mandatory scroll-smooth -mx-4 sm:-mx-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {loading ? (
          Array.from({ length: 10 }).map((_, i) => (
            <div key={`skeleton-new-${i}`} className="flex-none w-[80px] sm:w-[96px] snap-start">
              <NewAdditionItemSkeleton />
            </div>
          ))
        ) : (
          apps.filter(app => app.is_new).slice(0, 10).map((app, index) => (
            <div
              key={`${app.id}-${index}`}
              className="flex-none w-[80px] sm:w-[96px] snap-start"
            >
              <Link to={`/${app.slug}`} className="flex flex-col gap-2 group active:scale-[0.98] transition-transform">
                <div className="relative w-full aspect-square">
                  <div className="w-full h-full rounded-[18px] overflow-hidden bg-white/20 border border-black/5 dark:border-white/10 shadow-sm group-hover:shadow-[0_8px_20px_-8px_rgba(0,0,0,0.1)] transition-all">
                    <img 
                      src={app.icon_url || "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=128&h=128&fit=crop"} 
                      alt={app.name} 
                      referrerPolicy="no-referrer"
                      loading={index < 3 ? "eager" : "lazy"}
                      decoding="async"
                      {...(index < 3 ? { fetchPriority: "high" as const } : { fetchPriority: "low" as const })}
                      width={128}
                      height={128}
                      className="w-full h-full object-cover group-hover:-translate-y-0.5 transition-transform duration-300" 
                    />
                  </div>
                  {app.is_hot ? (
                    <div className="absolute -top-1.5 -right-1.5 z-20 pointer-events-none">
                      <span className="bg-[#d32f2f] text-white text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-[8px] shadow-[0_2px_8px_rgba(0,0,0,0.15)] uppercase tracking-wider block">
                        HOT
                      </span>
                    </div>
                  ) : app.is_new ? (
                    <div className="absolute -top-1.5 -right-1.5 z-20 pointer-events-none">
                      <span className="bg-[#008738] text-white text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-[8px] shadow-[0_2px_8px_rgba(0,0,0,0.15)] uppercase tracking-wider block">
                        NEW
                      </span>
                    </div>
                  ) : null}
                </div>
                <div className="px-1 text-center">
                  <h3 className="text-[10px] sm:text-xs font-medium text-zinc-800 dark:text-zinc-200 truncate">{app.name}</h3>
                </div>
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
