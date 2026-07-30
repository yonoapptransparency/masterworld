import React from 'react';
import { Star } from 'lucide-react';

interface AppSpecsBarProps {
  rating?: number;
  file_size?: string;
  category?: string;
  version?: string;
}

export function AppSpecsBar({ rating, file_size, category, version }: AppSpecsBarProps) {
  return (
    <div className="w-full grid grid-cols-4 py-4 mb-6 border-y border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/10 dark:bg-zinc-900/10">
      {/* Column 1: Rating */}
      <div className="flex flex-col items-center justify-center px-2 text-center">
        <div className="flex items-center gap-0.5 font-extrabold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
          <span>{rating ? rating.toFixed(1) : '5.0'}</span>
          <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current text-orange-500" />
        </div>
        <div className="text-[10px] sm:text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mt-1">Rating</div>
      </div>

      {/* Column 2: Size */}
      <div className="flex flex-col items-center justify-center px-2 text-center border-l border-zinc-200 dark:border-zinc-800/80">
        <div className="font-extrabold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
          {file_size || '45 MB'}
        </div>
        <div className="text-[10px] sm:text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mt-1">Size</div>
      </div>

      {/* Column 3: Type */}
      <div className="flex flex-col items-center justify-center px-2 text-center border-l border-zinc-200 dark:border-zinc-800/80">
        <div className="font-extrabold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800/60 px-2.5 py-0.5 rounded-full leading-none truncate max-w-full">
          {category ? category.split(',')[0].trim() : 'General'}
        </div>
        <div className="text-[10px] sm:text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mt-1.5">Type</div>
      </div>

      {/* Column 4: Version */}
      <div className="flex flex-col items-center justify-center px-2 text-center border-l border-zinc-200 dark:border-zinc-800/80">
        <div className="font-extrabold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 truncate max-w-full">
          {version || '2.0.6'}
        </div>
        <div className="text-[10px] sm:text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mt-1">Version</div>
      </div>
    </div>
  );
}

export default AppSpecsBar;
