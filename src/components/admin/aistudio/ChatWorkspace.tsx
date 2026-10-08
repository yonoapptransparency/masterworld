import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  BrainCircuit, 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Play, 
  RotateCcw,
  Bot,
  User,
  ShieldAlert
} from 'lucide-react';
import { ChatMessage, BrainMemoryDirective, StudioConfig } from './types';

interface ChatWorkspaceProps {
  chatHistory: ChatMessage[];
  directives: BrainMemoryDirective[];
  selectedAppIds: string[];
  appsCount: number;
  config: StudioConfig;
  onSendMessage: (text: string) => Promise<void>;
  onAddDirective: (rule: string) => void;
  onRemoveDirective: (id: string) => void;
  onClearChat: () => void;
  onTriggerGeneration: (customInstruction?: string) => Promise<void>;
  isGenerating: boolean;
  isSendingChat: boolean;
}

export const ChatWorkspace: React.FC<ChatWorkspaceProps> = ({
  chatHistory,
  directives,
  selectedAppIds,
  appsCount,
  config,
  onSendMessage,
  onAddDirective,
  onRemoveDirective,
  onClearChat,
  onTriggerGeneration,
  isGenerating,
  isSendingChat
}) => {
  const [inputText, setInputText] = useState('');
  const [showDirectives, setShowDirectives] = useState(false);
  const [newRuleInput, setNewRuleInput] = useState('');
  const chatScrollRef = useRef<HTMLDivElement>(null);

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
    await onSendMessage(msg);
  };

  const handleAddNewRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleInput.trim()) return;
    onAddDirective(newRuleInput.trim());
    setNewRuleInput('');
  };

  const QUICK_PROMPTS = [
    'Focus on instant UPI withdrawal and easy bonus claim',
    'Write 50% Today and 50% Yesterday reviews with natural slang',
    'Generate short punchy reviews praising smooth gameplay',
    'Mix casual Hinglish with real mobile player experience'
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl flex flex-col h-full overflow-hidden">
      {/* Top Brain Memory Bar */}
      <div className="p-3 border-b border-slate-800 bg-slate-950/40 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowDirectives(!showDirectives)}
            className="flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition"
          >
            <BrainCircuit className="w-4 h-4" />
            <span>Store Brain Memory: {directives.filter(d => d.active).length} Rules Remembered</span>
            {showDirectives ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClearChat}
              className="text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition flex items-center gap-1"
              title="Reset Chat History"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>

            <button
              disabled={isGenerating || selectedAppIds.length === 0}
              onClick={() => onTriggerGeneration()}
              className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium transition flex items-center gap-1.5 shadow-sm shadow-emerald-950"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isGenerating ? 'Generating...' : `Generate for ${selectedAppIds.length} Apps`}</span>
            </button>
          </div>
        </div>

        {/* Expandable Memory Rules Drawer */}
        {showDirectives && (
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-3 text-xs space-y-2 mt-1">
            <div className="text-[11px] text-slate-400 font-medium">
              These rules are locked in the Store Brain memory. Gemini remembers them in every conversation and generation:
            </div>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {directives.map(dir => (
                <div key={dir.id} className="flex items-center justify-between gap-2 p-1.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
                  <span className="truncate flex-1">• {dir.rule}</span>
                  <button
                    onClick={() => onRemoveDirective(dir.id)}
                    className="text-slate-500 hover:text-red-400 p-0.5 transition"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            {/* Add new rule form */}
            <form onSubmit={handleAddNewRule} className="flex items-center gap-1.5 pt-1">
              <input
                type="text"
                value={newRuleInput}
                onChange={e => setNewRuleInput(e.target.value)}
                placeholder="Teach AI a new memory rule (e.g. Always praise table graphics)..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs transition flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add</span>
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Chat Messages Stream */}
      <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {chatHistory.map(msg => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 max-w-[85%] ${
              msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${
                msg.sender === 'user' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-emerald-400'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>

            <div
              className={`rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-emerald-600 text-white rounded-tr-none'
                  : 'bg-slate-800/80 text-slate-200 border border-slate-700/50 rounded-tl-none'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>
            </div>
          </div>
        ))}

        {isSendingChat && (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Bot className="w-4 h-4 text-emerald-400 animate-spin" />
            <span>Store Brain is reasoning and formulating instructions...</span>
          </div>
        )}
      </div>

      {/* Quick Prompt Chips & Topic suggestions */}
      <div className="px-3 pt-2 pb-1 border-t border-slate-800 bg-slate-950/20 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap flex-shrink-0">Quick Topics:</span>
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => setInputText(prompt)}
            className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800/70 hover:bg-slate-700/80 text-slate-300 hover:text-white transition whitespace-nowrap border border-slate-700/40"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Input Bar with Teach Memory option */}
      <form onSubmit={handleSend} className="p-2.5 sm:p-3 border-t border-slate-800 bg-slate-950/60 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder={`Discuss topics with AI, or instruct "Teach: always mention UPI speed"...`}
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 sm:px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
        />
        
        {inputText.trim() && (
          <button
            type="button"
            onClick={() => {
              onAddDirective(inputText.trim());
              setInputText('');
            }}
            className="hidden sm:flex px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 text-[11px] font-medium transition items-center gap-1 border border-slate-700 flex-shrink-0"
            title="Lock this rule permanently into Store Brain memory"
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>Remember Rule</span>
          </button>
        )}

        <button
          type="submit"
          disabled={!inputText.trim() || isSendingChat}
          className="p-2 sm:px-3 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white transition flex items-center gap-1.5 flex-shrink-0 font-medium text-xs shadow-sm shadow-emerald-950"
        >
          <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
};
