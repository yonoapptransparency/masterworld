import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, 
  Star, 
  MessageSquare, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  ExternalLink,
  Sparkles,
  ShieldCheck,
  Search,
  Filter
} from 'lucide-react';
import { toast } from '../../Toast';
import { AppReviewCountData } from './types';
import { adminFetch as defaultAdminFetch } from '../../../services/adminAuthService';

export type { AppReviewCountData };

interface AppLiveReviewsModalProps {
  app: any;
  appStats?: AppReviewCountData;
  isOpen: boolean;
  onClose: () => void;
  adminFetch?: (url: string, options?: any) => Promise<Response>;
  onReviewDeleted?: () => void;
  onReviewsUpdated?: () => void;
}

export const AppLiveReviewsModal: React.FC<AppLiveReviewsModalProps> = ({
  app,
  appStats,
  isOpen,
  onClose,
  adminFetch = defaultAdminFetch,
  onReviewDeleted,
  onReviewsUpdated
}) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterRating, setFilterRating] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const appId = String(app?.id || app?.slug || '');

  const fetchAppReviews = useCallback(async () => {
    if (!appId) return;
    setLoading(true);
    try {
      const res = await adminFetch(`/api/v1/admin/community/reviews?appId=${encodeURIComponent(appId)}&limit=100&sortBy=newest`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
      } else {
        toast("Failed to load app reviews", "error");
      }
    } catch (err: any) {
      console.error("Error fetching live reviews for app:", err);
      toast("Error loading live reviews", "error");
    } finally {
      setLoading(false);
    }
  }, [appId, adminFetch]);

  useEffect(() => {
    if (isOpen && appId) {
      fetchAppReviews();
    }
  }, [isOpen, appId, fetchAppReviews]);

  const handleDeleteReview = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this live review from Firestore?")) return;
    setDeletingId(id);
    try {
      const res = await adminFetch(`/api/v1/admin/community/reviews/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        toast("Live review deleted successfully", "success");
        setReviews(prev => prev.filter(r => r.id !== id));
        if (onReviewDeleted) onReviewDeleted();
        if (onReviewsUpdated) onReviewsUpdated();
      } else {
        toast("Failed to delete review", "error");
      }
    } catch (e: any) {
      toast("Error deleting review: " + (e?.message || 'Network error'), "error");
    } finally {
      setDeletingId(null);
    }
  };

  if (!isOpen || !app) return null;

  const filteredReviews = reviews.filter(r => {
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    if (filterRating !== 'all' && Number(r.rating) !== Number(filterRating)) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const textMatch = (r.reviewText || r.comment || '').toLowerCase().includes(q);
      const userMatch = (r.userName || r.username || '').toLowerCase().includes(q);
      if (!textMatch && !userMatch) return false;
    }
    return true;
  });

  const publishedCount = reviews.filter(r => r.status === 'published').length;
  const pendingCount = reviews.filter(r => r.status === 'pending').length;
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0) / reviews.length).toFixed(1)
    : (appStats?.avgRating || app?.rating || '—');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl shadow-black/60 overflow-hidden text-slate-800 dark:text-slate-100">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            {app.icon_url ? (
              <img
                src={app.icon_url}
                alt={app.name}
                className="w-12 h-12 rounded-2xl object-contain bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0 shadow-xs"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-black text-lg flex items-center justify-center shrink-0">
                {app.name?.charAt(0) || 'A'}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 dark:text-white truncate">
                  {app.name}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 shrink-0">
                  Firebase Live
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {app.developer || 'Studio'} • {app.category || 'Card'} • ID: <code className="font-mono text-[11px] text-slate-700 dark:text-slate-300">{appId}</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={fetchAppReviews}
              disabled={loading}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="Refresh reviews"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Telemetry Strip */}
        <div className="px-5 py-3 bg-slate-100/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 dark:text-slate-400">Total Live:</span>
            <strong className="text-sm font-black text-slate-900 dark:text-white">{reviews.length}</strong>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 dark:text-slate-400">Published:</span>
            <strong className="text-sm font-black text-emerald-600 dark:text-emerald-400">{publishedCount}</strong>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 dark:text-slate-400">Pending:</span>
            <strong className="text-sm font-black text-amber-600 dark:text-amber-400">{pendingCount}</strong>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 dark:text-slate-400">Avg Rating:</span>
            <span className="text-sm font-black text-amber-500 flex items-center gap-0.5">
              <Star size={13} className="fill-amber-400" />
              {avgRating}★
            </span>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0 bg-white dark:bg-slate-900">
          <div className="relative flex-1 min-w-[180px] max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search reviewer or comment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              <option value="all">All Statuses ({reviews.length})</option>
              <option value="published">Published ({publishedCount})</option>
              <option value="pending">Pending ({pendingCount})</option>
            </select>

            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 scrollbar-thin">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <RefreshCw size={26} className="animate-spin text-emerald-500 mx-auto" />
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Loading live reviews from Firebase...</p>
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="py-14 text-center space-y-3 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <MessageSquare size={22} />
              </div>
              <div className="max-w-sm mx-auto">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {reviews.length === 0 ? "No Live Reviews in Firebase" : "No matching reviews found"}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {reviews.length === 0 
                    ? `"${app.name}" currently has 0 live reviews in Firestore. Use Brain 1 or Brain 2 to generate authentic reviews and publish them.`
                    : "Try adjusting your search or rating filters to see other reviews."}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/70 rounded-2xl p-3.5 space-y-2.5 shadow-2xs hover:border-slate-300 dark:hover:border-slate-600 transition-all"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0">
                        {(rev.userName || rev.username || 'P').charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-black text-slate-900 dark:text-white truncate block">
                          {rev.userName || rev.username || 'Anonymous Player'}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {rev.timestamp ? new Date(rev.timestamp).toLocaleDateString() : 'Recent'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                        rev.status === 'published'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                      }`}>
                        {rev.status || 'published'}
                      </span>
                      <button
                        onClick={() => handleDeleteReview(rev.id)}
                        disabled={deletingId === rev.id}
                        className="p-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title="Delete review"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={12}
                        className={star <= (rev.rating || 5) ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-700'}
                      />
                    ))}
                    <span className="text-[10px] font-bold text-slate-500 ml-1">
                      {rev.rating || 5}.0
                    </span>
                    {rev.source && (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 ml-auto">
                        {rev.source === 'ai_generated' ? '🤖 AI' : rev.source === 'admin_created' ? '✍️ Admin' : '👤 Public'}
                      </span>
                    )}
                  </div>

                  {/* Review Text */}
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-4">
                    {rev.reviewText || rev.comment || ''}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Showing {filteredReviews.length} of {reviews.length} reviews</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
