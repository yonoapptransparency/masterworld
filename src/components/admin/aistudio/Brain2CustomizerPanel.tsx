import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Cpu, 
  Key, 
  Flame, 
  UserCheck, 
  AlignLeft, 
  Languages, 
  Tag, 
  Sparkles, 
  Check, 
  Info,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Zap,
  Globe
} from 'lucide-react';

export interface Brain2CustomizerPanelProps {
  model: string;
  onModelChange: (model: string) => void;
  temperature: number;
  onTemperatureChange: (temp: number) => void;
  personaProfile: 'community_mix' | 'tech_performance' | 'daily_gamers' | 'casual_explorers' | 'constructive_critics';
  onPersonaProfileChange: (profile: 'community_mix' | 'tech_performance' | 'daily_gamers' | 'casual_explorers' | 'constructive_critics') => void;
  reviewLength: 'mixed' | 'short' | 'realistic' | 'detailed';
  onReviewLengthChange: (length: 'mixed' | 'short' | 'realistic' | 'detailed') => void;
  languageStyle: 'proper_english' | 'hinglish' | 'natural_mix';
  onLanguageStyleChange: (style: 'proper_english' | 'hinglish' | 'natural_mix') => void;
  focusVectors: string[];
  onToggleFocusVector: (vector: string) => void;
  onClearFocusVectors: () => void;
  customQuery: string;
  onCustomQueryChange: (query: string) => void;
  adminFetch: (url: string, init?: RequestInit) => Promise<Response>;
}

const AVAILABLE_BRAIN2_MODELS = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', badge: 'Recommended for Search Grounding', desc: 'Fastest real-time web crawler & synthesis' },
  { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash', badge: 'Flagship Default', desc: 'Next-generation multimodal reasoning' },
  { id: 'gemini-3.7-pro', name: 'Gemini 3.7 Pro', badge: 'Deep Reasoning', desc: 'Maximum depth & comprehensive reasoning' },
  { id: 'gemini-3.7-flash', name: 'Gemini 3.7 Flash', badge: 'Hybrid Analytical', desc: 'Balanced speed and deep nuance' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', badge: 'Long Context Pro', desc: '1M+ token context window depth' },
  { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite', badge: 'Ultra-Fast', desc: 'Lowest latency & light footprint' },
  { id: 'gemini-flash-latest', name: 'Gemini Flash Latest', badge: 'Auto-Updated', desc: 'Always latest stable Flash model' }
];

const PRESET_TEMPERATURES = [
  { val: 0.30, label: '0.30 Strict & Grounded' },
  { val: 0.70, label: '0.70 Balanced' },
  { val: 0.85, label: '0.85 Play Store Organic ★' },
  { val: 1.05, label: '1.05 High Diversity' }
];

const PERSONA_OPTIONS = [
  {
    id: 'community_mix',
    label: 'Play Store Community Mix',
    badge: 'Organic Mix',
    desc: 'Real everyday users across diverse backgrounds, casual and experienced alike.'
  },
  {
    id: 'tech_performance',
    label: 'Tech & Performance Testers',
    badge: 'Hardware & FPS',
    desc: 'Mentions 60fps, device heating, battery drain, RAM memory, and 4G/5G ping.'
  },
  {
    id: 'daily_gamers',
    label: 'Active Daily Gamers',
    badge: 'Gameplay & Flow',
    desc: 'Focuses on matchmaking speed, daily tournaments, table flow, and game fairness.'
  },
  {
    id: 'casual_explorers',
    label: 'Casual Explorers',
    badge: 'UX & Visuals',
    desc: 'Values intuitive layout, clean aesthetics, soothing sound, and casual sessions.'
  },
  {
    id: 'constructive_critics',
    label: 'Constructive Reviewers',
    badge: 'Balanced Feedback',
    desc: 'Balanced reviews paired with thoughtful feature wishes and update feedback.'
  }
];

const LENGTH_OPTIONS = [
  {
    id: 'mixed',
    label: 'Play Store Mixed',
    badge: 'Realistic Mix',
    desc: 'Organic variety: some 1-line reactions, medium feedback, and detailed reviews.'
  },
  {
    id: 'short',
    label: 'Crisp & Punchy',
    badge: '1–2 Sentences',
    desc: 'Concise and to the point. Ideal for fast scanning and clean mobile feeds.'
  },
  {
    id: 'realistic',
    label: 'Authentic Balanced',
    badge: '2–3 Sentences',
    desc: 'The sweet spot for Google Play Store reviews addressing real features.'
  },
  {
    id: 'detailed',
    label: 'In-Depth Web Review',
    badge: '3–4 Sentences',
    desc: 'Comprehensive multi-aspect analysis of gameplay, stability, and UI.'
  }
];

const LANGUAGE_OPTIONS = [
  {
    id: 'proper_english',
    label: 'Clean English',
    badge: 'Standard Gamer',
    desc: 'Natural, fluent English without Hindi slang.'
  },
  {
    id: 'hinglish',
    label: 'Casual Hinglish',
    badge: 'Desi Voice',
    desc: 'Authentic Indian slang ("Mast game hai", "Smooth gameplay", "Bhai update badhiya hai").'
  },
  {
    id: 'natural_mix',
    label: 'Natural 60/40 Mix',
    badge: 'Most Authentic',
    desc: 'Realistic Indian community blend: ~60% English, ~40% natural Hinglish.'
  }
];

const FOCUS_VECTOR_CHIPS = [
  'Latest Update & Patch Feedback',
  '60 FPS Animation & Stutter Check',
  'Network Reconnect & 4G/5G Stability',
  'UI Layout & Card Sorting Responsiveness',
  'Bugs, Glitches & Edge Cases',
  'Community Feature Wishes & Suggestions',
  'Battery & Thermal Optimization',
  'Fair Play & Fast Matchmaking'
];

export const Brain2CustomizerPanel: React.FC<Brain2CustomizerPanelProps> = ({
  model,
  onModelChange,
  temperature,
  onTemperatureChange,
  personaProfile,
  onPersonaProfileChange,
  reviewLength,
  onReviewLengthChange,
  languageStyle,
  onLanguageStyleChange,
  focusVectors,
  onToggleFocusVector,
  onClearFocusVectors,
  customQuery,
  onCustomQueryChange,
  adminFetch
}) => {
  const [apiKeyInfo, setApiKeyInfo] = useState<{
    hasDedicatedResearchKey: boolean;
    activeKeyName: string;
    keySource: string;
    availableKeysCount: number;
  } | null>(null);
  const [loadingKeyInfo, setLoadingKeyInfo] = useState<boolean>(false);

  const fetchKeyInfo = async () => {
    setLoadingKeyInfo(true);
    try {
      const res = await adminFetch('/api/v1/admin/community/brain2/status');
      if (res.ok) {
        const data = await res.json();
        if (data.apiKeyInfo) {
          setApiKeyInfo(data.apiKeyInfo);
        }
      }
    } catch (e) {
      console.warn("Could not fetch Brain 2 key info:", e);
    } finally {
      setLoadingKeyInfo(false);
    }
  };

  useEffect(() => {
    fetchKeyInfo();
  }, []);

  return (
    <div className="bg-slate-50 dark:bg-slate-900/70 border border-indigo-200/80 dark:border-indigo-900/60 rounded-3xl p-5 space-y-6 shadow-sm">
      
      {/* Header with Title & API Key Status Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600/10 dark:bg-indigo-400/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Sliders size={18} />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>Brain 2 Web Research & Model Customizer</span>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                100% Configurable
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Fine-tune Gemini models, temperature, persona profiles, comment lengths, language, and search focus.
            </p>
          </div>
        </div>

        {/* API Key Status Pill */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-2xl shadow-2xs shrink-0">
          <Key size={13} className="text-amber-500" />
          <div className="text-[11px] leading-tight">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
              <span className={`w-2 h-2 rounded-full ${apiKeyInfo?.hasDedicatedResearchKey ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'}`} />
              <span>{apiKeyInfo?.activeKeyName || 'GEMINI_RESEARCH_API_KEY'}</span>
            </div>
            <div className="text-[9px] text-slate-400 font-medium">
              {apiKeyInfo?.keySource || 'Dedicated Web Research API Vault'}
            </div>
          </div>
          <button
            onClick={fetchKeyInfo}
            disabled={loadingKeyInfo}
            className="text-slate-400 hover:text-indigo-500 ml-1 cursor-pointer transition-colors"
            title="Refresh Key Status"
          >
            <RefreshCw size={11} className={loadingKeyInfo ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Row 1: Model Selection & Temperature Control */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Model Selector (7 cols) */}
        <div className="lg:col-span-7 space-y-2">
          <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Cpu size={14} className="text-indigo-500" />
              <span>AI Research & Grounding Model</span>
            </span>
            <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-bold">
              {model}
            </span>
          </label>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {AVAILABLE_BRAIN2_MODELS.map((m) => {
              const isSelected = model === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onModelChange(m.id)}
                  className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-400/30'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {m.name}
                    </span>
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                        <Check size={10} />
                      </span>
                    )}
                  </div>
                  <div className="mt-1">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}>
                      {m.badge}
                    </span>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                      {m.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Temperature & Creativity (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Flame size={14} className="text-amber-500" />
                <span>Creativity & Temperature</span>
              </label>
              <span className="text-xs font-mono font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800">
                {temperature.toFixed(2)}
              </span>
            </div>

            <input
              type="range"
              min="0.20"
              max="1.15"
              step="0.05"
              value={temperature}
              onChange={(e) => onTemperatureChange(parseFloat(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
            />

            <div className="grid grid-cols-2 gap-1.5 pt-1">
              {PRESET_TEMPERATURES.map((preset) => (
                <button
                  key={preset.val}
                  type="button"
                  onClick={() => onTemperatureChange(preset.val)}
                  className={`px-2 py-1.5 text-[10px] font-bold rounded-lg border transition-all cursor-pointer text-center truncate ${
                    Math.abs(temperature - preset.val) < 0.03
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200/70 dark:border-slate-800">
            <strong className="text-slate-700 dark:text-slate-300">Grounding Rule:</strong> 0.70–0.85 generates authentic diverse sentence lengths matching live Google Play Store user distribution.
          </div>
        </div>

      </div>

      {/* Row 2: Persona Profile & Review Length Format */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Player Persona Profile */}
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <UserCheck size={14} className="text-indigo-500" />
              <span>Reviewer Persona Profile</span>
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              {PERSONA_OPTIONS.find(p => p.id === personaProfile)?.badge}
            </span>
          </label>
          
          <div className="space-y-1.5">
            {PERSONA_OPTIONS.map((p) => {
              const isSelected = personaProfile === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onPersonaProfileChange(p.id as any)}
                  className={`w-full p-2.5 rounded-xl text-left border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-indigo-50/90 dark:bg-indigo-950/70 border-indigo-500 ring-1 ring-indigo-400/40'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900 dark:text-white">
                        {p.label}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}>
                        {p.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                      {p.desc}
                    </p>
                  </div>
                  {isSelected && (
                    <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                      <Check size={10} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Review Length & Depth Format */}
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <AlignLeft size={14} className="text-indigo-500" />
              <span>Review Length & Depth Format</span>
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              {LENGTH_OPTIONS.find(l => l.id === reviewLength)?.badge}
            </span>
          </label>
          
          <div className="space-y-1.5">
            {LENGTH_OPTIONS.map((l) => {
              const isSelected = reviewLength === l.id;
              return (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => onReviewLengthChange(l.id as any)}
                  className={`w-full p-2.5 rounded-xl text-left border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-indigo-50/90 dark:bg-indigo-950/70 border-indigo-500 ring-1 ring-indigo-400/40'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900 dark:text-white">
                        {l.label}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}>
                        {l.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                      {l.desc}
                    </p>
                  </div>
                  {isSelected && (
                    <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                      <Check size={10} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Row 3: Commenter Voice & Language Style */}
      <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Languages size={14} className="text-indigo-500" />
            <span>Commenter Voice & Language Style</span>
          </span>
          <span className="text-[10px] text-slate-400 font-bold">
            {LANGUAGE_OPTIONS.find(opt => opt.id === languageStyle)?.badge}
          </span>
        </label>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {LANGUAGE_OPTIONS.map((lang) => {
            const isSelected = languageStyle === lang.id;
            return (
              <button
                key={lang.id}
                type="button"
                onClick={() => onLanguageStyleChange(lang.id as any)}
                className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-indigo-50/90 dark:bg-indigo-950/70 border-indigo-500 ring-2 ring-indigo-400/30'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    {lang.label}
                  </span>
                  {isSelected && (
                    <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                      <Check size={10} />
                    </span>
                  )}
                </div>
                <div className="mt-1">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                    isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}>
                    {lang.badge}
                  </span>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {lang.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Row 4: Web Research Focus Vectors (Interactive Multi-Select Chips) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Tag size={14} className="text-indigo-500" />
            <span>Web Research Focus Vectors (Multi-Select Chips)</span>
          </label>
          {focusVectors.length > 0 && (
            <button
              type="button"
              onClick={onClearFocusVectors}
              className="text-[11px] font-bold text-rose-500 hover:text-rose-600 cursor-pointer"
            >
              Clear All ({focusVectors.length})
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {FOCUS_VECTOR_CHIPS.map((chip) => {
            const isSelected = focusVectors.includes(chip);
            return (
              <button
                key={chip}
                type="button"
                onClick={() => onToggleFocusVector(chip)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs scale-102'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                {isSelected ? <Check size={12} /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />}
                <span>{chip}</span>
              </button>
            );
          })}
        </div>
        <p className="text-[10px] text-slate-500 dark:text-slate-400">
          Selected vectors are injected into Gemini's search grounding directives to discover specific community reports.
        </p>
      </div>

      {/* Row 5: Custom Research Spark (Direct Prompt Input) */}
      <div className="space-y-1.5">
        <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Sparkles size={14} className="text-indigo-500" />
            <span>Special Admin Research Spark (Optional Custom Directives)</span>
          </span>
          {customQuery && (
            <button
              type="button"
              onClick={() => onCustomQueryChange('')}
              className="text-[10px] text-slate-400 hover:text-rose-500 cursor-pointer"
            >
              Clear
            </button>
          )}
        </label>
        <input
          type="text"
          value={customQuery}
          onChange={(e) => onCustomQueryChange(e.target.value)}
          placeholder="E.g., 'Focus specifically on card discard animations and battery drain on Android 14'..."
          className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

    </div>
  );
};
