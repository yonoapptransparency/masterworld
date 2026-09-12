import React, { useState, useEffect, useCallback } from 'react';
import { 
  MessageSquare, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ExternalLink,
  ChevronRight,
  Clock,
  Star,
  Activity,
  Layers,
  Flame
} from 'lucide-react';
import { 
  fetchAdminCommunityOverviewStats, 
  AdminCommunityStats 
} from '../../lib/adminCommunityFirebase';

interface AdminCommunityOverviewCardProps {
  onTabChange?: (tab: string) => void;
}

export const AdminCommunityOverviewCard: React.FC<AdminCommunityOverviewCardProps> = ({ onTabChange }) => {
  const [stats, setStats] = useState<AdminCommunityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const loadStats = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await fetchAdminCommunityOverviewStats();
      setStats(data);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (e) {
      console.error('[AdminCommunityOverview] Error loading stats:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
    // Auto refresh every 45 seconds to keep admin live
    const interval = setInterval(() => loadStats(true), 45000);
    return () => clearInterval(interval);
  }, [loadStats]);

  const publishedPercent = stats && stats.totalReviews > 0 
    ? Math.round((stats.publishedReviews / stats.totalReviews) * 100) 
    : 100;
  const pendingPercent = stats && stats.totalReviews > 0 
    ? Math.round((stats.pendingReviews / stats.totalReviews) * 100) 
    : 0;

  return (
    <div 
      id="admin-community-firebase-overview"
      className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xl shadow-slate-200/30 dark:shadow-none relative overflow-hidden transition-all backdrop-blur-sm"
    >
      {/* Decorative gradient glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-gradient-to-bl from-blue-500/10 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                Community Firebase Engine
              </h3>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300/40 dark:border-emerald-800/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Cloud Sync
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Dedicated project <code className="text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/50 px-1.5 py-0.5 rounded text-[11px] font-mono">rummydexcommunity</code>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {lastUpdated}
            </span>
          )}
          <button
            id="refresh-community-stats-btn"
            type="button"
            onClick={() => loadStats(true)}
            disabled={refreshing}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all border-0 cursor-pointer disabled:opacity-50"
            title="Refresh Live Community Data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mb-6 relative z-10">
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl">
          <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
            Total Reviews
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-1.5">
            {loading ? '...' : (stats?.totalReviews?.toLocaleString() || '0')}
            <span className="text-xs font-semibold text-emerald-500">Live</span>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
            {stats?.publishedReviews || 0} published
          </div>
        </div>

        <div 
          onClick={() => onTabChange && onTabChange('reviews')}
          className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 p-4 rounded-2xl cursor-pointer hover:border-amber-400 transition-all group"
        >
          <div className="flex items-center justify-between text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1">
            <span>Pending Review</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div className="text-2xl font-black text-amber-900 dark:text-amber-300">
            {loading ? '...' : (stats?.pendingReviews || 0)}
          </div>
          <div className="text-[10px] text-amber-700/80 dark:text-amber-400/80 mt-1">
            Requires moderation
          </div>
        </div>

        <div 
          onClick={() => onTabChange && onTabChange('reports')}
          className="bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 p-4 rounded-2xl cursor-pointer hover:border-rose-400 transition-all group"
        >
          <div className="flex items-center justify-between text-[11px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider mb-1">
            <span>User Reports</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div className="text-2xl font-black text-rose-900 dark:text-rose-300">
            {loading ? '...' : (stats?.pendingReports || 0)}
          </div>
          <div className="text-[10px] text-rose-700/80 dark:text-rose-400/80 mt-1">
            Flagged submissions
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl">
          <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
            Player Sentiment
          </div>
          <div className="text-2xl font-black text-amber-500 flex items-center gap-1">
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            {loading ? '...' : (stats?.averageRating || 4.8)}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
            Across active players
          </div>
        </div>
      </div>

      {/* Moderation Progress bar */}
      {stats && stats.totalReviews > 0 && (
        <div className="mb-6 relative z-10">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
            <span>Catalog Moderation Health</span>
            <span className="font-bold text-slate-900 dark:text-white">{publishedPercent}% Published</span>
          </div>
          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
            <div 
              className="bg-emerald-500 h-full transition-all duration-700" 
              style={{ width: `${publishedPercent}%` }} 
              title={`Published: ${stats.publishedReviews}`}
            />
            {pendingPercent > 0 && (
              <div 
                className="bg-amber-500 h-full transition-all duration-700" 
                style={{ width: `${pendingPercent}%` }} 
                title={`Pending: ${stats.pendingReviews}`}
              />
            )}
          </div>
        </div>
      )}

      {/* Quick Action Buttons */}
      <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 relative z-10">
        <button
          type="button"
          onClick={() => onTabChange && onTabChange('reviews')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all border-0 cursor-pointer"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Manage App Reviews
        </button>

        <button
          type="button"
          onClick={() => onTabChange && onTabChange('ai-reviews')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition-all border-0 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          AI Review Studio
        </button>

        <button
          type="button"
          onClick={() => onTabChange && onTabChange('reports')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all border-0 cursor-pointer"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
          Flagged Reports {stats && stats.pendingReports > 0 ? `(${stats.pendingReports})` : ''}
        </button>
      </div>
    </div>
  );
};

export default AdminCommunityOverviewCard;
