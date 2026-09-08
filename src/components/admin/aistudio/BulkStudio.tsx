import React from 'react';
import { Zap, RefreshCw } from 'lucide-react';

interface BulkStudioProps {
  appsList: any[];
  categories: string[];
  bulkCategory: string;
  setBulkCategory: (cat: string) => void;
  bulkCountPerApp: number;
  setBulkCountPerApp: (cnt: number) => void;
  bulkBrainChoice: 'local' | 'research';
  setBulkBrainChoice: (brain: 'local' | 'research') => void;
  bulkLanguageStyle: 'proper_english' | 'hinglish' | 'natural_mix';
  setBulkLanguageStyle: (style: 'proper_english' | 'hinglish' | 'natural_mix') => void;
  bulkProgress: { current: number; total: number; active: boolean } | null;
  onRunBulkBatch: () => void;
}

export const BulkStudio: React.FC<BulkStudioProps> = ({
  appsList,
  categories,
  bulkCategory,
  setBulkCategory,
  bulkCountPerApp,
  setBulkCountPerApp,
  bulkBrainChoice,
  setBulkBrainChoice,
  bulkLanguageStyle,
  setBulkLanguageStyle,
  bulkProgress,
  onRunBulkBatch
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-5">
        
        {/* Header */}
        <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Zap size={15} />
            <span>Fast Multi-App Category Batch</span>
          </div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white mt-1">
            1-Click Bulk Batch Review Generator
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Generate and automatically publish authentic reviews for entire catalog categories in a single action.
          </p>
        </div>

        {/* Bulk Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Category selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Category Filter:</label>
            <select
              value={bulkCategory}
              onChange={(e) => setBulkCategory(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              <option value="all">All Apps Catalog ({appsList.length} Apps)</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Reviews per app */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Reviews Per App:</label>
            <select
              value={bulkCountPerApp}
              onChange={(e) => setBulkCountPerApp(parseInt(e.target.value, 10))}
              className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              <option value={2}>2 Reviews per App</option>
              <option value={3}>3 Reviews per App (Standard)</option>
              <option value={5}>5 Reviews per App</option>
            </select>
          </div>

          {/* Brain Engine */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">AI Intelligence Engine:</label>
            <select
              value={bulkBrainChoice}
              onChange={(e) => setBulkBrainChoice(e.target.value as any)}
              className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              <option value="local">🧠 Brain 1: Deep Dossier Comprehension</option>
              <option value="research">🌐 Brain 2: Live Internet Web Researcher</option>
            </select>
          </div>

          {/* Language Style (for Brain 1) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Review Language Voice:</label>
            <select
              value={bulkLanguageStyle}
              onChange={(e) => setBulkLanguageStyle(e.target.value as any)}
              disabled={bulkBrainChoice === 'research'}
              className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-200 cursor-pointer disabled:opacity-50"
            >
              <option value="proper_english">Clean Proper English</option>
              <option value="hinglish">Casual Hinglish (Desi)</option>
              <option value="natural_mix">Play Store Mix (60/40)</option>
            </select>
          </div>

        </div>

        {/* Progress Bar if running */}
        {bulkProgress?.active && (
          <div className="bg-cyan-50 dark:bg-cyan-950/40 p-4 rounded-2xl border border-cyan-200 dark:border-cyan-800/60 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-cyan-800 dark:text-cyan-200">
              <span className="flex items-center gap-1.5">
                <RefreshCw size={14} className="animate-spin" />
                Executing Bulk Generation...
              </span>
              <span>{bulkProgress.current} / {bulkProgress.total} Apps</span>
            </div>
            <div className="w-full bg-cyan-200 dark:bg-cyan-900 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(bulkProgress.current / bulkProgress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Launch Action */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onRunBulkBatch}
            disabled={bulkProgress?.active}
            className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-black shadow-lg shadow-cyan-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Zap size={14} />
            <span>Launch 1-Click Bulk Batch</span>
          </button>
        </div>

      </div>
    </div>
  );
};
