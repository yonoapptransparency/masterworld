import { ShieldCheck, ShieldAlert } from 'lucide-react';
import { AppConfig } from '../../types';

interface AppHeaderProps {
  app: AppConfig;
}

export default function AppHeader({ app }: AppHeaderProps) {
  return (
    <div className="flex w-full items-center gap-4 sm:gap-6 mb-6 px-3 sm:px-6 mt-2">
      <div className="relative w-[72px] h-[72px] sm:w-[96px] sm:h-[96px] shrink-0 premium-logo-container">
        {/* Dynamic glowing colorful aura background */}
        <div className="premium-logo-aura"></div>
        
        <div className="w-full h-full rounded-[20px] overflow-hidden shadow-sm bg-white border border-black/5 dark:border-white/10 premium-logo-image-frame">
          {/* Dynamic glossy sweep light overlay */}
          <div className="premium-logo-shine-overlay"></div>
          
          {app.icon_url ? (
            <img 
              src={app.icon_url || undefined} 
              alt={app.name} 
              loading="eager" 
              fetchPriority="high" 
              width={128} 
              height={128} 
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl font-bold bg-zinc-800 text-zinc-500">
              {(app.name || 'A').substring(0, 1)}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex flex-col justify-center flex-1">
        <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 leading-tight mb-0.5 break-words">
          {app.name}
        </h1>
        <div className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
          {app.developer || "Developer"}
        </div>
        <div className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
          {app.is_new && <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-sm uppercase font-bold tracking-wider">New</span>}
          {app.safety_status === 'Verified' ? (
            <span className="flex items-center text-green-600 gap-0.5 font-medium"><ShieldCheck className="w-3.5 h-3.5" /> Verified</span>
          ) : (
            <span className="flex items-center text-orange-500 gap-0.5 font-medium"><ShieldAlert className="w-3.5 h-3.5" /> {app.safety_status}</span>
          )}
        </div>
      </div>
    </div>
  );
}
