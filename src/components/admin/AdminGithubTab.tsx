import React, { useState, useEffect } from 'react';
import { Github, Save, RefreshCw, Upload, FileText, ShieldAlert, Link as LinkIcon } from 'lucide-react';
import { toast } from '../Toast';
import { adminFetch } from '../../services/adminAuthService';

interface AdminGithubTabProps {
  pushAllToGitHub: (e?: any, logCb?: (msg: string) => void, appsList?: any[], settings?: any, newsList?: any[], videosList?: any[]) => Promise<any>;
  gitConfig: any;
  saveGitConfig: (config: any) => Promise<void>;
  generatePreview: () => string;
  appsList: any[];
  settings: any;
  newsList: any[];
  videosList: any[];
}

export const AdminGithubTab = React.memo(({
  pushAllToGitHub,
  gitConfig,
  saveGitConfig,
  generatePreview,
  appsList,
  settings,
  newsList,
  videosList
}: AdminGithubTabProps) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState<string>("");
  const [localConfig, setLocalConfig] = useState(gitConfig || { owner: '', repo: '', branch: 'main', token: '' });

  useEffect(() => {
    if (gitConfig) {
      setLocalConfig(gitConfig);
    }
  }, [gitConfig]);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveGitConfig(localConfig);
      toast('GitHub Configuration Saved successfully.', 'success');
    } catch (err: any) {
      toast(`Error saving GitHub config: ${err.message}`, 'error');
    }
  };

  const handleManualSync = async () => {
    setSyncing(true);
    setLogs(["Starting Manual GitHub Sync..."]);
    try {
      const result = await pushAllToGitHub(
        undefined, 
        (msg: string) => {
          setLogs(prev => [...prev, msg]);
        }, 
        appsList,
        settings,
        newsList,
        videosList
      );
      const targetMsg = (result as any)?.targetRepo ? ` to ${(result as any).targetRepo}` : "";
      setLogs(prev => [...prev, `Sync completed successfully${targetMsg}!`]);
    } catch (err: any) {
      setLogs(prev => [...prev, `ERROR: ${err.message || 'Push failed'}`]);
    } finally {
      setSyncing(false);
    }
  };

  const handleTestConnection = async () => {
    setSyncing(true);
    setLogs(prev => [...prev, "Testing GitHub Connection..."]);
    try {
      const res = await adminFetch('/api/github-sync/test', {
        method: 'POST',
        body: JSON.stringify(localConfig)
      });
      
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error(`Server returned non-JSON response (${res.status}): ${text.substring(0, 100)}...`);
      }

      if (res.ok) {
        setLogs(prev => [...prev, `SUCCESS: ${data.message || 'Connection successful!'}`]);
        if (data.permissions) {
          setLogs(prev => [...prev, `Permissions: Push=${data.permissions.push ? '✅' : '❌'}, Pull=${data.permissions.pull ? '✅' : '❌'}, Admin=${data.permissions.admin ? '✅' : '❌'}`]);
          if (!data.permissions.push) {
            setLogs(prev => [...prev, "⚠️ WARNING: Token does not have PUSH permissions. Sync will fail."]);
          }
        }
        toast("GitHub Connection Successful!", "success");
      } else {
        const errMsg = data.message || data.error || data.details || `HTTP ${res.status} Error`;
        setLogs(prev => [...prev, `CONNECTION FAILED: ${errMsg}`]);
        toast(`Connection Failed: ${errMsg}`, "error");
      }
    } catch (err: any) {
      setLogs(prev => [...prev, `ERROR: ${err.message}`]);
      toast(`Error testing connection: ${err.message}`, "error");
    } finally {
      setSyncing(false);
    }
  };

  const handleTogglePreview = () => {
    if (!showPreview) {
      try {
        const payload = generatePreview();
        setPreviewContent(payload);
      } catch (err) {
        setPreviewContent(`Error generating preview: ${err}`);
      }
    }
    setShowPreview(!showPreview);
  };

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-2xl border border-black/10 dark:border-white/10 shadow-sm">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 dark:text-white">
            <Github className="w-5 h-5 text-blue-500" /> Source Control & External Sync
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage static site generation and GitHub synchronization.</p>
        </div>
      </div>
      
      <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800/30 rounded-2xl p-6 relative overflow-hidden">
        <h3 className="text-base font-bold text-rose-700 dark:text-rose-400 mb-2 flex items-center gap-2">
           <ShieldAlert className="w-5 h-5" /> Security Notice
        </h3>
        <p className="text-sm text-rose-700/80 dark:text-rose-400/80 mb-2">
          The more_information_url (your private clearance redirect moreinfos) are encrypted before being pushed to GitHub to keep them secure.
        </p>
        <p className="text-sm text-rose-700/80 dark:text-rose-400/80">
          ⚠️ WARNING: You must configure the <code className="bg-rose-100 dark:bg-rose-900/30 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-800/50">AES_SECRET</code> environment variable in your Vercel/production deployment exactly as it is set here, or secure links will fail to decrypt.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b border-black/5 dark:border-white/5 pb-2 mb-6">Repository Configuration</h3>
        <form onSubmit={handleSaveConfig} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Repository Owner</label>
              <input type="text" value={localConfig.owner || ''} onChange={e => setLocalConfig({...localConfig, owner: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all font-mono" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Repository Name</label>
              <input type="text" value={localConfig.repo || ''} onChange={e => setLocalConfig({...localConfig, repo: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all font-mono" required />
              <p className="text-[10px] text-slate-500 mt-1">Note: Please enter the name of your public website repository (e.g. <strong>Dex</strong>).</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Branch</label>
              <input type="text" value={localConfig.branch || ''} onChange={e => setLocalConfig({...localConfig, branch: e.target.value})} placeholder="main" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all font-mono" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">GitHub Fine-grained PAT</label>
              <input type="password" value={localConfig.token || ''} onChange={e => setLocalConfig({...localConfig, token: e.target.value})} placeholder="github_pat_..." className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all font-mono" required />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center gap-2">
              <Save className="w-4 h-4" /> Save Configuration
            </button>
            <button 
              type="button" 
              onClick={handleTestConnection} 
              disabled={syncing || !localConfig.token}
              className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-6 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center gap-2"
            >
              {syncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <LinkIcon className="w-4 h-4" />}
              Test Connection
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b border-black/5 dark:border-white/5 pb-2">Live Synchronization Logs</h3>
        
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 h-[250px] overflow-y-auto font-mono text-xs text-emerald-400 space-y-1 shadow-inner">
          {logs.length === 0 ? (
            <p className="text-slate-500">System ready to synchronize target repository...</p>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-slate-600">[{new Date().toLocaleTimeString()}]</span>
                <span>{log}</span>
              </div>
            ))
          )}
        </div>

        <div className="flex gap-4">
          <button 
            onClick={handleManualSync} 
            disabled={syncing || !gitConfig?.token} 
            className="flex-1 min-h-[48px] bg-blue-600 disabled:bg-blue-600/50 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            {syncing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
            {syncing ? 'Synchronizing Repository...' : 'Trigger Full Static Build Sync (to Dex)'}
          </button>
          <button 
            onClick={handleTogglePreview} 
            className="flex-none px-6 min-h-[48px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2"
          >
            <FileText className="w-5 h-5" />
            {showPreview ? 'Hide Payload' : 'Preview Payload'}
          </button>
        </div>

        {showPreview && (
          <div className="mt-6">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b border-black/5 dark:border-white/5 pb-2 mb-4">Generated Payload (staticData.ts)</h3>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 h-[400px] overflow-y-auto font-mono text-xs text-slate-300 shadow-inner whitespace-pre-wrap">
              {previewContent}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

AdminGithubTab.displayName = 'AdminGithubTab';

export default AdminGithubTab;
