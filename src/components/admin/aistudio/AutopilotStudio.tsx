import React, { useState, useMemo } from 'react';
import { Play, Pause, Square, Terminal, Check, Filter, Layers, CheckSquare, Square as UncheckedSquare } from 'lucide-react';

interface AutopilotStudioProps {
  appsList: any[];
  autoPilotStatus: any;
  autoPilotLoading: boolean;
  selectedAutoPilotAppIds: string[];
  autoPilotAppSearch: string;
  setAutoPilotAppSearch: (s: string) => void;
  autoPilotBrainChoice: 'local' | 'research';
  setAutoPilotBrainChoice: (b: 'local' | 'research') => void;
  autoPilotOptions: {
    countPerApp: number;
    skipAppsWithReviews: boolean;
    skipThreshold: number;
    overrideTargetScore: number | null;
    toneFocus: any;
  };
  setAutoPilotOptions: React.Dispatch<React.SetStateAction<{
    countPerApp: number;
    skipAppsWithReviews: boolean;
    skipThreshold: number;
    overrideTargetScore: number | null;
    toneFocus: any;
  }>>;
  activeModel: string;
  onOpenAiSettings: () => void;
  onToggleAutoPilotApp: (appId: string) => void;
  onSelectAllAutoPilotApps: () => void;
  onDeselectAllAutoPilotApps: () => void;
  onStartAutoPilot: () => void;
  onPauseAutoPilot: () => void;
  onResumeAutoPilot: () => void;
  onStopAutoPilot: () => void;
  onClearAutoPilotLogs: () => void;
}

export const AutopilotStudio: React.FC<AutopilotStudioProps> = ({
  appsList,
  autoPilotStatus,
  autoPilotLoading,
  selectedAutoPilotAppIds,
  autoPilotAppSearch,
  setAutoPilotAppSearch,
  autoPilotBrainChoice,
  setAutoPilotBrainChoice,
  autoPilotOptions,
  setAutoPilotOptions,
  activeModel,
  onOpenAiSettings,
  onToggleAutoPilotApp,
  onSelectAllAutoPilotApps,
  onDeselectAllAutoPilotApps,
  onStartAutoPilot,
  onPauseAutoPilot,
  onResumeAutoPilot,
  onStopAutoPilot,
  onClearAutoPilotLogs
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    appsList.forEach(a => {
      if (a.category) cats.add(a.category);
    });
    return Array.from(cats);
  }, [appsList]);

  // Filtered app list
  const filteredApps = useMemo(() => {
    return appsList.filter(app => {
      const matchesSearch = !autoPilotAppSearch.trim() || 
        (app.name && app.name.toLowerCase().includes(autoPilotAppSearch.toLowerCase())) ||
        (app.slug && app.slug.toLowerCase().includes(autoPilotAppSearch.toLowerCase()));
      const matchesCat = selectedCategory === 'all' || app.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [appsList, autoPilotAppSearch, selectedCategory]);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-5">
        
        {/* Header & Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
              <Play size={15} />
              <span>Autonomous Catalog Queue Runner</span>
            </div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white mt-1">
              Part 3: Autonomous Catalog Queue Runner
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select apps, choose between Brain 1 (Dossier & Full HTML Rules) or Brain 2 (Web Researcher), and launch hands-free background generation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border ${
              autoPilotStatus?.status === 'running' 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800'
                : autoPilotStatus?.status === 'paused'
                ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800'
                : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                autoPilotStatus?.status === 'running' ? 'bg-emerald-500 animate-pulse' : autoPilotStatus?.status === 'paused' ? 'bg-amber-500' : 'bg-slate-400'
              }`} />
              {autoPilotStatus?.status ? autoPilotStatus.status.toUpperCase() : 'IDLE'}
            </span>
          </div>
        </div>

        {/* Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Layers size={12} className="text-blue-500" />
              <span>Generation Brain:</span>
            </label>
            <select
              value={autoPilotBrainChoice}
              onChange={(e) => setAutoPilotBrainChoice(e.target.value as any)}
              className="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 mt-1 cursor-pointer"
            >
              <option value="local">🧠 Brain 1: Deep Dossier</option>
              <option value="research">🌐 Brain 2: Live Web</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Terminal size={12} className="text-purple-500" />
              <span>Active AI Model:</span>
            </label>
            <button
              onClick={onOpenAiSettings}
              className="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-purple-700 dark:text-purple-400 mt-1 cursor-pointer text-left truncate flex items-center justify-between"
              title="Click to change the active AI model"
            >
              <span className="truncate">{activeModel}</span>
              <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded ml-1">Change</span>
            </button>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Reviews Per App:</label>
            <select
              value={autoPilotOptions.countPerApp}
              onChange={(e) => setAutoPilotOptions(prev => ({ ...prev, countPerApp: parseInt(e.target.value, 10) }))}
              className="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 mt-1 cursor-pointer"
            >
              <option value={3}>3 Reviews per App</option>
              <option value={5}>5 Reviews per App</option>
              <option value={10}>10 Reviews per App</option>
              <option value={15}>15 Reviews per App</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Skip Apps with Reviews:</label>
            <select
              value={autoPilotOptions.skipAppsWithReviews ? 'yes' : 'no'}
              onChange={(e) => setAutoPilotOptions(prev => ({ ...prev, skipAppsWithReviews: e.target.value === 'yes' }))}
              className="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 mt-1 cursor-pointer"
            >
              <option value="no">Generate for all selected apps</option>
              <option value="yes">Skip apps with &gt; 10 reviews</option>
            </select>
          </div>

          <div className="flex items-end gap-2">
            {autoPilotStatus?.status === 'running' ? (
              <>
                <button
                  onClick={onPauseAutoPilot}
                  className="flex-1 px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-black transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Pause size={14} /> Pause
                </button>
                <button
                  onClick={onStopAutoPilot}
                  className="flex-1 px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-black transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Square size={14} /> Stop
                </button>
              </>
            ) : autoPilotStatus?.status === 'paused' ? (
              <>
                <button
                  onClick={onResumeAutoPilot}
                  className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Play size={14} /> Resume
                </button>
                <button
                  onClick={onStopAutoPilot}
                  className="flex-1 px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-black transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Square size={14} /> Stop
                </button>
              </>
            ) : (
              <button
                onClick={onStartAutoPilot}
                disabled={autoPilotLoading || selectedAutoPilotAppIds.length === 0}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black shadow-md shadow-blue-600/20 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Play size={14} /> Launch Queue ({selectedAutoPilotAppIds.length} Apps)
              </button>
            )}
          </div>
        </div>

        {/* App Selection Grid & Filters */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Queue Apps Selection ({selectedAutoPilotAppIds.length} of {appsList.length} Selected)
              </span>
              <button 
                onClick={onSelectAllAutoPilotApps} 
                className="flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800"
              >
                <CheckSquare size={12} />
                <span>Select All ({appsList.length})</span>
              </button>
              <button 
                onClick={onDeselectAllAutoPilotApps} 
                className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-400 font-bold hover:underline cursor-pointer bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700"
              >
                <UncheckedSquare size={12} />
                <span>Deselect All</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* Category Filter */}
              <div className="flex items-center gap-1">
                <Filter size={12} className="text-slate-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="text-xs px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Search Filter */}
              <input
                type="text"
                placeholder="Search apps..."
                value={autoPilotAppSearch}
                onChange={(e) => setAutoPilotAppSearch(e.target.value)}
                className="text-xs px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 w-full sm:w-44"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
            {filteredApps.map(app => {
              const appId = String(app.id || app.slug || '');
              const isSelected = selectedAutoPilotAppIds.includes(appId) || selectedAutoPilotAppIds.includes(String(app.id)) || selectedAutoPilotAppIds.includes(String(app.slug));
              return (
                <button
                  key={appId}
                  onClick={() => onToggleAutoPilotApp(appId)}
                  className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-400 text-blue-900 dark:text-blue-100 shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  {app.icon_url ? (
                    <img src={app.icon_url} alt="" className="w-6 h-6 rounded-md object-contain shrink-0" />
                  ) : (
                    <div className="w-6 h-6 rounded-md bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold">
                      {app.name?.charAt(0)}
                    </div>
                  )}
                  <div className="truncate flex-1 min-w-0">
                    <span className="text-[11px] font-bold truncate block">{app.name}</span>
                    {app.category && <span className="text-[9px] text-slate-400 truncate block">{app.category}</span>}
                  </div>
                  {isSelected && <Check size={12} className="text-blue-600 shrink-0 font-bold" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Terminal Logs */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Terminal size={14} className="text-blue-500" />
              Live Queue Terminal Logs
            </span>
            <button
              onClick={onClearAutoPilotLogs}
              className="text-[11px] text-slate-400 hover:text-rose-500 cursor-pointer"
            >
              Clear Logs
            </button>
          </div>

          <div className="bg-slate-950 text-slate-300 font-mono text-xs p-4 rounded-2xl border border-slate-800 max-h-52 overflow-y-auto space-y-1.5 scrollbar-thin">
            {autoPilotStatus?.logs && autoPilotStatus.logs.length > 0 ? (
              autoPilotStatus.logs.map((log: any, i: number) => (
                <div key={i} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-slate-500 text-[10px] shrink-0 font-sans">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                  <span className={
                    log.type === 'success' ? 'text-emerald-400' :
                    log.type === 'warning' ? 'text-amber-400' :
                    log.type === 'error' ? 'text-rose-400' : 'text-slate-300'
                  }>
                    {log.message}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-xs italic">Queue terminal idle. Ready for launch.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

