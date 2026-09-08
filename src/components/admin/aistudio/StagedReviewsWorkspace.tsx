import React from 'react';
import { 
  CheckSquare, 
  Trash2, 
  Check, 
  RefreshCw, 
  Star, 
  ExternalLink, 
  Globe, 
  Cpu 
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
  onSaveAllStaged: () => void;
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
                Model: {generationTelemetry.modelUsed || 'gemini-3.8-flash'}
              </span>
              <span className="font-semibold text-emerald-400">
                Status: {generationTelemetry.searchStatus}
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

      {/* 2. Staged Reviews Grid */}
      {stagedReviews.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <CheckSquare size={18} className="text-emerald-500" />
                <span>Staged Reviews for Approval ({stagedReviews.length} Ready)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Edit ratings, reviewer names, or text before publishing to the live website community.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onDiscardAll}
                className="px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 rounded-xl hover:bg-rose-100 transition-colors cursor-pointer"
              >
                Discard All
              </button>
              <button
                onClick={onSaveAllStaged}
                disabled={savingStaged}
                className="px-5 py-2 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md shadow-emerald-600/20 transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {savingStaged ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    <span>Publishing to Database...</span>
                  </>
                ) : (
                  <>
                    <Check size={14} />
                    <span>Publish All Staged ({stagedReviews.length})</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Staged Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stagedReviews.map((rev, idx) => (
              <div 
                key={idx} 
                className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={rev.userName || ''}
                    onChange={(e) => onUpdateReviewName(idx, e.target.value)}
                    className="text-xs font-black bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-900 dark:text-white"
                  />

                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(starVal => (
                      <button
                        key={starVal}
                        type="button"
                        onClick={() => onUpdateReviewRating(idx, starVal)}
                        className="cursor-pointer"
                      >
                        <Star 
                          size={15} 
                          className={starVal <= rev.rating ? "text-amber-400 fill-amber-400" : "text-slate-300 dark:text-slate-600"} 
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  value={rev.reviewText || ''}
                  onChange={(e) => onUpdateReviewText(idx, e.target.value)}
                  rows={3}
                  className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed resize-none"
                />

                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                      rev._brainMode === 'brain2' 
                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' 
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}>
                      {rev._brainMode === 'brain2' ? '🌐 Brain 2 Web' : '🧠 Brain 1 Dossier'}
                    </span>
                    <span>{rev.reviewText?.length || 0} chars</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onDiscardReview(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                      title="Discard review"
                    >
                      <Trash2 size={14} />
                    </button>
                    <button
                      onClick={() => onSaveReviewToLive(idx)}
                      disabled={savingReviewIndex === idx}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[11px] transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      {savingReviewIndex === idx ? <RefreshCw size={11} className="animate-spin" /> : <Check size={11} />}
                      <span>Publish</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
