import React, { useState } from 'react';
import { Newspaper, Plus, Trash2, LayoutDashboard, Edit2, Save, X, CheckCircle2, RefreshCw } from 'lucide-react';
import { toast } from '../Toast';
import ImageUpload from '../ImageUpload';

interface AdminNewsTabProps {
  newsList: any[];
  handleAddNews: () => string;
  handleDeleteNews: (id: string) => void;
  handleNewsChange: (id: string, field: string, value: any) => void;
  saveNews: (list: any[]) => Promise<void>;
  saving: boolean;
  setSaving: (saving: boolean) => void;
  appsList: any[];
}

export const AdminNewsTab = React.memo(({
  newsList,
  handleAddNews,
  handleDeleteNews,
  handleNewsChange,
  saveNews,
  saving,
  setSaving,
  appsList
}: AdminNewsTabProps) => {
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);

  const handleSaveAll = async (customList?: any[]) => {
    setSaving(true);
    try {
      const listToSave = customList || newsList;
      await saveNews(listToSave);
      toast('News saved and synchronized successfully!', 'success');
    } catch (e: any) {
      console.error('Failed to save news:', e);
      toast('Failed to save news: ' + (e?.message || 'Error'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveItemAndClose = async (itemId: string) => {
    setSaving(true);
    try {
      await saveNews(newsList);
      toast('News item saved and synchronized!', 'success');
      setEditingNewsId(null);
    } catch (e: any) {
      console.error('Failed to save news item:', e);
      toast('Failed to save: ' + (e?.message || 'Error'), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-slate-900 p-6 rounded-2xl border border-black/10 dark:border-white/10 shadow-sm gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 dark:text-white">
            <Newspaper className="w-5 h-5 text-blue-500" /> News Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Total News Articles: <span className="font-semibold text-blue-600 dark:text-blue-400">{newsList.length}</span>
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => {
              const newId = handleAddNews();
              setEditingNewsId(newId);
            }}
            className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add News Item
          </button>
          <button
            onClick={() => handleSaveAll()}
            disabled={saving}
            className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? 'Syncing...' : 'Save All News'}</span>
          </button>
        </div>
      </div>

      {/* News List */}
      <div className="space-y-4">
        {newsList.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-12 text-center">
            <Newspaper className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No News Items Yet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">Add your first article or release announcement.</p>
            <button
              onClick={() => {
                const newId = handleAddNews();
                setEditingNewsId(newId);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-xs inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add News Item
            </button>
          </div>
        ) : (
          newsList.map((item: any) => (
            <div key={item.id} className="bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 rounded-2xl p-6 shadow-sm relative overflow-hidden transition-all">
              {editingNewsId === item.id ? (
                <div className="space-y-6">
                  {/* Editor Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-black/10 dark:border-white/10 pb-4 mb-4 gap-4">
                    <div>
                      <h3 className="font-bold text-lg text-blue-600 flex items-center gap-2">
                        <LayoutDashboard className="w-4 h-4" /> Editing: {item.title || 'Untitled News'}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">ID: {item.id}</p>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => handleSaveItemAndClose(item.id)}
                        disabled={saving}
                        className="flex-1 sm:flex-none flex justify-center items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all shadow-sm"
                      >
                        {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        <span>Save & Done</span>
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Delete this news article?')) {
                            handleDeleteNews(item.id);
                            const updatedList = newsList.filter(n => n.id !== item.id);
                            handleSaveAll(updatedList);
                            setEditingNewsId(null);
                          }
                        }}
                        className="flex-1 sm:flex-none flex justify-center items-center gap-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 text-rose-600 px-3 py-2 rounded-lg font-semibold text-sm transition-all"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                      <button
                        onClick={() => setEditingNewsId(null)}
                        className="flex-1 sm:flex-none flex justify-center items-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white px-3 py-2 rounded-lg font-semibold text-sm transition-all"
                      >
                        <X className="w-4 h-4" /> Close
                      </button>
                    </div>
                  </div>

                  {/* Form Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-5">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white border-b border-black/5 dark:border-white/5 pb-2">General Information</h4>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Title *</label>
                        <input
                          type="text"
                          value={item.title || ''}
                          onChange={e => handleNewsChange(item.id, 'title', e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                          placeholder="Article title"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Slug (URL)</label>
                          <input
                            type="text"
                            value={item.slug || ''}
                            onChange={e => handleNewsChange(item.id, 'slug', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white font-mono focus:ring-2 focus:ring-blue-500 transition-all"
                            placeholder="news-slug"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Category</label>
                          <input
                            type="text"
                            value={item.category || ''}
                            onChange={e => handleNewsChange(item.id, 'category', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
                            placeholder="Industry / Updates"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">News Cover / Thumbnail URL (16:9)</label>
                          <ImageUpload
                            value={item.logo_url || ''}
                            onChange={val => handleNewsChange(item.id, 'logo_url', val)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white font-mono focus-within:ring-2 focus-within:ring-blue-500 transition-all overflow-hidden"
                            placeholder="https://... (16:9 YouTube thumbnail recommended)"
                          />
                          {item.logo_url && (
                            <div className="mt-4 flex items-center justify-center w-full max-w-sm rounded-xl overflow-hidden border border-black/10 dark:border-white/10 bg-slate-100 dark:bg-slate-800 p-2">
                              <img src={item.logo_url} alt="Thumbnail Preview" className="max-w-full h-auto max-h-48 object-contain rounded-md shadow-sm" />
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Short Summary / Description</label>
                        <textarea
                          value={item.description || ''}
                          onChange={e => handleNewsChange(item.id, 'description', e.target.value)}
                          rows={3}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
                          placeholder="Brief summary for listings and search cards..."
                        />
                      </div>

                      <h4 className="font-bold text-sm text-slate-900 dark:text-white border-b border-black/5 dark:border-white/5 pb-2 mt-6">Leadership / Author Config</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">CEO / Author Name</label>
                          <input
                            type="text"
                            value={item.ceo_name || ''}
                            onChange={e => handleNewsChange(item.id, 'ceo_name', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
                            placeholder="Author Name"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">CEO Role / Subtitle</label>
                          <input
                            type="text"
                            value={item.ceo_description || ''}
                            onChange={e => handleNewsChange(item.id, 'ceo_description', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
                            placeholder="CEO & Managing Director"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white border-b border-black/5 dark:border-white/5 pb-2">SEO & Social Meta</h4>
                      <div className="grid gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">SEO Meta Title</label>
                          <input
                            type="text"
                            value={item.seo_title || ''}
                            onChange={e => handleNewsChange(item.id, 'seo_title', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
                            placeholder="Search engine title..."
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">SEO Meta Description</label>
                          <textarea
                            value={item.seo_description || ''}
                            onChange={e => handleNewsChange(item.id, 'seo_description', e.target.value)}
                            rows={2}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
                            placeholder="Meta description for search snippets..."
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Social OG Image</label>
                            <ImageUpload
                              value={item.og_image_url || ''}
                              onChange={val => handleNewsChange(item.id, 'og_image_url', val)}
                              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white font-mono focus-within:ring-2 focus-within:ring-blue-500 transition-all overflow-hidden"
                              placeholder="https://..."
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Canonical URL</label>
                            <input
                              type="text"
                              value={item.canonical_url || ''}
                              onChange={e => handleNewsChange(item.id, 'canonical_url', e.target.value)}
                              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white font-mono focus:ring-2 focus:ring-blue-500 transition-all"
                              placeholder="https://www.rummydex.com/news/..."
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Target Region</label>
                            <input
                              type="text"
                              value={item.target_region || ''}
                              onChange={e => handleNewsChange(item.id, 'target_region', e.target.value)}
                              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
                              placeholder="Global / India"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">SEO Keywords</label>
                            <input
                              type="text"
                              value={item.seo_keywords || ''}
                              onChange={e => handleNewsChange(item.id, 'seo_keywords', e.target.value)}
                              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
                              placeholder="comma, separated, tags"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">External Source Link</label>
                            <input
                              type="text"
                              value={item.link || ''}
                              onChange={e => handleNewsChange(item.id, 'link', e.target.value)}
                              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white font-mono focus:ring-2 focus:ring-blue-500 transition-all"
                              placeholder="https://source-news-link..."
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Related Application</label>
                            <select
                              value={item.related_app_id || ''}
                              onChange={e => handleNewsChange(item.id, 'related_app_id', e.target.value)}
                              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
                            >
                              <option value="">No App Linked</option>
                              {appsList && appsList.map((app: any) => (
                                <option key={app.id} value={app.id}>
                                  {app.name} ({app.id})
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* HTML Content Body */}
                  <div className="space-y-3 pt-4 border-t border-black/10 dark:border-white/10">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">Full Article HTML / Markdown Content</h4>
                      <span className="text-xs text-slate-400">Supports standard HTML &amp; paragraphs</span>
                    </div>
                    <textarea
                      value={item.content || item.description_html || ''}
                      onChange={e => {
                        handleNewsChange(item.id, 'content', e.target.value);
                        handleNewsChange(item.id, 'description_html', e.target.value);
                      }}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-4 text-slate-800 dark:text-slate-200 font-mono text-sm shadow-inner min-h-[300px] focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder="<p>Full article body HTML content...</p>"
                    />
                  </div>

                  {/* Editor Bottom Actions */}
                  <div className="pt-4 border-t border-black/10 dark:border-white/10 flex flex-col sm:flex-row justify-end items-center gap-3">
                    <button
                      onClick={() => setEditingNewsId(null)}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                    >
                      Close Editor
                    </button>
                    <button
                      onClick={() => handleSaveItemAndClose(item.id)}
                      disabled={saving}
                      className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-50 text-white px-8 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
                    >
                      {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      <span>Save News Article</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Collapsed Item View */
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-start gap-4">
                    {item.logo_url ? (
                      <div className="w-24 h-16 bg-slate-50 dark:bg-slate-900/50 rounded-xl flex items-center justify-center border border-black/10 shadow-sm shrink-0 p-1">
                        <img
                          src={item.logo_url}
                          className="max-w-full max-h-full object-contain rounded-md"
                          loading="lazy"
                          alt={item.title}
                        />
                      </div>
                    ) : (
                      <div className="w-24 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-xl flex items-center justify-center border border-blue-100 dark:border-blue-800 shrink-0">
                        <Newspaper className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-base dark:text-white flex items-center gap-2">
                        {item.title || 'Untitled News'}
                        {item.category && (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {item.category}
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {item.description || 'No description provided.'}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500 mt-2 font-mono">
                        <span>Slug: /{item.slug || 'news'}</span>
                        <span>•</span>
                        <span>{new Date(item.created_at || item.date || item.published_at || new Date()).toLocaleDateString()}</span>
                        {item.ceo_name && (
                          <>
                            <span>•</span>
                            <span className="text-slate-600 dark:text-slate-300 font-sans">Author: {item.ceo_name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => setEditingNewsId(item.id)}
                      className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-3.5 py-2 rounded-lg font-semibold text-xs transition-all"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete "${item.title || 'this item'}"?`)) {
                          handleDeleteNews(item.id);
                          const updatedList = newsList.filter(n => n.id !== item.id);
                          handleSaveAll(updatedList);
                        }
                      }}
                      className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 px-3.5 py-2 rounded-lg font-semibold text-xs transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Bottom Sticky Sync Bar */}
      {newsList.length > 0 && (
        <div className="mt-8 pt-6 border-t border-black/10 dark:border-white/10 flex justify-between items-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Clicking Save synchronizes all news entries to Cloud Firestore and local storage.
          </p>
          <button
            onClick={() => handleSaveAll()}
            disabled={saving}
            className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? 'Synchronizing News...' : 'Save & Sync All News'}</span>
          </button>
        </div>
      )}
    </div>
  );
});

AdminNewsTab.displayName = 'AdminNewsTab';

export default AdminNewsTab;
