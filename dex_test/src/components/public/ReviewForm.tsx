import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Plus, Loader2, Check, AlertCircle, Sparkles } from 'lucide-react';
import { Review } from './ReviewItem';

interface ReviewFormProps {
  appId: string;
  onSuccess: (newReview: Review) => void;
}

export function ReviewForm({ appId, onSuccess }: ReviewFormProps) {
  const [username, setUsername] = useState('');
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorText, setErrorText] = useState('');

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');
    
    const cleanUsername = username.trim().replace(/<[^>]*>?/gm, '');
    const cleanComment = comment.trim().replace(/<[^>]*>?/gm, '');

    if (!cleanUsername || cleanUsername.length < 2) {
      setErrorText('Please specify a valid display name (min 2 chars).');
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9 ]+$/;
    if (!usernameRegex.test(cleanUsername)) {
      setErrorText('Username can only contain letters, numbers, and spaces.');
      return;
    }

    if (!cleanComment || cleanComment.length < 10) {
      setErrorText('Your review must contain at least 10 characters.');
      return;
    }

    const wordCount = cleanComment.split(/\s+/).filter(w => w.trim().length > 0).length;
    if (wordCount < 5) {
      setErrorText('Your review must contain at least 5 words.');
      return;
    }

    setSubmitting(true);

    const generatedId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newSubmission: Review = {
      id: generatedId,
      app_id: appId,
      username: cleanUsername,
      rating: rating,
      comment: cleanComment,
      created_at: new Date().toISOString(),
      helpful_count: 0,
      source: 'community'
    };

    try {
      onSuccess(newSubmission);

      let storedReviews: Review[] = [];
      const stored = localStorage.getItem(`local_user_reviews_${appId}`);
      if (stored) {
        storedReviews = JSON.parse(stored);
      }
      localStorage.setItem(`local_user_reviews_${appId}`, JSON.stringify([newSubmission, ...storedReviews]));

      try {
        await fetch('/api/v1/public/review', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            app_id: appId,
            username: cleanUsername,
            rating: rating,
            comment: cleanComment,
            created_at: newSubmission.created_at,
            helpful_count: 0,
            is_approved: false,
            source: newSubmission.source
          })
        }).catch(() => {});
      } catch (e) {}

      setSuccess(true);
      setUsername('');
      setComment('');
      setRating(5);
      
      setTimeout(() => setSuccess(false), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/10 rounded-2xl shadow-sm">
      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-4 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-amber-500" />
        <span>Share your gameplay review</span>
      </h3>

      <form onSubmit={handleReviewSubmit} className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Your Rating:</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <motion.button
                  key={s}
                  type="button"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onMouseEnter={() => setHoveredRating(s)}
                  onMouseLeave={() => setHoveredRating(null)}
                  onClick={() => setRating(s)}
                  className="p-1 focus:outline-none cursor-pointer"
                >
                  <Star 
                    className={`w-6 h-6 transition-colors duration-200 ${
                      s <= (hoveredRating !== null ? hoveredRating : rating)
                        ? 'fill-amber-400 text-amber-400' 
                        : 'text-zinc-300 dark:text-zinc-700'
                    }`} 
                  />
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-1">
            <span className="block text-[10px] font-bold text-zinc-400 mb-1 uppercase tracking-wider">Your Name</span>
            <input
              type="text"
              required
              maxLength={30}
              placeholder="Name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full text-xs font-semibold p-2.5 bg-white dark:bg-zinc-950 border border-black/10 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-[#01875f]/20 focus:border-[#01875f] text-zinc-900 dark:text-zinc-100 transition-all h-[46px]"
            />
          </div>
          
          <div className="sm:col-span-2">
            <label htmlFor="comment" className="block text-[10px] font-bold text-zinc-400 mb-1 uppercase tracking-wider">Review comment</label>
            <textarea
              id="comment"
              required
              maxLength={500}
              placeholder="Write a constructive, honest review of the gameplay experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
              className="w-full bg-zinc-50 focus:bg-white dark:bg-zinc-950 border border-black/5 dark:border-white/10 rounded-xl p-3 text-xs font-medium text-zinc-800 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none min-h-[46px]"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex-1">
            {errorText && (
              <div className="flex items-center gap-1 text-xs font-semibold text-rose-500">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorText}</span>
              </div>
            )}

            <AnimatePresence>
              {success && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1.5 text-xs font-bold text-emerald-500"
                >
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 animate-bounce" />
                  <span>Review submitted!</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center justify-center gap-2 h-10 px-5 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-bold text-xs rounded-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shrink-0 w-full sm:w-auto"
          >
            {submitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Post Review</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
