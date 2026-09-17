import React, { useState, useMemo } from 'react';
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
  Terminal,
  Layers,
  CheckSquare,
  Square as UncheckedSquare,
  Sliders,
  Filter,
  ArrowRight,
  Database,
  Info
} from 'lucide-react';
import { Brain2AutobotLog, Brain2AutobotSessionStats, Brain2AutobotStage, GenerationTelemetry } from './types';
import { Brain2CustomizerPanel } from './Brain2CustomizerPanel';
import { StagedReviewsWorkspace } from './StagedReviewsWorkspace';

export interface Brain2StudioProps {
  currentApp: any;
  filteredApps: any[];
  appsList?: any[];
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
  onExecuteBrain2Step: (isManualTrigger?: boolean, directSaveOverride?: boolean, overrideApp?: any) => Promise<number | any>;
  onResetBrain2Session: () => void;

  // Customizer props
  brain2Model?: string;
  setBrain2Model?: (m: string) => void;
  brain2Temperature?: number;
  setBrain2Temperature?: (t: number) => void;
  brain2PersonaProfile?: 'community_mix' | 'tech_performance' | 'daily_gamers' | 'casual_explorers' | 'constructive_critics';
  setBrain2PersonaProfile?: (p: 'community_mix' | 'tech_performance' | 'daily_gamers' | 'casual_explorers' | 'constructive_critics') => void;
  brain2ReviewLength?: 'mixed' | 'short' | 'realistic' | 'detailed';
  setBrain2ReviewLength?: (l: 'mixed' | 'short' | 'realistic' | 'detailed') => void;
  brain2LanguageStyle?: 'proper_english' | 'hinglish' | 'natural_mix';
  setBrain2LanguageStyle?: (s: 'proper_english' | 'hinglish' | 'natural_mix') => void;
  brain2FocusVectors?: string[];
  setBrain2FocusVectors?: (v: string[] | ((prev: string[]) => string[])) => void;
  adminFetch?: (url: string, init?: RequestInit) => Promise<Response>;

  // Staged reviews workspace
  stagedReviews?: any[];
  generationTelemetry?: GenerationTelemetry | null;
  savingStaged?: boolean;
  savingReviewIndex?: number | null;
  onUpdateReviewName?: (index: number, name: string) => void;
  onUpdateReviewRating?: (index: number, rating: number) => void;
  onUpdateReviewText?: (index: number, text: string) => void;
  onDiscardReview?: (index: number) => void;
  onDiscardAll?: () => void;
  onSaveReviewToLive?: (index: number) => void;
  onSaveAllStaged?: () => void;
}

export const Brain2Studio: React.FC<Brain2StudioProps> = ({
  currentApp,
  filteredApps,
  appsList = [],
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
  onResetBrain2Session,

  // Customizer props
  brain2Model = 'gemini-2.5-flash',
  setBrain2Model,
  brain2Temperature = 0.75,
  setBrain2Temperature,
  brain2PersonaProfile = 'community_mix',
  setBrain2PersonaProfile,
  brain2ReviewLength = 'mixed',
  setBrain2ReviewLength,
  brain2LanguageStyle = 'proper_english',
  setBrain2LanguageStyle,
  brain2FocusVectors = [],
  setBrain2FocusVectors,
  adminFetch = fetch,

  // Staged reviews
  stagedReviews = [],
  generationTelemetry,
  savingStaged = false,
  savingReviewIndex = null,
  onUpdateReviewName,
  onUpdateReviewRating,
  onUpdateReviewText,
  onDiscardReview,
  onDiscardAll,
  onSaveReviewToLive,
  onSaveAllStaged
}) => {
  // Navigation between Single App Researcher and Multi-App Catalog Queue
  const [subTab, setSubTab] = useState<'single' | 'queue'>('single');
  const [showCustomizer, setShowCustomizer] = useState<boolean>(true);

  // Multi-App Queue Autopilot State
  const [queueSearch, setQueueSearch] = useState<string>('');
  const [queueCategory, setQueueCategory] = useState<string>('all');
  const [selectedQueueAppIds, setSelectedQueueAppIds] = useState<string[]>([]);
  const [queueReviewsPerApp, setQueueReviewsPerApp] = useState<number>(2);
  const [queueTargetScore, setQueueTargetScore] = useState<number>(4.2);
  const [queueSaveDirectly, setQueueSaveDirectly] = useState<boolean>(false);
  const [queueActive, setQueueActive] = useState<boolean>(false);
  const [queuePaused, setQueuePaused] = useState<boolean>(false);
  const [queueCurrentIndex, setQueueCurrentIndex] = useState<number>(0);
  const [queueAppProgress, setQueueAppProgress] = useState<Record<string, 'pending' | 'researching' | 'completed' | 'error'>>({});

  const allApps = appsList.length > 0 ? appsList : filteredApps;

  const categories = useMemo(() => {
    const set = new Set<string>();
    allApps.forEach(a => { if (a.category) set.add(a.category); });
    return Array.from(set).sort();
  }, [allApps]);

  const filteredQueueApps = useMemo(() => {
    return allApps.filter(app => {
      const matchesCat = queueCategory === 'all' || app.category === queueCategory;
      const matchesSearch = !queueSearch.trim() || 
        app.name?.toLowerCase().includes(queueSearch.toLowerCase()) ||
        app.developer?.toLowerCase().includes(queueSearch.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [allApps, queueCategory, queueSearch]);

  const handleSelectAllQueue = () => {
    setSelectedQueueAppIds(filteredQueueApps.map(a => String(a.id || a.slug)));
  };

  const handleClearQueueSelection = () => {
    setSelectedQueueAppIds([]);
  };

  const handleToggleQueueApp = (id: string) => {
    setSelectedQueueAppIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Toggle Focus Vectors
  const handleToggleFocusVector = (vec: string) => {
    if (setBrain2FocusVectors) {
      setBrain2FocusVectors(prev => 
        prev.includes(vec) ? prev.filter(v => v !== vec) : [...prev, vec]
      );
    }
  };

  const handleClearFocusVectors = () => {
    if (setBrain2FocusVectors) {
      setBrain2FocusVectors([]);
    }
  };

  // Multi-App Queue Autopilot Execution
  const runQueueAutopilot = async () => {
    if (selectedQueueAppIds.length === 0) return;
    setQueueActive(true);
    setQueuePaused(false);

    const initialProgress: Record<string, 'pending' | 'researching' | 'completed' | 'error'> = {};
    selectedQueueAppIds.forEach(id => { initialProgress[id] = 'pending'; });
    setQueueAppProgress(initialProgress);

    for (let i = 0; i < selectedQueueAppIds.length; i++) {
      setQueueCurrentIndex(i);
      const targetId = selectedQueueAppIds[i];
      const targetApp = allApps.find(a => String(a.id || a.slug) === String(targetId));
      if (!targetApp) continue;

      setQueueAppProgress(prev => ({ ...prev, [targetId]: 'researching' }));
      try {
        await onExecuteBrain2Step(true, queueSaveDirectly, targetApp);
        setQueueAppProgress(prev => ({ ...prev, [targetId]: 'completed' }));
      } catch (err) {
        setQueueAppProgress(prev => ({ ...prev, [targetId]: 'error' }));
      }

      // Small pacing delay between apps in queue
      await new Promise(r => setTimeout(r, 1500));
    }

    setQueueActive(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Sub-Tab Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSubTab('single')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              subTab === 'single'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Globe size={14} />
            <span>Single App Live Researcher</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('queue')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              subTab === 'queue'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Layers size={14} />
            <span>Multi-App Catalog Queue (Autopilot)</span>
            <span className="text-[10px] bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.2 rounded-md font-mono">
              {allApps.length} Apps
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 px-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>GEMINI_RESEARCH_API_KEY Web Quota Active</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: SINGLE APP LIVE WEB RESEARCHER */}
      {/* ========================================================================= */}
      {subTab === 'single' && (
        <>
          {/* Main Cockpit Card */}
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
                      AUTONOMOUS RESEARCH ACTIVE
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
                      type="button"
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

            {/* Granular Brain 2 Customizer Panel */}
            <div className="pt-2">
              <Brain2CustomizerPanel
                model={brain2Model}
                onModelChange={setBrain2Model || (() => {})}
                temperature={brain2Temperature}
                onTemperatureChange={setBrain2Temperature || (() => {})}
                personaProfile={brain2PersonaProfile}
                onPersonaProfileChange={setBrain2PersonaProfile || (() => {})}
                reviewLength={brain2ReviewLength}
                onReviewLengthChange={setBrain2ReviewLength || (() => {})}
                languageStyle={brain2LanguageStyle}
                onLanguageStyleChange={setBrain2LanguageStyle || (() => {})}
                focusVectors={brain2FocusVectors}
                onToggleFocusVector={handleToggleFocusVector}
                onClearFocusVectors={handleClearFocusVectors}
                customQuery={brain2CustomQuery}
                onCustomQueryChange={setBrain2CustomQuery}
                adminFetch={adminFetch}
              />
            </div>

            {/* Autonomous Execution Bar */}
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

              {/* Action Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  {!brain2AutobotActive ? (
                    <button
                      type="button"
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
                          type="button"
                          onClick={onResumeBrain2Autobot}
                          className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <Play size={14} className="fill-white" />
                          <span>Resume Autobot</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={onPauseBrain2Autobot}
                          className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-white font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <Pause size={14} />
                          <span>Pause Autobot</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={onStopBrain2Autobot}
                        className="px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <Square size={14} className="fill-white" />
                        <span>Stop & Disengage</span>
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => onExecuteBrain2Step(true)}
                    disabled={brain2AutobotActive}
                    className="px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    <Zap size={14} className="text-indigo-500" />
                    <span>Run Single Step (1-Shot Web Research)</span>
                  </button>
                </div>

                <button
                  type="button"
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
        </>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: MULTI-APP AUTONOMOUS CATALOG QUEUE */}
      {/* ========================================================================= */}
      {subTab === 'queue' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
                <Layers size={15} />
                <span>Brain 2 Catalog Queue Autopilot</span>
                {queueActive && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-500 text-white animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    QUEUE AUTOPILOT RUNNING ({queueCurrentIndex + 1}/{selectedQueueAppIds.length})
                  </span>
                )}
              </div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                Multi-App Autonomous Web Research Queue
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Batch-process multiple apps across the catalog. Brain 2 independently resolves each app's exact Google Play identity, crawls real player feedback, generates ratings, and stages or publishes them.
              </p>
            </div>

            {/* Queue Controls */}
            <div className="flex items-center gap-2">
              {!queueActive ? (
                <button
                  type="button"
                  onClick={runQueueAutopilot}
                  disabled={selectedQueueAppIds.length === 0}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Play size={13} className="fill-white" />
                  <span>Start Queue Autopilot ({selectedQueueAppIds.length} Selected)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setQueueActive(false)}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Square size={13} className="fill-white" />
                  <span>Stop Queue</span>
                </button>
              )}
            </div>
          </div>

          {/* Queue Parameters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Reviews Per App</label>
              <select
                value={queueReviewsPerApp}
                onChange={(e) => setQueueReviewsPerApp(parseInt(e.target.value, 10))}
                className="w-full mt-1 text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200"
              >
                <option value={1}>1 review per app</option>
                <option value={2}>2 reviews per app</option>
                <option value={3}>3 reviews per app</option>
                <option value={5}>5 reviews per app</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Storage Destination</label>
              <select
                value={queueSaveDirectly ? 'live' : 'staging'}
                onChange={(e) => setQueueSaveDirectly(e.target.value === 'live')}
                className="w-full mt-1 text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200"
              >
                <option value="staging">Staging Deck (Inspect all before live publish)</option>
                <option value="live">Auto-Publish (Live directly to community DB)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Queue Model</label>
              <div className="w-full mt-1 text-xs font-mono font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-indigo-600 dark:text-indigo-400">
                {brain2Model}
              </div>
            </div>
          </div>

          {/* Queue Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter apps in queue..."
                  value={queueSearch}
                  onChange={(e) => setQueueSearch(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
                />
              </div>

              <select
                value={queueCategory}
                onChange={(e) => setQueueCategory(e.target.value)}
                className="text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-slate-800 dark:text-slate-200"
              >
                <option value="all">All Categories ({allApps.length})</option>
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAllQueue}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <CheckSquare size={13} />
                <span>Select All ({filteredQueueApps.length})</span>
              </button>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <button
                type="button"
                onClick={handleClearQueueSelection}
                className="text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
              >
                Clear Selection
              </button>
            </div>
          </div>

          {/* App List in Queue */}
          <div className="max-h-80 overflow-y-auto space-y-1.5 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 bg-slate-50/50 dark:bg-slate-900/50">
            {filteredQueueApps.map(app => {
              const appId = String(app.id || app.slug);
              const isSelected = selectedQueueAppIds.includes(appId);
              const status = queueAppProgress[appId];

              return (
                <div
                  key={appId}
                  onClick={() => handleToggleQueueApp(appId)}
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-white dark:bg-slate-800 border-indigo-500/80 shadow-2xs'
                      : 'bg-white/60 dark:bg-slate-850 border-slate-200/60 dark:border-slate-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="accent-indigo-600 cursor-pointer"
                    />
                    {app.icon_url ? (
                      <img src={app.icon_url} alt="" className="w-8 h-8 rounded-lg object-contain bg-slate-100 dark:bg-slate-800 shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
                        {app.name?.charAt(0) || 'A'}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-xs font-black text-slate-800 dark:text-slate-200 truncate">
                        {app.name}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {app.developer || 'Studio'} • {app.category || 'General'}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {status === 'researching' && (
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                        <Globe size={10} className="animate-spin" />
                        Researching Web...
                      </span>
                    )}
                    {status === 'completed' && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 size={10} />
                        Completed
                      </span>
                    )}
                    {status === 'error' && (
                      <span className="text-[10px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-950 px-2 py-0.5 rounded-full">
                        Retry Needed
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TELEMETRY HUD & LIVE TERMINAL CONSOLE */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
        
        {/* Stage Pipeline Indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2 text-xs font-black text-slate-300 uppercase tracking-wider">
            <Activity size={15} className="text-indigo-400" />
            <span>Brain 2 Web Research & Grounding Pipeline</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold">
            {[
              { id: 'resolving_target', label: '1. Target' },
              { id: 'web_searching', label: '2. Search' },
              { id: 'extracting_reviews', label: '3. Extract' },
              { id: 'rating_aligning', label: '4. Align' },
              { id: 'sanitizing', label: '5. Sanitize' }
            ].map(stage => {
              const isActive = brain2CurrentStage === stage.id;
              return (
                <span
                  key={stage.id}
                  className={`px-2.5 py-1 rounded-lg border transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white border-indigo-400 shadow-xs scale-105 animate-pulse'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {stage.label}
                </span>
              );
            })}
          </div>
        </div>

        {/* Real-time Session Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Generated</div>
            <div className="text-lg font-black text-indigo-400 mt-0.5">{brain2SessionStats.totalGenerated}</div>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <div className="text-[10px] uppercase font-bold text-slate-400">Live Published</div>
            <div className="text-lg font-black text-emerald-400 mt-0.5">{brain2SessionStats.autoPublished}</div>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <div className="text-[10px] uppercase font-bold text-slate-400">Staged In Deck</div>
            <div className="text-lg font-black text-amber-400 mt-0.5">{stagedReviews.length || brain2SessionStats.staged}</div>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <div className="text-[10px] uppercase font-bold text-slate-400">Search Queries</div>
            <div className="text-lg font-black text-cyan-400 mt-0.5">{brain2SessionStats.queriesRun}</div>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <div className="text-[10px] uppercase font-bold text-slate-400">Active Model</div>
            <div className="text-xs font-bold text-slate-300 mt-1 truncate" title={brain2SessionStats.lastModel || brain2Model}>
              {brain2SessionStats.lastModel || brain2Model}
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

      {/* ========================================================================= */}
      {/* 3. STAGED REVIEWS WORKSPACE (WHEN REVIEWS ARE STAGED) */}
      {/* ========================================================================= */}
      {stagedReviews.length > 0 && onUpdateReviewName && onUpdateReviewRating && onUpdateReviewText && onDiscardReview && onDiscardAll && onSaveReviewToLive && onSaveAllStaged && (
        <StagedReviewsWorkspace
          stagedReviews={stagedReviews}
          generationTelemetry={generationTelemetry}
          savingStaged={savingStaged}
          savingReviewIndex={savingReviewIndex}
          onUpdateReviewName={onUpdateReviewName}
          onUpdateReviewRating={onUpdateReviewRating}
          onUpdateReviewText={onUpdateReviewText}
          onDiscardReview={onDiscardReview}
          onDiscardAll={onDiscardAll}
          onSaveReviewToLive={onSaveReviewToLive}
          onSaveAllStaged={onSaveAllStaged}
        />
      )}

    </div>
  );
};
