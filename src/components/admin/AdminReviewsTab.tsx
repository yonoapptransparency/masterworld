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
  ChevronLeft,
  ChevronRight,
  Layers,
  Calculator
} from 'lucide-react';
import { toast } from '../Toast';
import { adminFetch } from '../../services/adminAuthService';
import { 
  fetchAdminReviewsList, 
  fetchAdminAppReviewCounts, 
  AdminReviewItem,
  AppReviewCountsData 
} from '../../lib/adminCommunityFirebase';
import AdminAIReviewStudioTab from './AdminAIReviewStudioTab';
import { EditReviewModal } from './reviews/EditReviewModal';
import { ReplyReviewModal } from './reviews/ReplyReviewModal';

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
  const [firebaseStatus, setFirebaseStatus] = useState<'checking' | 'live' | 'error'>('checking');
  const [firebaseStatusMsg, setFirebaseStatusMsg] = useState('');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAppId, setSelectedAppId] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedRating, setSelectedRating] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedReviewIds, setSelectedReviewIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Per-app and database-wide review counts
  const [globalDbStats, setGlobalDbStats] = useState<{
    total: number;
    published: number;
    pending: number;
    rejected: number;
    flagged: number;
    averageRating: number;
  } | null>(null);
  const [appCountsMap, setAppCountsMap] = useState<Record<string, AppReviewCountsData>>({});

  // App selector carousel filtering & sorting
  const [appFilterQuery, setAppFilterQuery] = useState('');
  const [appSortBy, setAppSortBy] = useState<'reviews' | 'name' | 'pending'>('reviews');

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

  // Fast helper to get review counts for an app
  const getAppStats = useCallback((app: any): AppReviewCountsData => {
    const slugKey = (app.slug || '').toLowerCase();
    const idKey = (app.id || '').toLowerCase();
    return appCountsMap[slugKey] || appCountsMap[idKey] || {
      total: 0,
      published: 0,
      pending: 0,
      rejected: 0,
      flagged: 0,
      avgRating: 5.0
    };
  }, [appCountsMap]);

  // Filtered & Sorted Apps for the App Selector Carousel
  const filteredAppsList = useMemo(() => {
    let list = [...appsList];
    if (appFilterQuery.trim()) {
      const q = appFilterQuery.toLowerCase().trim();
      list = list.filter(a => 
        (a.name && a.name.toLowerCase().includes(q)) ||
        (a.slug && a.slug.toLowerCase().includes(q)) ||
        (a.id && a.id.toLowerCase().includes(q)) ||
        (a.category && a.category.toLowerCase().includes(q))
      );
    }

    list.sort((a, b) => {
      const statsA = getAppStats(a);
      const statsB = getAppStats(b);

      if (appSortBy === 'reviews') {
        if (statsB.total !== statsA.total) return statsB.total - statsA.total;
        return (a.name || '').localeCompare(b.name || '');
      }
      if (appSortBy === 'pending') {
        if (statsB.pending !== statsA.pending) return statsB.pending - statsA.pending;
        if (statsB.total !== statsA.total) return statsB.total - statsA.total;
        return (a.name || '').localeCompare(b.name || '');
      }
      // 'name'
      return (a.name || '').localeCompare(b.name || '');
    });

    return list;
  }, [appsList, appFilterQuery, appSortBy, getAppStats]);

  // Currently selected app details
  const activeApp = useMemo(() => {
    if (selectedAppId === 'all') return null;
    return appMap.get(selectedAppId) || { id: selectedAppId, name: selectedAppId, slug: selectedAppId };
  }, [selectedAppId, appMap]);

  const fetchFirebaseStatus = async () => {
    try {
      setFirebaseStatus('checking');
      const res = await adminFetch('/api/v1/admin/community/health/ping');
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.firestoreRead && data.firestoreWrite) {
          setFirebaseStatus('live');
          setFirebaseStatusMsg(`${data.details?.project || 'rummydexcommunity'} Live (Read/Write OK)`);
        } else if (data.firestoreRead) {
          setFirebaseStatus('live');
          setFirebaseStatusMsg(`${data.details?.project || 'rummydexcommunity'} Live (${data.details?.readMode || 'REST Live'})`);
        } else if (data.inMemoryReady || data.isQuotaProtected) {
          setFirebaseStatus('live');
          setFirebaseStatusMsg(`${data.details?.project || 'rummydexcommunity'} Live (Multi-Tier Zero-Downtime Cache: ${data.reviewsCount || 0} reviews)`);
        } else {
          setFirebaseStatus('error');
          setFirebaseStatusMsg(`Connection issues with ${data.details?.project || 'rummydexcommunity'}. Read: ${data.firestoreRead ? 'OK' : 'Fail'}, Write: ${data.firestoreWrite ? 'OK' : 'Fail'}`);
        }
      } else {
        setFirebaseStatus('error');
        setFirebaseStatusMsg('Error communicating with backend ping');
      }
    } catch(e) {
      setFirebaseStatus('error');
      setFirebaseStatusMsg('Network error reaching backend');
    }
  };

  // Initial load: fetch quick app review counts & firebase health ping
  useEffect(() => {
    fetchFirebaseStatus();
    fetchAdminAppReviewCounts().then(res => {
      if (res?.globalStats) setGlobalDbStats(res.globalStats);
      if (res?.appCounts) setAppCountsMap(res.appCounts);
    }).catch(() => {});
  }, []);

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
        try {
          window.dispatchEvent(new CustomEvent('community-reviews-cleared', { detail: { appId: appIdToClear } }));
        } catch (e) {}
        // Refresh counts and reviews
        fetchAdminAppReviewCounts().then(res => {
          if (res?.globalStats) setGlobalDbStats(res.globalStats);
          if (res?.appCounts) setAppCountsMap(res.appCounts);
        }).catch(() => {});
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

      const result = await fetchAdminReviewsList({
        appId: selectedAppId !== 'all' ? selectedAppId : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        rating: selectedRating !== 'all' ? selectedRating : undefined,
        search: searchQuery.trim() || undefined,
        sortBy,
        limit: selectedAppId !== 'all' ? 500 : 100,
        refresh: isRefresh
      });
      const rawReviews = (result.reviews as ReviewData[]) || [];
      const deduplicatedMap = new Map<string, ReviewData>();
      rawReviews.forEach(r => {
        if (r && r.id && !deduplicatedMap.has(r.id)) {
          deduplicatedMap.set(r.id, r);
        }
      });
      setReviews(Array.from(deduplicatedMap.values()));
      if (result.globalStats) {
        setGlobalDbStats(result.globalStats);
      }
      if (result.appCounts) {
        setAppCountsMap(result.appCounts);
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

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedAppId, selectedStatus, selectedRating, searchQuery, sortBy]);

  // Calculate quick metrics with true database totals
  const stats = useMemo(() => {
    // When viewing all applications without active text/rating filters, use exact database totals
    if (selectedAppId === 'all' && selectedStatus === 'all' && selectedRating === 'all' && !searchQuery.trim() && globalDbStats) {
      return {
        total: globalDbStats.total,
        published: globalDbStats.published,
        pending: globalDbStats.pending,
        rejected: globalDbStats.rejected,
        flagged: globalDbStats.flagged,
        avg: globalDbStats.averageRating.toFixed(1)
      };
    }

    // When viewing a specific app without active text/rating filters, use exact app counts
    if (selectedAppId !== 'all' && selectedStatus === 'all' && selectedRating === 'all' && !searchQuery.trim()) {
      const appKey = selectedAppId.toLowerCase();
      const countObj = appCountsMap[appKey];
      if (countObj) {
        return {
          total: countObj.total,
          published: countObj.published,
          pending: countObj.pending,
          rejected: countObj.rejected,
          flagged: countObj.flagged,
          avg: (countObj.avgRating || 5.0).toFixed(1)
        };
      }
    }

    // Otherwise calculate dynamically from the currently fetched reviews
    const total = reviews.length;
    const published = reviews.filter(r => r.status === 'published').length;
    const pending = reviews.filter(r => r.status === 'pending').length;
    const rejected = reviews.filter(r => r.status === 'rejected').length;
    const flagged = reviews.filter(r => r.reported || (r.report_count || 0) > 0).length;
    const avg = total > 0 
      ? (reviews.reduce((acc, cur) => acc + (Number(cur.rating) || 5), 0) / total).toFixed(1)
      : '5.0';

    return { total, published, pending, rejected, flagged, avg };
  }, [reviews, selectedAppId, selectedStatus, selectedRating, searchQuery, globalDbStats, appCountsMap]);

  // Paginated reviews slice
  const totalPages = Math.ceil(reviews.length / pageSize) || 1;
  const paginatedReviews = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const slice = reviews.slice(startIndex, startIndex + pageSize);
    const map = new Map<string, ReviewData>();
    for (const r of slice) {
      if (r && r.id && !map.has(r.id)) {
        map.set(r.id, r);
      }
    }
    return Array.from(map.values());
  }, [reviews, currentPage, pageSize]);

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
        try {
          window.dispatchEvent(new CustomEvent('community-review-deleted', { detail: { id } }));
        } catch (e) {}
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
        try {
          window.dispatchEvent(new CustomEvent('community-reviews-updated'));
        } catch (e) {}
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
          try {
            window.dispatchEvent(new CustomEvent('community-reviews-updated'));
          } catch (e) {}
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
          try {
            window.dispatchEvent(new CustomEvent('community-reviews-updated'));
          } catch (e) {}
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
    const pageIds = paginatedReviews.map(r => r.id);
    const allPageSelected = pageIds.length > 0 && pageIds.every(id => selectedReviewIds.includes(id));
    
    if (allPageSelected) {
      // Unselect all on current page
      setSelectedReviewIds(prev => prev.filter(id => !pageIds.includes(id)));
    } else {
      // Select all on current page
      setSelectedReviewIds(prev => Array.from(new Set([...prev, ...pageIds])));
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
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight">App Reviews & Ratings Control</h1>
                {firebaseStatus === 'checking' && (
                  <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 rounded-lg text-[10px] font-bold border border-amber-400/30 flex items-center gap-1.5 uppercase tracking-wider">
                    <RefreshCw className="w-3 h-3 animate-spin" /> Checking Firebase...
                  </span>
                )}
                {firebaseStatus === 'live' && (
                  <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg text-[10px] font-bold border border-emerald-400/30 flex items-center gap-1.5 uppercase tracking-wider" title={firebaseStatusMsg}>
                    <CheckCircle2 className="w-3 h-3" /> Firebase 100% Live
                  </span>
                )}
                {firebaseStatus === 'error' && (
                  <span className="px-2.5 py-1 bg-rose-500/20 text-rose-300 rounded-lg text-[10px] font-bold border border-rose-400/30 flex items-center gap-1.5 uppercase tracking-wider" title={firebaseStatusMsg}>
                    <AlertTriangle className="w-3 h-3" /> Firebase Sync Issue
                  </span>
                )}
              </div>
              <p className="text-xs md:text-sm text-blue-200/80 font-medium mt-1">
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
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Select Application to Manage Reviews
            </h3>
            <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
              {filteredAppsList.length} of {appsList.length} Apps
            </span>
          </div>

          {/* Mini Search & Sort Bar for App Carousel */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={appFilterQuery}
                onChange={(e) => setAppFilterQuery(e.target.value)}
                placeholder="Filter apps..."
                className="w-full pl-8 pr-6 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {appFilterQuery && (
                <button 
                  onClick={() => setAppFilterQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0">
              <button
                onClick={() => setAppSortBy('reviews')}
                className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                  appSortBy === 'reviews' 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Sort by most reviews"
              >
                Most Revs
              </button>
              <button
                onClick={() => setAppSortBy('pending')}
                className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                  appSortBy === 'pending' 
                    ? 'bg-amber-500 text-white shadow-sm' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Sort by apps with pending reviews needing moderation"
              >
                Pending
              </button>
              <button
                onClick={() => setAppSortBy('name')}
                className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                  appSortBy === 'name' 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Sort alphabetically"
              >
                A-Z
              </button>
            </div>
          </div>
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
                {globalDbStats ? globalDbStats.total.toLocaleString() : reviews.length} total reviews
              </div>
            </div>
          </button>

          {/* Individual App Cards */}
          {filteredAppsList.map((app) => {
            const appStats = getAppStats(app);
            const isSelected = selectedAppId === (app.slug || app.id);

            return (
              <button
                key={app.id || app.slug}
                onClick={() => setSelectedAppId(app.slug || app.id)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl border transition-all shrink-0 cursor-pointer text-left max-w-[220px] ${
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
                    <span className="truncate max-w-[70px]">{app.category || 'Card Game'}</span>
                    <span>•</span>
                    <span className={`font-bold ${isSelected ? 'text-amber-200' : 'text-amber-500'}`}>
                      {appStats.total} revs
                    </span>
                    {appStats.pending > 0 && (
                      <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full ${
                        isSelected ? 'bg-amber-400 text-slate-900' : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                      }`}>
                        {appStats.pending} new
                      </span>
                    )}
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

      {/* Interactive Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          onClick={() => { setSelectedStatus('all'); setSelectedRating('all'); }}
          className={`p-4 rounded-2xl shadow-sm text-left transition-all cursor-pointer border ${
            selectedStatus === 'all' && selectedRating === 'all'
              ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-500/50 ring-2 ring-blue-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Total Reviews</span>
          <div className="text-2xl font-black text-slate-800 dark:text-white mt-1">{stats.total.toLocaleString()}</div>
        </button>

        <button
          onClick={() => setSelectedStatus(selectedStatus === 'published' ? 'all' : 'published')}
          className={`p-4 rounded-2xl shadow-sm text-left transition-all cursor-pointer border ${
            selectedStatus === 'published'
              ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-500/60 ring-2 ring-emerald-500/30'
              : 'bg-white dark:bg-slate-900 border-emerald-500/20 hover:border-emerald-500/40'
          }`}
        >
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Published
          </span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{stats.published.toLocaleString()}</div>
        </button>

        <button
          onClick={() => setSelectedStatus(selectedStatus === 'pending' ? 'all' : 'pending')}
          className={`p-4 rounded-2xl shadow-sm text-left transition-all cursor-pointer border ${
            selectedStatus === 'pending'
              ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-500/60 ring-2 ring-amber-500/30'
              : 'bg-white dark:bg-slate-900 border-amber-500/20 hover:border-amber-500/40'
          }`}
        >
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Pending
          </span>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{stats.pending.toLocaleString()}</div>
        </button>

        <button
          onClick={() => setSortBy(sortBy === 'reports' ? 'newest' : 'reports')}
          className={`p-4 rounded-2xl shadow-sm text-left transition-all cursor-pointer border ${
            sortBy === 'reports'
              ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-500/60 ring-2 ring-rose-500/30'
              : 'bg-white dark:bg-slate-900 border-rose-500/20 hover:border-rose-500/40'
          }`}
        >
          <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Flagged
          </span>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{stats.flagged.toLocaleString()}</div>
        </button>

        <button
          onClick={() => setSelectedStatus(selectedStatus === 'rejected' ? 'all' : 'rejected')}
          className={`p-4 rounded-2xl shadow-sm text-left transition-all cursor-pointer border ${
            selectedStatus === 'rejected'
              ? 'bg-slate-100 dark:bg-slate-800 border-slate-400 ring-2 ring-slate-400/30'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Rejected</span>
          <div className="text-2xl font-black text-slate-500 mt-1">{stats.rejected.toLocaleString()}</div>
        </button>

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

          {/* App Selector Dropdown with Live Review Counts */}
          <div className="w-full lg:w-72">
            <select
              value={selectedAppId}
              onChange={(e) => setSelectedAppId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">
                📱 All Applications ({appsList.length} apps • {globalDbStats ? globalDbStats.total.toLocaleString() : reviews.length} revs)
              </option>
              {appsList.map((app) => {
                const count = getAppStats(app).total;
                return (
                  <option key={app.id || app.slug} value={app.slug || app.id}>
                    {app.name} ({count} {count === 1 ? 'rev' : 'revs'})
                  </option>
                );
              })}
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
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSelectAll}
              className="text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
              title="Select all on this page"
            >
              {paginatedReviews.length > 0 && paginatedReviews.every(r => selectedReviewIds.includes(r.id)) ? (
                <CheckSquare className="w-5 h-5 text-blue-600" />
              ) : (
                <Square className="w-5 h-5" />
              )}
            </button>
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">
              Showing {reviews.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, reviews.length)} of {reviews.length} Reviews
            </span>
          </div>

          {/* Page Size & Pagination Controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
              <span>Per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-800 dark:text-white cursor-pointer focus:outline-none"
              >
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold px-2 text-slate-700 dark:text-slate-300">
                  {currentPage} / {totalPages}
                </span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
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
          <>
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {paginatedReviews.map((rev) => {
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

          {/* Bottom Pagination Bar */}
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-500">
                Showing {reviews.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} - {Math.min(reviews.length, currentPage * pageSize)} of {reviews.length} reviews
              </span>
              
              <div className="flex items-center gap-1.5 ml-2">
                <span className="text-[11px] font-bold text-slate-400">Per page:</span>
                {[25, 50, 100, 200].map((size) => (
                  <button
                    key={size}
                    onClick={() => {
                      setPageSize(size);
                      setCurrentPage(1);
                    }}
                    className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      pageSize === size
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => {
                    setCurrentPage(1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer"
                  title="First Page"
                >
                  « First
                </button>
                <button
                  disabled={currentPage <= 1}
                  onClick={() => {
                    setCurrentPage(prev => Math.max(1, prev - 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>
                <div className="px-3 text-xs font-bold text-slate-700 dark:text-slate-300">
                  Page {currentPage} of {totalPages}
                </div>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => {
                    setCurrentPage(prev => Math.min(totalPages, prev + 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => {
                    setCurrentPage(totalPages);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer"
                  title="Last Page"
                >
                  Last »
                </button>
              </div>
            )}
          </div>
        </>
        )}
      </div>

      {/* Create / Edit Review Modal */}
      <EditReviewModal
        editModalReview={editModalReview}
        setEditModalReview={setEditModalReview}
        isAddMode={isAddMode}
        appsList={appsList}
        actioningId={actioningId}
        onSave={handleSaveModal}
      />

      {/* Official Reply Modal */}
      <ReplyReviewModal
        replyModalReview={replyModalReview}
        setReplyModalReview={setReplyModalReview}
        replyAuthor={replyAuthor}
        setReplyAuthor={setReplyAuthor}
        replyText={replyText}
        setReplyText={setReplyText}
        onSaveReply={handleSaveReply}
      />

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
