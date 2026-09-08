import React from 'react';
import { 
  Globe, 
  Search, 
  Star, 
  ExternalLink, 
  Eye, 
  Bot, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Play, 
  Pause, 
  Square, 
  Zap, 
  RotateCcw, 
  Activity, 
  Terminal 
} from 'lucide-react';
import { Brain2AutobotLog, Brain2AutobotSessionStats, Brain2AutobotStage } from './types';

interface Brain2StudioProps {
  currentApp: any;
  filteredApps: any[];
  selectedAppId: string;
  setSelectedAppId: (id: string) => void;
  appSearch: string;
  setAppSearch: (q: string) => void;
  brain2TargetScore: number;
  setBrain2TargetScore: (score: number) => void;
  brain2CustomQuery: string;
  setBrain2CustomQuery: (q: string) => void;
  brain2AutobotActive: boolean;
  brain2AutobotPaused: boolean;
  brain2ExecutionMode: 'paced' | 'instant';
  setBrain2ExecutionMode: (m: 'paced' | 'instant') => void;
  brain2SaveDirectly: boolean;
  setBrain2SaveDirectly: (val: boolean) => void;
  brain2TargetGoal: number;
  setBrain2TargetGoal: (n: number) => void;
  brain2BatchSize: number;
  setBrain2BatchSize: (n: number) => void;
  brain2CycleDelay: number;
  setBrain2CycleDelay: (n: number) => void;
  brain2CurrentStage: Brain2AutobotStage;
  brain2SessionStats: Brain2AutobotSessionStats;
  brain2Logs: Brain2AutobotLog[];
  brain2TargetInfo: any;
  brain2GroundedSources: Array<{ title: string; url: string; snippet?: string }>;
  showBrain2SourcesDrawer: boolean;
  setShowBrain2SourcesDrawer: (show: boolean) => void;
  onStartBrain2Autobot: () => void;
  onPauseBrain2Autobot: () => void;
  onResumeBrain2Autobot: () => void;
  onStopBrain2Autobot: () => void;
  onExecuteBrain2Step: (isManualTrigger?: boolean) => void;
  onResetBrain2Session: () => void;
}

export const Brain2Studio: React.FC<Brain2StudioProps> = ({
  currentApp,
  filteredApps,
  selectedAppId,
  setSelectedAppId,
  appSearch,
  setAppSearch,
  brain2TargetScore,
  setBrain2TargetScore,
  brain2CustomQuery,
  setBrain2CustomQuery,
  brain2AutobotActive,
  brain2AutobotPaused,
  brain2ExecutionMode,
  setBrain2ExecutionMode,
  brain2SaveDirectly,
  setBrain2SaveDirectly,
  brain2TargetGoal,
  setBrain2TargetGoal,
  brain2BatchSize,
  setBrain2BatchSize,
  brain2CycleDelay,
  setBrain2CycleDelay,
  brain2CurrentStage,
  brain2SessionStats,
  brain2Logs,
  brain2TargetInfo,
  brain2GroundedSources,
  showBrain2SourcesDrawer,
  setShowBrain2SourcesDrawer,
  onStartBrain2Autobot,
  onPauseBrain2Autobot,
  onResumeBrain2Autobot,
  onStopBrain2Autobot,
  onExecuteBrain2Step,
  onResetBrain2Session
}) => {
  return (
    <div className="space-y-6">
      
      {/* 1. Main Brain 2 Control Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-5">
        
        {/* Title & App Search Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Globe size={15} />
              <span>Brain 2: Live Internet Web Researcher Autobot</span>
              {brain2AutobotActive && !brain2AutobotPaused && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-500 text-white animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  AUTONOMOUS WEB RESEARCH ACTIVE
                </span>
              )}
              {brain2AutobotActive && brain2AutobotPaused && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white">
                  PAUSED
                </span>
              )}
              {!brain2AutobotActive && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  STANDBY
                </span>
              )}
            </div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
              <span>Targeted App + Developer Web Research Engine</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80">
                Google Search Grounded
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-3xl">
              Identifies the exact app via <strong>App Name</strong> and <strong>Developer Name</strong> on Google Play Store and user review portals. Gathers authentic human sentiment with strict rating synchronization. Works seamlessly across any app category.
            </p>
          </div>

          <div className="relative w-full lg:w-72">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search target app in catalog..."
              value={appSearch}
              onChange={(e) => setAppSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Target App Card & Exact Identity Cockpit */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/70">
          
          <div className="lg:col-span-5 flex items-center gap-4">
            {currentApp?.icon_url ? (
              <img 
                src={currentApp.icon_url} 
                alt={currentApp?.name || 'App'} 
                className="w-14 h-14 rounded-2xl object-contain shadow-xs bg-white dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700" 
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center font-black text-indigo-600 shrink-0 text-xl">
                {currentApp?.name?.charAt(0) || 'A'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <select
                value={selectedAppId}
                onChange={(e) => setSelectedAppId(e.target.value)}
                className="w-full text-base font-black bg-transparent text-slate-900 dark:text-white border-0 cursor-pointer focus:outline-none truncate"
              >
                {filteredApps.map(app => (
                  <option key={app.id} value={app.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                    {app.name} — {app.developer || 'Studio'}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Developer: <strong className="text-slate-800 dark:text-slate-200">{currentApp?.developer || 'Studio'}</strong>
                </span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span className="text-[11px] font-bold text-amber-500 flex items-center gap-0.5">
                  <Star size={11} className="fill-amber-400" />
                  {currentApp?.rating || 4.2}★ Base
                </span>
              </div>
            </div>
          </div>

          {/* Exact Identity Resolution & Live Play Store Query Preview */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                <Globe size={13} />
                <span>Exact Identity Live Search Grounding Signature:</span>
              </div>
              {brain2TargetInfo?.googlePlaySearchUrl && (
                <a
                  href={brain2TargetInfo.googlePlaySearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <span>Play Store Target</span>
                  <ExternalLink size={10} />
                </a>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              <span className="text-[10px] font-mono bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800/60">
                site:play.google.com/store/apps "{currentApp?.name}" "{currentApp?.developer || 'Studio'}"
              </span>
              <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                "{currentApp?.name}" "{currentApp?.developer || 'Studio'}" user reviews complaints
              </span>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-1">
              <span>Exact Match: App Name + Developer Name (Category assumption omitted)</span>
              {brain2GroundedSources.length > 0 && (
                <button
                  onClick={() => setShowBrain2SourcesDrawer(!showBrain2SourcesDrawer)}
                  className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Eye size={11} />
                  <span>{showBrain2SourcesDrawer ? 'Hide' : 'View'} Grounded Sources ({brain2GroundedSources.length})</span>
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Discovered Grounded Sources Drawer */}
        {showBrain2SourcesDrawer && brain2GroundedSources.length > 0 && (
          <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-indigo-700 dark:text-indigo-300">
              <span className="flex items-center gap-1.5">
                <Globe size={13} />
                <span>Discovered Live Web Sources & Review Citations</span>
              </span>
              <span className="text-[10px] text-slate-500">{brain2GroundedSources.length} links discovered</span>
            </div>
            <div className="max-h-36 overflow-y-auto space-y-1.5 pr-2">
              {brain2GroundedSources.map((source, idx) => (
                <div key={idx} className="text-[11px] bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{source.title}</span>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 dark:text-indigo-400 hover:underline shrink-0 flex items-center gap-1 text-[10px]"
                  >
                    <span>Open Link</span>
                    <ExternalLink size={10} />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Autonomous Autobot Configuration Panel */}
        <div className="space-y-4 pt-2">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Bot size={13} className="text-indigo-500" />
                Autobot Mode
              </label>
              <select
                value={brain2ExecutionMode}
                onChange={(e) => setBrain2ExecutionMode(e.target.value as any)}
                className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="paced">Paced Stream (Loop with research pause)</option>
                <option value="instant">Instant Batch (Single cycle)</option>
              </select>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Streams live reviews with continuous web queries.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Star size={13} className="text-amber-400 fill-amber-400" />
                  Target Benchmark
                </span>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                  {brain2TargetScore.toFixed(1)}★
                </span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="1.0"
                  max="5.0"
                  step="0.1"
                  value={brain2TargetScore}
                  onChange={(e) => setBrain2TargetScore(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Review sentiment strictly synchronizes with rating.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-indigo-500" />
                Storage Destination
              </label>
              <select
                value={brain2SaveDirectly ? 'live' : 'staging'}
                onChange={(e) => setBrain2SaveDirectly(e.target.value === 'live')}
                className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="staging">Staging Deck (Inspect before publishing)</option>
                <option value="live">Auto-Publish (Direct to live database)</option>
              </select>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Where extracted reviews are committed.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Clock size={13} className="text-indigo-500" />
                  Batch & Delay
                </span>
                <span className="text-indigo-600 dark:text-indigo-400 text-[11px] font-bold">
                  Goal: {brain2TargetGoal === -1 ? 'Continuous' : `${brain2TargetGoal} reviews`}
                </span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={brain2BatchSize}
                  onChange={(e) => setBrain2BatchSize(parseInt(e.target.value, 10))}
                  className="text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value={1}>1 / cycle</option>
                  <option value={2}>2 / cycle</option>
                  <option value={3}>3 / cycle</option>
                  <option value={5}>5 / cycle</option>
                </select>
                <select
                  value={brain2CycleDelay}
                  onChange={(e) => setBrain2CycleDelay(parseInt(e.target.value, 10))}
                  className="text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value={2}>2s delay</option>
                  <option value={3}>3s delay</option>
                  <option value={5}>5s delay</option>
                </select>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Controls research speed and rate pacing.</p>
            </div>

          </div>

          {/* Optional Custom Search Focus */}
          <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0">
              <Sparkles size={14} className="text-indigo-500" />
              <span>Optional Search Focus:</span>
            </div>
            <input
              type="text"
              placeholder="E.g., 'Recent update stutter or UI smoothness' (Directs Google search grounding without rigid forcing)"
              value={brain2CustomQuery}
              onChange={(e) => setBrain2CustomQuery(e.target.value)}
              className="flex-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Action Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              {!brain2AutobotActive ? (
                <button
                  onClick={onStartBrain2Autobot}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer ring-2 ring-indigo-400/40 hover:scale-[1.02]"
                >
                  <Play size={15} className="fill-white" />
                  <span>Start Web Researcher Autobot (Autonomous Flow)</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  {brain2AutobotPaused ? (
                    <button
                      onClick={onResumeBrain2Autobot}
                      className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Play size={14} className="fill-white" />
                      <span>Resume Autobot</span>
                    </button>
                  ) : (
                    <button
                      onClick={onPauseBrain2Autobot}
                      className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-white font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Pause size={14} />
                      <span>Pause Autobot</span>
                    </button>
                  )}
                  <button
                    onClick={onStopBrain2Autobot}
                    className="px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Square size={14} className="fill-white" />
                    <span>Stop & Disengage</span>
                  </button>
                </div>
              )}

              <button
                onClick={() => onExecuteBrain2Step(true)}
                disabled={brain2AutobotActive}
                className="px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <Zap size={14} className="text-indigo-500" />
                <span>Run Single Step (1-Shot Web Research)</span>
              </button>
            </div>

            <button
              onClick={onResetBrain2Session}
              className="px-3.5 py-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
              title="Reset session telemetry and logs"
            >
              <RotateCcw size={13} />
              <span>Reset Session</span>
            </button>
          </div>

        </div>

      </div>

      {/* 2. Telemetry HUD & Live Terminal Console */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
        
        {/* Stage Pipeline Indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2 text-xs font-black text-slate-300 uppercase tracking-wider">
            <Activity size={15} className="text-indigo-400" />
            <span>Brain 2 Web Research & Grounding Pipeline</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold">
            {[
              { key: 'resolving_target', label: '1. Resolve Identity' },
              { key: 'web_searching', label: '2. Google Search Grounding' },
              { key: 'extracting_reviews', label: '3. Extract Real Reviews' },
              { key: 'rating_aligning', label: '4. Rating Alignment' },
              { key: 'sanitizing', label: '5. Safety Guard' },
              { key: 'published', label: '6. Commit Live' }
            ].map((step) => {
              const isCurrent = brain2CurrentStage === step.key;
              return (
                <div
                  key={step.key}
                  className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
                    isCurrent
                      ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30 scale-105'
                      : 'bg-slate-800/80 text-slate-400'
                  }`}
                >
                  {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
                  <span>{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Telemetry Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <div className="text-[10px] uppercase font-bold text-slate-400">Researched</div>
            <div className="text-xl font-black text-indigo-400 mt-0.5">{brain2SessionStats.totalGenerated}</div>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <div className="text-[10px] uppercase font-bold text-slate-400">Auto-Published</div>
            <div className="text-xl font-black text-emerald-400 mt-0.5">{brain2SessionStats.autoPublished}</div>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <div className="text-[10px] uppercase font-bold text-slate-400">Staged In Deck</div>
            <div className="text-xl font-black text-purple-400 mt-0.5">{brain2SessionStats.staged}</div>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <div className="text-[10px] uppercase font-bold text-slate-400">Search Queries</div>
            <div className="text-xl font-black text-cyan-400 mt-0.5">{brain2SessionStats.queriesRun}</div>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <div className="text-[10px] uppercase font-bold text-slate-400">Engine Model</div>
            <div className="text-xs font-bold text-slate-300 mt-1 truncate">
              {brain2SessionStats.lastModel || 'gemini-3.8-flash + Search'}
            </div>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <div className="text-[10px] uppercase font-bold text-slate-400">Last Latency</div>
            <div className="text-xs font-bold text-slate-300 mt-1">
              {brain2SessionStats.lastLatencyMs ? `${(brain2SessionStats.lastLatencyMs / 1000).toFixed(1)}s` : 'Ready'}
            </div>
          </div>
        </div>

        {/* Live Terminal Log Feed */}
        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 pb-2 border-b border-slate-800/80">
            <span className="flex items-center gap-1.5 text-indigo-400 font-bold">
              <Terminal size={14} />
              <span>Brain 2 Web Researcher Live Terminal Feed</span>
            </span>
            <span className="text-[10px] text-slate-500">
              {brain2Logs.length} research events logged
            </span>
          </div>

          <div className="h-44 overflow-y-auto font-mono text-[11px] space-y-1.5 pr-2 scrollbar-thin text-slate-300">
            {brain2Logs.length === 0 ? (
              <div className="text-slate-600 italic py-6 text-center">
                Brain 2 terminal standing by. Click "Start Web Researcher Autobot" or "Run Single Step" to begin autonomous web search.
              </div>
            ) : (
              brain2Logs.map((log) => {
                let colorClass = 'text-slate-300';
                if (log.type === 'success') colorClass = 'text-indigo-400 font-semibold';
                if (log.type === 'reasoning') colorClass = 'text-cyan-400';
                if (log.type === 'safety') colorClass = 'text-purple-300';
                if (log.type === 'warn') colorClass = 'text-amber-400';

                return (
                  <div key={log.id} className="leading-relaxed flex items-start gap-2">
                    <span className="text-slate-500 shrink-0 text-[10px]">[{log.time}]</span>
                    <span className={`${colorClass} flex-1 break-words`}>{log.text}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
