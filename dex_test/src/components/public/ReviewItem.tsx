import React from 'react';
import { Star, ShieldCheck, ThumbsUp, Flag, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';

export interface Review {
  id: string;
  app_id: string;
  username: string;
  rating: number;
  comment: string;
  created_at: string;
  helpful_count: number;
  source?: 'google' | 'community' | string;
  reported?: boolean;
  report_count?: number;
}

const AVATAR_COLORS = [
  'bg-emerald-500 text-emerald-100',
  'bg-sky-500 text-sky-100',
  'bg-violet-500 text-violet-100',
  'bg-amber-500 text-amber-100',
  'bg-rose-500 text-rose-100',
  'bg-indigo-500 text-indigo-100',
  'bg-teal-500 text-teal-100',
];

export const getAvatarStyle = (name: string): string => {
  const index = name ? name.toLowerCase().charCodeAt(0) % AVATAR_COLORS.length : 0;
  return AVATAR_COLORS[index];
};

interface ReviewItemProps {
  rev: Review;
  isReported: boolean;
  isExpanded: boolean;
  isVoted: boolean;
  onToggleExpand: (id: string) => void;
  onHelpfulVote: (id: string) => void;
  onReport: (id: string) => void;
}

export function ReviewItem({
  rev,
  isReported,
  isExpanded,
  isVoted,
  onToggleExpand,
  onHelpfulVote,
  onReport,
}: ReviewItemProps) {
  const isLong = rev.comment.length > 150;
  const displayedComment = isLong && !isExpanded 
    ? `${rev.comment.substring(0, 150)}...` 
    : rev.comment;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      key={rev.id}
      className={`p-5 border rounded-2xl flex gap-4 transition-all text-left ${
        isReported || rev.reported
          ? 'bg-rose-500/[0.04] dark:bg-rose-500/[0.08] border-rose-500/20 opacity-90'
          : 'bg-zinc-50/50 dark:bg-zinc-900/30 border-black/5 dark:border-white/10'
      }`}
    >
      {/* Avatar */}
      <div className={`w-9 h-9 rounded-full font-black text-sm flex items-center justify-center shrink-0 uppercase shadow-sm ${getAvatarStyle(rev.username)}`}>
        {rev.username ? rev.username.charAt(0) : 'G'}
      </div>

      {/* Content column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-1">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-bold text-sm text-zinc-800 dark:text-zinc-200 truncate">
              {rev.username}
            </span>
            <span className="inline-flex items-center gap-1 bg-[#01875f]/10 text-[#01875f] dark:text-[#00a170] text-[10px] font-semibold px-2 py-0.5 rounded-full border border-[#01875f]/10 shrink-0 select-none">
              <ShieldCheck className="w-2.5 h-2.5 text-[#01875f]" />
              <span>Verified Player</span>
            </span>
            {(isReported || rev.reported) && (
              <span className="inline-flex items-center gap-1 bg-rose-500/10 text-rose-600 dark:text-rose-450 text-[10px] font-black px-2 py-0.5 rounded-full border border-rose-500/10 shrink-0 select-none uppercase tracking-wide animate-pulse">
                Flagged
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase shrink-0">
            {new Date(rev.created_at).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </span>
        </div>

        {/* Stars */}
        <div className="flex items-center gap-0.5 mb-2.5 text-amber-500">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star 
              key={`star-${rev.id}-${s}`} 
              className={`w-3 h-3 ${s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-300 dark:text-zinc-700'}`} 
            />
          ))}
        </div>

        {/* Expandable Review Text using Framer Motion */}
        <motion.div 
          layout="position"
          className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed break-words whitespace-pre-wrap flex flex-col relative select-text"
        >
          <p>{displayedComment}</p>
          
          {isLong && (
            <button
              onClick={() => onToggleExpand(rev.id)}
              className="self-start inline-flex items-center gap-0.5 text-[11px] font-black text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 mt-2 cursor-pointer transition-all uppercase tracking-wide select-none outline-none"
            >
              <span>{isExpanded ? 'Show less' : 'Read more'}</span>
              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}
        </motion.div>

        {/* Footer Help voting Panel */}
        <div className="flex items-center gap-4 mt-4 pt-3.5 border-t border-black/[0.03] dark:border-white/[0.03]">
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
            Was this review helpful?
          </span>
          <button
            onClick={() => onHelpfulVote(rev.id)}
            disabled={isVoted}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
              isVoted
                ? 'bg-blue-500/10 text-blue-500 cursor-default'
                : 'bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 text-zinc-500 dark:text-zinc-400 active:scale-95 cursor-pointer'
            }`}
          >
            <ThumbsUp className="w-3 h-3" />
            <span>Helpful {rev.helpful_count > 0 && `(${rev.helpful_count})`}</span>
          </button>

          <button
            onClick={() => onReport(rev.id)}
            disabled={isReported || rev.reported}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ml-auto ${
              isReported || rev.reported
                ? 'bg-rose-500/10 text-rose-650 dark:text-rose-400 cursor-default font-black'
                : 'bg-black/5 hover:bg-rose-500/10 hover:text-rose-600 dark:bg-white/5 dark:hover:bg-rose-500/15 text-zinc-500 dark:text-zinc-400 active:scale-95 cursor-pointer'
            }`}
          >
            <Flag className="w-3 h-3" />
            <span>{isReported || rev.reported ? 'Reported' : 'Report'}</span>
          </button>
        </div>

      </div>
    </motion.div>
  );
}

export default ReviewItem;
