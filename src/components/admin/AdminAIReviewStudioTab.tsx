import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Zap, 
  Layers, 
  Key, 
  Sparkles, 
  ShieldCheck, 
  Activity, 
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { toast } from '../Toast';
import { 
  StudioConfig, 
  BrainMemoryDirective, 
  ChatMessage, 
  StagedReview 
} from './aistudio/types';
import { 
  loadStudioConfig, 
  saveStudioConfig, 
  loadBrainDirectives, 
  saveBrainDirectives, 
  loadChatHistory, 
  saveChatHistory, 
  loadStagedReviews, 
  saveStagedReviews, 
  loadSelectedAppIds, 
  saveSelectedAppIds 
} from './aistudio/storage';
import { 
  sendChatMessageToGemini, 
  generateReviewsForAppWithGemini 
} from './aistudio/geminiEngine';
import { AppSelector } from './aistudio/AppSelector';
import { ChatWorkspace } from './aistudio/ChatWorkspace';
import { Brain2BatchGenerator } from './aistudio/Brain2BatchGenerator';
import { StagedQueue } from './aistudio/StagedQueue';
import { ApiKeyModal } from './aistudio/ApiKeyModal';
import { createAdminReviewItem } from '../../lib/communityFirebase';

interface AdminAIReviewStudioTabProps {
  appsList: any[];
  onReviewsGenerated?: () => void;
}

export const AdminAIReviewStudioTab: React.FC<AdminAIReviewStudioTabProps> = ({
  appsList = [],
  onReviewsGenerated
}) => {
  // Navigation: 'brain1' (Chat) | 'brain2' (AutoBot) | 'staged' (Queue)
  const [activeTab, setActiveTab] = useState<'brain1' | 'brain2' | 'staged'>('brain1');

  // Persistent State
  const [config, setConfig] = useState<StudioConfig>(loadStudioConfig);
  const [directives, setDirectives] = useState<BrainMemoryDirective[]>(loadBrainDirectives);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(loadChatHistory);
  const [stagedReviews, setStagedReviews] = useState<StagedReview[]>(loadStagedReviews);
  const [selectedAppIds, setSelectedAppIds] = useState<string[]>(() => {
    const saved = loadSelectedAppIds();
    if (saved.length > 0) return saved;
    return appsList.slice(0, 5).map(a => String(a.id || a.slug));
  });

  // Filters & Modal
  const [appSearch, setAppSearch] = useState('');
  const [appCategory, setAppCategory] = useState('all');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  // Async Execution States
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0, percent: 0 });

  // Sync to local storage
  useEffect(() => { saveStudioConfig(config); }, [config]);
  useEffect(() => { saveBrainDirectives(directives); }, [directives]);
  useEffect(() => { saveChatHistory(chatHistory); }, [chatHistory]);
  useEffect(() => { saveStagedReviews(stagedReviews); }, [stagedReviews]);
  useEffect(() => { saveSelectedAppIds(selectedAppIds); }, [selectedAppIds]);

  // Handle Chat message send
  const handleSendChatMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toISOString()
    };
    const updatedHistory = [...chatHistory, userMsg];
    setChatHistory(updatedHistory);
    setIsSendingChat(true);

    try {
      const replyText = await sendChatMessageToGemini(text, updatedHistory, directives, config);
      const botMsg: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toISOString()
      };
      setChatHistory(prev => [...prev, botMsg]);
    } catch (err: any) {
      toast(err.message || 'Error communicating with AI Brain', 'error');
    } finally {
      setIsSendingChat(false);
    }
  };

  // Add directive to Store Brain
  const handleAddDirective = (rule: string) => {
    const newDir: BrainMemoryDirective = {
      id: `dir_${Date.now()}`,
      rule,
      category: 'general',
      createdAt: new Date().toISOString(),
      active: true
    };
    setDirectives(prev => [...prev, newDir]);
    toast('New rule taught to Store Brain memory!', 'success');
  };

  const handleRemoveDirective = (id: string) => {
    setDirectives(prev => prev.filter(d => d.id !== id));
  };

  // Core generation logic (shared by Brain 1 and Brain 2)
  const handleExecuteGeneration = async (customInstruction?: string) => {
    const targets = appsList.filter(a => selectedAppIds.includes(String(a.id || a.slug)));
    if (targets.length === 0) {
      toast('Please select at least 1 app from the left catalog panel', 'error');
      return;
    }

    setIsGenerating(true);
    setBatchProgress({ current: 0, total: targets.length, percent: 0 });

    const newStagedList: StagedReview[] = [];
    let directPublishedCount = 0;

    for (let i = 0; i < targets.length; i++) {
      const app = targets[i];
      setBatchProgress({
        current: i + 1,
        total: targets.length,
        percent: Math.round(((i + 1) / targets.length) * 100)
      });

      try {
        const generated = await generateReviewsForAppWithGemini(
          app,
          config.reviewsPerApp,
          directives,
          config,
          customInstruction || config.customTopic
        );

        if (config.publishMode === 'auto_direct') {
          // DIRECT UPLOAD TO FIREBASE (Write-only to Community)
          for (const review of generated) {
            try {
              await createAdminReviewItem({
                appId: review.appId,
                appName: review.appName,
                appSlug: review.appSlug,
                userName: review.userName,
                rating: review.rating,
                reviewText: review.reviewText,
                timestamp: review.timestamp,
                status: 'published'
              });
              directPublishedCount++;
            } catch (_) {}
          }
        } else {
          // STAGE FOR MANUAL APPROVAL
          newStagedList.push(...generated);
        }
      } catch (_) {}
    }

    setIsGenerating(false);

    if (config.publishMode === 'auto_direct') {
      toast(`Directly posted ${directPublishedCount} reviews to Live Community!`, 'success');
      if (onReviewsGenerated) onReviewsGenerated();
    } else {
      setStagedReviews(prev => [...newStagedList, ...prev]);
      setActiveTab('staged');
      toast(`Generated ${newStagedList.length} reviews! Staged in deck for your preview.`, 'success');
    }
  };

  // Publish all staged reviews to Firestore Community (Write-Only)
  const handlePublishAllToFirestore = async () => {
    if (stagedReviews.length === 0) return;
    setIsPublishing(true);

    try {
      let publishedCount = 0;
      for (const review of stagedReviews) {
        await createAdminReviewItem({
          appId: review.appId,
          appName: review.appName,
          appSlug: review.appSlug,
          userName: review.userName,
          rating: review.rating,
          reviewText: review.reviewText,
          timestamp: review.timestamp,
          status: 'published'
        });
        publishedCount++;
      }

      setStagedReviews([]);
      toast(`Successfully published ${publishedCount} reviews to Live Community!`, 'success');
      if (onReviewsGenerated) onReviewsGenerated();
    } catch (err: any) {
      toast(`Error publishing: ${err.message}`, 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Studio Navigation */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-100">AI Review Studio</h2>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium">
                Store Brain Memory Active
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Generates 100% human-realistic player comments from local metadata with zero Firestore read burn.
            </p>
          </div>
        </div>

        {/* Tab Controls & Key Configuration */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          {/* Tab buttons */}
          <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab('brain1')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'brain1' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Brain 1: Chat</span>
            </button>

            <button
              onClick={() => setActiveTab('brain2')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'brain2' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Brain 2: AutoBot</span>
            </button>

            <button
              onClick={() => setActiveTab('staged')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 relative whitespace-nowrap ${
                activeTab === 'staged' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Staging</span>
              {stagedReviews.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-bold">
                  {stagedReviews.length}
                </span>
              )}
            </button>
          </div>

          {/* Gemini Model & API Key Settings Trigger */}
          <button
            onClick={() => setIsApiKeyModalOpen(true)}
            className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition border border-slate-700 flex items-center gap-1.5 whitespace-nowrap"
            title="Configure Gemini Model & API Key"
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono text-[11px] text-amber-300/90">{config.model || 'gemini-flash-latest'}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400">
              {config.apiKey ? 'Key ✓' : 'Set Key'}
            </span>
          </button>
        </div>
      </div>

      {/* Main Dual Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left App Picker Column (4 cols) */}
        <div className="lg:col-span-4 h-[480px] lg:h-[640px]">
          <AppSelector
            appsList={appsList}
            selectedAppIds={selectedAppIds}
            onChangeSelection={setSelectedAppIds}
            searchQuery={appSearch}
            setSearchQuery={setAppSearch}
            selectedCategory={appCategory}
            setSelectedCategory={setAppCategory}
          />
        </div>

        {/* Right Active Tab Column (8 cols) */}
        <div className="lg:col-span-8 h-[540px] lg:h-[640px]">
          {activeTab === 'brain1' && (
            <ChatWorkspace
              chatHistory={chatHistory}
              directives={directives}
              selectedAppIds={selectedAppIds}
              appsCount={appsList.length}
              config={config}
              onSendMessage={handleSendChatMessage}
              onAddDirective={handleAddDirective}
              onRemoveDirective={handleRemoveDirective}
              onClearChat={() => setChatHistory([])}
              onTriggerGeneration={handleExecuteGeneration}
              isGenerating={isGenerating}
              isSendingChat={isSendingChat}
            />
          )}

          {activeTab === 'brain2' && (
            <Brain2BatchGenerator
              config={config}
              onChangeConfig={updates => setConfig(prev => ({ ...prev, ...updates }))}
              selectedAppCount={selectedAppIds.length}
              onLaunchBatch={() => handleExecuteGeneration()}
              isGenerating={isGenerating}
              progress={batchProgress}
            />
          )}

          {activeTab === 'staged' && (
            <StagedQueue
              stagedReviews={stagedReviews}
              onDeleteReview={id => setStagedReviews(prev => prev.filter(r => r.id !== id))}
              onClearAll={() => setStagedReviews([])}
              onUpdateReview={(id, updates) =>
                setStagedReviews(prev => prev.map(r => (r.id === id ? { ...r, ...updates } : r)))
              }
              onPublishAllToFirestore={handlePublishAllToFirestore}
              isPublishing={isPublishing}
            />
          )}
        </div>
      </div>

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        config={config}
        onSaveConfig={updates => setConfig(prev => ({ ...prev, ...updates }))}
      />
    </div>
  );
};

export default AdminAIReviewStudioTab;
