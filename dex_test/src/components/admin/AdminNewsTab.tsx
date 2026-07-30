import React, { useState } from 'react';
import { Newspaper, Plus, Trash2, LayoutDashboard, Edit2, Save } from 'lucide-react';
import { toast } from '../Toast';

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

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-2xl border border-black/10 dark:border-white/10 shadow-sm">
        <h2 className="text-xl font-bold flex items-center gap-2 dark:text-white"><Newspaper className="w-5 h-5 text-blue-500" /> News System</h2>
        <button onClick={() => {
          const newId = handleAddNews();
          setEditingNewsId(newId);
        }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all"><Plus className="w-4 h-4" /> Add News Item</button>
      </div>
      <div className="space-y-4">
        {newsList.map((item: any) => (
          <div key={item.id} className="bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 rounded-2xl p-6 shadow-sm relative overflow-hidden">
            {editingNewsId === item.id ? (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-black/10 dark:border-white/10 pb-4 mb-4 gap-4">
                  <div>
                    <h3 className="font-bold text-lg text-blue-600 flex items-center gap-2"><LayoutDashboard className="w-4 h-4"/> Edit News</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">ID: {item.id}</p>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button onClick={() => handleDeleteNews(item.id)} className="flex-1 sm:flex-none flex justify-center items-center gap-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 text-rose-600 px-4 py-2 rounded-lg font-semibold text-sm transition-all"><Trash2 className="w-4 h-4" /> Delete</button>
                    <button onClick={() => setEditingNewsId(null)} className="flex-1 sm:flex-none flex justify-center items-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all">Close</button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-5">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white border-b border-black/5 dark:border-white/5 pb-2">General Information</h4>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Title</label>
                      <input type="text" value={item.title} onChange={e => handleNewsChange(item.id, 'title', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" placeholder="News Title" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Slug (URL)</label>
                        <input type="text" value={item.slug} onChange={e => handleNewsChange(item.id, 'slug', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Category</label>
                        <input type="text" value={item.category || ''} onChange={e => handleNewsChange(item.id, 'category', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Logo URL</label>
                        <input type="text" value={item.logo_url} onChange={e => handleNewsChange(item.id, 'logo_url', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Short Description</label>
                      <textarea value={item.description} onChange={e => handleNewsChange(item.id, 'description', e.target.value)} rows={3} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"></textarea>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 dark:text-white border-b border-black/5 dark:border-white/5 pb-2 mt-6">Leadership / CEO Config</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">CEO Name</label>
                        <input type="text" value={item.ceo_name} onChange={e => handleNewsChange(item.id, 'ceo_name', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">CEO Role/Title</label>
                        <input type="text" value={item.ceo_description} onChange={e => handleNewsChange(item.id, 'ceo_description', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white border-b border-black/5 dark:border-white/5 pb-2">SEO & Social Meta</h4>
                    <div className="grid gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">SEO Title</label>
                        <input type="text" value={item.seo_title} onChange={e => handleNewsChange(item.id, 'seo_title', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">SEO Description</label>
                        <textarea value={item.seo_description} onChange={e => handleNewsChange(item.id, 'seo_description', e.target.value)} rows={2} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"></textarea>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Social OG Image</label>
                          <input type="text" value={item.og_image_url} onChange={e => handleNewsChange(item.id, 'og_image_url', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Canonical URL</label>
                          <input type="text" value={item.canonical_url} onChange={e => handleNewsChange(item.id, 'canonical_url', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Target Region</label>
                          <input type="text" value={item.target_region} onChange={e => handleNewsChange(item.id, 'target_region', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" placeholder="Global" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">SEO Keywords</label>
                          <input type="text" value={item.seo_keywords} onChange={e => handleNewsChange(item.id, 'seo_keywords', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" placeholder="Comma separated" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Source Link</label>
                          <input type="text" value={item.link} onChange={e => handleNewsChange(item.id, 'link', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" />
                        </div>
                      </div>
                      <div className="pt-4">
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Related Application ID (Optional)</label>
                        <select 
                          value={item.related_app_id || ''} 
                          onChange={e => handleNewsChange(item.id, 'related_app_id', e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
                        >
                          <option value="">No App Linked</option>
                          {appsList && appsList.map((app: any) => (
                            <option key={app.id} value={app.id}>{app.name} ({app.id})</option>
                          ))}
                        </select>
                      </div>

                    </div>
                  </div>
                </div>
                <div className="space-y-4 pt-4 border-t border-black/10 dark:border-white/10">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">Full HTML / Markdown Content</h4>
                  <textarea value={item.content} onChange={e => handleNewsChange(item.id, 'content', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-4 text-slate-800 dark:text-slate-200 font-mono text-sm shadow-inner min-h-[400px] focus:ring-2 focus:ring-blue-500 transition-all" placeholder="HTML content here..."></textarea>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-4">
                    {item.logo_url ? (
                      <img src={item.logo_url} className="w-16 h-16 object-cover rounded-xl border border-black/10 shadow-sm" loading="lazy" width={64} height={64} alt={item.title} />
                    ) : (
                      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-700">
                        <Newspaper className="w-6 h-6 text-slate-400" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-lg dark:text-white">{item.title || 'Untitled News'}</h3>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">{item.category || "Uncategorized"} • {new Date(item.date).toLocaleDateString()}</p>
                      {item.slug && <p className="text-xs font-mono text-slate-400 dark:text-slate-500 mt-1">{item.slug}</p>}
                    </div>
                  </div>
                  <button onClick={() => setEditingNewsId(item.id)} className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 text-blue-600 px-4 py-2 rounded-lg font-semibold text-sm transition-all"><Edit2 className="w-4 h-4" /> Edit</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-8 pt-6 border-t border-black/10 dark:border-white/10 flex justify-end">
        <button 
          onClick={async () => {
            setSaving(true);
            try {
              await saveNews(newsList);
              toast('News successfully saved and synchronized.', 'success');
            } catch(e) {
              console.error(e);
              toast('Failed to save news.', 'error');
            }
            setSaving(false);
          }} 
          disabled={saving} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          {saving ? 'Synchronizing News...' : <><Save className="w-5 h-5"/> Sync All News</>}
        </button>
      </div>
    </div>
  );
});

AdminNewsTab.displayName = 'AdminNewsTab';

export default AdminNewsTab;
