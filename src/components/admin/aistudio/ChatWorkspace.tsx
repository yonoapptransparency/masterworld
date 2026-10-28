import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  BrainCircuit,
  Plus,
  Trash2,
  ChevronUp,
  User,
  Calendar,
  Star,
  Smile,
  CheckCircle,
  Layers,
  Square,
  ShoppingBag,
  Edit3,
  X
} from 'lucide-react';
import {
  ChatMessage,
  BrainMemoryDirective,
  StudioConfig,
  DateDistributionMode,
  RatingMixMode,
  LanguageToneMode,
  PlatformCommentStyle,
  PublishMode
} from './types';

interface ChatWorkspaceProps {
  chatHistory: ChatMessage[];
  directives: BrainMemoryDirective[];
  selectedAppIds: string[];
  appsCount: number;
  config: StudioConfig;
  websiteLogoUrl?: string;
  siteTitle?: string;
  onChangeConfig: (updates: Partial<StudioConfig>) => void;
  onSendMessage: (text: string) => Promise<void>;
  onAddDirective: (rule: string) => void;
  onRemoveDirective: (id: string) => void;
  onClearChat: () => void;
  onTriggerGeneration: (customInstruction?: string) => Promise<void>;
  onStopGeneration?: () => void;
  onOpenAppSelector?: () => void;
  onOpenStagedDeck?: () => void;
  isGenerating: boolean;
  isSendingChat: boolean;
  batchProgress: { current: number; total: number; percent: number; currentAppName?: string };
  showDirectives?: boolean;
  setShowDirectives?: (val: boolean) => void;
  showControlsDrawer?: boolean;
  setShowControlsDrawer?: (val: boolean) => void;
  aiStatus?: {
    status: 'connected' | 'disconnected' | 'testing';
    latencyMs?: number;
    model: string;
  };
}

export const ChatWorkspace: React.FC<ChatWorkspaceProps> = ({
  chatHistory,
  directives,
  selectedAppIds,
  config,
  websiteLogoUrl,
  siteTitle = 'RummyDex',
  onChangeConfig,
  onSendMessage,
  onAddDirective,
  onRemoveDirective,
  onTriggerGeneration,
  onStopGeneration,
  onOpenAppSelector,
  onOpenStagedDeck,
  isGenerating,
  isSendingChat,
  showDirectives: externalShowDirectives,
  setShowDirectives: externalSetShowDirectives,
  showControlsDrawer: externalShowControlsDrawer,
  setShowControlsDrawer: externalSetShowControlsDrawer,
  aiStatus
}) => {
  const [inputText, setInputText] = useState('');
  const [internalShowDirectives, setInternalShowDirectives] = useState(false);
  const [internalShowControlsDrawer, setInternalShowControlsDrawer] = useState(false);
  const [newRuleInput, setNewRuleInput] = useState('');
  const [isEditingFocus, setIsEditingFocus] = useState(false);
  const [focusDraft, setFocusDraft] = useState(config.activeSessionDirective || '');
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const showDirectives = externalShowDirectives !== undefined ? externalShowDirectives : internalShowDirectives;
  const setShowDirectives = externalSetShowDirectives || setInternalShowDirectives;

  const showControlsDrawer = externalShowControlsDrawer !== undefined ? externalShowControlsDrawer : internalShowControlsDrawer;
  const setShowControlsDrawer = externalSetShowControlsDrawer || setInternalShowControlsDrawer;

  useEffect(() => {
    setFocusDraft(config.activeSessionDirective || '');
  }, [config.activeSessionDirective]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatHistory, isSendingChat]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isSendingChat) return;
    const msg = inputText.trim();
    setInputText('');
    await onSendMessage(msg);
  };

  const handleAddNewRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleInput.trim()) return;
    onAddDirective(newRuleInput.trim());
    setNewRuleInput('');
  };

  const handleSaveFocus = (e: React.FormEvent) => {
    e.preventDefault();
    onChangeConfig({ activeSessionDirective: focusDraft.trim() });
    setIsEditingFocus(false);
  };

  const QUICK_PROMPTS = [
    {
      label: '🛒 Amazon / Flipkart Value Style',
      text: 'Write comments like real Amazon & Flipkart buyers focusing on what each app actually provides, value for time, expectations vs reality, and genuine trust.'
    },
    {
      label: '▶️ Play Store Authentic',
      text: 'Write authentic Google Play Store style reviews mentioning daily usage, specific modes/features from the app details, onboarding ease, and recent updates.'
    },
    {
      label: '🎬 Video & Walkthrough Angle',
      text: 'Include natural comments from users who watched the gameplay video/tutorial first and then tried the app’s modes and features themselves.'
    },
    {
      label: '🌐 Smart Multi-Platform Mix',
      text: 'Use a smart multi-platform mix (Play Store + Amazon/Flipkart value + Video/Social + Player Community) so every comment talks about a different real-world angle.'
    },
    {
      label: '🇮🇳 Natural Hinglish Mix',
      text: 'Write in casual, natural Indian Hinglish mixed with English, talking about what the app provides without repeating the same phrases.'
    },
    {
      label: '⚡ Match Catalog Stars',
      text: 'Generate reviews strictly matching each app’s official catalog rating score.'
    },
    {
      label: '🚀 Start Generating Now',
      text: 'Start generating reviews now for all selected apps.'
    }
  ];

  const logoSrc = websiteLogoUrl || 'https://res.cloudinary.com/diewalae4/image/upload/v1786624142/1000134293_sbicyb.png';

  return (
    <div className="bg-white dark:bg-slate-900 flex flex-col h-full w-full overflow-hidden">
      {/* Expandable Memory Rules Drawer */}
      {showDirectives && (
        <div className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 p-3 sm:p-4 text-xs space-y-2.5 shadow-inner flex-shrink-0 animate-in fade-in duration-150">
          <div className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <BrainCircuit className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Persistent Store Directives (saved to cloud & local memory, applied to every comment):</span>
            </div>
            <button
              type="button"
              onClick={() => setShowDirectives(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {directives.map(dir => (
              <div key={dir.id} className="flex items-center justify-between gap-2 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                <span className="text-slate-800 dark:text-slate-200 text-xs leading-tight">{dir.rule}</span>
                <button
                  onClick={() => onRemoveDirective(dir.id)}
                  className="text-slate-400 hover:text-rose-500 p-1 transition cursor-pointer"
                  title="Remove rule"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          <form onSubmit={handleAddNewRule} className="flex gap-2 pt-1">
            <input
              type="text"
              value={newRuleInput}
              onChange={e => setNewRuleInput(e.target.value)}
              placeholder="Add permanent rule (e.g., focus on what the app provides, avoid repetitive technical clichés)..."
              className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 font-medium"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs active:scale-95 transition"
            >
              <Plus className="w-3 h-3" />
              <span>Save Rule</span>
            </button>
          </form>
        </div>
      )}

      {/* Expandable Automation Controls Drawer */}
      {showControlsDrawer && (
        <div className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 p-3 sm:p-4 text-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 shadow-inner flex-shrink-0 animate-in fade-in duration-150">
          {/* 1. Platform Comment Psychology */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <ShoppingBag className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>Platform Comment Style</span>
            </label>
            <select
              value={config.platformStyle || 'smart_multi_platform'}
              onChange={e => onChangeConfig({ platformStyle: e.target.value as PlatformCommentStyle })}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-emerald-500 font-bold"
            >
              <option value="smart_multi_platform">🌐 Smart Multi-Platform Mix (Best)</option>
              <option value="amazon_flipkart_value">🛒 Amazon / Flipkart ("What It Provides")</option>
              <option value="play_store_authentic">▶️ Google Play Store Authentic</option>
              <option value="youtube_video_social">🎬 YouTube / Video & Walkthrough</option>
              <option value="community_player_forum">💬 Player Community & Word-of-Mouth</option>
            </select>
          </div>

          {/* 2. Reviews per app */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Layers className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>Reviews Per App</span>
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                {config.reviewsPerApp} each
              </span>
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min={1}
                max={500}
                value={config.reviewsPerApp || 1}
                onChange={e => {
                  const val = Math.max(1, Math.min(500, parseInt(e.target.value, 10) || 1));
                  onChangeConfig({ reviewsPerApp: val });
                }}
                className="w-16 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-blue-500 font-bold text-center"
              />
              <select
                value={[1, 2, 3, 5, 10, 20, 50].includes(config.reviewsPerApp) ? config.reviewsPerApp : 'custom'}
                onChange={e => {
                  if (e.target.value !== 'custom') {
                    onChangeConfig({ reviewsPerApp: Number(e.target.value) });
                  }
                }}
                className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-blue-500 font-medium"
              >
                <option value={1}>1 Review</option>
                <option value={2}>2 Reviews</option>
                <option value={3}>3 Reviews</option>
                <option value={5}>5 Reviews</option>
                <option value={10}>10 Reviews</option>
                <option value={20}>20 Reviews</option>
                <option value={50}>50 Reviews</option>
                <option value="custom">Custom...</option>
              </select>
            </div>
          </div>

          {/* 3. Rating Strategy */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-500 fill-current" />
              <span>Star Rating Control</span>
            </label>
            <select
              value={config.ratingMix}
              onChange={e => onChangeConfig({ ratingMix: e.target.value as RatingMixMode })}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-blue-500 font-bold"
            >
              <option value="auto_app_rating">⚡ Auto (Match Catalog Rating)</option>
              <option value="all_5_star">⭐⭐⭐⭐⭐ All 5-Star (100%)</option>
              <option value="all_4_star">⭐⭐⭐⭐ All 4-Star (100%)</option>
              <option value="organic_full_mix">🎲 Full Organic Mix (1★ to 5★)</option>
              <option value="critical_bugs">⚠️ Critical & Bugs (1★ & 2★ only)</option>
              <option value="all_3_star">⭐⭐⭐ All 3-Star (Neutral)</option>
              <option value="all_2_star">⭐⭐ All 2-Star (Missing Features)</option>
              <option value="all_1_star">⭐ All 1-Star (Crashes & Bugs)</option>
              <option value="natural">👍 Naturally Positive (75% 5★, 20% 4★)</option>
              <option value="balanced_critical">⚖️ Balanced Critical (50% 5★, 30% 4★)</option>
            </select>
          </div>

          {/* 4. Tone & Persona */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Smile className="w-3 h-3 text-amber-500 dark:text-amber-400" />
              <span>Voice & Language</span>
            </label>
            <select
              value={config.languageTone}
              onChange={e => onChangeConfig({ languageTone: e.target.value as LanguageToneMode })}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-blue-500 font-medium"
            >
              <option value="all_rounder_standard">Standard Everyday Users</option>
              <option value="happy_with_emojis">Happy with Emojis (😊👍⭐)</option>
              <option value="super_excited_emojis">Super Excited & Passionate (🔥🚀💯)</option>
              <option value="hinglish_natural">Casual Indian / Hinglish</option>
              <option value="natural_english">Everyday Casual English</option>
              <option value="short_punchy">Short & Punchy (1-2 lines)</option>
              <option value="detailed_feedback">Detailed Experience (2-3 lines)</option>
              <option value="honest_balanced">Honest & Balanced Praise</option>
              <option value="feature_focused">Features & What App Provides</option>
              <option value="beginner_friendly">Beginner / First-Time User</option>
              <option value="daily_regular_user">Loyal Regular User</option>
            </select>
          </div>

          {/* 5. Date Distribution */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
              <span>Date Timeline (No Future)</span>
            </label>
            <select
              value={config.dateMode}
              onChange={e => onChangeConfig({ dateMode: e.target.value as DateDistributionMode })}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-blue-500 font-medium"
            >
              <option value="today_and_yesterday">50% Today, 50% Yesterday</option>
              <option value="today_only">100% Today (Up to Current Hour)</option>
              <option value="today_morning">Today Morning / Daytime Only</option>
              <option value="today_evening">Today Evening / Night Only</option>
              <option value="yesterday_only">100% Yesterday</option>
              <option value="last_2_days">Past 48 Hours</option>
              <option value="last_3_days">Past 3 Days</option>
              <option value="last_5_days">Past 5 Days</option>
              <option value="last_7_days">Past 7 Days</option>
              <option value="last_15_days">Past 15 Days</option>
              <option value="last_30_days">Past 30 Days</option>
            </select>
          </div>

          {/* 6. Publish Target */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
              <span>Publish Target</span>
            </label>
            <select
              value={config.publishMode}
              onChange={e => onChangeConfig({ publishMode: e.target.value as PublishMode })}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-blue-500 font-medium"
            >
              <option value="wait_approve">Stage in Deck (Review First)</option>
              <option value="auto_direct">Direct to Live Community</option>
            </select>
          </div>
        </div>
      )}

      {/* Active Session Status & Editable Focus Bar */}
      <div className="bg-slate-100/90 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 px-2.5 sm:px-3.5 py-1.5 text-[11px] flex items-center justify-between gap-2 flex-shrink-0 flex-wrap">
        <div className="flex items-center gap-1.5 flex-1 min-w-[200px] overflow-hidden">
          <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 flex-shrink-0">
            <Sparkles className="w-3 h-3" />
            <span>Active Instruction:</span>
          </span>

          {isEditingFocus ? (
            <form onSubmit={handleSaveFocus} className="flex items-center gap-1.5 flex-1">
              <input
                type="text"
                value={focusDraft}
                onChange={e => setFocusDraft(e.target.value)}
                placeholder="Type exact instruction for review generation..."
                className="flex-1 bg-white dark:bg-slate-950 border border-emerald-500 rounded px-2 py-0.5 text-[11px] text-slate-900 dark:text-white focus:outline-none"
                autoFocus
              />
              <button
                type="submit"
                className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold text-[10px] cursor-pointer"
              >
                Lock In
              </button>
              <button
                type="button"
                onClick={() => setIsEditingFocus(false)}
                className="p-0.5 text-slate-400 hover:text-slate-200"
              >
                <X className="w-3 h-3" />
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-1.5 overflow-hidden">
              <span
                onClick={() => setIsEditingFocus(true)}
                className="truncate text-slate-800 dark:text-slate-200 font-medium cursor-pointer hover:underline"
                title="Click to edit active session instruction"
              >
                "{config.activeSessionDirective || 'Multi-platform human reviews grounded in what each app provides, features, FAQs & videos'}"
              </span>
              <button
                type="button"
                onClick={() => setIsEditingFocus(true)}
                className="text-slate-400 hover:text-emerald-500 p-0.5 flex-shrink-0 cursor-pointer"
                title="Edit Active Instruction"
              >
                <Edit3 className="w-3 h-3" />
              </button>
              {config.activeSessionDirective && (
                <button
                  type="button"
                  onClick={() => onChangeConfig({ activeSessionDirective: '' })}
                  className="text-slate-400 hover:text-rose-500 p-0.5 flex-shrink-0 cursor-pointer"
                  title="Reset Active Instruction"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0 text-[10px] flex-wrap">
          <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-300 font-bold">
            {config.platformStyle === 'amazon_flipkart_value'
              ? '🛒 Amazon/Flipkart Value'
              : config.platformStyle === 'play_store_authentic'
              ? '▶️ Play Store Style'
              : config.platformStyle === 'youtube_video_social'
              ? '🎬 Video/Social Style'
              : config.platformStyle === 'community_player_forum'
              ? '💬 Community Forum'
              : '🌐 Multi-Platform Mix'}
          </span>
          <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-bold">
            {config.ratingMix === 'auto_app_rating' ? '⚡ Auto App Rating' : config.ratingMix.replace(/_/g, ' ')}
          </span>
          <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 font-semibold">
            {config.reviewsPerApp} / app
          </span>
        </div>
      </div>

      {/* Main Conversation Stream */}
      <div
        ref={chatScrollRef}
        className="flex-1 min-h-0 p-3 sm:p-4 md:p-5 overflow-y-auto space-y-3 sm:space-y-4 bg-slate-50/70 dark:bg-slate-950/80"
      >
        {chatHistory.length === 0 ? (
          <div className="h-full min-h-[260px] flex flex-col items-center justify-center text-center p-4 sm:p-6 space-y-3.5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-lg p-2">
              <img
                src={logoSrc}
                alt={siteTitle}
                className="w-full h-full object-contain"
                onError={e => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                {siteTitle} Multi-Platform Review Brain
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mt-1.5 leading-relaxed">
                Tell me how you want comments crafted today (Play Store, Amazon/Flipkart value & what the app provides, YouTube video walkthrough reactions, or Hinglish). I retain our entire conversation when generating!
              </p>
            </div>

            {onOpenAppSelector && (
              <button
                type="button"
                onClick={onOpenAppSelector}
                className="mt-1 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-2 border border-slate-200 dark:border-slate-700 transition cursor-pointer shadow-xs active:scale-95"
              >
                <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Target Apps ({selectedAppIds.length} Selected)</span>
              </button>
            )}
          </div>
        ) : (
          chatHistory.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-2.5 sm:gap-3 text-xs leading-relaxed ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs p-1">
                  <img
                    src={logoSrc}
                    alt={siteTitle}
                    className="w-full h-full object-contain"
                    onError={e => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              <div
                className={`max-w-[88%] sm:max-w-[82%] rounded-2xl p-3 sm:p-3.5 shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-xs'
                    : 'bg-white dark:bg-slate-800/95 border border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 rounded-bl-xs'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed break-words">{msg.text}</div>

                {/* Live Inline Preview of Generated Reviews */}
                {msg.previewReviews && msg.previewReviews.length > 0 && (
                  <div className="mt-2.5 pt-2.5 border-t border-slate-200 dark:border-slate-700/80 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      <span>Sample Generated Reviews ({msg.previewReviews.length}):</span>
                      {onOpenStagedDeck && (
                        <button
                          type="button"
                          onClick={onOpenStagedDeck}
                          className="underline hover:text-emerald-300 cursor-pointer"
                        >
                          Open Staged Deck →
                        </button>
                      )}
                    </div>
                    {msg.previewReviews.map((rev, rIdx) => (
                      <div
                        key={rIdx}
                        className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/60 text-[11px]"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-900 dark:text-slate-100">{rev.userName}</span>
                          <span className="text-amber-500 font-bold">{'★'.repeat(rev.rating)}{'☆'.repeat(Math.max(0, 5 - rev.rating))}</span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 leading-snug">{rev.reviewText}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 text-[10px] mt-1.5 opacity-65">
                  {msg.modelUsed && (
                    <span className="font-mono px-1.5 py-0.2 rounded bg-black/10 dark:bg-white/10">
                      {msg.modelUsed}
                    </span>
                  )}
                  <span>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
              {msg.sender === 'user' && (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-xs shadow-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))
        )}

        {isSendingChat && (
          <div className="flex gap-3 text-xs leading-relaxed justify-start">
            <div className="w-8 h-8 rounded-xl overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 flex items-center justify-center flex-shrink-0 p-1 animate-pulse">
              <img src={logoSrc} alt={siteTitle} className="w-full h-full object-contain" />
            </div>
            <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-3 text-slate-500 dark:text-slate-400 rounded-bl-xs flex items-center gap-2 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Thinking with {aiStatus?.model || config.model || 'Gemini'}...</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Suggestion Pills */}
      <div className="px-2.5 sm:px-3 py-1.5 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-shrink-0">
        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider flex-shrink-0 mr-1">
          Presets:
        </span>
        {QUICK_PROMPTS.map((qp, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSendMessage(qp.text)}
            className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/90 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition flex-shrink-0 border border-slate-200 dark:border-slate-700/60 whitespace-nowrap cursor-pointer active:scale-95 font-medium"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Input Message Form & Execution Bar */}
      <div className="p-2 sm:p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex-shrink-0">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            disabled={isSendingChat}
            placeholder="Tell AI how to build reviews (e.g. 'Write like Flipkart/Amazon buyers about what the app provides')..."
            className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 sm:px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:border-blue-500 transition-all font-medium"
          />

          {isGenerating ? (
            <button
              type="button"
              onClick={onStopGeneration}
              className="px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 flex-shrink-0"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>Stop</span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={!inputText.trim() || isSendingChat}
              className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs sm:text-sm font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 flex-shrink-0"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          )}
        </form>
      </div>
    </div>
  );
};
