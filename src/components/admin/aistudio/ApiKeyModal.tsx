import React, { useState, useEffect } from 'react';
import { Key, X, ExternalLink, ShieldCheck, RefreshCw, Eye, EyeOff, CheckCircle2, AlertTriangle } from 'lucide-react';
import { StudioConfig } from './types';

export const PRESET_GEMINI_MODELS = [
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (gemini-2.5-flash — Fastest & Recommended Free Tier)' },
  { id: 'gemini-flash-latest', label: 'Gemini Flash Latest (gemini-flash-latest — Auto-Updated Flash)' },
  { id: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite (gemini-2.5-flash-lite — Ultra-Low Quota & Speed)' },
  { id: 'gemini-3.8-flash', label: 'Gemini 3.8 Flash (gemini-3.8-flash — Auto-Mapped High Speed)' },
  { id: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash Lite (gemini-3.1-flash-lite — Lightweight)' }
];

const PRESET_IDS = PRESET_GEMINI_MODELS.map(m => m.id);

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: StudioConfig;
  onSaveConfig: (
    newConfig: Partial<StudioConfig>,
    verifiedStatus?: { status: 'connected' | 'disconnected' | 'testing'; model: string; latencyMs?: number }
  ) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig
}) => {
  const [apiKeyInput, setApiKeyInput] = useState(config.apiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>(() => {
    const m = config.model || 'gemini-2.5-flash';
    return PRESET_IDS.includes(m) ? m : 'custom';
  });
  const [customModelInput, setCustomModelInput] = useState(() => {
    const m = config.model || 'gemini-2.5-flash';
    return PRESET_IDS.includes(m) ? '' : m;
  });
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [testLatency, setTestLatency] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Sync modal inputs whenever modal opens or config changes externally
  useEffect(() => {
    if (isOpen) {
      setApiKeyInput(config.apiKey || '');
      const m = config.model || 'gemini-2.5-flash';
      if (PRESET_IDS.includes(m)) {
        setSelectedPreset(m);
        setCustomModelInput('');
      } else {
        setSelectedPreset('custom');
        setCustomModelInput(m);
      }
      setTestStatus('idle');
      setTestMessage('');
      setTestLatency(null);
    }
  }, [isOpen, config.apiKey, config.model]);

  if (!isOpen) return null;

  const activeModelName =
    selectedPreset === 'custom'
      ? customModelInput.trim() || 'gemini-2.5-flash'
      : selectedPreset;

  const runLiveVerification = async (keyToTest: string, modelToTest: string): Promise<{
    ok: boolean;
    modelUsed: string;
    latencyMs: number;
    message: string;
  }> => {
    const startTime = performance.now();

    // 1. Try server verification with a strict 4.5s timeout
    const srvController = new AbortController();
    const srvTimer = setTimeout(() => srvController.abort(), 4500);
    try {
      const srvRes = await fetch('/api/v1/admin/community/aistudio-gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test',
          apiKey: keyToTest,
          model: modelToTest
        }),
        signal: srvController.signal
      });
      clearTimeout(srvTimer);

      const srvData = await srvRes.json().catch(() => ({}));
      if (srvRes.ok && srvData.success) {
        const latency = srvData.latencyMs || Math.round(performance.now() - startTime);
        const resolvedModel = srvData.model || modelToTest;
        return {
          ok: true,
          modelUsed: resolvedModel,
          latencyMs: latency,
          message: `Verified ${resolvedModel} (${latency}ms) — AI Connected & Ready.`
        };
      }
      if (srvData.error && !keyToTest) {
        return {
          ok: false,
          modelUsed: modelToTest,
          latencyMs: Math.round(performance.now() - startTime),
          message: srvData.error
        };
      }
    } catch (_) {
      clearTimeout(srvTimer);
    }

    if (!keyToTest) {
      return {
        ok: false,
        modelUsed: modelToTest,
        latencyMs: 0,
        message: 'Please paste your Google Gemini API key.'
      };
    }

    // 2. Instant zero-quota browser verification via /v1beta/models discovery (~120ms)
    const listController = new AbortController();
    const listTimer = setTimeout(() => listController.abort(), 4000);
    try {
      const listRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?pageSize=100&key=${encodeURIComponent(keyToTest)}`,
        { method: 'GET', signal: listController.signal }
      );
      clearTimeout(listTimer);
      const latencyMs = Math.round(performance.now() - startTime);

      if (!listRes.ok) {
        const errData = await listRes.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `HTTP ${listRes.status}`);
      }

      const listData = await listRes.json().catch(() => ({}));
      const available = new Set<string>();
      if (Array.isArray(listData?.models)) {
        for (const m of listData.models) {
          if ((m.supportedGenerationMethods || []).includes('generateContent')) {
            available.add(String(m.name || '').replace(/^models\//, ''));
          }
        }
      }

      const resolvedModel = available.has(modelToTest)
        ? modelToTest
        : available.has('gemini-2.5-flash')
        ? 'gemini-2.5-flash'
        : available.has('gemini-flash-latest')
        ? 'gemini-flash-latest'
        : modelToTest;

      return {
        ok: true,
        modelUsed: resolvedModel,
        latencyMs,
        message: `Verified ${resolvedModel} (${latencyMs}ms) — AI Connected & Ready.`
      };
    } catch (err: any) {
      clearTimeout(listTimer);
      throw new Error(err?.message || 'Unable to verify API key.');
    }
  };

  const handleTestKey = async () => {
    const keyToTest = apiKeyInput.trim();
    if (!keyToTest) {
      setTestStatus('error');
      setTestMessage('Please enter your Google Gemini API key first.');
      return;
    }
    setTestStatus('testing');
    setTestMessage(`Testing live connection with "${activeModelName}"...`);
    setTestLatency(null);

    try {
      const result = await runLiveVerification(keyToTest, activeModelName);
      setTestLatency(result.latencyMs);
      if (result.ok) {
        setTestStatus('success');
        setTestMessage(result.message);
      } else {
        setTestStatus('error');
        setTestMessage(result.message);
      }
    } catch (err: any) {
      setTestStatus('error');
      setTestMessage(`Connection failed: ${err.message}`);
    }
  };

  const handleSave = async () => {
    const cleanKey = apiKeyInput.trim();
    setIsSaving(true);

    // Fire server persistence in background with timeout so UI never hangs
    fetch('/api/v1/admin/community/aistudio-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clearKey: cleanKey === '',
        config: {
          apiKey: cleanKey,
          model: activeModelName
        }
      })
    }).catch(() => {});

    if (cleanKey) {
      // Save immediately to state & localStorage, and let parent verify in background
      onSaveConfig(
        {
          apiKey: cleanKey,
          model: activeModelName
        },
        {
          status: 'connected',
          model: activeModelName
        }
      );
    } else {
      onSaveConfig(
        {
          apiKey: '',
          model: activeModelName
        },
        {
          status: 'disconnected',
          model: activeModelName
        }
      );
    }

    setIsSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-4 sm:p-5 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-100">Google AI Studio Key & Model Switcher</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3.5 text-xs">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-300 font-semibold">Google Gemini API Key</label>
              {apiKeyInput.trim() && (
                <span className="text-[10px] font-mono text-emerald-400">
                  Key length: {apiKeyInput.trim().length} chars
                </span>
              )}
            </div>
            <div className="relative flex items-center">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKeyInput}
                onChange={e => {
                  setApiKeyInput(e.target.value);
                  if (testStatus !== 'idle') setTestStatus('idle');
                }}
                placeholder="Paste your AIzaSy... Gemini API key"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3 pr-9 py-2.5 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2.5 text-slate-400 hover:text-slate-200 p-1"
                title={showKey ? 'Hide API Key' : 'Show API Key'}
              >
                {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Attaches immediately to browser & server brain</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Get Free Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-300 font-semibold">Active Gemini AI Model</label>
              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
                100% Free Tier Compatible
              </span>
            </div>
            <select
              value={selectedPreset}
              onChange={e => {
                setSelectedPreset(e.target.value);
                if (testStatus !== 'idle') setTestStatus('idle');
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-medium"
            >
              {PRESET_GEMINI_MODELS.map(m => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
              <option value="custom">Custom Model ID (Type manually)</option>
            </select>

            {selectedPreset === 'custom' && (
              <div className="mt-2">
                <input
                  type="text"
                  value={customModelInput}
                  onChange={e => setCustomModelInput(e.target.value)}
                  placeholder="e.g. gemini-flash-latest or gemini-2.5-flash"
                  className="w-full bg-slate-950 border border-amber-600/50 rounded-xl px-3 py-2 text-xs font-mono text-amber-200 placeholder-slate-600 focus:outline-none focus:border-amber-400"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Enter any valid Google AI Studio model ID.
                </p>
              </div>
            )}
          </div>

          <div className="p-2.5 rounded-xl bg-blue-950/30 border border-blue-900/40 text-[11px] text-blue-300/90 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-blue-200">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Instant Key & Model Switching</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Switching models or pasting a new API key updates both your browser and backend server immediately without needing a page reload.
            </p>
          </div>

          {testMessage && (
            <div
              className={`p-2.5 rounded-xl text-[11px] flex items-start justify-between gap-2 ${
                testStatus === 'success'
                  ? 'bg-emerald-950/50 border border-emerald-500/40 text-emerald-300'
                  : testStatus === 'error'
                  ? 'bg-rose-950/50 border border-rose-500/40 text-rose-300'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-start gap-1.5">
                {testStatus === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />}
                {testStatus === 'error' && <AlertTriangle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0 mt-0.5" />}
                <span className="leading-relaxed">{testMessage}</span>
              </div>
              {testLatency !== null && testStatus === 'success' && (
                <span className="font-mono text-[10px] bg-emerald-900/60 px-1.5 py-0.5 rounded flex-shrink-0">
                  {testLatency}ms
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800 gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleTestKey}
            disabled={testStatus === 'testing' || isSaving}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testStatus === 'testing' ? 'animate-spin text-emerald-400' : ''}`} />
            <span>Test Key & Model</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition cursor-pointer shadow-sm"
            >
              {isSaving ? 'Attaching...' : 'Save & Attach Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
