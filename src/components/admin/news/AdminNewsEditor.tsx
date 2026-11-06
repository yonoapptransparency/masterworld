import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Trash2, Save, Tag, Globe, FileText, Sparkles, CheckCircle2,
  Eye, Code, Pin, Link2, Smartphone, Wand2, FolderPlus,
  ArrowLeft, ExternalLink, Loader2, ChevronDown, ChevronUp, Check, Edit3
} from 'lucide-react';
import ImageUpload from '../../ImageUpload';
import { toast } from '../../Toast';
import { safeHtml, structureHtmlFragment } from '../../../lib/safeHtmlPublic';
import { adminFetch } from '../../../services/adminAuthService';

const HTML_SNIPPETS = [
  { label: 'H2', snippet: '<h2>Section Heading</h2>', wrap: { open: '<h2>', close: '</h2>' } },
  { label: 'H3', snippet: '<h3>Subheading</h3>', wrap: { open: '<h3>', close: '</h3>' } },
  { label: 'Paragraph', snippet: '<p>Write your paragraph here...</p>', wrap: { open: '<p>', close: '</p>' } },
  { label: 'Bold', snippet: '<strong>Important text</strong>', wrap: { open: '<strong>', close: '</strong>' } },
  { label: 'Bullet List', snippet: '<ul>\n  <li>First key point</li>\n  <li>Second key point</li>\n</ul>' },
  { label: 'Number List', snippet: '<ol>\n  <li>Step one</li>\n  <li>Step two</li>\n</ol>' },
  { label: 'Link', snippet: '<a href="https://example.com" target="_blank" rel="noopener noreferrer">Official Link</a>' },
  { label: 'Image', snippet: '<img src="https://res.cloudinary.com/..." alt="Article visual" loading="lazy" />' },
  { label: 'Table', snippet: '<table>\n  <thead>\n    <tr><th>Feature</th><th>Details</th></tr>\n  </thead>\n  <tbody>\n    <tr><td>Security</td><td>Verified</td></tr>\n  </tbody>\n</table>' },
  { label: 'Quote', snippet: '<blockquote>Key takeaway note...</blockquote>', wrap: { open: '<blockquote>', close: '</blockquote>' } },
  { label: 'SVG Check', snippet: '<p><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;margin-right:6px"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg><strong>Verified Update:</strong> Details verified by editorial team.</p>' }
];

interface AdminNewsEditorProps {
  article: any;
  appsList: any[];
  availableCategories: string[];
  isAutoSlug: boolean;
  setIsAutoSlug: (val: boolean) => void;
  isSaving: boolean;
  onBack: () => void;
  onChange: (id: string, field: string, value: any) => void;
  onSave: (article: any, closeAfterSave: boolean) => Promise<void>;
  onDeleteRequest: (article: any) => void;
  onAddCustomCategory: (catName: string) => void;
}

export const AdminNewsEditor: React.FC<AdminNewsEditorProps> = React.memo(({
  article,
  appsList,
  availableCategories,
  isAutoSlug,
  setIsAutoSlug,
  isSaving,
  onBack,
  onChange,
  onSave,
  onDeleteRequest,
  onAddCustomCategory
}) => {
  // Local draft state prevents re-rendering the entire AdminDashboard and 48-article list on every keystroke
  const [draft, setDraft] = useState<any>(() => ({
    ...article,
    content: String(article.content ?? article.description_html ?? article.content_html ?? ''),
    image_url: String(article.image_url || article.logo_url || article.image || '')
  }));

  useEffect(() => {
    setDraft({
      ...article,
      content: String(article.content ?? article.description_html ?? article.content_html ?? ''),
      image_url: String(article.image_url || article.logo_url || article.image || '')
    });
  }, [article.id]);

  const updateField = (field: string, value: any) => {
    setDraft((prev: any) => {
      const next = { ...prev, [field]: value };
      if (field === 'content') {
        next.description_html = value;
        next.content_html = value;
      } else if (field === 'image_url') {
        next.logo_url = value;
        next.image = value;
      } else if (field === 'status') {
        next.sync_to_public = value !== 'draft';
      } else if (field === 'is_pinned') {
        next.pinned = Boolean(value);
      }
      return next;
    });
  };

  const [editorPreviewMode, setEditorPreviewMode] = useState<'code' | 'preview' | 'split'>('code');
  const [isFormattingHtml, setIsFormattingHtml] = useState(false);
  const [showAdvancedSeo, setShowAdvancedSeo] = useState(false);
  const [showAddCategoryBox, setShowAddCategoryBox] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const htmlTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  const generateSlug = (text: string) =>
    String(text || '').toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

  const htmlContent = String(draft.content ?? '');
  const coverImage = String(draft.image_url || '');
  const isDraft = draft.status === 'draft' || draft.sync_to_public === false;
  const isPinned = Boolean(draft.is_pinned ?? draft.pinned);

  const getTagsString = (): string => {
    if (typeof draft.seo_keywords === 'string' && draft.seo_keywords.trim()) return draft.seo_keywords;
    if (Array.isArray(draft.tags)) return draft.tags.filter(Boolean).join(', ');
    if (typeof draft.tags === 'string') return draft.tags;
    return '';
  };

  const { plainText, wordCount, readTime } = useMemo(() => {
    const plain = String(htmlContent || '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const words = plain ? plain.split(/\s+/).filter(Boolean).length : 0;
    return {
      plainText: plain,
      wordCount: words,
      readTime: `${Math.max(1, Math.ceil(words / 200))} min read`
    };
  }, [htmlContent]);

  const handleTitleChange = (val: string) => {
    setDraft((prev: any) => {
      const next: any = { ...prev, title: val };
      if (isAutoSlug || !prev.slug || String(prev.slug).startsWith('news-')) {
        next.slug = generateSlug(val);
      }
      return next;
    });
  };

  const insertHtmlSnippet = (snippet: string, wrapTag?: { open: string; close: string }) => {
    const textarea = htmlTextareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart ?? htmlContent.length;
      const end = textarea.selectionEnd ?? htmlContent.length;
      const selected = htmlContent.substring(start, end);
      const replacement = wrapTag && selected ? `${wrapTag.open}${selected}${wrapTag.close}` : snippet;
      const prefix = start > 0 && !htmlContent.substring(0, start).endsWith('\n') && snippet.startsWith('<h') ? '\n' : '';
      const nextHtml = htmlContent.substring(0, start) + prefix + replacement + htmlContent.substring(end);
      updateField('content', nextHtml);
      setTimeout(() => {
        try {
          textarea.focus();
          const pos = start + prefix.length + replacement.length;
          textarea.setSelectionRange(pos, pos);
        } catch (_) {}
      }, 10);
    } else {
      updateField('content', htmlContent ? `${htmlContent}\n${snippet}` : snippet);
    }
  };

  const handleStructureHtml = async () => {
    if (!htmlContent.trim()) {
      toast('Please write or paste content into the HTML body first.', 'error');
      return;
    }
    setIsFormattingHtml(true);
    try {
      let formatted = '';
      try {
        const res = await adminFetch('/api/v1/admin/ai-format-html', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: htmlContent, title: draft.title || '' })
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.formattedHtml) formatted = data.formattedHtml;
        }
      } catch (_) {}
      if (!formatted) formatted = structureHtmlFragment(htmlContent);
      updateField('content', formatted);
      toast('HTML structured and cleaned!', 'success');
    } catch (err: any) {
      toast('Failed to structure HTML: ' + (err?.message || 'Error'), 'error');
    } finally {
      setIsFormattingHtml(false);
    }
  };

  const handleAutoExtractSummary = () => {
    if (!plainText) {
      toast('Write article body first to extract a summary.', 'error');
      return;
    }
    const snippet = plainText.length > 155 ? `${plainText.substring(0, 152).trim()}...` : plainText;
    updateField('description', snippet);
    toast('Summary extracted from article body!', 'success');
  };

  const handleAutoGenerateSeo = () => {
    const title = String(draft.title || '').trim();
    const summary = String(draft.description || '').trim() || (plainText.length > 155 ? `${plainText.substring(0, 152).trim()}...` : plainText);
    const cat = String(draft.category || 'General').trim();
    const linkedApp = appsList.find((a: any) => String(a.id) === String(draft.related_app_id));
    const defaultTags = getTagsString() || [cat, linkedApp?.name || '', 'RummyDex', 'App Analysis'].filter(Boolean).join(', ');

    setDraft((prev: any) => ({
      ...prev,
      seo_title: title ? title.substring(0, 65) : prev.seo_title,
      seo_description: summary ? summary.substring(0, 160) : prev.seo_description,
      description: prev.description || (summary ? summary.substring(0, 160) : ''),
      seo_keywords: defaultTags,
      slug: prev.slug || (title ? generateSlug(title) : prev.slug),
      read_time: readTime
    }));
    toast('SEO metadata populated from article!', 'success');
  };

  const triggerSave = async (closeAfterSave: boolean) => {
    // Sync key fields back to parent state once at save time
    Object.entries(draft).forEach(([k, v]) => {
      if (article[k] !== v) {
        onChange(draft.id, k, v);
      }
    });
    await onSave(draft, closeAfterSave);
  };

  return (
    <div className="w-full space-y-2.5 pb-4 animate-fade-in">
      {/* Single Compact Sticky Top Action Bar */}
      <div className="sticky top-11 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-2 shadow-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer border-0 shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
          <div className="min-w-0 hidden sm:block">
            <div className="text-xs font-black text-slate-900 dark:text-white truncate max-w-[260px] lg:max-w-[420px]">
              {draft.title || 'New Article'}
            </div>
            <div className="text-[10px] text-slate-400 font-mono truncate">
              /news/{draft.slug || 'auto-slug'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => updateField('status', isDraft ? 'published' : 'draft')}
            className={`px-2 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 border cursor-pointer ${
              !isDraft
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/70'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/70'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${!isDraft ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span>{!isDraft ? 'Live' : 'Draft'}</span>
          </button>

          <button
            type="button"
            onClick={() => updateField('is_pinned', !isPinned)}
            className={`px-2 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 border cursor-pointer ${
              isPinned
                ? 'bg-amber-500 text-white border-amber-500'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
            title="Pin Article"
          >
            <Pin className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{isPinned ? 'Pinned' : 'Pin'}</span>
          </button>

          <button
            type="button"
            onClick={() => onDeleteRequest(draft)}
            className="p-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-lg text-xs font-bold flex items-center cursor-pointer border border-rose-200/60 dark:border-rose-800/60"
            title="Delete Article"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={() => triggerSave(true)}
            className="px-2.5 py-1.5 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 disabled:opacity-50 text-white rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer border-0"
          >
            <Check className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Save &amp; Exit</span>
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={() => triggerSave(false)}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer border-0"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{isSaving ? 'Saving...' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Main Responsive 2-Column Grid on Desktop, Compact Stack on Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-start">
        {/* Left / Main Column: Headline + Slug + HTML Body + Excerpt */}
        <div className="lg:col-span-8 space-y-2.5">
          {/* Headline & Slug Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 sm:p-3.5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-500" />
                <span>Article Headline &amp; URL</span>
              </span>
              {draft.slug && (
                <a
                  href={`/news/${draft.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <span>Public Page</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <div>
              <input
                type="text"
                value={draft.title || ''}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Enter article headline (H1)..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm sm:text-base font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              <div className="sm:col-span-7">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Link2 className="w-3 h-3 text-blue-500" />
                    <span>URL Slug</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      updateField('slug', generateSlug(draft.title || ''));
                      setIsAutoSlug(true);
                    }}
                    className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer bg-transparent border-0 p-0"
                  >
                    Auto-Slug
                  </button>
                </div>
                <div className="flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden focus-within:border-blue-500">
                  <span className="px-2 py-1.5 text-[11px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">/news/</span>
                  <input
                    type="text"
                    value={draft.slug || ''}
                    onChange={(e) => {
                      setIsAutoSlug(false);
                      updateField('slug', generateSlug(e.target.value));
                    }}
                    placeholder="article-url-slug"
                    className="flex-1 bg-transparent px-2 py-1.5 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none min-w-0"
                  />
                </div>
              </div>

              <div className="sm:col-span-5">
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                  <Smartphone className="w-3 h-3 text-indigo-500" />
                  <span>Linked App Box (Optional)</span>
                </label>
                <select
                  value={draft.related_app_id || ''}
                  onChange={(e) => updateField('related_app_id', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="">— No Linked App —</option>
                  {appsList.map((app: any) => (
                    <option key={app.id} value={app.id}>{app.name} ({app.category || 'App'})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* HTML Body & Summary Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 sm:p-3.5 space-y-2.5 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-indigo-500 shrink-0" />
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                  Article HTML Content
                </span>
                <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                  ({wordCount} words · {readTime})
                </span>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  disabled={isFormattingHtml}
                  onClick={handleStructureHtml}
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer border-0"
                >
                  {isFormattingHtml ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-yellow-300" />}
                  <span>Clean HTML</span>
                </button>

                <div className="inline-flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setEditorPreviewMode('code')}
                    className={`px-2 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 cursor-pointer border-0 ${
                      editorPreviewMode === 'code' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs' : 'bg-transparent text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>HTML</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorPreviewMode('preview')}
                    className={`px-2 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 cursor-pointer border-0 ${
                      editorPreviewMode === 'preview' ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-2xs' : 'bg-transparent text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Eye className="w-3 h-3" />
                    <span>Preview</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorPreviewMode('split')}
                    className={`hidden md:flex px-2 py-1 rounded-md text-[11px] font-bold items-center gap-1 cursor-pointer border-0 ${
                      editorPreviewMode === 'split' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs' : 'bg-transparent text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span>Split</span>
                  </button>
                </div>
              </div>
            </div>

            {editorPreviewMode !== 'preview' && (
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-0.5">
                {HTML_SNIPPETS.map((btn) => (
                  <button
                    key={btn.label}
                    type="button"
                    onClick={() => insertHtmlSnippet(btn.snippet, btn.wrap)}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-md text-[10px] font-bold whitespace-nowrap cursor-pointer border border-slate-200/70 dark:border-slate-700 shrink-0"
                  >
                    +{btn.label}
                  </button>
                ))}
              </div>
            )}

            <div className={editorPreviewMode === 'split' ? 'grid grid-cols-1 md:grid-cols-2 gap-3' : 'block'}>
              {editorPreviewMode !== 'preview' && (
                <textarea
                  ref={htmlTextareaRef}
                  rows={16}
                  value={htmlContent}
                  onChange={(e) => updateField('content', e.target.value)}
                  placeholder="Write or paste your full HTML article body (H2, H3, links, SVGs, tables, images)..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 font-mono text-xs text-slate-900 dark:text-slate-100 leading-relaxed focus:outline-none focus:border-blue-500"
                />
              )}

              {(editorPreviewMode === 'preview' || editorPreviewMode === 'split') && (
                <div className="bg-slate-50/70 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl p-3 max-h-[480px] overflow-y-auto">
                  <div className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Live Render Preview</span>
                  </div>
                  {htmlContent.trim() ? (
                    <div
                      className="rich-html-content text-slate-800 dark:text-slate-200 text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: safeHtml(htmlContent) }}
                    />
                  ) : (
                    <p className="text-xs text-slate-400 italic py-8 text-center">No HTML content yet.</p>
                  )}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Short Card Summary / Feed Excerpt
                </label>
                <button
                  type="button"
                  onClick={handleAutoExtractSummary}
                  className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-0 p-0"
                >
                  <Wand2 className="w-3 h-3" />
                  <span>Auto-Extract</span>
                </button>
              </div>
              <textarea
                rows={2}
                value={draft.description || ''}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Short summary displayed on News Feed cards..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Right / Sidebar Column: Category + Cover Image + SEO & Publishing */}
        <div className="lg:col-span-4 space-y-2.5">
          {/* Category & Cover Image Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 sm:p-3.5 space-y-3 shadow-2xs">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Category</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowAddCategoryBox(!showAddCategoryBox)}
                  className="text-[10px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 cursor-pointer bg-transparent border-0 p-0"
                >
                  <FolderPlus className="w-3 h-3" />
                  <span>+ Custom</span>
                </button>
              </div>

              {showAddCategoryBox && (
                <div className="flex items-center gap-1.5 mb-2">
                  <input
                    type="text"
                    value={customCategoryInput}
                    onChange={(e) => setCustomCategoryInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (customCategoryInput.trim()) {
                          const c = customCategoryInput.trim();
                          onAddCustomCategory(c);
                          updateField('category', c);
                          setCustomCategoryInput('');
                          setShowAddCategoryBox(false);
                        }
                      }
                    }}
                    placeholder="New category..."
                    className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customCategoryInput.trim()) {
                        const c = customCategoryInput.trim();
                        onAddCustomCategory(c);
                        updateField('category', c);
                        setCustomCategoryInput('');
                        setShowAddCategoryBox(false);
                      }
                    }}
                    className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold cursor-pointer border-0"
                  >
                    Add
                  </button>
                </div>
              )}

              <div className="flex flex-wrap gap-1">
                {availableCategories.map(cat => {
                  const active = String(draft.category || 'General').toLowerCase() === cat.toLowerCase();
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => updateField('category', cat)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer border ${
                        active
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Cover Banner / Thumbnail (Cloudinary)
              </label>
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-1">
                <ImageUpload
                  value={coverImage}
                  onChange={(val) => updateField('image_url', val)}
                  placeholder="Upload cover or paste URL..."
                />
              </div>
            </div>
          </div>

          {/* SEO & Publishing Metadata Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 sm:p-3.5 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-emerald-500" />
                <span>SEO &amp; Publishing</span>
              </span>
              <button
                type="button"
                onClick={handleAutoGenerateSeo}
                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer border-0"
              >
                <Wand2 className="w-3 h-3" />
                <span>Auto-Fill SEO</span>
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400">SEO Meta Title</label>
                <span className="text-[10px] font-mono text-slate-400">{String(draft.seo_title || '').length}/60</span>
              </div>
              <input
                type="text"
                value={draft.seo_title || ''}
                onChange={(e) => updateField('seo_title', e.target.value)}
                placeholder={draft.title || 'Custom SEO Title...'}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400">SEO Meta Description</label>
                <span className="text-[10px] font-mono text-slate-400">{String(draft.seo_description || '').length}/160</span>
              </div>
              <textarea
                rows={2}
                value={draft.seo_description || ''}
                onChange={(e) => updateField('seo_description', e.target.value)}
                placeholder={draft.description || 'Search engine meta description...'}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">Tags &amp; Keywords</label>
              <input
                type="text"
                value={getTagsString()}
                onChange={(e) => updateField('seo_keywords', e.target.value)}
                placeholder="Rummy, Security Alert, Yono Update..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">Author Name</label>
                <input
                  type="text"
                  value={draft.ceo_name || draft.author || ''}
                  onChange={(e) => updateField('ceo_name', e.target.value)}
                  placeholder="Editorial Team"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">Publish Date</label>
                <input
                  type="date"
                  value={String(draft.date || draft.published_at || '').split('T')[0]}
                  onChange={(e) => updateField('date', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowAdvancedSeo(!showAdvancedSeo)}
                className="flex items-center justify-between w-full text-left text-[10px] font-bold text-slate-500 dark:text-slate-400 cursor-pointer bg-transparent border-0 p-0"
              >
                <span>Advanced OpenGraph &amp; Author Role</span>
                {showAdvancedSeo ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {showAdvancedSeo && (
                <div className="space-y-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">Author Role</label>
                      <input
                        type="text"
                        value={draft.ceo_description || ''}
                        onChange={(e) => updateField('ceo_description', e.target.value)}
                        placeholder="Analyst"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">Read Time</label>
                      <input
                        type="text"
                        value={draft.read_time || ''}
                        onChange={(e) => updateField('read_time', e.target.value)}
                        placeholder={readTime}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-800 dark:text-slate-100"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">Canonical URL Override</label>
                    <input
                      type="text"
                      value={draft.canonical_url || ''}
                      onChange={(e) => updateField('canonical_url', e.target.value)}
                      placeholder={`https://www.rummydex.com/news/${draft.slug || 'slug'}`}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
