import React, { useState, useMemo } from 'react';
import { 
  Cpu, 
  Sparkles, 
  Star, 
  Play, 
  CheckCircle2, 
  Clock, 
  Pause, 
  Square, 
  Zap, 
  RotateCcw, 
  Activity, 
  Terminal, 
  FileText, 
  Compass, 
  Info, 
  Eye,
  Search,
  Languages,
  Check,
  CheckSquare,
  Square as UncheckedSquare,
  Filter,
  Layers,
  Trash2,
  RefreshCw,
  Upload,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  ArrowRight,
  Database,
  Sliders,
  UserCheck,
  AlignLeft,
  Tag,
  Gauge,
  Flame,
  ShieldCheck,
  Bot
} from 'lucide-react';
import { AutobotLog, AutobotSessionStats, AutobotStage, stripHtmlTags, GenerationTelemetry } from './types';
import { StagedReviewsWorkspace } from './StagedReviewsWorkspace';

interface Brain1StudioProps {
  // Catalog & Single App State
  appsList: any[];
  currentApp: any;
  filteredApps: any[];
  selectedAppId: string;
  setSelectedAppId: (id: string) => void;
  appSearch: string;
  setAppSearch: (q: string) => void;
  targetScore: number;
  customPrompt: string;
  setCustomPrompt: (prompt: string) => void;
  brain1LanguageStyle: 'proper_english' | 'hinglish' | 'natural_mix';
  setBrain1LanguageStyle: (style: 'proper_english' | 'hinglish' | 'natural_mix') => void;

  // Brain 1 Customization Controls
  brain1Model: string;
  setBrain1Model: (m: string) => void;
  brain1Temperature: number;
  setBrain1Temperature: (t: number) => void;
  brain1ReviewLength: 'mixed' | 'short' | 'realistic' | 'detailed';
  setBrain1ReviewLength: (l: 'mixed' | 'short' | 'realistic' | 'detailed') => void;
  brain1PersonaProfile: 'diverse_all' | 'casual_gamers' | 'pro_players' | 'family_social' | 'performance_focused';
  setBrain1PersonaProfile: (p: 'diverse_all' | 'casual_gamers' | 'pro_players' | 'family_social' | 'performance_focused') => void;
  brain1FocusAspects: string[];
  setBrain1FocusAspects: (aspects: string[]) => void;
  availableModels?: any[];
  activeAiModel?: string;

  // Single App Autobot Controls
  autobotActive: boolean;
  autobotPaused: boolean;
  autobotExecutionMode: 'paced' | 'instant';
  setAutobotExecutionMode: (m: 'paced' | 'instant') => void;
  autobotSaveDirectly: boolean;
  setAutobotSaveDirectly: (val: boolean) => void;
  autobotTargetGoal: number;
  setAutobotTargetGoal: (n: number) => void;
  autobotBatchSize: number;
  setAutobotBatchSize: (n: number) => void;
  autobotCycleDelay: number;
  setAutobotCycleDelay: (n: number) => void;
  autobotCurrentStage: AutobotStage;
  autobotSessionStats: AutobotSessionStats;
  autobotLogs: AutobotLog[];
  brain1Dossier: any;
  dossierHealth: { descChars: number; featuresChars?: number; modes: string[]; hasSafety?: boolean; hasFaqs?: boolean; summary: string };
  onStartAutobot: () => void;
  onPauseAutobot: () => void;
  onResumeAutobot: () => void;
  onStopAutobot: () => void;
  onExecuteStep: (isManualTrigger?: boolean) => void;
  onResetSession: () => void;

  // Multi-App Autopilot Queue Props
  selectedAutoPilotAppIds: string[];
  onToggleAutoPilotApp: (appId: string) => void;
  onSelectAllAutoPilotApps: () => void;
  onDeselectAllAutoPilotApps: () => void;
  autoPilotAppSearch: string;
  setAutoPilotAppSearch: (s: string) => void;
  autoPilotCountPerApp: number;
  setAutoPilotCountPerApp: (n: number) => void;
  autoPilotSkipReviews: boolean;
  setAutoPilotSkipReviews: (v: boolean) => void;
  autoPilotSkipThreshold: number;
  setAutoPilotSkipThreshold: (n: number) => void;
  autoPilotSaveDirectly: boolean;
  setAutoPilotSaveDirectly: (v: boolean) => void;
  autoPilotCycleDelay: number;
  setAutoPilotCycleDelay: (n: number) => void;
  autoPilotRunning: boolean;
  autoPilotPaused: boolean;
  autoPilotCurrentApp: any;
  autoPilotProgress: { current: number; total: number; percent: number };
  onStartAutoPilotQueue: () => void;
  onPauseAutoPilotQueue: () => void;
  onResumeAutoPilotQueue: () => void;
  onStopAutoPilotQueue: () => void;

  // Staged Reviews (Downside) Props
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

export const ALL_GEMINI_MODELS = [
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', desc: 'Flagship Deep Dossier Reasoning (2M+ Tokens)', badge: 'Recommended for Brain 1' },
  { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash', desc: 'Next-Gen Ultra-Fast Flash (1M+ Tokens)', badge: 'High Speed' },
  { id: 'gemini-3.7-pro', name: 'Gemini 3.7 Pro', desc: 'Deep Analytical Engine (2M+ Tokens)', badge: 'Deep Logic' },
  { id: 'gemini-3.7-flash', name: 'Gemini 3.7 Flash', desc: 'High-Performance Hybrid (1M+ Tokens)', badge: 'Fast Reasoning' },
  { id: 'gemini-3.5-pro', name: 'Gemini 3.5 Pro', desc: 'Pro Reasoning Engine (2M+ Tokens)', badge: 'Pro' },
  { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', desc: 'Balanced Flash Engine (1M+ Tokens)', badge: 'Balanced' },
  { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro Preview', desc: 'Deep Thinking Preview (2M+ Tokens)', badge: 'Thinking' },
  { id: 'gemini-flash-latest', name: 'Gemini Flash Latest', desc: 'Auto-Updated Latest Model (1M+ Tokens)', badge: 'Latest' },
  { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite', desc: 'Ultra Fast & Lightweight (1M+ Tokens)', badge: 'Lite' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', desc: 'Adaptive Multimodal (1M+ Tokens)', badge: 'Adaptive' }
];

export const AVAILABLE_FOCUS_ASPECTS = [
  'Points / Pool / Deals Rules',
  'Card Sorting & Discard Pile',
  'Table Timers & Fast Paced Turns',
  '4G/5G Reconnect & Network Drop Stability',
  '60 FPS UI Animations & Graphics',
  'Low Battery & Heat Optimization',
  'Quick Table Matchmaking',
  'Safe & Fair Play Environment'
];

interface Brain1CustomizerPanelProps {
  brain1Model: string;
  setBrain1Model: (m: string) => void;
  brain1Temperature: number;
  setBrain1Temperature: (t: number) => void;
  brain1ReviewLength: 'mixed' | 'short' | 'realistic' | 'detailed';
  setBrain1ReviewLength: (l: 'mixed' | 'short' | 'realistic' | 'detailed') => void;
  brain1PersonaProfile: 'diverse_all' | 'casual_gamers' | 'pro_players' | 'family_social' | 'performance_focused';
  setBrain1PersonaProfile: (p: 'diverse_all' | 'casual_gamers' | 'pro_players' | 'family_social' | 'performance_focused') => void;
  brain1FocusAspects: string[];
  setBrain1FocusAspects: (aspects: string[]) => void;
  brain1LanguageStyle: 'proper_english' | 'hinglish' | 'natural_mix';
  setBrain1LanguageStyle: (style: 'proper_english' | 'hinglish' | 'natural_mix') => void;
  customPrompt: string;
  setCustomPrompt: (prompt: string) => void;
  titlePrefix?: string;
}

export const Brain1CustomizerPanel: React.FC<Brain1CustomizerPanelProps> = ({
  brain1Model,
  setBrain1Model,
  brain1Temperature,
  setBrain1Temperature,
  brain1ReviewLength,
  setBrain1ReviewLength,
  brain1PersonaProfile,
  setBrain1PersonaProfile,
  brain1FocusAspects,
  setBrain1FocusAspects,
  brain1LanguageStyle,
  setBrain1LanguageStyle,
  customPrompt,
  setCustomPrompt,
  titlePrefix = 'Brain 1'
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const toggleFocusAspect = (aspect: string) => {
    if (brain1FocusAspects.includes(aspect)) {
      setBrain1FocusAspects(brain1FocusAspects.filter(a => a !== aspect));
    } else {
      setBrain1FocusAspects([...brain1FocusAspects, aspect]);
    }
  };

  const getTemperatureLabel = (val: number) => {
    if (val <= 0.4) return 'Strict & Factual';
    if (val <= 0.75) return 'Balanced';
    if (val <= 0.9) return 'Play Store Organic (Recommended)';
    return 'High Variety & Slang';
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-800/60 rounded-3xl p-5 border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-4">
      {/* Header Bar with quick status tags */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-700/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Sliders size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h5 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                {titlePrefix} AI Engine & Autonomous Customization
              </h5>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/80">
                100% Admin Controlled
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Customize Gemini reasoning model, temperature creativity, review length, player personas, and focus aspects.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {isExpanded ? (
              <>
                <ChevronUp size={14} />
                <span>Collapse Options</span>
              </>
            ) : (
              <>
                <ChevronDown size={14} />
                <span>Expand All ({brain1Model})</span>
              </>
            )}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-5 pt-1">
          {/* 1. AI Reasoning Model Selection */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Bot size={14} className="text-emerald-500" />
                <span>AI Reasoning Model</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  (Gemini 2.5 Pro recommended for deep dossier HTML comprehension)
                </span>
              </label>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/80">
                Active: {brain1Model}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {ALL_GEMINI_MODELS.slice(0, 6).map((m) => {
                const isSelected = brain1Model === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setBrain1Model(m.id)}
                    className={`text-left p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                      isSelected
                        ? 'bg-white dark:bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'bg-white/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                        {m.name}
                      </span>
                      <span
                        className={`text-[9px] font-black px-1.5 py-0.5 rounded-md shrink-0 ${
                          isSelected
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {m.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
                      {m.desc}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Additional Models Dropdown if user wants other specific models */}
            <div className="flex items-center justify-between gap-2 pt-1 text-xs">
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                Or select another available model:
              </span>
              <select
                value={brain1Model}
                onChange={(e) => setBrain1Model(e.target.value)}
                className="text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {ALL_GEMINI_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} — {m.desc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 2. Temperature & Creativity Control */}
          <div className="space-y-2.5 pt-2 border-t border-slate-200 dark:border-slate-700/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Gauge size={14} className="text-emerald-500" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Temperature & Autonomous Spontaneity:
                </span>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                  {brain1Temperature.toFixed(2)}
                </span>
                <span className="text-[11px] text-slate-400">
                  ({getTemperatureLabel(brain1Temperature)})
                </span>
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setBrain1Temperature(0.30)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-colors cursor-pointer ${
                    brain1Temperature === 0.30
                      ? 'bg-emerald-500 text-white border-emerald-500'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  0.30 Strict
                </button>
                <button
                  type="button"
                  onClick={() => setBrain1Temperature(0.70)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-colors cursor-pointer ${
                    brain1Temperature === 0.70
                      ? 'bg-emerald-500 text-white border-emerald-500'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  0.70 Balanced
                </button>
                <button
                  type="button"
                  onClick={() => setBrain1Temperature(0.85)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-colors cursor-pointer ${
                    brain1Temperature === 0.85
                      ? 'bg-emerald-500 text-white border-emerald-500'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  0.85 Organic ★
                </button>
                <button
                  type="button"
                  onClick={() => setBrain1Temperature(1.00)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-colors cursor-pointer ${
                    brain1Temperature === 1.00
                      ? 'bg-emerald-500 text-white border-emerald-500'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  1.00 High Slang
                </button>
              </div>
            </div>

            <input
              type="range"
              min="0.2"
              max="1.0"
              step="0.05"
              value={brain1Temperature}
              onChange={(e) => setBrain1Temperature(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          {/* 3. Review Length & Depth Format */}
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700/60">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <AlignLeft size={14} className="text-emerald-500" />
              <span>Review Length & Structural Complexity</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {[
                { id: 'mixed', label: 'Play Store Mixed', badge: 'Natural Mix', desc: 'Realistic mixture of 1-line bursts, 2-line impressions, and 1 in-depth review' },
                { id: 'short', label: 'Crisp & Punchy', badge: '1–2 Sentences', desc: 'Fast mobile player reactions, punchy praises or quick functional notes' },
                { id: 'realistic', label: 'Authentic Balanced', badge: '2–3 Sentences', desc: 'Standard authentic player feedback covering overall experience and feel' },
                { id: 'detailed', label: 'In-Depth Gameplay', badge: '3–4 Sentences', desc: 'Comprehensive feedback dissecting table timers, discard piles, and app speed' }
              ].map((item) => {
                const isSelected = brain1ReviewLength === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setBrain1ReviewLength(item.id as any)}
                    className={`text-left p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-1 ${
                      isSelected
                        ? 'bg-white dark:bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'bg-white/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 dark:text-white">
                        {item.label}
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
                      {item.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Player Persona Profile */}
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700/60">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <UserCheck size={14} className="text-emerald-500" />
              <span>Player Persona Profile</span>
              <span className="text-[10px] text-slate-400 font-normal">
                (Dictates commenter background, priorities, and vocabulary)
              </span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {[
                { id: 'diverse_all', label: 'Diverse All-Rounders', badge: 'Play Store Default', desc: 'Realistic cross-section of Indian mobile gamers from novices to daily players' },
                { id: 'pro_players', label: 'Card Strategy Veterans', badge: 'Competitive', desc: 'Focuses on Points/Pool/Deals rules, timer pressure, discard piles, and fair play' },
                { id: 'casual_gamers', label: 'Casual & Weekend Players', badge: 'Relaxed', desc: 'Praises UI graphics, smooth animations, background audio, and casual table fun' },
                { id: 'family_social', label: 'Private Table & Social', badge: 'Social', desc: 'Enjoys inviting friends, private room matches, clean matchmaking, and zero toxicity' },
                { id: 'performance_focused', label: 'Hardware & Tech Savvy', badge: 'Performance', desc: 'Monitors FPS, low battery consumption, heat levels, and 4G/5G reconnection' }
              ].map((item) => {
                const isSelected = brain1PersonaProfile === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setBrain1PersonaProfile(item.id as any)}
                    className={`text-left p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-1 ${
                      isSelected
                        ? 'bg-white dark:bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'bg-white/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 dark:text-white">
                        {item.label}
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
                      {item.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Focus Aspects (Multi-Select Chips) */}
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Tag size={14} className="text-emerald-500" />
                <span>Gameplay Focus Aspects</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  (Click to emphasize specific mechanics; unselected = organic balance)
                </span>
              </label>
              {brain1FocusAspects.length > 0 && (
                <button
                  type="button"
                  onClick={() => setBrain1FocusAspects([])}
                  className="text-[10px] text-rose-600 hover:underline cursor-pointer"
                >
                  Clear all ({brain1FocusAspects.length})
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {AVAILABLE_FOCUS_ASPECTS.map((aspect) => {
                const isSelected = brain1FocusAspects.includes(aspect);
                return (
                  <button
                    key={aspect}
                    type="button"
                    onClick={() => toggleFocusAspect(aspect)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    {isSelected && <Check size={13} />}
                    <span>{aspect}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6. Review Language & Commenter Voice */}
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700/60">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Languages size={14} className="text-emerald-500" />
              <span>Review Language & Voice Style</span>
            </label>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setBrain1LanguageStyle('proper_english')}
                className={`text-left p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                  brain1LanguageStyle === 'proper_english'
                    ? 'bg-white dark:bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'bg-white/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 dark:text-white">Proper English</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300">Clean</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                  Natural, fluent English as written by real players on Play Store. No slang.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setBrain1LanguageStyle('hinglish')}
                className={`text-left p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                  brain1LanguageStyle === 'hinglish'
                    ? 'bg-white dark:bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'bg-white/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 dark:text-white">Casual Hinglish</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300">Desi</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                  Conversational blend of Hindi & English gaming terms used in Indian chat.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setBrain1LanguageStyle('natural_mix')}
                className={`text-left p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                  brain1LanguageStyle === 'natural_mix'
                    ? 'bg-white dark:bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'bg-white/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 dark:text-white">Natural Mix</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300">60/40</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                  Organic mix: ~60% casual English and ~40% conversational Hinglish.
                </p>
              </button>
            </div>
          </div>

          {/* 7. Optional Custom Topic Spark */}
          <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-700/60">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Sparkles size={14} className="text-emerald-500" />
              <span>Optional Custom Topic Guidance (Free-form spark)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Focus on fast withdrawal speed, 60fps card animations, tournament excitement..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export const Brain1Studio: React.FC<Brain1StudioProps> = ({
  appsList,
  currentApp,
  filteredApps,
  selectedAppId,
  setSelectedAppId,
  appSearch,
  setAppSearch,
  targetScore,
  customPrompt,
  setCustomPrompt,
  brain1LanguageStyle,
  setBrain1LanguageStyle,
  brain1Model,
  setBrain1Model,
  brain1Temperature,
  setBrain1Temperature,
  brain1ReviewLength,
  setBrain1ReviewLength,
  brain1PersonaProfile,
  setBrain1PersonaProfile,
  brain1FocusAspects,
  setBrain1FocusAspects,
  availableModels = [],
  activeAiModel,
  autobotActive,
  autobotPaused,
  autobotExecutionMode,
  setAutobotExecutionMode,
  autobotSaveDirectly,
  setAutobotSaveDirectly,
  autobotTargetGoal,
  setAutobotTargetGoal,
  autobotBatchSize,
  setAutobotBatchSize,
  autobotCycleDelay,
  setAutobotCycleDelay,
  autobotCurrentStage,
  autobotSessionStats,
  autobotLogs,
  brain1Dossier,
  dossierHealth,
  onStartAutobot,
  onPauseAutobot,
  onResumeAutobot,
  onStopAutobot,
  onExecuteStep,
  onResetSession,

  // Multi-App Autopilot Props
  selectedAutoPilotAppIds,
  onToggleAutoPilotApp,
  onSelectAllAutoPilotApps,
  onDeselectAllAutoPilotApps,
  autoPilotAppSearch,
  setAutoPilotAppSearch,
  autoPilotCountPerApp,
  setAutoPilotCountPerApp,
  autoPilotSkipReviews,
  setAutoPilotSkipReviews,
  autoPilotSkipThreshold,
  setAutoPilotSkipThreshold,
  autoPilotSaveDirectly,
  setAutoPilotSaveDirectly,
  autoPilotCycleDelay,
  setAutoPilotCycleDelay,
  autoPilotRunning,
  autoPilotPaused,
  autoPilotCurrentApp,
  autoPilotProgress,
  onStartAutoPilotQueue,
  onPauseAutoPilotQueue,
  onResumeAutoPilotQueue,
  onStopAutoPilotQueue,

  // Staged Reviews Props
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
  // Operational Sub-mode inside Brain 1
  const [brain1SubMode, setBrain1SubMode] = useState<'single' | 'autopilot'>('single');
  const [showDossierDrawer, setShowDossierDrawer] = useState(false);
  const [dossierActiveTab, setDossierActiveTab] = useState<'overview' | 'description' | 'features' | 'safety' | 'faqs' | 'raw'>('overview');
  const [autoPilotCategoryFilter, setAutoPilotCategoryFilter] = useState<string>('all');

  // Categories extracted from appsList
  const categories = useMemo(() => {
    const cats = new Set<string>();
    appsList.forEach(a => {
      if (a.category) cats.add(a.category);
    });
    return Array.from(cats);
  }, [appsList]);

  // Filtered apps for autopilot multi-app selection grid
  const autopilotFilteredApps = useMemo(() => {
    return appsList.filter(app => {
      const matchCat = autoPilotCategoryFilter === 'all' || app.category === autoPilotCategoryFilter;
      const q = autoPilotAppSearch.toLowerCase().trim();
      const matchSearch = !q || 
        (app.name && app.name.toLowerCase().includes(q)) ||
        (app.slug && app.slug.toLowerCase().includes(q)) ||
        (app.id && String(app.id).toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [appsList, autoPilotCategoryFilter, autoPilotAppSearch]);

  return (
    <div className="space-y-6">
      
      {/* 1. Main Brain 1 Shell Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
        
        {/* Title & Mode Switcher Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shadow-xs">
              <Cpu size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Brain 1: Deep Admin Dossier Comprehension Engine
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/80">
                  gemini-2.5-pro
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Ingests complete internal app dossier (HTML descriptions, gameplay rules, alerts, FAQs). Generates authentic player reviews.
              </p>
            </div>
          </div>

          {/* Sub-Mode Segmented Control: Single Focus vs Multi-App Autopilot */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700/80 shrink-0">
            <button
              onClick={() => setBrain1SubMode('single')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs transition-all cursor-pointer ${
                brain1SubMode === 'single'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Zap size={14} />
              <span>Single App Focus</span>
            </button>
            <button
              onClick={() => setBrain1SubMode('autopilot')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs transition-all cursor-pointer ${
                brain1SubMode === 'autopilot'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Play size={14} />
              <span>Multi-App Autopilot Queue</span>
              {selectedAutoPilotAppIds.length > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  brain1SubMode === 'autopilot' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                }`}>
                  {selectedAutoPilotAppIds.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SUB-MODE 1: SINGLE APP FOCUS */}
        {/* ========================================================================= */}
        {brain1SubMode === 'single' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Search and App Selector Cockpit */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/70">
              <div className="lg:col-span-6 flex items-center gap-3.5">
                {currentApp?.icon_url ? (
                  <img 
                    src={currentApp.icon_url} 
                    alt={currentApp?.name || 'App'} 
                    className="w-13 h-13 rounded-2xl object-contain shadow-xs bg-white dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700" 
                  />
                ) : (
                  <div className="w-13 h-13 rounded-2xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center font-black text-emerald-600 shrink-0 text-xl">
                    {currentApp?.name?.charAt(0) || 'A'}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="relative mb-1">
                    <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Type to filter app list..."
                      value={appSearch}
                      onChange={(e) => setAppSearch(e.target.value)}
                      className="w-full text-xs pl-7 pr-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <select
                    value={selectedAppId}
                    onChange={(e) => setSelectedAppId(e.target.value)}
                    className="w-full text-sm font-black bg-transparent text-slate-900 dark:text-white border-0 cursor-pointer focus:outline-none truncate"
                  >
                    {filteredApps.map(app => (
                      <option key={app.id} value={app.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                        {app.name} ({app.category || 'General'}) • Store: {app.rating || '4.8'}★
                      </option>
                    ))}
                  </select>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    <span>Developer: <strong className="text-slate-800 dark:text-slate-200">{currentApp?.developer || 'Studio'}</strong></span>
                    <span>•</span>
                    <span>Category: <strong>{currentApp?.category || 'Card'}</strong></span>
                    <span>•</span>
                    <span>Size: <strong>{currentApp?.file_size || 'Fast DL'}</strong></span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 flex flex-wrap items-center justify-end gap-2 text-[11px] font-semibold">
                <div className="bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800/70 flex items-center gap-1.5">
                  <FileText size={13} className="text-emerald-500" />
                  <span>HTML Chars: <strong>{brain1Dossier?.dossierStats?.totalChars || dossierHealth.descChars}</strong></span>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-800/70 flex items-center gap-1.5">
                  <Compass size={13} className="text-blue-500" />
                  <span>Rules & Modes: <strong>{brain1Dossier?.highlights?.length || dossierHealth.modes.length}</strong></span>
                </div>
                <div className="bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 px-3 py-1.5 rounded-xl border border-purple-200 dark:border-purple-800/70 flex items-center gap-1.5">
                  <Info size={13} className="text-purple-500" />
                  <span>FAQs: <strong>{brain1Dossier?.dossierStats?.faqCount || 0}</strong></span>
                </div>
                <button
                  onClick={() => setShowDossierDrawer(!showDossierDrawer)}
                  className="bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-3.5 py-1.5 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors flex items-center gap-1.5 cursor-pointer font-bold text-xs"
                >
                  <Eye size={13} />
                  <span>{showDossierDrawer ? 'Hide Ingested Info' : 'Inspect Ingested Info'}</span>
                </button>
              </div>
            </div>

            {/* Expandable 360° Dossier Drawer */}
            {showDossierDrawer && (
              <div className="bg-slate-900 text-slate-200 rounded-2xl border border-slate-800 overflow-hidden space-y-3 animate-in fade-in duration-200">
                <div className="p-3.5 bg-slate-950/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <Terminal size={15} />
                    <span>Complete Internal Dossier Ingested by Brain 1 for "{currentApp?.name}"</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {(['overview', 'description', 'features', 'safety', 'faqs', 'raw'] as const).map(tab => (
                      <button
                        key={tab}
                        onClick={() => setDossierActiveTab(tab)}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-colors cursor-pointer ${
                          dossierActiveTab === tab
                            ? 'bg-emerald-500 text-white shadow-xs'
                            : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 max-h-56 overflow-y-auto text-xs text-slate-300 leading-relaxed space-y-2 pr-3 scrollbar-thin">
                  {dossierActiveTab === 'overview' && (
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1.5">
                        {(brain1Dossier?.highlights || dossierHealth.modes).map((m: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[11px] font-bold">
                            ✓ {m}
                          </span>
                        ))}
                      </div>
                      <p className="text-slate-400 text-xs mt-2">{brain1Dossier?.descriptionSummary || dossierHealth.summary}</p>
                    </div>
                  )}

                  {dossierActiveTab === 'description' && (
                    <div className="space-y-1">
                      <div className="text-emerald-400 font-bold text-[11px]">Database App Description:</div>
                      <p className="whitespace-pre-wrap font-mono text-[11px] text-slate-300">
                        {stripHtmlTags(currentApp?.description_html || currentApp?.description || 'No description provided')}
                      </p>
                    </div>
                  )}

                  {dossierActiveTab === 'features' && (
                    <div className="space-y-1">
                      <div className="text-emerald-400 font-bold text-[11px]">Features Breakdown:</div>
                      <p className="whitespace-pre-wrap font-mono text-[11px] text-slate-300">
                        {stripHtmlTags(currentApp?.features_html || currentApp?.features || 'No features list provided')}
                      </p>
                    </div>
                  )}

                  {dossierActiveTab === 'safety' && (
                    <div className="space-y-2">
                      {currentApp?.red_box_msg && (
                        <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300">
                          <span className="font-bold text-xs">Critical Notice: </span>
                          {stripHtmlTags(currentApp.red_box_msg)}
                        </div>
                      )}
                      {currentApp?.yellow_box_msg && (
                        <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-300">
                          <span className="font-bold text-xs">Caution Notice: </span>
                          {stripHtmlTags(currentApp.yellow_box_msg)}
                        </div>
                      )}
                      {currentApp?.idea_box_msg && (
                        <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-800/60 text-blue-300">
                          <span className="font-bold text-xs">Admin Tips: </span>
                          {stripHtmlTags(currentApp.idea_box_msg)}
                        </div>
                      )}
                      {!currentApp?.red_box_msg && !currentApp?.yellow_box_msg && !currentApp?.idea_box_msg && (
                        <p className="text-slate-400 text-xs">No special safety alerts assigned to this app.</p>
                      )}
                    </div>
                  )}

                  {dossierActiveTab === 'faqs' && (
                    <div className="space-y-2 font-mono text-[11px]">
                      {brain1Dossier?.faqsList && brain1Dossier.faqsList.length > 0 ? (
                        brain1Dossier.faqsList.map((f: any, i: number) => (
                          <div key={i} className="p-2 bg-slate-800/60 rounded-lg">
                            <span className="text-emerald-400 font-bold">Q: {f.question}</span>
                            <p className="text-slate-300 mt-0.5">A: {f.answer}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-400 text-xs">No FAQs logged for this app.</p>
                      )}
                    </div>
                  )}

                  {dossierActiveTab === 'raw' && (
                    <pre className="font-mono text-[10px] text-slate-300 whitespace-pre-wrap leading-tight">
                      {brain1Dossier?.fullSummary || dossierHealth.summary}
                    </pre>
                  )}
                </div>
              </div>
            )}

            {/* Brain 1 AI Engine & Quality Customization Panel */}
            <Brain1CustomizerPanel
              brain1Model={brain1Model}
              setBrain1Model={setBrain1Model}
              brain1Temperature={brain1Temperature}
              setBrain1Temperature={setBrain1Temperature}
              brain1ReviewLength={brain1ReviewLength}
              setBrain1ReviewLength={setBrain1ReviewLength}
              brain1PersonaProfile={brain1PersonaProfile}
              setBrain1PersonaProfile={setBrain1PersonaProfile}
              brain1FocusAspects={brain1FocusAspects}
              setBrain1FocusAspects={setBrain1FocusAspects}
              brain1LanguageStyle={brain1LanguageStyle}
              setBrain1LanguageStyle={setBrain1LanguageStyle}
              customPrompt={customPrompt}
              setCustomPrompt={setCustomPrompt}
              titlePrefix="Single App Focus"
            />

            {/* Single App Generation Parameters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Play size={13} className="text-emerald-500" />
                  Reviews Per Step
                </label>
                <select
                  value={autobotBatchSize}
                  onChange={(e) => setAutobotBatchSize(Number(e.target.value))}
                  className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value={1}>1 Review per step</option>
                  <option value={2}>2 Reviews per step</option>
                  <option value={3}>3 Reviews per step</option>
                  <option value={5}>5 Reviews per step</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock size={13} className="text-emerald-500" />
                  Loop Cycle Delay
                </label>
                <select
                  value={autobotCycleDelay}
                  onChange={(e) => setAutobotCycleDelay(Number(e.target.value))}
                  className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value={2}>2 Seconds Delay</option>
                  <option value={3}>3 Seconds Delay</option>
                  <option value={5}>5 Seconds Delay</option>
                </select>
              </div>

              {/* Destination Toggle: Staging vs Direct */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Database size={13} className="text-emerald-500" />
                  Output Destination
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAutobotSaveDirectly(false)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      !autobotSaveDirectly
                        ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/30'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <CheckCircle2 size={13} />
                    <span>Stage at Downside (Review First)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAutobotSaveDirectly(true)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      autobotSaveDirectly
                        ? 'bg-blue-50 dark:bg-blue-950/70 border-blue-500 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500/30'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Upload size={13} />
                    <span>Direct Upload to Firestore</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Single App Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex flex-wrap items-center gap-3">
                {!autobotActive ? (
                  <button
                    onClick={onStartAutobot}
                    className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/40 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Play size={16} />
                    <span>Start Continuous Autobot Loop</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    {autobotPaused ? (
                      <button
                        onClick={onResumeAutobot}
                        className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-600/20"
                      >
                        <Play size={15} />
                        <span>Resume Loop</span>
                      </button>
                    ) : (
                      <button
                        onClick={onPauseAutobot}
                        className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-md shadow-amber-500/20"
                      >
                        <Pause size={15} />
                        <span>Pause Loop</span>
                      </button>
                    )}
                    <button
                      onClick={onStopAutobot}
                      className="px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-md shadow-rose-600/20"
                    >
                      <Square size={15} />
                      <span>Stop Loop</span>
                    </button>
                  </div>
                )}

                <button
                  onClick={() => onExecuteStep(true)}
                  disabled={autobotActive}
                  className="px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <Zap size={14} className="text-emerald-500" />
                  <span>Run Single Step (1-Shot)</span>
                </button>
              </div>

              <button
                onClick={onResetSession}
                className="px-3.5 py-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                title="Reset session telemetry and logs"
              >
                <RotateCcw size={13} />
                <span>Reset Telemetry</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUB-MODE 2: MULTI-APP AUTOPILOT QUEUE */}
        {/* ========================================================================= */}
        {brain1SubMode === 'autopilot' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Banner: What Brain 1 Autopilot Does */}
            <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-500/30 rounded-2xl p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Play size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <span>Multi-App Autopilot Queue</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500 text-white font-bold">Deep HTML Analysis</span>
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    Select multiple apps below. Brain 1 will sequentially read each app's full HTML description, rules, alerts, and FAQs to generate authentic player reviews. Output drops directly to the Downside Staging Deck with the app logo and name for approval!
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-start sm:self-center bg-white dark:bg-slate-800 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
                <Layers size={15} className="text-emerald-500" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Selected: <strong className="text-emerald-600 dark:text-emerald-400">{selectedAutoPilotAppIds.length}</strong> of {appsList.length}
                </span>
              </div>
            </div>

            {/* Multi-App Catalog Selection Toolbar */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/80 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Filter size={15} className="text-emerald-500" />
                  <h5 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Select Target Apps for Queue ({selectedAutoPilotAppIds.length} Selected)
                  </h5>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={onSelectAllAutoPilotApps}
                    className="px-3 py-1.5 text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-xl border border-emerald-300 dark:border-emerald-800/80 hover:bg-emerald-100 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <CheckSquare size={13} />
                    <span>Select All ({appsList.length})</span>
                  </button>
                  <button
                    onClick={onDeselectAllAutoPilotApps}
                    className="px-3 py-1.5 text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <UncheckedSquare size={13} />
                    <span>Deselect All</span>
                  </button>
                </div>
              </div>

              {/* Filters: Category & Live Search */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-4">
                  <select
                    value={autoPilotCategoryFilter}
                    onChange={(e) => setAutoPilotCategoryFilter(e.target.value)}
                    className="w-full text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="all">All Categories ({appsList.length})</option>
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-8 relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search apps by name, category, or slug..."
                    value={autoPilotAppSearch}
                    onChange={(e) => setAutoPilotAppSearch(e.target.value)}
                    className="w-full text-xs pl-8.5 pr-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Responsive App Selection Grid */}
              <div className="max-h-60 overflow-y-auto pr-1 scrollbar-thin grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {autopilotFilteredApps.map(app => {
                  const idStr = String(app.id || app.slug || '');
                  const isSelected = selectedAutoPilotAppIds.includes(idStr) || selectedAutoPilotAppIds.includes(String(app.id)) || selectedAutoPilotAppIds.includes(String(app.slug));
                  return (
                    <div
                      key={app.id || app.slug}
                      onClick={() => onToggleAutoPilotApp(idStr)}
                      className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                        isSelected
                          ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-500 text-slate-900 dark:text-white shadow-xs'
                          : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 dark:border-slate-600'
                      }`}>
                        {isSelected && <Check size={11} />}
                      </div>

                      {app.icon_url ? (
                        <img
                          src={app.icon_url}
                          alt={app.name}
                          className="w-8 h-8 rounded-lg object-contain bg-white dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center font-bold text-xs text-emerald-600 shrink-0">
                          {app.name?.charAt(0) || 'A'}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold truncate text-slate-900 dark:text-white">
                          {app.name}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                          <span>{app.category || 'Card'}</span>
                          <span>•</span>
                          <span>{app.rating || '4.8'}★</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Brain 1 AI Engine & Quality Customization for Autopilot Queue */}
            <Brain1CustomizerPanel
              brain1Model={brain1Model}
              setBrain1Model={setBrain1Model}
              brain1Temperature={brain1Temperature}
              setBrain1Temperature={setBrain1Temperature}
              brain1ReviewLength={brain1ReviewLength}
              setBrain1ReviewLength={setBrain1ReviewLength}
              brain1PersonaProfile={brain1PersonaProfile}
              setBrain1PersonaProfile={setBrain1PersonaProfile}
              brain1FocusAspects={brain1FocusAspects}
              setBrain1FocusAspects={setBrain1FocusAspects}
              brain1LanguageStyle={brain1LanguageStyle}
              setBrain1LanguageStyle={setBrain1LanguageStyle}
              customPrompt={customPrompt}
              setCustomPrompt={setCustomPrompt}
              titlePrefix="Autopilot Queue"
            />

            {/* Queue Parameters & Destination */}
            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/70 space-y-4">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={15} className="text-emerald-500" />
                <h5 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Queue Execution Settings
                </h5>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Reviews per App */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Reviews per App
                  </label>
                  <select
                    value={autoPilotCountPerApp}
                    onChange={(e) => setAutoPilotCountPerApp(Number(e.target.value))}
                    className="w-full text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value={3}>3 Reviews per App</option>
                    <option value={5}>5 Reviews per App (Recommended)</option>
                    <option value={10}>10 Reviews per App</option>
                    <option value={15}>15 Reviews per App</option>
                  </select>
                </div>

                {/* Delay between apps */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Delay Between Apps
                  </label>
                  <select
                    value={autoPilotCycleDelay}
                    onChange={(e) => setAutoPilotCycleDelay(Number(e.target.value))}
                    className="w-full text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value={2}>2 Seconds Buffer</option>
                    <option value={3}>3 Seconds Buffer</option>
                    <option value={5}>5 Seconds Buffer</option>
                  </select>
                </div>

                {/* Destination: Downside Staging Deck vs Direct Firestore */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Database size={13} className="text-emerald-500" />
                    Queue Output Destination
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAutoPilotSaveDirectly(false)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        !autoPilotSaveDirectly
                          ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/30 shadow-xs'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <CheckCircle2 size={13} />
                      <span>Stage at Downside (Review First)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAutoPilotSaveDirectly(true)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        autoPilotSaveDirectly
                          ? 'bg-blue-50 dark:bg-blue-950/70 border-blue-500 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500/30 shadow-xs'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <Upload size={13} />
                      <span>Direct Upload to Firestore</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Skip Threshold Option */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-slate-700/60 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 font-medium">
                  <input
                    type="checkbox"
                    checked={autoPilotSkipReviews}
                    onChange={(e) => setAutoPilotSkipReviews(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Skip apps that already have more than threshold reviews</span>
                </label>

                {autoPilotSkipReviews && (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-xs font-bold">Skip threshold:</span>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={autoPilotSkipThreshold}
                      onChange={(e) => setAutoPilotSkipThreshold(Number(e.target.value))}
                      className="w-16 px-2 py-1 text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-center"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Queue Execution Status & Actions */}
            <div className="space-y-4">
              {/* If Running: Live Progress Bar & Current App Banner */}
              {autoPilotRunning && (
                <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-4.5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                        <RefreshCw size={16} className="animate-spin" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-emerald-300 uppercase tracking-wider">
                          Brain 1 Autopilot Processing App {autoPilotProgress.current + 1} of {autoPilotProgress.total} ({autoPilotProgress.percent}%)
                        </div>
                        <div className="text-sm font-bold text-white flex items-center gap-2 mt-0.5">
                          <span>{autoPilotCurrentApp?.name || 'Loading App...'}</span>
                          {autoPilotCurrentApp?.category && (
                            <span className="text-[10px] px-2 py-0.2 rounded bg-emerald-900/80 text-emerald-300 font-semibold">
                              {autoPilotCurrentApp.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {autoPilotProgress.percent}% Complete
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                      style={{ width: `${autoPilotProgress.percent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Queue Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex flex-wrap items-center gap-3">
                  {!autoPilotRunning ? (
                    <button
                      onClick={onStartAutoPilotQueue}
                      disabled={selectedAutoPilotAppIds.length === 0}
                      className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-xs shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/40 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Play size={16} />
                      <span>Launch Brain 1 Autopilot Queue ({selectedAutoPilotAppIds.length} Apps)</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      {autoPilotPaused ? (
                        <button
                          onClick={onResumeAutoPilotQueue}
                          className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-600/20"
                        >
                          <Play size={15} />
                          <span>Resume Queue</span>
                        </button>
                      ) : (
                        <button
                          onClick={onPauseAutoPilotQueue}
                          className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-md shadow-amber-500/20"
                        >
                          <Pause size={15} />
                          <span>Pause Queue</span>
                        </button>
                      )}
                      <button
                        onClick={onStopAutoPilotQueue}
                        className="px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-md shadow-rose-600/20"
                      >
                        <Square size={15} />
                        <span>Stop Queue</span>
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={onResetSession}
                  className="px-3.5 py-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                  title="Reset session telemetry and logs"
                >
                  <RotateCcw size={13} />
                  <span>Reset Telemetry</span>
                </button>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* 2. Telemetry HUD & Live Activity Terminal Console */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
        
        {/* Stage Pipeline Indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2 text-xs font-black text-slate-300 uppercase tracking-wider">
            <Activity size={15} className="text-emerald-400" />
            <span>Multitask Reasoning & Execution Pipeline</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold">
            {[
              { key: 'ingesting', label: '1. Ingest Dossier' },
              { key: 'reasoning', label: '2. Human Reasoning' },
              { key: 'synthesizing', label: '3. Draft Reviews' },
              { key: 'sanitizing', label: '4. Safety Guard' },
              { key: 'published', label: '5. Commit / Stage' }
            ].map((step) => {
              const isCurrent = autobotCurrentStage === step.key;
              return (
                <div
                  key={step.key}
                  className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
                    isCurrent
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30 scale-105'
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
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Generated</div>
            <div className="text-xl font-black text-emerald-400 mt-0.5">{autobotSessionStats.totalGenerated}</div>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <div className="text-[10px] uppercase font-bold text-slate-400">Auto-Published</div>
            <div className="text-xl font-black text-blue-400 mt-0.5">{autobotSessionStats.autoPublished}</div>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <div className="text-[10px] uppercase font-bold text-slate-400">Staged In Deck</div>
            <div className="text-xl font-black text-purple-400 mt-0.5">{autobotSessionStats.staged}</div>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <div className="text-[10px] uppercase font-bold text-slate-400">Cycles Run</div>
            <div className="text-xl font-black text-amber-400 mt-0.5">{autobotSessionStats.cyclesCompleted}</div>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <div className="text-[10px] uppercase font-bold text-slate-400">Engine Model</div>
            <div className="text-xs font-bold text-slate-300 mt-1 truncate">
              {autobotSessionStats.lastModel || 'gemini-3.8-flash'}
            </div>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <div className="text-[10px] uppercase font-bold text-slate-400">Last Latency</div>
            <div className="text-xs font-bold text-slate-300 mt-1">
              {autobotSessionStats.lastLatencyMs ? `${(autobotSessionStats.lastLatencyMs / 1000).toFixed(1)}s` : 'Ready'}
            </div>
          </div>
        </div>

        {/* Live Terminal Log Feed */}
        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 pb-2 border-b border-slate-800/80">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <Terminal size={14} />
              <span>Brain 1 Activity & Reasoning Feed</span>
            </span>
            <span className="text-[10px] text-slate-500">
              {autobotLogs.length} events logged this session
            </span>
          </div>

          <div className="h-44 overflow-y-auto font-mono text-[11px] space-y-1.5 pr-2 scrollbar-thin text-slate-300">
            {autobotLogs.length === 0 ? (
              <div className="text-slate-600 italic py-6 text-center">
                Terminal ready. Run Single Step or Launch Autopilot Queue to begin generating reviews.
              </div>
            ) : (
              autobotLogs.map((log) => {
                let colorClass = 'text-slate-300';
                if (log.type === 'success') colorClass = 'text-emerald-400 font-semibold';
                if (log.type === 'reasoning') colorClass = 'text-blue-400';
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
      {/* 3. DOWNSIDE STAGING DECK — GENERATED REVIEWS WORKSPACE */}
      {/* ========================================================================= */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <CheckSquare size={17} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Downside Review Deck</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800/80">
                  {stagedReviews.length} Staged Ready
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generated reviews appear here with app logo and name. Review or edit, then upload to Firestore.
              </p>
            </div>
          </div>
        </div>

        {stagedReviews.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl p-10 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
              <Sparkles size={22} />
            </div>
            <div className="max-w-md mx-auto">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                No reviews currently staged in the downside deck
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Choose an app above and click <strong>"Run Single Step (1-Shot)"</strong> or launch the <strong>"Multi-App Autopilot Queue"</strong> with staging destination. Generated reviews will appear here with the app logo and name ready for inspection and upload to Firestore.
              </p>
            </div>
          </div>
        ) : (
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

    </div>
  );
};
