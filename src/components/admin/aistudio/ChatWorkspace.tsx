import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  BrainCircuit, 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  RotateCcw,
  Bot,
  User,
  Sliders,
  Calendar,
  Star,
  Smile,
  CheckCircle,
  Clock,
  Layers,
  ArrowRight,
  Square,
  OctagonAlert,
  Settings2,
  ExternalLink
} from 'lucide-react';
import { 
  ChatMessage, 
  BrainMemoryDirective, 
  StudioConfig, 
  DateDistributionMode, 
  RatingMixMode, 
  LanguageToneMode, 
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
  isGenerating: boolean;
  isSendingChat: boolean;
  batchProgress: { current: number; total: number; percent: number; currentAppName?: string };
  showDirectives?: boolean;
  setShowDirectives?: (val: boolean) => void;
  showControlsDrawer?: boolean;
  setShowControlsDrawer?: (val: boolean) => void;
}

export const ChatWorkspace: React.FC<ChatWorkspaceProps> = ({
  chatHistory,
  directives,
  selectedAppIds,
  appsCount,
  config,
  websiteLogoUrl,
  siteTitle = 'RummyDex',
  onChangeConfig,
  onSendMessage,
  onAddDirective,
  onRemoveDirective,
  onClearChat,
  onTriggerGeneration,
  onStopGeneration,
  onOpenAppSelector,
  isGenerating,
  isSendingChat,
  batchProgress,
  showDirectives: externalShowDirectives,
  setShowDirectives: externalSetShowDirectives,
  showControlsDrawer: externalShowControlsDrawer,
  setShowControlsDrawer: externalSetShowControlsDrawer
}) => {
  const [inputText, setInputText] = useState('');
  const [internalShowDirectives, setInternalShowDirectives] = useState(false);
  const [internalShowControlsDrawer, setInternalShowControlsDrawer] = useState(false);
  const [newRuleInput, setNewRuleInput] = useState('');
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const showDirectives = externalShowDirectives !== undefined ? externalShowDirectives : internalShowDirectives;
  const setShowDirectives = externalSetShowDirectives || setInternalShowDirectives;

  const showControlsDrawer = externalShowControlsDrawer !== undefined ? externalShowControlsDrawer : internalShowControlsDrawer;
  const setShowControlsDrawer = externalSetShowControlsDrawer || setInternalShowControlsDrawer;

  // Auto scroll to bottom of chat
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

    // Check if user is issuing a stop command in chat
    const lower = msg.toLowerCase();
    const isStopCommand = 
      lower.includes('stop generating') || 
      lower.includes('stop the working') || 
      lower.includes('stop ai') || 
      lower === 'stop' || 
      lower === 'cancel';

    if (isStopCommand && isGenerating && onStopGeneration) {
      onStopGeneration();
      await onSendMessage(msg);
      return;
    }

    // Check if user is issuing a direct command to start generating
    const isStartCommand = 
      lower.startsWith('start generating') || 
      lower.startsWith('generate now') || 
      lower.startsWith('start now') ||
      lower === 'start' ||
      lower.includes('start generating reviews') ||
      lower.includes('start generation');

    await onSendMessage(msg);

    if (isStartCommand && !isGenerating && selectedAppIds.length > 0) {
      setTimeout(() => {
        onTriggerGeneration(msg);
      }, 600);
    }
  };

  const handleAddNewRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleInput.trim()) return;
    onAddDirective(newRuleInput.trim());
    setNewRuleInput('');
  };

  const QUICK_PROMPTS = [
    { label: '😊 Happy with Emojis', text: 'Today make reviews that all our customers are happy and write with natural emojis.' },
    { label: '🎯 Core Features & UI', text: 'Today let\'s generate reviews based on the core features and UI present on our website for each app.' },
    { label: '📱 Normal Everyday Users', text: 'Generate standard, normal everyday people reviews. Very balanced and natural for all categories.' },
    { label: '⏱️ Past 2 Days (No Future)', text: 'Distribute reviews across the past 2 days up to today without any future timestamps.' },
    { label: '🚀 Start Generating', text: 'Start generating reviews now for all selected apps.' }
  ];

  const totalReviewsToProduce = selectedAppIds.length * config.reviewsPerApp;
  const logoSrc = websiteLogoUrl || "https://res.cloudinary.com/diewalae4/image/upload/v1786624142/1000134293_sbicyb.png";

  return (
    <div className="bg-white dark:bg-slate-900 flex flex-col h-full w-full overflow-hidden">
      {/* Expandable Memory Rules Drawer */}
      {showDirectives && (
        <div className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 p-3 sm:p-4 text-xs space-y-2.5 shadow-inner flex-shrink-0 animate-in fade-in duration-150">
          <div className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <BrainCircuit className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Persistent Store Directives (applied to every generated comment):</span>
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
              placeholder="Add instruction (e.g., mention smooth fast UI, write in casual friendly tone)..."
              className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs"
            >
              <Plus className="w-3 h-3" />
              <span>Save</span>
            </button>
          </form>
        </div>
      )}

      {/* Expandable Automation Controls Drawer */}
      {showControlsDrawer && (
        <div className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 p-3 sm:p-4 text-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 shadow-inner flex-shrink-0 animate-in fade-in duration-150">
          {/* 1. Reviews per app */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Layers className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>Reviews Per App</span>
            </label>
            <select
              value={config.reviewsPerApp}
              onChange={e => onChangeConfig({ reviewsPerApp: Number(e.target.value) })}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-blue-500 font-medium"
            >
              <option value={1}>1 Review per app</option>
              <option value={2}>2 Reviews per app</option>
              <option value={3}>3 Reviews per app</option>
              <option value={5}>5 Reviews per app</option>
              <option value={10}>10 Reviews per app</option>
            </select>
          </div>

          {/* 2. Tone & Persona */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Smile className="w-3 h-3 text-amber-500 dark:text-amber-400" />
              <span>Tone & Style</span>
            </label>
            <select
              value={config.languageTone}
              onChange={e => onChangeConfig({ languageTone: e.target.value as LanguageToneMode })}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-blue-500 font-medium"
            >
              <option value="all_rounder_standard">Standard Everyday Users</option>
              <option value="happy_with_emojis">Happy with Emojis (😊👍⭐)</option>
              <option value="hinglish_natural">Casual Indian / Hinglish</option>
              <option value="natural_english">Everyday Casual English</option>
              <option value="short_punchy">Short & Punchy (1-2 lines)</option>
              <option value="detailed_feedback">Detailed Experience</option>
            </select>
          </div>

          {/* 3. Date Distribution */}
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
              <option value="today_only">100% Today (Up to current hour)</option>
              <option value="yesterday_only">100% Yesterday</option>
              <option value="last_3_days">Past 3 Days</option>
              <option value="last_7_days">Past 7 Days</option>
            </select>
          </div>

          {/* 4. Publish Mode */}
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

      {/* Main Conversation Stream - Fills 100% of the Available Viewport */}
      <div 
        ref={chatScrollRef}
        className="flex-1 p-3.5 sm:p-5 overflow-y-auto space-y-4 bg-slate-50/70 dark:bg-slate-950/80"
      >
        {chatHistory.length === 0 ? (
          <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-6 space-y-3.5">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-lg p-2">
              <img 
                src={logoSrc} 
                alt={siteTitle} 
                className="w-full h-full object-contain" 
                onError={e => { (e.target as HTMLElement).style.display = 'none'; }}
              />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{siteTitle} Review Assistant</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mt-1.5 leading-relaxed">
                Chat to define today’s review angle, tone, emojis, or core features. 
                When ready, say <span className="text-emerald-600 dark:text-emerald-400 font-bold">"Start generating"</span> or click Generate. 
                I will inspect each app's real website content and write authentic human comments.
              </p>
            </div>

            {onOpenAppSelector && (
              <button
                type="button"
                onClick={onOpenAppSelector}
                className="mt-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-2 border border-slate-200 dark:border-slate-700 transition cursor-pointer shadow-xs active:scale-95"
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
              className={`flex gap-3 text-xs leading-relaxed ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-xl overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs p-1">
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
                className={`max-w-[85%] rounded-2xl p-3.5 shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-xs'
                    : 'bg-white dark:bg-slate-800/95 border border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 rounded-bl-xs'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
                <div className="text-[10px] text-right mt-1.5 opacity-60">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-xs shadow-xs">
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
              <span>Understanding your directive...</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Suggestion Pills */}
      <div className="px-3 py-2 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-shrink-0">
        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider flex-shrink-0 mr-1">
          Quick Prompts:
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
      <div className="p-2.5 sm:p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex-shrink-0">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            disabled={isSendingChat}
            placeholder="Discuss review strategy or type 'Start generating'..."
            className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:border-blue-500 transition-all font-medium"
          />

          {isGenerating ? (
            <button
              type="button"
              onClick={onStopGeneration}
              className="px-3.5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 flex-shrink-0"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>Stop</span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={!inputText.trim() || isSendingChat}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs sm:text-sm font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 flex-shrink-0"
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
