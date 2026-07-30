import React from 'react';

export function AppDetailsSkeleton() {
  return (
    <div className="w-full select-none px-2 py-6 animate-fade-in">
      {/* Back button skeleton */}
      <div className="mb-6 flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        <div className="h-4 w-28 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
      </div>

      <div className="w-full">
        {/* App Main Header Info Loader */}
        <div className="pt-0.5 pb-6 mb-6 flex flex-col items-center text-center border-b border-black/5 dark:border-white/5">
          {/* App Icon rounded box skeleton */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[16px] bg-zinc-200 dark:bg-zinc-800 animate-pulse mb-4 shadow-sm" />
          
          {/* Title and Subtitles */}
          <div className="h-7 w-52 sm:w-64 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse mb-3" />
          <div className="flex gap-2 mb-4">
            <div className="h-5 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse" />
            <div className="h-5 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse" />
          </div>

          {/* Key metrics grid (4 specs columns) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 w-full max-w-[320px] mb-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={`skeleton-metric-v2-${i}`} className="py-2.5 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-black/5 dark:border-white/5 animate-pulse">
                <div className="h-2 w-8 bg-zinc-200 dark:bg-zinc-800 rounded mx-auto mb-1.5" />
                <div className="h-3 w-12 bg-zinc-200 dark:bg-zinc-800 rounded mx-auto" />
              </div>
            ))}
          </div>

          {/* Action buttons skeleton */}
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto justify-center mt-1">
            <div className="h-10 w-full sm:w-[150px] bg-zinc-200 dark:bg-zinc-800 rounded-xl animate-pulse" />
            <div className="h-10 w-full sm:w-[150px] bg-zinc-100 dark:bg-zinc-850 rounded-xl animate-pulse" />
          </div>
        </div>

        {/* Long description / About this app skeleton loader */}
        <div className="py-8 border-b border-black/5 dark:border-white/5">
          <div className="h-5 w-32 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse mb-5" />
          <div className="space-y-3">
            <div className="h-3.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
            <div className="h-3.5 w-[94%] bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
            <div className="h-3.5 w-[85%] bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
            <div className="h-3.5 w-[91%] bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
            <div className="h-3.5 w-[70%] bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
          </div>
          
          {/* Release Notes subsection skeleton */}
          <div className="mt-8 pt-8 border-t border-black/5 dark:border-white/5">
            <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse mb-3" />
            <div className="h-20 w-full bg-zinc-50 dark:bg-zinc-850 border border-black/5 dark:border-white/5 rounded-2xl animate-pulse" />
          </div>
        </div>

        {/* Related items list skeleton */}
        <div className="mb-8">
          <div className="h-5 w-40 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse mb-4" />
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={`skeleton-related-v2-${i}`} className="p-3.5 border border-black/5 dark:border-white/5 bg-zinc-55/50 dark:bg-zinc-900/30 rounded-2xl flex items-center justify-between gap-3 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-zinc-250 dark:bg-zinc-800" />
                  <div className="space-y-1.5">
                    <div className="h-3.5 w-28 bg-zinc-200 dark:bg-zinc-800 rounded" />
                    <div className="h-2.5 w-16 bg-zinc-200 dark:bg-zinc-800 rounded" />
                  </div>
                </div>
                <div className="h-8 w-12 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AppDetailsSkeleton;
