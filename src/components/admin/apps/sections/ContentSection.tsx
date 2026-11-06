import React, { useState, useRef } from 'react';
import { adminFetch } from '../../../../services/adminAuthService';
import { Sparkles, Loader2, ChevronDown, ChevronUp, CheckCircle, Info, Eye, Edit3 } from 'lucide-react';
import { toast } from '../../../Toast';
import { safeHtml, structureHtmlFragment } from '../../../../lib/safeHtmlPublic';

interface ContentSectionProps {
  formFields: any;
  handleFieldChange: (field: string, value: any) => void;
}

const APP_HTML_SNIPPETS = [
  { label: 'H2', snippet: '<h2>Section Heading</h2>', wrap: { open: '<h2>', close: '</h2>' } },
  { label: 'H3', snippet: '<h3>Subheading</h3>', wrap: { open: '<h3>', close: '</h3>' } },
  { label: 'Paragraph', snippet: '<p>Write paragraph here...</p>', wrap: { open: '<p>', close: '</p>' } },
  { label: 'Bold', snippet: '<strong>Important text</strong>', wrap: { open: '<strong>', close: '</strong>' } },
  { label: 'Bullet List', snippet: '<ul>\n  <li>Feature point one</li>\n  <li>Feature point two</li>\n</ul>' },
  { label: 'Table', snippet: '<table>\n  <thead>\n    <tr><th>Specification</th><th>Details</th></tr>\n  </thead>\n  <tbody>\n    <tr><td>Status</td><td>Verified</td></tr>\n  </tbody>\n</table>' },
  { label: 'Link', snippet: '<a href="https://example.com" target="_blank" rel="noopener noreferrer">Official Link</a>' },
  { label: 'SVG Check', snippet: '<p><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;margin-right:6px"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg><strong>Verified Security:</strong> Checked by editorial team.</p>' }
];

export const ContentSection = ({ formFields, handleFieldChange }: ContentSectionProps) => {
  const [isFormatting, setIsFormatting] = useState(false);
  const [aiStatusMsg, setAiStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [previewMode, setPreviewMode] = useState<'code' | 'preview'>('code');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const insertSnippet = (snippet: string, wrap?: { open: string; close: string }) => {
    const current = String(formFields.description_html || '');
    const el = textareaRef.current;
    if (el) {
      const start = el.selectionStart ?? current.length;
      const end = el.selectionEnd ?? current.length;
      const selected = current.substring(start, end);
      const replacement = wrap && selected ? `${wrap.open}${selected}${wrap.close}` : snippet;
      const prefix = start > 0 && !current.substring(0, start).endsWith('\n') && snippet.startsWith('<h') ? '\n' : '';
      const next = current.substring(0, start) + prefix + replacement + current.substring(end);
      handleFieldChange('description_html', next);
      setTimeout(() => {
        try {
          el.focus();
          const pos = start + prefix.length + replacement.length;
          el.setSelectionRange(pos, pos);
        } catch (_) {}
      }, 10);
    } else {
      handleFieldChange('description_html', current ? `${current}\n${snippet}` : snippet);
    }
  };

  const handleAiFormatHtml = async () => {
    const rawContent = formFields.description_html || '';
    if (!rawContent.trim()) {
      setAiStatusMsg({ type: 'error', text: 'Please paste or write your raw review text/HTML into the box first.' });
      return;
    }

    setIsFormatting(true);
    setAiStatusMsg(null);

    try {
      let formatted = '';
      try {
        const res = await adminFetch('/api/v1/admin/ai-format-html', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: rawContent,
            appName: formFields.name || ''
          })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.formattedHtml) {
            formatted = data.formattedHtml;
          }
        }
      } catch (_) {}

      if (!formatted) {
        formatted = structureHtmlFragment(rawContent);
      }

      handleFieldChange('description_html', formatted);
      setAiStatusMsg({
        type: 'success',
        text: '✨ Cleaned and structured HTML headings, paragraphs, lists, links, and SVGs.'
      });
    } catch (err: any) {
      setAiStatusMsg({ type: 'error', text: 'Error formatting HTML.' });
    } finally {
      setIsFormatting(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Primary Gateway Access Link */}
      <div>
        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
          Primary Gateway Access Link (Target URL to secure & encrypt)
        </label>
        <div className="flex gap-2">
          <input 
            type="text" 
            name="more_information_url" 
            value={formFields.more_information_url || ''} 
            onChange={e => handleFieldChange('more_information_url', e.target.value)} 
            placeholder="https://..." 
            className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 font-mono" 
          />
          {formFields.more_information_url && formFields.more_information_url.startsWith('U2FsdGVkX1') && (
            <button
              type="button"
              onClick={async () => {
                try {
                  const res = await adminFetch('/api/v1/admin/decrypt-url', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ encryptedUrl: formFields.more_information_url })
                  });
                  const data = await res.json();
                  if (data.decrypted) {
                    handleFieldChange('more_information_url', data.decrypted);
                    try {
                      await navigator.clipboard.writeText(data.decrypted);
                    } catch (_) {}
                    toast('Decrypted URL revealed and copied to clipboard!', 'success');
                  } else {
                    toast('Failed to decrypt URL.', 'error');
                  }
                } catch (e) {
                  toast('Error decrypting URL.', 'error');
                }
              }}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-semibold text-xs transition-all whitespace-nowrap cursor-pointer border-0"
            >
              Reveal Link
            </button>
          )}
        </div>
        <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1">
          On save, APK-Gatekeeper will securely hash and encrypt this link on the server, keeping backend code completely invisible to client browsers.
        </p>
      </div>

      {/* Main Unified Description & Review HTML Box */}
      <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <span>Full App Description & Review HTML</span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Supports full HTML, H2/H3 headings, external links, tables, images, and SVGs.
            </p>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={handleAiFormatHtml}
              disabled={isFormatting}
              className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-50 border-0 cursor-pointer"
            >
              {isFormatting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Structuring...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  <span>Structure & Clean HTML</span>
                </>
              )}
            </button>

            <div className="inline-flex bg-white dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setPreviewMode('code')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer border-0 ${
                  previewMode === 'code'
                    ? 'bg-blue-600 text-white'
                    : 'bg-transparent text-slate-600 dark:text-slate-400'
                }`}
              >
                <Edit3 className="w-3 h-3" />
                <span>HTML</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode('preview')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer border-0 ${
                  previewMode === 'preview'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-transparent text-slate-600 dark:text-slate-400'
                }`}
              >
                <Eye className="w-3 h-3" />
                <span>Preview</span>
              </button>
            </div>
          </div>
        </div>

        {aiStatusMsg && (
          <div className={`p-3 rounded-xl text-xs flex items-start gap-2.5 ${
            aiStatusMsg.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300' : 'bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 text-rose-800 dark:text-rose-300'
          }`}>
            {aiStatusMsg.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" /> : <Info className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />}
            <span className="leading-relaxed font-medium">{aiStatusMsg.text}</span>
          </div>
        )}

        {previewMode === 'code' && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {APP_HTML_SNIPPETS.map((btn) => (
              <button
                key={btn.label}
                type="button"
                onClick={() => insertSnippet(btn.snippet, btn.wrap)}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-[11px] font-bold whitespace-nowrap cursor-pointer border border-slate-200 dark:border-slate-700 shrink-0"
              >
                + {btn.label}
              </button>
            ))}
          </div>
        )}

        {previewMode === 'code' ? (
          <textarea 
            ref={textareaRef}
            name="description_html" 
            value={formFields.description_html || ''} 
            onChange={e => handleFieldChange('description_html', e.target.value)} 
            rows={14} 
            className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 rounded-xl p-3.5 font-mono text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 leading-relaxed shadow-inner"
            placeholder="Paste raw text, review HTML, SVGs, or links here..."
          />
        ) : (
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 max-h-[420px] overflow-y-auto">
            {(formFields.description_html || '').trim() ? (
              <div
                className="rich-html-content text-slate-800 dark:text-slate-200 text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: safeHtml(formFields.description_html || '') }}
              />
            ) : (
              <p className="text-xs text-slate-400 italic py-6 text-center">No HTML description written yet.</p>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 gap-2">
          <span>💡 All external links, SVGs, images, and tables are preserved cleanly.</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">Chars: {(formFields.description_html || '').length}</span>
        </div>
      </div>

      {/* Optional Collapsible Extra Fields */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full p-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-left flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors border-0 cursor-pointer"
        >
          <span>Advanced Extra Banners & Legacy Feature Lists (Optional)</span>
          {showAdvanced ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {showAdvanced && (
          <div className="p-4 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800/80 space-y-4 animate-fade-in">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Key Features HTML List</label>
                <textarea 
                  name="features_html" 
                  value={formFields.features_html || ''} 
                  onChange={e => handleFieldChange('features_html', e.target.value)} 
                  rows={4} 
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 font-mono text-xs text-slate-800 dark:text-emerald-400 focus:outline-none focus:border-blue-500"
                  placeholder="<li>Secure encryption</li>&#10;<li>Unlimited bandwidth</li>"
                />
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Custom Extra Box Banner Title</label>
                  <input 
                    type="text" 
                    name="custom_admin_box_heading" 
                    value={formFields.custom_admin_box_heading || ''} 
                    onChange={e => handleFieldChange('custom_admin_box_heading', e.target.value)} 
                    placeholder="e.g. SPECIAL COMPATIBILITY NOTE"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500" 
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Custom Extra Box HTML Description</label>
                  <textarea 
                    name="custom_admin_box_html" 
                    value={formFields.custom_admin_box_html || ''} 
                    onChange={e => handleFieldChange('custom_admin_box_html', e.target.value)} 
                    rows={2} 
                    placeholder="<p>Extra banner text...</p>"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 font-mono text-xs text-slate-800 dark:text-blue-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
