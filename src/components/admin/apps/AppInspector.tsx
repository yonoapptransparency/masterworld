import React, { useState } from 'react';
import { 
  Edit2, 
  Trash2, 
  Compass, 
  AlertTriangle, 
  Sparkles, 
  MessageSquare,
  LayoutDashboard
} from 'lucide-react';
import { safeHtml } from '../../../lib/safeHtml';

interface AppInspectorProps {
  selectedApp: any;
  setSelectedAppId: (id: string | null) => void;
  setEditingAppId: (id: string | null) => void;
  setActiveFormTab: (tab: any) => void;
  handleDeleteApp: (id: string) => void;
}

export const AppInspector = ({ 
  selectedApp, 
  setSelectedAppId, 
  setEditingAppId, 
  setActiveFormTab, 
  handleDeleteApp 
}: AppInspectorProps) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  if (!selectedApp) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center p-8 text-center bg-slate-50/50 dark:bg-slate-900/10">
        <LayoutDashboard className="w-14 h-14 text-slate-300 dark:text-slate-700 animate-pulse mb-3" />
        <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">Select an App</h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mt-1">
          Select an application from the list to view its details or edit configuration.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Selected App Header panel */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/30 flex flex-col sm:flex-row sm:items-start gap-4 shrink-0">
        <div className="flex items-center justify-between w-full sm:w-auto">
          <button 
            type="button"
            onClick={() => setSelectedAppId(null)} 
            className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border-0 cursor-pointer"
          >
            ← Back to List
          </button>
        </div>
        <div className="flex items-start gap-4 w-full">
          <img 
            src={selectedApp.icon_url || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=128&h=128&fit=crop'} 
            loading="lazy"
            width={64}
            height={64}
            className="w-16 h-16 object-cover rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800 bg-slate-100" 
            alt="" 
          />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate max-w-sm">
                {selectedApp.name}
              </h3>
              <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50">
                Order #{selectedApp.serial_number || 0}
              </span>
            </div>
            
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
              Folder: <span className="text-blue-500 dark:text-blue-400 font-semibold">{selectedApp.category}</span>
            </p>

            <div className="flex gap-2 mt-2">
              <button 
                type="button"
                onClick={() => {
                  setEditingAppId(selectedApp.id);
                  setActiveFormTab('general');
                }}
                className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-950/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-200/40 dark:border-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-semibold cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit Configuration
              </button>
              <button 
                type="button"
                onClick={() => handleDeleteApp(selectedApp.id)}
                className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200/40 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg text-xs font-semibold cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Selected App Body Panel (Previews & Detailed Metrics) */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-6 pb-20 space-y-6 custom-scrollbar bg-white dark:bg-slate-900">
        
        {/* Google SERP Preview simulator */}
        <div className="space-y-2">
          <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-blue-500" />
            Google SEO Listing Simulation
          </h4>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs max-w-full font-sans">
            <div className="text-[12px] text-slate-500 dark:text-slate-400 font-normal truncate flex items-center gap-1">
              <span>https://verification-gatekeeper.com</span>
              <span className="text-slate-400">› apps › {selectedApp.slug || selectedApp.id}</span>
            </div>
            <div className="text-[18px] text-blue-600 dark:text-blue-400 font-medium hover:underline cursor-pointer leading-tight truncate mt-0.5">
              {selectedApp.seo_title || selectedApp.name}
            </div>
            <p className="text-[13px] text-slate-600 dark:text-slate-400 font-normal leading-normal mt-1 line-clamp-2">
              {selectedApp.seo_description || `Download ${selectedApp.name} for Android. Fully scanned, verified safe and offline bypass setup complete. Size: ${selectedApp.file_size || 'Unknown'}...`}
            </p>
          </div>
        </div>

        {/* Basic Meta Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50/50 dark:bg-slate-800/20 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Rating Score</div>
            <div className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1 flex items-center gap-1">
              ⭐ {selectedApp.rating !== undefined ? selectedApp.rating : 5.0} <span className="text-[10px] text-slate-400 font-normal">/ 10</span>
            </div>
          </div>

          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Package Size</div>
            <div className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1">
              📦 {selectedApp.file_size || 'Unknown'}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">App Version</div>
            <div className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1 font-mono">
              ℹ️ {selectedApp.version || '1.0'}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Developer</div>
            <div className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1 truncate" title={selectedApp.developer}>
              💻 {selectedApp.developer || 'Admin'}
            </div>
          </div>
        </div>

        {/* Custom alerts visualization */}
        {(selectedApp.red_box_msg || selectedApp.yellow_box_msg || selectedApp.idea_box_msg) && (
          <div className="space-y-3">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Live Notification Alerts Previews</h4>
            
            {selectedApp.red_box_msg && (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-xs text-rose-800 dark:text-rose-300 flex gap-2.5 items-start">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold block mb-0.5 text-rose-900 dark:text-rose-400">RED CRITICAL NOTICE</strong>
                  <span className="font-medium">{selectedApp.red_box_msg}</span>
                </div>
              </div>
            )}

            {selectedApp.yellow_box_msg && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-800 dark:text-amber-300 flex gap-2.5 items-start">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold block mb-0.5 text-amber-900 dark:text-amber-400">YELLOW ALERT NOTICE</strong>
                  <span className="font-medium">{selectedApp.yellow_box_msg}</span>
                </div>
              </div>
            )}

            {selectedApp.idea_box_msg && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-xs text-emerald-800 dark:text-emerald-300 flex gap-2.5 items-start">
                <Sparkles className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold block mb-0.5 text-emerald-900 dark:text-emerald-400">GREEN RECOMMENDATION TIP</strong>
                  <span className="font-medium">{selectedApp.idea_box_msg}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SEO Keywords panel */}
        {selectedApp.seo_keywords && (
          <div>
            <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">SEO Discovery Tags</h4>
            <div className="flex flex-wrap gap-1.5">
              {selectedApp.seo_keywords.split(',').map((keyword: string, idx: number) => (
                <span key={idx} className="bg-slate-100 dark:bg-slate-800 border border-slate-200/40 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-lg text-[10px] font-semibold">
                  #{keyword.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Description HTML content summary */}
        <div>
          <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">HTML Body Length Indicators</h4>
          <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <button type="button" onClick={() => { setEditingAppId(selectedApp.id); setActiveFormTab('content'); }} className="bg-slate-50 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/80 p-3.5 rounded-xl flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-left w-full">
              <span>Description:</span>
              <span className="bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded font-mono font-bold text-slate-500">
                {selectedApp.description_html?.length || 0} chars
              </span>
            </button>
            <button type="button" onClick={() => { setEditingAppId(selectedApp.id); setActiveFormTab('content'); }} className="bg-slate-50 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/80 p-3.5 rounded-xl flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-left w-full">
              <span>Features List:</span>
              <span className="bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded font-mono font-bold text-slate-500">
                {selectedApp.features_html?.length || 0} chars
              </span>
            </button>
          </div>
        </div>

        {/* Selected App Interactive FAQs preview */}
        {selectedApp.faqs && selectedApp.faqs.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
              FAQ Items Accordion ({selectedApp.faqs.length})
            </h4>
            <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
              {selectedApp.faqs.map((faq: any, idx: number) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div key={idx} className="bg-slate-50/20 dark:bg-slate-900/10 text-xs">
                    <button 
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full text-left p-3.5 font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer border-0"
                    >
                      <span>{faq.question}</span>
                      <span className="text-slate-400 font-bold">{isOpen ? '−' : '+'}</span>
                    </button>
                    {isOpen && (
                      <div 
                        className="p-3.5 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-medium leading-relaxed border-t border-slate-100 dark:border-slate-800"
                        dangerouslySetInnerHTML={{ __html: safeHtml(faq.answer ) }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
