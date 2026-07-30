import React from 'react';
import { Star, ShieldCheck, MessageSquare } from 'lucide-react';

interface ReviewScoreSummaryProps {
  overallRating?: number;
  totalCount: number;
  averageValue: string;
}

export function ReviewScoreSummary({ overallRating = 5.0, totalCount, averageValue }: ReviewScoreSummaryProps) {
  return (
    <div className="w-full lg:w-1/3">
      <h2 className="text-xl font-bold mb-6 text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-blue-500" />
        <span>Ratings and reviews</span>
      </h2>

      <div className="flex items-center gap-4 sm:gap-6 p-4 sm:p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-black/5 dark:border-white/10">
        <div className="text-center">
          <div className="text-5xl font-black text-zinc-900 dark:text-white tracking-tighter leading-none mb-1">
            {averageValue}
          </div>
          <div className="flex justify-center gap-0.5 mb-1 text-amber-500">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star 
                key={`score-star-${s}`} 
                className={`w-3.5 h-3.5 ${s <= Math.round(overallRating) ? 'fill-amber-400 text-amber-400' : 'text-zinc-300 dark:text-zinc-700'}`} 
              />
            ))}
          </div>
          <div className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500">
            {totalCount.toLocaleString()} ratings
          </div>
        </div>

        {/* Distribution bars */}
        <div className="flex-1 space-y-1 text-xs">
          {[
            { star: 5, fill: '82%' },
            { star: 4, fill: '12%' },
            { star: 3, fill: '4%' },
            { star: 2, fill: '1%' },
            { star: 1, fill: '1%' },
          ].map((item, idx) => (
            <div key={`dist-bar-${item.star}-${idx}`} className="flex items-center gap-2">
              <span className="w-2.5 font-bold text-zinc-500 text-right">{item.star}</span>
              <div className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full" 
                  style={{ width: item.fill }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Verification Guard info badge */}
      <div className="mt-4 p-3 bg-green-500/5 border border-green-500/10 rounded-xl flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
        <span className="text-[11px] font-semibold text-green-700 dark:text-green-400 leading-relaxed">
          Ratings and reviews are fully verified. All strategies and gameplay logs are processed by authorized community members only.
        </span>
      </div>
    </div>
  );
}

export default ReviewScoreSummary;
