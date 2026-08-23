import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  MessageSquare, 
  Search, 
  Filter, 
  Star, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Plus, 
  RefreshCw, 
  CheckSquare, 
  Square, 
  Pin, 
  ThumbsUp, 
  CornerDownRight, 
  Download, 
  Sparkles, 
  Edit3, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  X, 
  ExternalLink,
  ChevronDown,
  Layers,
  Calculator
} from 'lucide-react';
import { toast } from '../Toast';
import { adminFetch } from '../../services/adminAuthService';
import AdminAIReviewStudioTab from './AdminAIReviewStudioTab';

interface AdminReviewsTabProps {
  appsList?: any[];
}

export interface ReviewData {
  id: string;
  appId: string;
  userName: string;
  rating: number;
  reviewText: string;
  timestamp: string;
  status: 'published' | 'pending' | 'rejected' | string;
  helpful_count?: number;
  isPinned?: boolean;
  reported?: boolean;
  report_count?: number;
  source?: string;
  adminReply?: {
    text: string;
    author: string;
    timestamp: string;
  } | null;
}

export const AdminReviewsTab: React.FC<AdminReviewsTabProps> = ({ appsList = [] }) => {
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actioningId, setActioningId] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAppId, setSelectedAppId] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedRating, setSelectedRating] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedReviewIds, setSelectedReviewIds] = useState<string[]>([]);

  // Modals
  const [editModalReview, setEditModalReview] = useState<Partial<ReviewData> | null>(null);
  const [isAddMode, setIsAddMode] = useState(false);
  const [replyModalReview, setReplyModalReview] = useState<ReviewData | null>(null);
  const [showAIModal, setShowAIModal] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyAuthor, setReplyAuthor] = useState('RummyDex Official Support');
  const [recalculating, setRecalculating] = useState(false);

  // App Lookup Map
  const appMap = useMemo(() => {
    const map = new Map<string, any>();
    appsList.forEach(app => {
      if (app.id) map.set(app.id, app);
      if (app.slug) map.set(app.slug, app);
    });
    return map;
  }, [appsList]);

  // Calculate reviews count per app for the app browser bar
  const appReviewCounts = useMemo(() => {
    const counts = new Map<string, number>();
    reviews.forEach(r => {
      const key = String(r.appId || '').toLowerCase();
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    return counts;
  }, [reviews]);

  // Currently selected app details
  const activeApp = useMemo(() => {
    if (selectedAppId === 'all') return null;
    return appMap.get(selectedAppId) || { id: selectedAppId, name: selectedAppId, slug: selectedAppId };
  }, [selectedAppId, appMap]);

  // Handle clearing reviews for active app
  const handleClearAppReviews = async (appIdToClear: string) => {
    if (!window.confirm(`Are you sure you want to delete ALL reviews for "${appIdToClear}"? This action cannot be undone.`)) return;
    try {
      setRefreshing(true);
      const res = await adminFetch('/api/v1/admin/community/reviews/clear-app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appId: appIdToClear })
      });
      const data = await res.json();
      if (res.ok) {
        toast(data.message || 'App reviews cleared successfully', 'success');
        await fetchReviews(true);
      } else {
        toast(data.error || 'Failed to clear app reviews', 'error');
      }
    } catch (err) {
      toast('Error clearing reviews', 'error');
    } finally {
      setRefreshing(false);
    }
  };

  // Fetch reviews from backend
  const fetchReviews = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const params = new URLSearchParams();
      if (selectedAppId !== 'all') params.set('appId', selectedAppId);
      if (selectedStatus !== 'all') params.set('status', selectedStatus);
      if (selectedRating !== 'all') params.set('rating', selectedRating);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      params.set('sortBy', sortBy);
      params.set('limit', '5000');

      const res = await adminFetch(`/api/v1/admin/community/reviews?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
      } else {
        toast('Failed to load reviews list', 'error');
      }
    } catch (err: any) {
      console.error('Error fetching admin reviews:', err);
      toast('Network error loading reviews', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedAppId, selectedStatus, selectedRating, searchQuery, sortBy]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Calculate quick metrics
  const stats = useMemo(() => {
    const total = reviews.length;
    const published = reviews.filter(r => r.status === 'published').length;
    const pending = reviews.filter(r => r.status === 'pending').length;
    const rejected = reviews.filter(r => r.status === 'rejected').length;
    const flagged = reviews.filter(r => r.reported || (r.report_count || 0) > 0).length;
    const avg = total > 0 
      ? (reviews.reduce((acc, cur) => acc + (Number(cur.rating) || 5), 0) / total).toFixed(1)
      : '5.0';

    return { total, published, pending, rejected, flagged, avg };
  }, [reviews]);

  // Individual Actions
  const handleUpdateStatus = async (review: ReviewData, newStatus: 'published' | 'pending' | 'rejected') => {
    try {
      setActioningId(review.id);
      const res = await adminFetch(`/api/v1/admin/community/reviews/${review.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        toast(`Review status set to ${newStatus}`, 'success');
        setReviews(prev => prev.map(r => r.id === review.id ? { ...r, status: newStatus } : r));
      } else {
        toast('Failed to update review status', 'error');
      }
    } catch (err) {
      toast('Error processing request', 'error');
    } finally {
      setActioningId(null);
    }
  };

  const handleTogglePin = async (review: ReviewData) => {
    try {
      setActioningId(review.id);
      const newPinned = !review.isPinned;
      const res = await adminFetch(`/api/v1/admin/community/reviews/${review.id}`, {
        method: 'PUT',
        body: JSON.stringify({ isPinned: newPinned })
      });

      if (res.ok) {
        toast(newPinned ? 'Review pinned to top' : 'Review unpinned', 'success');
        setReviews(prev => prev.map(r => r.id === review.id ? { ...r, isPinned: newPinned } : r));
      }
    } catch (err) {
      toast('Error toggling pin', 'error');
    } finally {
      setActioningId(null);
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this review?')) return;
    try {
      setActioningId(id);
      const res = await adminFetch(`/api/v1/admin/community/reviews/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        toast('Review deleted permanently', 'success');
        setReviews(prev => prev.filter(r => r.id !== id));
        setSelectedReviewIds(prev => prev.filter(selId => selId !== id));
      } else {
        toast('Failed to delete review', 'error');
      }
    } catch (err) {
      toast('Error deleting review', 'error');
    } finally {
      setActioningId(null);
    }
  };

  // Bulk Actions
  const handleBulkAction = async (action: 'publish' | 'pending' | 'reject' | 'delete' | 'pin' | 'unpin') => {
    if (selectedReviewIds.length === 0) return;
    if (action === 'delete' && !window.confirm(`Delete ${selectedReviewIds.length} selected reviews? This cannot be undone.`)) {
      return;
    }

    try {
      setRefreshing(true);
      const res = await adminFetch('/api/v1/admin/community/reviews/bulk', {
        method: 'POST',
        body: JSON.stringify({ reviewIds: selectedReviewIds, action })
      });

      if (res.ok) {
        toast(`Bulk ${action} executed successfully!`, 'success');
        setSelectedReviewIds([]);
        await fetchReviews(true);
      } else {
        toast('Bulk action failed', 'error');
      }
    } catch (err) {
      toast('Error performing bulk action', 'error');
    } finally {
      setRefreshing(false);
    }
  };

  // Save Modal (Create / Edit)
  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalReview?.appId || !editModalReview?.userName || !editModalReview?.reviewText) {
      toast('Please fill all required review fields', 'error');
      return;
    }

    try {
      setActioningId('modal_save');
      if (isAddMode) {
        const res = await adminFetch('/api/v1/admin/community/reviews', {
          method: 'POST',
          body: JSON.stringify(editModalReview)
        });

        if (res.ok) {
          toast('New verified review created!', 'success');
          setEditModalReview(null);
          await fetchReviews(true);
        } else {
          toast('Failed to create review', 'error');
        }
      } else if (editModalReview.id) {
        const res = await adminFetch(`/api/v1/admin/community/reviews/${editModalReview.id}`, {
          method: 'PUT',
          body: JSON.stringify(editModalReview)
        });

        if (res.ok) {
          const data = await res.json();
          toast('Review updated successfully!', 'success');
          setReviews(prev => prev.map(r => r.id === editModalReview.id ? data.review : r));
          setEditModalReview(null);
        } else {
          toast('Failed to update review', 'error');
        }
      }
    } catch (err) {
      toast('Error saving review', 'error');
    } finally {
      setActioningId(null);
    }
  };

  // Save Official Reply
  const handleSaveReply = async () => {
    if (!replyModalReview) return;
    try {
      setActioningId(replyModalReview.id);
      const adminReplyPayload = replyText.trim() ? {
        text: replyText.trim(),
        author: replyAuthor.trim() || 'RummyDex Support',
        timestamp: new Date().toISOString()
      } : null;

      const res = await adminFetch(`/api/v1/admin/community/reviews/${replyModalReview.id}`, {
        method: 'PUT',
        body: JSON.stringify({ adminReply: adminReplyPayload })
      });

      if (res.ok) {
        toast(adminReplyPayload ? 'Official reply published!' : 'Official reply removed', 'success');
        setReviews(prev => prev.map(r => r.id === replyModalReview.id ? { ...r, adminReply: adminReplyPayload } : r));
        setReplyModalReview(null);
      } else {
        toast('Failed to save reply', 'error');
      }
    } catch (err) {
      toast('Error saving reply', 'error');
    } finally {
      setActioningId(null);
    }
  };

  // Recalculate Rating Statistics
  const handleRecalculateStats = async () => {
    if (!window.confirm('Recalculate all star distributions and rating averages across all apps in Firestore?')) return;
    try {
      setRecalculating(true);
      const res = await adminFetch('/api/v1/admin/community/reviews/recalc-stats', {
        method: 'POST',
        body: JSON.stringify({ appId: selectedAppId !== 'all' ? selectedAppId : undefined })
      });

      if (res.ok) {
        const data = await res.json();
        toast(data.message || 'Rating stats updated!', 'success');
      } else {
        toast('Failed to recalculate stats', 'error');
      }
    } catch (err) {
      toast('Error recalculating stats', 'error');
    } finally {
      setRecalculating(false);
    }
  };

  // Export Reviews
  const handleExport = (format: 'csv' | 'json') => {
    if (reviews.length === 0) {
      toast('No reviews to export', 'error');
      return;
    }

    if (format === 'json') {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reviews, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `rummydex_reviews_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast('Exported JSON successfully', 'success');
    } else {
      const headers = ['ID', 'AppID', 'Author', 'Rating', 'Status', 'HelpfulVotes', 'Pinned', 'Date', 'Comment', 'AdminReply'];
      const rows = reviews.map(r => [
        r.id,
        `"${r.appId}"`,
        `"${(r.userName || '').replace(/"/g, '""')}"`,
        r.rating,
        r.status,
        r.helpful_count || 0,
        r.isPinned ? 'YES' : 'NO',
        `"${new Date(r.timestamp).toISOString()}"`,
        `"${(r.reviewText || '').replace(/"/g, '""')}"`,
        `"${((r.adminReply?.text) || '').replace(/"/g, '""')}"`
      ]);

      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `rummydex_reviews_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast('Exported CSV successfully', 'success');
    }
  };

  const toggleSelectAll = () => {
    if (selectedReviewIds.length === reviews.length) {
      setSelectedReviewIds([]);
    } else {
      setSelectedReviewIds(reviews.map(r => r.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedReviewIds.includes(id)) {
      setSelectedReviewIds(prev => prev.filter(item => item !== id));
    } else {
      setSelectedReviewIds(prev => [...prev, id]);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-24 animate-fade-in">
      
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 md:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="p-2.5 bg-blue-500/20 text-blue-300 rounded-2xl border border-blue-400/20">
              <MessageSquare className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">App Reviews & Ratings Control</h1>
              <p className="text-xs md:text-sm text-blue-200/80 font-medium">
                Full lifecycle management: verify, edit, pin, reply, audit, and recalculate ratings directly in Firestore.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 relative z-10">
          <button
            onClick={() => setShowAIModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all active:scale-95 cursor-pointer uppercase tracking-wider"
            title="Open Gemini AI Review Generator Studio"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            AI Review Studio
          </button>

          <button
            onClick={() => {
              setIsAddMode(true);
              setEditModalReview({
                appId: appsList[0]?.slug || appsList[0]?.id || 'spin-crush',
                userName: '',
                rating: 5,
                reviewText: '',
                status: 'published',
                isPinned: false,
                helpful_count: 0
              });
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-500/25 transition-all active:scale-95 cursor-pointer uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" />
            Create Review
          </button>
          
          <button
            onClick={handleRecalculateStats}
            disabled={recalculating}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 rounded-xl font-bold text-xs transition-all active:scale-95 cursor-pointer"
            title="Recalculate average ratings and star counts for all apps"
          >
            <Calculator className={`w-4 h-4 ${recalculating ? 'animate-spin' : ''}`} />
            {recalculating ? 'Calculating...' : 'Recalc Ratings'}
          </button>

          <button
            onClick={() => fetchReviews(true)}
            disabled={refreshing}
            className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all active:scale-95 cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Visual Interactive App Catalog Selector Carousel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Select Application to Manage Reviews ({appsList.length} Apps)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
            Click any app card to filter reviews
          </span>
        </div>

        {/* Scrollable Horizontal App Strip */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
          
          {/* "All Applications" Card */}
          <button
            onClick={() => setSelectedAppId('all')}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all shrink-0 cursor-pointer text-left ${
              selectedAppId === 'all'
                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/25 ring-2 ring-blue-500/30'
                : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
              selectedAppId === 'all' ? 'bg-white/20 text-white' : 'bg-blue-500/10 text-blue-600'
            }`}>
              📱
            </div>
            <div>
              <div className="text-xs font-black leading-tight">All Applications</div>
              <div className={`text-[10px] font-medium mt-0.5 ${selectedAppId === 'all' ? 'text-blue-100' : 'text-slate-400'}`}>
                {reviews.length} total reviews
              </div>
            </div>
          </button>

          {/* Individual App Cards */}
          {appsList.map((app) => {
            const appKey = (app.slug || app.id || '').toLowerCase();
            const revCount = appReviewCounts.get(appKey) || appReviewCounts.get((app.id || '').toLowerCase()) || 0;
            const isSelected = selectedAppId === (app.slug || app.id);

            return (
              <button
                key={app.id || app.slug}
                onClick={() => setSelectedAppId(app.slug || app.id)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl border transition-all shrink-0 cursor-pointer text-left max-w-[210px] ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/25 ring-2 ring-blue-500/30'
                    : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500'
                }`}
              >
                <img
                  src={app.icon_url || 'https://via.placeholder.com/48'}
                  alt={app.name}
                  className="w-10 h-10 rounded-xl object-cover border border-black/10 shrink-0 bg-slate-200 dark:bg-slate-700"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-black truncate leading-tight">{app.name}</div>
                  <div className={`text-[10px] font-medium mt-0.5 flex items-center gap-1.5 ${
                    isSelected ? 'text-blue-100' : 'text-slate-400'
                  }`}>
                    <span className="truncate">{app.category || 'Card Game'}</span>
                    <span>•</span>
                    <span className={`font-bold ${isSelected ? 'text-amber-200' : 'text-amber-500'}`}>
                      {revCount} revs
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected App Context Banner (App Spotlight) */}
      {activeApp && selectedAppId !== 'all' && (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 p-5 md:p-6 rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in duration-200">
          <div className="flex items-center gap-4">
            <img
              src={activeApp.icon_url || 'https://via.placeholder.com/64'}
              alt={activeApp.name}
              className="w-14 h-14 md:w-16 md:h-16 rounded-2xl object-cover border-2 border-white/20 shadow-lg shrink-0 bg-slate-800"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg md:text-xl font-black">{activeApp.name}</h2>
                <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-indigo-400/30 uppercase tracking-wider">
                  {activeApp.category || 'Card Game'}
                </span>
              </div>
              <p className="text-xs text-indigo-200/80 font-medium mt-0.5">
                Slug: <code className="bg-white/10 px-1.5 py-0.5 rounded text-amber-300">{selectedAppId}</code> •
                Package: <code className="text-slate-300">{activeApp.package_name || 'N/A'}</code>
              </p>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-indigo-200">
                <span className="font-bold flex items-center gap-1 text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-current" /> {activeApp.rating || '4.8'} Avg
                </span>
                <span>•</span>
                <span className="font-bold text-white">
                  {reviews.length} Filtered Reviews
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowAIModal(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Generate Reviews for App
            </button>
            <button
              onClick={() => handleClearAppReviews(selectedAppId)}
              className="px-3.5 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-400/30 rounded-xl font-bold text-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear App Reviews
            </button>
          </div>
        </div>
      )}

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Reviews</span>
          <div className="text-2xl font-black text-slate-800 dark:text-white mt-1">{stats.total}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-emerald-500/20 dark:border-emerald-500/20 p-4 rounded-2xl shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Published
          </span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{stats.published}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-amber-500/20 dark:border-amber-500/20 p-4 rounded-2xl shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Pending
          </span>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{stats.pending}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-rose-500/20 dark:border-rose-500/20 p-4 rounded-2xl shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Flagged
          </span>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{stats.flagged}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Rejected</span>
          <div className="text-2xl font-black text-slate-500 mt-1">{stats.rejected}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-amber-500/30 p-4 rounded-2xl shadow-sm bg-gradient-to-br from-amber-500/5 to-transparent">
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-500 flex items-center gap-1">
            <Star className="w-3 h-3 fill-amber-500" /> Avg Rating
          </span>
          <div className="text-2xl font-black text-amber-500 mt-1">{stats.avg} ★</div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by author, review text, or app ID..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* App Selector */}
          <div className="w-full lg:w-64">
            <select
              value={selectedAppId}
              onChange={(e) => setSelectedAppId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">📱 All Applications ({appsList.length})</option>
              {appsList.map((app) => (
                <option key={app.id || app.slug} value={app.slug || app.id}>
                  {app.name} ({app.slug || app.id})
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="w-full lg:w-48">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="newest">⚡ Newest First</option>
              <option value="oldest">🕰️ Oldest First</option>
              <option value="rating_desc">⭐ Highest Rating</option>
              <option value="rating_asc">★ Lowest Rating</option>
              <option value="helpful">👍 Most Helpful</option>
              <option value="reports">🚩 Most Flagged</option>
            </select>
          </div>

          {/* Export Menu */}
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => handleExport('csv')}
              className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
              title="Export CSV"
            >
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
            <button
              onClick={() => handleExport('json')}
              className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
              title="Export JSON"
            >
              <Download className="w-3.5 h-3.5" /> JSON
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 mr-2">Status:</span>
          {[
            { id: 'all', label: 'All' },
            { id: 'published', label: 'Published' },
            { id: 'pending', label: 'Pending Moderation' },
            { id: 'rejected', label: 'Hidden / Rejected' }
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setSelectedStatus(st.id)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedStatus === st.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {st.label}
            </button>
          ))}

          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-4 mr-2">Stars:</span>
          {[
            { id: 'all', label: 'All' },
            { id: '5', label: '★ 5' },
            { id: '4', label: '★ 4' },
            { id: '3', label: '★ 3' },
            { id: '2', label: '★ 2' },
            { id: '1', label: '★ 1' }
          ].map((rt) => (
            <button
              key={rt.id}
              onClick={() => setSelectedRating(rt.id)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedRating === rt.id
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {rt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Action Header */}
      {selectedReviewIds.length > 0 && (
        <div className="bg-blue-600 text-white p-4 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-3 animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-3">
            <span className="bg-white/20 px-3 py-1 rounded-lg text-xs font-black">
              {selectedReviewIds.length} Selected
            </span>
            <span className="text-xs font-medium opacity-90">Choose action for selected items:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleBulkAction('publish')}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Bulk Publish
            </button>
            <button
              onClick={() => handleBulkAction('pending')}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5" /> Bulk Pending
            </button>
            <button
              onClick={() => handleBulkAction('reject')}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <EyeOff className="w-3.5 h-3.5" /> Bulk Hide
            </button>
            <button
              onClick={() => handleBulkAction('pin')}
              className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <Pin className="w-3.5 h-3.5" /> Bulk Pin
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" /> Bulk Delete
            </button>
            <button
              onClick={() => setSelectedReviewIds([])}
              className="px-2 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        
        {/* List Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSelectAll}
              className="text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
              title="Select all visible"
            >
              {selectedReviewIds.length === reviews.length && reviews.length > 0 ? (
                <CheckSquare className="w-5 h-5 text-blue-600" />
              ) : (
                <Square className="w-5 h-5" />
              )}
            </button>
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">
              Showing {reviews.length} Reviews
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-3 border-blue-600 border-t-transparent" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Community Reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-24 px-4">
            <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No reviews found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              No community reviews match the selected filters or search terms.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {reviews.map((rev) => {
              const matchedApp = appMap.get(rev.appId);
              const isSelected = selectedReviewIds.includes(rev.id);

              return (
                <div 
                  key={rev.id} 
                  className={`p-6 transition-all hover:bg-slate-50/70 dark:hover:bg-slate-800/40 flex flex-col gap-4 ${
                    isSelected ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                  } ${rev.isPinned ? 'border-l-4 border-l-blue-500' : ''}`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    
                    {/* Left: User & Meta info */}
                    <div className="flex items-start gap-4 flex-1">
                      <button
                        onClick={() => toggleSelectOne(rev.id)}
                        className="mt-1 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer shrink-0"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>

                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-md uppercase">
                        {rev.userName ? rev.userName.charAt(0) : 'U'}
                      </div>

                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">
                            {rev.userName}
                          </span>

                          {/* App Badge with link */}
                          <a
                            href={`/app/${rev.appId}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300 hover:text-blue-600 text-[10px] font-black px-2.5 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors uppercase tracking-wider"
                          >
                            <span>{matchedApp?.name || rev.appId}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>

                          {/* Status Badge */}
                          {rev.status === 'published' && (
                            <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-wider">
                              Published
                            </span>
                          )}
                          {rev.status === 'pending' && (
                            <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-amber-500/20 uppercase tracking-wider animate-pulse">
                              Pending
                            </span>
                          )}
                          {rev.status === 'rejected' && (
                            <span className="bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-rose-500/20 uppercase tracking-wider">
                              Hidden
                            </span>
                          )}

                          {rev.isPinned && (
                            <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-blue-500/20 uppercase tracking-wider flex items-center gap-1">
                              <Pin className="w-2.5 h-2.5 fill-current" /> Pinned
                            </span>
                          )}

                          {(rev.reported || (rev.report_count || 0) > 0) && (
                            <span className="bg-rose-500/15 text-rose-600 dark:text-rose-400 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-rose-500/30 uppercase tracking-wider flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Flagged ({rev.report_count || 1})
                            </span>
                          )}
                        </div>

                        {/* Stars and Date */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3.5 h-3.5 ${
                                  s <= rev.rating
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-slate-200 dark:text-slate-700'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-slate-400 font-medium">
                            {new Date(rev.timestamp).toLocaleString(undefined, {
                              dateStyle: 'medium',
                              timeStyle: 'short'
                            })}
                          </span>
                          <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                            <ThumbsUp className="w-3 h-3 text-slate-400" /> {rev.helpful_count || 0} Helpful
                          </span>
                        </div>

                        {/* Comment Text */}
                        <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/80 mt-2">
                          <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">
                            {rev.reviewText}
                          </p>
                        </div>

                        {/* Official Admin Reply View */}
                        {rev.adminReply && (
                          <div className="mt-2.5 pl-4 border-l-2 border-l-blue-500 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1">
                                <CornerDownRight className="w-3 h-3" /> {rev.adminReply.author || 'Official Response'}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(rev.adminReply.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                              "{rev.adminReply.text}"
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Quick Action Controls */}
                    <div className="flex flex-wrap lg:flex-col items-center lg:items-end gap-2 shrink-0 pt-2 lg:pt-0">
                      <div className="flex items-center gap-1.5">
                        {/* Quick Status Toggles */}
                        {rev.status !== 'published' && (
                          <button
                            disabled={actioningId === rev.id}
                            onClick={() => handleUpdateStatus(rev, 'published')}
                            className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                            title="Publish Review"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Publish
                          </button>
                        )}
                        {rev.status !== 'rejected' && (
                          <button
                            disabled={actioningId === rev.id}
                            onClick={() => handleUpdateStatus(rev, 'rejected')}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                            title="Hide Review"
                          >
                            <EyeOff className="w-3.5 h-3.5" /> Hide
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Pin Button */}
                        <button
                          disabled={actioningId === rev.id}
                          onClick={() => handleTogglePin(rev)}
                          className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            rev.isPinned
                              ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300'
                              : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                          title={rev.isPinned ? 'Unpin review' : 'Pin review to top'}
                        >
                          <Pin className="w-3.5 h-3.5" />
                        </button>

                        {/* Reply Button */}
                        <button
                          onClick={() => {
                            setReplyModalReview(rev);
                            setReplyText(rev.adminReply?.text || '');
                            setReplyAuthor(rev.adminReply?.author || 'RummyDex Support');
                          }}
                          className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                          title="Official Reply"
                        >
                          <CornerDownRight className="w-3.5 h-3.5" /> {rev.adminReply ? 'Edit Reply' : 'Reply'}
                        </button>

                        {/* Full Edit Button */}
                        <button
                          onClick={() => {
                            setIsAddMode(false);
                            setEditModalReview({ ...rev });
                          }}
                          className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl transition-all cursor-pointer"
                          title="Edit Full Review"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          disabled={actioningId === rev.id}
                          onClick={() => handleDeleteReview(rev.id)}
                          className="p-2 bg-rose-50 hover:bg-rose-500 hover:text-white text-rose-600 dark:bg-rose-950/30 dark:hover:bg-rose-600 dark:hover:text-white rounded-xl transition-all cursor-pointer"
                          title="Delete Review Permanently"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create / Edit Review Modal */}
      {editModalReview && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4 animate-in fade-in duration-150">
          <div 
            className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-500/10 text-blue-600 rounded-xl">
                  {isAddMode ? <Plus className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {isAddMode ? 'Create New Player Review' : 'Edit Review & Details'}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Changes save directly to Firestore and auto-recalculate star distributions.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setEditModalReview(null)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="p-6 overflow-y-auto space-y-4">
              
              {/* App Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Target Application *
                </label>
                <select
                  value={editModalReview.appId || ''}
                  onChange={(e) => setEditModalReview({ ...editModalReview, appId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {appsList.map((app) => (
                    <option key={app.id || app.slug} value={app.slug || app.id}>
                      {app.name} ({app.slug || app.id})
                    </option>
                  ))}
                </select>
              </div>

              {/* Author & Rating in row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Player / Author Name *
                  </label>
                  <input
                    type="text"
                    value={editModalReview.userName || ''}
                    onChange={(e) => setEditModalReview({ ...editModalReview, userName: e.target.value })}
                    placeholder="e.g. Rahul_Gamer"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Star Rating (1 - 5) *
                  </label>
                  <div className="flex items-center gap-1 py-1">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        type="button"
                        key={num}
                        onClick={() => setEditModalReview({ ...editModalReview, rating: num })}
                        className="p-1 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            num <= (editModalReview.rating || 5)
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-300 dark:text-slate-700'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-xs font-black text-amber-500">
                      {editModalReview.rating || 5} Stars
                    </span>
                  </div>
                </div>
              </div>

              {/* Review Comment */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Review Comment *
                </label>
                <textarea
                  rows={4}
                  value={editModalReview.reviewText || ''}
                  onChange={(e) => setEditModalReview({ ...editModalReview, reviewText: e.target.value })}
                  placeholder="Detailed feedback regarding gameplay, graphics, withdrawal, customer support..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Status, Pinned & Helpful Votes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Status
                  </label>
                  <select
                    value={editModalReview.status || 'published'}
                    onChange={(e) => setEditModalReview({ ...editModalReview, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-white"
                  >
                    <option value="published">✅ Published</option>
                    <option value="pending">⏳ Pending</option>
                    <option value="rejected">❌ Hidden</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Helpful Votes
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editModalReview.helpful_count ?? 0}
                    onChange={(e) => setEditModalReview({ ...editModalReview, helpful_count: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-white"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="modal_pinned"
                    checked={Boolean(editModalReview.isPinned)}
                    onChange={(e) => setEditModalReview({ ...editModalReview, isPinned: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                  />
                  <label htmlFor="modal_pinned" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                    Pin Review to Top
                  </label>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditModalReview(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actioningId === 'modal_save'}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-lg shadow-blue-500/25 transition-all active:scale-95 cursor-pointer uppercase tracking-wider flex items-center gap-2"
                >
                  {actioningId === 'modal_save' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  {isAddMode ? 'Create Review' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Reply Modal */}
      {replyModalReview && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4 animate-in fade-in duration-150">
          <div 
            className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-500/10 text-indigo-600 rounded-xl">
                  <CornerDownRight className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Official Admin / Developer Reply
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Replying to {replyModalReview.userName} on {replyModalReview.appId}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setReplyModalReview(null)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-xs text-slate-600 dark:text-slate-300 italic">
                "{replyModalReview.reviewText}"
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Responder Name / Title
                </label>
                <input
                  type="text"
                  value={replyAuthor}
                  onChange={(e) => setReplyAuthor(e.target.value)}
                  placeholder="e.g. Official RummyDex Support or Developer Team"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Official Reply Message
                </label>
                <textarea
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Thank you for your valuable feedback! We have updated the latest version to address this..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">Leave empty to remove existing official reply.</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setReplyModalReview(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveReply}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-500/25 transition-all active:scale-95 cursor-pointer uppercase tracking-wider"
                >
                  Publish Reply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Review Studio Modal */}
      {showAIModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600/10 text-blue-600 rounded-xl">
                  <Sparkles size={22} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">
                    Gemini AI Review Studio
                  </h2>
                  <p className="text-xs text-slate-500">
                    Generate authentic, human-like reviews with full control over ratings and bulk deployment.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAIModal(false);
                  fetchReviews(true);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1">
              <AdminAIReviewStudioTab
                appsList={appsList}
                onReviewsGenerated={() => {
                  setShowAIModal(false);
                  fetchReviews(true);
                }}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminReviewsTab;
