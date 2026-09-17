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
  Calculator,
  ArrowLeft,
  Smartphone
} from 'lucide-react';
import { toast } from '../Toast';
import { adminFetch } from '../../services/adminAuthService';
import { invalidateReviewCache } from '../../lib/communityFirebase';
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
  const [selectedAppId, setSelectedAppId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedRating, setSelectedRating] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedReviewIds, setSelectedReviewIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [serverTotalPages, setServerTotalPages] = useState(1);
  const [serverTotalCount, setServerTotalCount] = useState(0);
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
  const [serverStats, setServerStats] = useState<any>(null);

  // App selector carousel filtering & sorting
  const [appFilterQuery, setAppFilterQuery] = useState('');
  const [appSortBy, setAppSortBy] = useState<'reviews' | 'name' | 'pending'>('reviews');

  // Mobile Master-Detail navigation state (false = App Selector, true = Review Feed)
  const [mobileDetailView, setMobileDetailView] = useState(false);

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

    // Listen for navigation events from overview dashboard
    const handleSelectAppEvent = (e: any) => {
      const targetId = e?.detail?.appId;
      if (targetId) {
        setSelectedAppId(targetId);
        setMobileDetailView(true);
      }
    };
    window.addEventListener('admin-select-app-reviews', handleSelectAppEvent);
    return () => window.removeEventListener('admin-select-app-reviews', handleSelectAppEvent);
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
  const fetchReviews = useCallback(async (isRefresh = false, pageOverride?: number) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const targetPage = pageOverride || currentPage;
      
      const result = await fetchAdminReviewsList({
        appId: selectedAppId && selectedAppId !== 'all' ? selectedAppId : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        rating: selectedRating !== 'all' ? selectedRating : undefined,
        search: searchQuery.trim() || undefined,
        sortBy,
        page: targetPage,
        limit: pageSize,
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
      
      if (result.page) setCurrentPage(result.page);
      if (result.totalPages) setServerTotalPages(result.totalPages);
      if (result.total !== undefined) setServerTotalCount(result.total);
      if (result.stats) setServerStats(result.stats);
      
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
  }, [selectedAppId, selectedStatus, selectedRating, searchQuery, sortBy, currentPage, pageSize]);

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

    // Use server-side calculated stats across all matching reviews
    if (serverStats) {
      return {
        total: serverStats.total || serverTotalCount,
        published: serverStats.published || 0,
        pending: serverStats.pending || 0,
        rejected: serverStats.rejected || 0,
        flagged: serverStats.flagged || 0,
        avg: (serverStats.averageRating || 5.0).toFixed(1)
      };
    }

    // Otherwise calculate dynamically from the currently fetched reviews
    const total = serverTotalCount || reviews.length;
    const published = reviews.filter(r => r.status === 'published' || r.status === 'approved').length;
    const pending = reviews.filter(r => r.status === 'pending').length;
    const rejected = reviews.filter(r => r.status === 'rejected').length;
    const flagged = reviews.filter(r => r.reported || (r.report_count || 0) > 0).length;
    const avg = reviews.length > 0 
      ? (reviews.reduce((acc, cur) => acc + (Number(cur.rating) || 5), 0) / reviews.length).toFixed(1)
      : '5.0';

    return { total, published, pending, rejected, flagged, avg };
  }, [reviews, selectedAppId, selectedStatus, selectedRating, searchQuery, globalDbStats, appCountsMap, serverStats, serverTotalCount]);

  // Paginated reviews slice (Now Server-Side)
  const totalPages = serverTotalPages;
  const paginatedReviews = reviews;

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
        invalidateReviewCache();
        try {
          window.dispatchEvent(new CustomEvent('community-reviews-updated'));
        } catch (e) {}
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
        invalidateReviewCache();
        try {
          window.dispatchEvent(new CustomEvent('community-reviews-updated'));
        } catch (e) {}
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
        invalidateReviewCache();
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
        invalidateReviewCache();
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
          invalidateReviewCache();
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
        fetchAdminAppReviewCounts().then(res => {
          if (res?.globalStats) setGlobalDbStats(res.globalStats);
          if (res?.appCounts) setAppCountsMap(res.appCounts);
        }).catch(() => {});
        await fetchReviews(true);
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
    <div className="flex flex-col lg:flex-row gap-4 w-full max-w-[1600px] mx-auto h-[calc(100vh-100px)] animate-fade-in bg-slate-50/50 dark:bg-slate-950/50 p-2 lg:p-4 rounded-3xl">
      
      {/* --- MASTER VIEW: APP DIRECTORY SIDEBAR --- */}
      <div className={`w-full lg:w-[340px] xl:w-[380px] flex-col bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl shadow-sm overflow-hidden shrink-0 ${mobileDetailView ? 'hidden lg:flex' : 'flex'}`}>
        
        {/* Sidebar Header & Search */}
        <div className="p-4 lg:p-5 border-b border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900 z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-[13px] font-black uppercase tracking-widest text-slate-900 dark:text-white">
                Directory
              </h2>
            </div>
            <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-[10px] font-black tracking-wider rounded-full border border-indigo-100 dark:border-indigo-500/20">
              {filteredAppsList.length} APPS
            </span>
          </div>

          <div className="relative mb-4 group">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              value={appFilterQuery}
              onChange={(e) => setAppFilterQuery(e.target.value)}
              placeholder="Search directory..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-400 placeholder:font-medium"
            />
          </div>

          <div className="flex p-1 bg-slate-100 dark:bg-slate-950 rounded-xl gap-1 border border-slate-200/50 dark:border-slate-800/50">
            {['reviews', 'pending', 'name'].map(sortType => (
              <button
                key={sortType}
                onClick={() => setAppSortBy(sortType as any)}
                className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${appSortBy === sortType ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                {sortType}
              </button>
            ))}
          </div>
        </div>

        {/* Sidebar App List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
          <button
            onClick={() => { setSelectedAppId('all'); setMobileDetailView(true); }}
            className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all text-left border ${selectedAppId === 'all' ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20' : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'}`}
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-sm ${selectedAppId === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
              <Layers className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-black truncate">Global Stream</div>
              <div className={`text-[11px] font-medium mt-0.5 ${selectedAppId === 'all' ? 'text-indigo-100' : 'text-slate-500'}`}>All Applications</div>
            </div>
          </button>

          {filteredAppsList.map(app => {
            const isSelected = selectedAppId === (app.slug || app.id);
            const stats = getAppStats(app);
            return (
              <button
                key={app.id || app.slug}
                onClick={() => { setSelectedAppId(app.slug || app.id); setMobileDetailView(true); }}
                className={`w-full flex items-center gap-3 p-2.5 rounded-2xl transition-all text-left border group ${isSelected ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20' : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'}`}
              >
                <div className="relative shrink-0">
                  <img src={app.icon_url} alt="" className="w-11 h-11 rounded-xl object-cover bg-slate-100 dark:bg-slate-800 shadow-sm" onError={e => (e.target as any).style.display='none'} />
                  {stats.pending > 0 && (
                    <div className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm animate-pulse">
                      {stats.pending > 99 ? '99+' : stats.pending}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-bold truncate tracking-tight">{app.name}</div>
                  <div className={`flex items-center gap-1.5 mt-0.5 text-[11px] font-medium ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                    <Star className={`w-3 h-3 ${isSelected ? 'text-amber-300' : 'text-amber-500'}`} />
                    <span>{stats.avgRating?.toFixed(1) || '0.0'}</span>
                    <span className="opacity-40">•</span>
                    <span>{stats.total.toLocaleString()} total</span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* --- DETAIL VIEW: COMMAND CENTER --- */}
      <div className={`flex-1 flex-col min-w-0 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl shadow-sm overflow-hidden relative ${mobileDetailView ? 'flex' : 'hidden lg:flex'}`}>
        
        {/* Mobile Header Back Button */}
        <div className="lg:hidden p-3 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md flex items-center sticky top-0 z-20">
          <button onClick={() => setMobileDetailView(false)} className="flex items-center gap-1.5 text-xs font-black text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
            <ArrowLeft className="w-3.5 h-3.5" /> Directory
          </button>
        </div>

        {/* Bento Dashboard Header */}
        <div className="p-4 lg:p-6 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/50 shrink-0">
          <div className="flex flex-col xl:flex-row gap-4">
            
            {/* Context Module */}
            <div className="flex-1 flex items-center gap-4 lg:gap-5 p-4 lg:p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
              
              <div className="relative shrink-0">
                {selectedAppId === 'all' ? (
                  <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                    <Layers className="w-8 h-8 lg:w-10 lg:h-10" />
                  </div>
                ) : (
                  <img src={activeApp?.icon_url} className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl object-cover shadow-md bg-slate-100 dark:bg-slate-800" />
                )}
              </div>
              
              <div className="flex-1 min-w-0 relative z-10">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white leading-tight truncate tracking-tight">
                    {selectedAppId === 'all' ? 'Global Command Center' : activeApp?.name}
                  </h1>
                  {activeApp && <ExternalLink className="w-4 h-4 text-slate-400 hover:text-indigo-500 cursor-pointer hidden md:block" />}
                </div>
                
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                    <MessageSquare className="w-4 h-4 text-indigo-500" />
                    <span className="text-sm font-bold">{globalDbStats?.total?.toLocaleString() || stats?.total?.toLocaleString() || 0}</span>
                    <span className="text-xs font-medium uppercase tracking-wider opacity-80">Total</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-bold">{globalDbStats?.pending?.toLocaleString() || stats?.pending?.toLocaleString() || 0}</span>
                    <span className="text-xs font-medium uppercase tracking-wider opacity-80">Pending</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-bold">{globalDbStats?.published?.toLocaleString() || stats?.published?.toLocaleString() || 0}</span>
                    <span className="text-xs font-medium uppercase tracking-wider opacity-80">Live</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Studio Module - The Crown Jewel */}
            <button
              onClick={() => setShowAIModal(true)}
              className="xl:w-72 flex flex-col justify-center p-5 rounded-2xl bg-slate-900 dark:bg-black border border-slate-800 dark:border-slate-800 shadow-xl text-left group transition-all hover:scale-[1.02] hover:shadow-indigo-500/20 active:scale-[0.98] relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                <Sparkles className="w-16 h-16 text-indigo-400" />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 text-indigo-400 font-black text-[10px] uppercase tracking-widest mb-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                  Review Studio
                </div>
                <h3 className="text-white text-lg font-black leading-tight mb-1">Generate Realistic Reviews</h3>
                <p className="text-slate-400 text-xs font-medium line-clamp-2">Use Brain 1 and Brain 2 to instantly generate, stage, and publish high-quality reviews.</p>
              </div>
            </button>
            
          </div>
        </div>

        {/* Toolbar & Filters (Sticky) */}
        <div className="px-4 lg:px-6 py-3 border-b border-slate-100 dark:border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10 shrink-0 shadow-sm">
          <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
            {['all', 'published', 'pending', 'rejected'].map(status => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${selectedStatus === status ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                {status}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none pl-3 pr-8 py-1.5 bg-slate-100 dark:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 rounded-lg text-xs font-bold focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-all text-slate-700 dark:text-slate-300"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="rating_desc">Highest Rating</option>
                <option value="rating_asc">Lowest Rating</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            
            <button 
              onClick={() => fetchReviews(true)} 
              className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
              title="Refresh Reviews"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Reviews Feed */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 bg-slate-50/30 dark:bg-slate-950/30 relative scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
          {loading && reviews.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4">
              <div className="w-10 h-10 rounded-full border-4 border-indigo-100 dark:border-indigo-900 border-t-indigo-500 animate-spin" />
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Syncing Master Database...</span>
            </div>
          ) : reviews.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4">
              <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-slate-300 dark:text-slate-600" />
              </div>
              <span className="text-sm font-bold text-slate-500">No reviews found for this filter.</span>
            </div>
          ) : (
            reviews.map(review => {
              const isChecked = selectedReviewIds.includes(review.id);
              const isPending = review.status === 'pending';
              const isPublished = review.status === 'published' || review.status === 'approved';
              
              return (
                <div 
                  key={review.id} 
                  className={`group relative p-4 lg:p-5 bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-200 ${isChecked ? 'border-indigo-500 shadow-md ring-1 ring-indigo-500/20' : 'border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md'}`}
                >
                  
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-3 gap-4">
                    <div className="flex items-center gap-3 lg:gap-4">
                      <div className="flex items-center h-full pt-1">
                        <input 
                          type="checkbox" 
                          checked={isChecked} 
                          onChange={() => toggleSelectOne(review.id)}
                          className="w-4.5 h-4.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[13px] lg:text-sm font-black text-slate-900 dark:text-white tracking-tight">{review.userName}</span>
                          {review.isPinned && (
                            <Pin className="w-3 h-3 text-indigo-500 fill-indigo-500" />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center text-amber-400">
                            {Array.from({length: 5}).map((_, i) => (
                              <Star key={i} className={`w-3 h-3 lg:w-3.5 lg:h-3.5 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 dark:fill-slate-800 text-slate-200 dark:text-slate-700'}`} />
                            ))}
                          </div>
                          <span className="text-[10px] lg:text-[11px] font-semibold text-slate-400">
                            {new Date(review.timestamp || '').toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-md text-[9px] lg:text-[10px] font-black uppercase tracking-widest ${isPublished ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20' : isPending ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'}`}>
                        {review.status}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="pl-8 lg:pl-9 pr-2">
                    <p className="text-[13px] lg:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      {review.reviewText}
                    </p>
                    
                    {/* Admin Reply Indicator */}
                    {review.adminReply && (
                      <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-1.5 mb-1 text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                          <CornerDownRight className="w-3 h-3" />
                          {review.adminReply.author}
                        </div>
                        <p className="text-[12px] text-slate-600 dark:text-slate-400 italic">
                          "{review.adminReply.text}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Inline Action Bar (Desktop Hover / Mobile Always Visible) */}
                  <div className="pl-8 lg:pl-9 mt-4 flex flex-wrap items-center gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200">
                    
                    {isPending && (
                      <button onClick={() => { setSelectedReviewIds([review.id]); setTimeout(() => handleBulkAction('publish'), 50); }} className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                      </button>
                    )}
                    
                    <button onClick={() => { setEditModalReview(review); setIsAddMode(false); }} className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors">
                      <Edit3 className="w-3.5 h-3.5" /> Edit
                    </button>
                    
                    <button onClick={() => { setReplyModalReview(review); setReplyText(review.adminReply?.text || ''); }} className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors">
                      <MessageSquare className="w-3.5 h-3.5" /> {review.adminReply ? 'Edit Reply' : 'Reply'}
                    </button>
                    
                    <button onClick={() => handleDeleteReview(review.id)} className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors ml-auto">
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>

                </div>
              )
            })
          )}
          
          {/* Pagination */}
          {serverTotalPages > 1 && (
            <div className="flex items-center justify-center gap-2 py-6">
               <button disabled={currentPage <= 1} onClick={() => fetchReviews(false, currentPage - 1)} className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                 <ChevronLeft className="w-5 h-5" />
               </button>
               <div className="px-4 py-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300">
                 {currentPage} / {serverTotalPages}
               </div>
               <button disabled={currentPage >= serverTotalPages} onClick={() => fetchReviews(false, currentPage + 1)} className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                 <ChevronRight className="w-5 h-5" />
               </button>
            </div>
          )}
        </div>

        {/* Bulk Actions Floating Bar */}
        {selectedReviewIds.length > 0 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 px-5 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-10 border border-slate-800 dark:border-slate-200 z-30">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-indigo-500 text-white flex items-center justify-center text-[10px] font-black">
                {selectedReviewIds.length}
              </div>
              <span className="text-xs font-black uppercase tracking-wider hidden sm:inline-block">Selected</span>
            </div>
            
            <div className="w-px h-5 bg-slate-700 dark:bg-slate-300 mx-1" />
            
            <button onClick={() => handleBulkAction('publish')} className="text-xs font-bold hover:text-emerald-400 dark:hover:text-emerald-600 transition-colors flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> <span className="hidden sm:inline-block">Approve</span>
            </button>
            <button onClick={() => handleBulkAction('delete')} className="text-xs font-bold hover:text-rose-400 dark:hover:text-rose-600 transition-colors flex items-center gap-1.5">
              <Trash2 className="w-4 h-4" /> <span className="hidden sm:inline-block">Delete</span>
            </button>
            
            <button onClick={() => setSelectedReviewIds([])} className="p-1.5 ml-2 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors">
              <X className="w-4 h-4 opacity-70" />
            </button>
          </div>
        )}

      </div>

      {/* --- MODALS --- */}
      
      {/* AI Studio Modal */}
      {showAIModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-[1400px] h-[95vh] flex flex-col overflow-hidden rounded-3xl bg-white dark:bg-slate-950 shadow-2xl relative border border-slate-200 dark:border-slate-800">
            <button onClick={() => setShowAIModal(false)} className="absolute top-4 right-4 z-50 p-2.5 bg-slate-100 dark:bg-slate-900 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors shadow-sm">
              <X className="w-5 h-5 text-slate-500" />
            </button>
            <div className="flex-1 overflow-y-auto">
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
      
      {/* Edit Modal (using existing component or inline replacement if missing) */}
      {(editModalReview || isAddMode) && (
        <EditReviewModal
           editModalReview={editModalReview as any}
           setEditModalReview={(rev) => { setEditModalReview(rev); if(!rev) setIsAddMode(false); }}
           isAddMode={isAddMode}
           onSave={handleSaveModal}
           appsList={appsList}
           actioningId={actioningId}
        />
      )}

      {/* Reply Modal */}
      {replyModalReview && (
        <ReplyReviewModal
           replyModalReview={replyModalReview as any}
           setReplyModalReview={setReplyModalReview}
           replyAuthor={replyAuthor}
           setReplyAuthor={setReplyAuthor}
           replyText={replyText}
           setReplyText={setReplyText}
           onSaveReply={handleSaveReply}
        />
      )}

    </div>
  );
};
export default AdminReviewsTab;
