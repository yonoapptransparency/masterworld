import React, { useState, useMemo } from 'react';
import { 
  CheckSquare, 
  Trash2, 
  Check, 
  RefreshCw, 
  Star, 
  ExternalLink, 
  Globe, 
  Cpu,
  Upload,
  Filter,
  Layers,
  LayoutGrid,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { GenerationTelemetry } from './types';

interface StagedReviewsWorkspaceProps {
  stagedReviews: any[];
  generationTelemetry: GenerationTelemetry | null;
  savingStaged: boolean;
  savingReviewIndex: number | null;
  onUpdateReviewName: (idx: number, name: string) => void;
  onUpdateReviewRating: (idx: number, star: number) => void;
  onUpdateReviewText: (idx: number, text: string) => void;
  onDiscardReview: (idx: number) => void;
  onDiscardAll: () => void;
  onSaveReviewToLive: (idx: number) => void;
  onSaveAllStaged: (appIdFilter?: string) => void;
}

export const StagedReviewsWorkspace: React.FC<StagedReviewsWorkspaceProps> = ({
  stagedReviews,
  generationTelemetry,
  savingStaged,
  savingReviewIndex,
  onUpdateReviewName,
  onUpdateReviewRating,
  onUpdateReviewText,
  onDiscardReview,
  onDiscardAll,
  onSaveReviewToLive,
  onSaveAllStaged
}) => {
  const [selectedAppFilter, setSelectedAppFilter] = useState<string>('all');
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'grouped'>('grid');
  const [collapsedAppGroups, setCollapsedAppGroups] = useState<Record<string, boolean>>({});

  // Unique apps represented in the current staged set
  const stagedAppsSummary = useMemo(() => {
    const map = new Map<string, { id: string; name: string; icon?: string; count: number }>();
    stagedReviews.forEach(r => {
      const id = String(r.appId || r.appSlug || 'unknown');
      const existing = map.get(id);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(id, {
          id,
          name: r.appName || id,
          icon: r.appIcon,
          count: 1
        });
      }
    });
    return Array.from(map.values());
  }, [stagedReviews]);

  // Tagged reviews with original indices so index-based mutation callbacks remain intact
  const taggedReviews = useMemo(() => {
    return stagedReviews.map((rev, idx) => ({ ...rev, _originalIdx: idx }));
  }, [stagedReviews]);

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    return taggedReviews.filter(rev => {
      if (selectedAppFilter !== 'all') {
        const id = String(rev.appId || rev.appSlug || 'unknown');
        if (id !== selectedAppFilter) return false;
      }
      if (selectedRatingFilter !== 'all') {
        if (Number(rev.rating) !== Number(selectedRatingFilter)) return false;
      }
      return true;
    });
  }, [taggedReviews, selectedAppFilter, selectedRatingFilter]);

  // Grouped reviews by app
  const groupedByApp = useMemo(() => {
    const groups: Record<string, typeof taggedReviews> = {};
    filteredReviews.forEach(rev => {
      const key = String(rev.appId || rev.appSlug || 'unknown');
      if (!groups[key]) groups[key] = [];
      groups[key].push(rev);
    });
    return groups;
  }, [filteredReviews]);

  const toggleAppCollapse = (appKey: string) => {
    setCollapsedAppGroups(prev => ({ ...prev, [appKey]: !prev[appKey] }));
  };

  return (
    <div className="space-y-6">
      {/* 1. Telemetry Block */}
      {generationTelemetry && (
        <div className={`p-4 rounded-2xl border text-xs space-y-3 ${
          generationTelemetry.mode === 'research'
            ? 'bg-indigo-950/40 border-indigo-500/30 text-indigo-200'
            : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
        }`}>
          <div className="flex items-center justify-between border-b pb-2 border-slate-700/50">
            <div className="flex items-center gap-2 font-bold">
              {generationTelemetry.mode === 'research' ? <Globe size={15} /> : <Cpu size={15} />}
              <span>
                {generationTelemetry.mode === 'research' ? 'Brain 2 Live Web Grounding Telemetry' : 'Brain 1 Dossier Comprehension Telemetry'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="font-mono bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                Model: {generationTelemetry.modelUsed || 'gemini-2.5-pro'}
              </span>
              <span className="font-semibold text-emerald-400">
                Status: {generationTelemetry.searchStatus || 'Completed'}
              </span>
            </div>
          </div>

          {generationTelemetry.dossierHighlights && generationTelemetry.dossierHighlights.length > 0 && (
            <div>
              <span className="font-bold text-emerald-300">Dossier Features Ingested:</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {generationTelemetry.dossierHighlights.map((h, i) => (
                  <span key={i} className="bg-emerald-900/60 text-emerald-200 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-emerald-700/50">
                    • {h}
                  </span>
                ))}
              </div>
            </div>
          )}

          {generationTelemetry.searchQueries && generationTelemetry.searchQueries.length > 0 && (
            <div>
              <span className="font-bold text-indigo-300">Google Searches Executed:</span>
              <div className="flex flex-wrap gap-1.5 mt-1 font-mono text-[10px]">
                {generationTelemetry.searchQueries.map((q, i) => (
                  <span key={i} className="bg-indigo-900/60 text-indigo-200 px-2 py-0.5 rounded-md border border-indigo-700/50">
                    🔍 {q}
                  </span>
                ))}
              </div>
            </div>
          )}

          {generationTelemetry.groundedSources && generationTelemetry.groundedSources.length > 0 && (
            <div>
              <span className="font-bold text-indigo-300">Live Sources & Discussions Discovered:</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {generationTelemetry.groundedSources.map((s, i) => (
                  <a
                    key={i}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-blue-300 hover:text-white underline underline-offset-2"
                  >
                    <ExternalLink size={10} />
                    <span>{s.title}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. Staged Reviews Command Deck */}
      {stagedReviews.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-5">
          
          {/* Deck Header & Primary Batch Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CheckSquare size={16} />
                </div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Staged Reviews Approval Deck ({stagedReviews.length} Total Staged)
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Filter by specific app, inspect player sentiment, edit ratings or text, and commit verified reviews to Firestore.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* View Mode Toggle: Grid vs Grouped */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Flat Grid View"
                >
                  <LayoutGrid size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grouped')}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'grouped'
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Group by App"
                >
                  <Layers size={14} />
                </button>
              </div>

              <button
                onClick={onDiscardAll}
                className="px-3.5 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 size={13} />
                <span>Discard All</span>
              </button>

              <button
                onClick={() => onSaveAllStaged(selectedAppFilter !== 'all' ? selectedAppFilter : undefined)}
                disabled={savingStaged || filteredReviews.length === 0}
                className="px-5 py-2 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {savingStaged ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Committing to Firestore...</span>
                  </>
                ) : (
                  <>
                    <Upload size={14} />
                    <span>
                      {selectedAppFilter !== 'all' 
                        ? `Upload ${filteredReviews.length} to Firestore` 
                        : `Upload All (${stagedReviews.length}) to Firestore`}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* App Filtering Bar (Specifically Addresses: "all the reviews are showing") */}
          <div className="space-y-3 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center justify-between gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-1.5">
                <Filter size={13} className="text-emerald-500" />
                <span>Filter Staged Reviews by App:</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 font-normal">Rating:</span>
                <select
                  value={selectedRatingFilter}
                  onChange={(e) => setSelectedRatingFilter(e.target.value)}
                  className="text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Stars</option>
                  <option value="5">5★ Only</option>
                  <option value="4">4★ Only</option>
                  <option value="3">3★ Only</option>
                  <option value="2">2★ Only</option>
                  <option value="1">1★ Only</option>
                </select>
              </div>
            </div>

            {/* App Pills Slider */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setSelectedAppFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedAppFilter === 'all'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750'
                }`}
              >
                <span>All Apps</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  selectedAppFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}>
                  {stagedReviews.length}
                </span>
              </button>

              {stagedAppsSummary.map(app => (
                <button
                  key={app.id}
                  type="button"
                  onClick={() => setSelectedAppFilter(app.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                    selectedAppFilter === app.id
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750'
                  }`}
                >
                  {app.icon ? (
                    <img src={app.icon} alt="" className="w-4 h-4 rounded object-contain" />
                  ) : (
                    <div className="w-4 h-4 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] flex items-center justify-center font-bold">
                      {app.name.charAt(0)}
                    </div>
                  )}
                  <span className="truncate max-w-[140px]">{app.name}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    selectedAppFilter === app.id ? 'bg-white/20 text-white' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                  }`}>
                    {app.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ================================================================= */}
          {/* VIEW MODE 1: FLAT GRID VIEW */}
          {/* ================================================================= */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredReviews.map((rev) => (
                <StagedReviewCard
                  key={rev._originalIdx}
                  rev={rev}
                  idx={rev._originalIdx}
                  savingReviewIndex={savingReviewIndex}
                  onUpdateReviewName={onUpdateReviewName}
                  onUpdateReviewRating={onUpdateReviewRating}
                  onUpdateReviewText={onUpdateReviewText}
                  onDiscardReview={onDiscardReview}
                  onSaveReviewToLive={onSaveReviewToLive}
                />
              ))}
            </div>
          )}

          {/* ================================================================= */}
          {/* VIEW MODE 2: GROUPED BY APP */}
          {/* ================================================================= */}
          {viewMode === 'grouped' && (
            <div className="space-y-5">
              {Object.entries(groupedByApp).map(([appKey, reviewsForApp]) => {
                const first = reviewsForApp[0];
                const isCollapsed = !!collapsedAppGroups[appKey];

                return (
                  <div 
                    key={appKey}
                    className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-2xs"
                  >
                    {/* App Group Header */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {first?.appIcon ? (
                          <img src={first.appIcon} alt="" className="w-8 h-8 rounded-xl object-contain bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0">
                            {first?.appName?.charAt(0) || 'A'}
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">
                            {first?.appName || appKey}
                          </h4>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                            {reviewsForApp.length} staged reviews ready
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleAppCollapse(appKey)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                        </button>
                      </div>
                    </div>

                    {/* App Group Cards */}
                    {!isCollapsed && (
                      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 dark:bg-slate-950/20">
                        {reviewsForApp.map((rev) => (
                          <StagedReviewCard
                            key={rev._originalIdx}
                            rev={rev}
                            idx={rev._originalIdx}
                            savingReviewIndex={savingReviewIndex}
                            onUpdateReviewName={onUpdateReviewName}
                            onUpdateReviewRating={onUpdateReviewRating}
                            onUpdateReviewText={onUpdateReviewText}
                            onDiscardReview={onDiscardReview}
                            onSaveReviewToLive={onSaveReviewToLive}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {filteredReviews.length === 0 && (
            <div className="py-12 text-center text-slate-400 text-xs">
              No reviews match the selected filter.
            </div>
          )}

        </div>
      )}
    </div>
  );
};

// Sub-component for individual staged review card
interface StagedReviewCardProps {
  rev: any;
  idx: number;
  savingReviewIndex: number | null;
  onUpdateReviewName: (idx: number, name: string) => void;
  onUpdateReviewRating: (idx: number, star: number) => void;
  onUpdateReviewText: (idx: number, text: string) => void;
  onDiscardReview: (idx: number) => void;
  onSaveReviewToLive: (idx: number) => void;
}

const StagedReviewCard: React.FC<StagedReviewCardProps> = ({
  rev,
  idx,
  savingReviewIndex,
  onUpdateReviewName,
  onUpdateReviewRating,
  onUpdateReviewText,
  onDiscardReview,
  onSaveReviewToLive
}) => {
  return (
    <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 space-y-3 shadow-xs hover:border-slate-300 dark:hover:border-slate-600 transition-all">
      {/* App Logo and App Name Banner */}
      <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-slate-200 dark:border-slate-700/60">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {rev.appIcon ? (
            <img
              src={rev.appIcon}
              alt={rev.appName || 'App'}
              className="w-8 h-8 rounded-xl object-contain bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0 shadow-xs"
            />
          ) : (
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-black text-xs flex items-center justify-center shrink-0">
              {(rev.appName || 'A').charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                {rev.appName || 'Card Game'}
              </span>
              {rev.appCategory && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 shrink-0">
                  {rev.appCategory}
                </span>
              )}
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono truncate">
              ID: {rev.appId || rev.appSlug || 'default'}
            </div>
          </div>
        </div>

        <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] shrink-0 ${
          rev._brainMode === 'brain2' 
            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' 
            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
        }`}>
          {rev._brainMode === 'brain2' ? '🌐 Brain 2 Web' : '🧠 Brain 1 Dossier'}
        </span>
      </div>

      {/* Reviewer Name and Interactive Star Rating */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <span className="text-[11px] text-slate-400 font-medium shrink-0">Player:</span>
          <input
            type="text"
            value={rev.userName || ''}
            onChange={(e) => onUpdateReviewName(idx, e.target.value)}
            placeholder="Player Name"
            className="text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-900 dark:text-white w-full focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1 shrink-0 bg-white dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
          {[1, 2, 3, 4, 5].map(starVal => (
            <button
              key={starVal}
              type="button"
              onClick={() => onUpdateReviewRating(idx, starVal)}
              className="cursor-pointer hover:scale-115 transition-transform"
              title={`Set rating to ${starVal} stars`}
            >
              <Star 
                size={14} 
                className={starVal <= rev.rating ? "text-amber-400 fill-amber-400" : "text-slate-300 dark:text-slate-600"} 
              />
            </button>
          ))}
          <span className="text-[10px] font-bold text-amber-500 ml-0.5 font-mono">{rev.rating}★</span>
        </div>
      </div>

      {/* Review Text Editable */}
      <textarea
        value={rev.reviewText || ''}
        onChange={(e) => onUpdateReviewText(idx, e.target.value)}
        rows={3}
        className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed resize-none"
        placeholder="Review content..."
      />

      {/* Actions & Meta */}
      <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 dark:text-slate-400">
        <span className="text-[10px] text-slate-400 font-mono">
          {rev.reviewText?.length || 0} chars • {(rev.reviewText || '').split(/\s+/).filter(Boolean).length} words
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onDiscardReview(idx)}
            className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
            title="Discard review"
          >
            <Trash2 size={14} />
          </button>
          <button
            onClick={() => onSaveReviewToLive(idx)}
            disabled={savingReviewIndex === idx}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-[11px] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
            title="Upload this review to Firestore database"
          >
            {savingReviewIndex === idx ? (
              <>
                <RefreshCw size={11} className="animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload size={12} />
                <span>Upload to Firestore</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
