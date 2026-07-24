import React, { useState } from 'react';
import { Plus, Trash2, Edit2, LayoutDashboard, Newspaper, Save, Globe, Image, Calendar, Tag, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import ImageUpload from "./ImageUpload";
const NewsTab = React.memo(({ newsList, handleAddNews, handleDeleteNews, handleNewsChange, saveNews, saving, setSaving, appsList }: any) => {
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-[24px] border border-black/5 dark:border-white/5 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3 dark:text-white">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl">
              <Newspaper className="w-6 h-6" />
            </div>
            News System
          </h2>
          <p className="text-sm text-slate-500 mt-1">Manage network announcements and intelligence reports.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => {
            const newId = handleAddNews();
            if (newId) setEditingNewsId(newId);
          }} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all active:scale-95 shadow-sm">
            <Plus className="w-4 h-4" /> Add News Item
          </button>
          <button 
            onClick={async () => {
              setSaving(true);
              try {
                await saveNews(newsList);
                alert('News successfully saved and synchronized.');
              } catch(e) {
                console.error(e);
                alert('Failed to save news.');
              }
              setSaving(false);
            }} 
            disabled={saving}
            className="shrink-0 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all shadow-sm active:scale-95"
          >
            {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            <span className="hidden sm:inline">{saving ? 'Saving...' : 'Save Updates'}</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {newsList.map((item: any) => (
          <motion.div 
            key={item.id} 
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white dark:bg-slate-900 border ${editingNewsId === item.id ? 'border-blue-500 shadow-md ring-4 ring-blue-500/10' : 'border-black/5 dark:border-white/5'} rounded-[24px] p-6 shadow-sm relative overflow-hidden transition-all`}
          >
            {editingNewsId === item.id ? (
              <div className="space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-black/5 dark:border-white/5 pb-4 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <Edit2 className="w-5 h-5"/>
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-slate-900 dark:text-white">Edit News Entry</h3>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {item.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button onClick={() => handleDeleteNews(item.id)} className="flex-1 sm:flex-none flex justify-center items-center gap-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 text-rose-600 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all"><Trash2 className="w-4 h-4" /> Delete</button>
                    <button onClick={() => setEditingNewsId(null)} className="flex-1 sm:flex-none flex justify-center items-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all">Done Editing</button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-5 space-y-6">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-[20px] border border-black/5 dark:border-white/5 space-y-5">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 border-b border-black/5 dark:border-white/5 pb-2">General Information</h4>
                      
                      <div>
                        <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5">News Title</label>
                        <input type="text" value={item.title || ''} onChange={e => handleNewsChange(item.id, 'title', e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all font-medium" />
                      </div>
                      
                      <div>
                        <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5">URL Slug</label>
                        <input type="text" value={item.slug || ''} onChange={e => handleNewsChange(item.id, 'slug', e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm dark:text-white font-mono focus:ring-2 focus:ring-blue-500 transition-all" />
                      </div>
                      
                      <div>
                        <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5">Short Description</label>
                        <textarea value={item.description || ''} onChange={e => handleNewsChange(item.id, 'description', e.target.value)} rows={3} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all resize-none"></textarea>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5">Category</label>
                          <input type="text" value={item.category || ''} onChange={e => handleNewsChange(item.id, 'category', e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all" placeholder="e.g. Update" />
                        </div>
                        <div>
                          <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5">Date</label>
                          <input type="date" value={item.date ? new Date(item.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]} onChange={e => handleNewsChange(item.id, 'date', new Date(e.target.value).toISOString())} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all" />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5">Author (CEO/Official Name)</label>
                          <input type="text" value={item.ceo_name || ''} onChange={e => handleNewsChange(item.id, 'ceo_name', e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all" />
                        </div>
                        <div>
                          <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5">Author Role</label>
                          <input type="text" value={item.ceo_description || ''} onChange={e => handleNewsChange(item.id, 'ceo_description', e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50/50 dark:bg-blue-900/10 p-5 rounded-[20px] border border-blue-100 dark:border-blue-800/30 space-y-5">
                      <h4 className="font-bold text-sm text-blue-800 dark:text-blue-300 flex items-center gap-2 border-b border-blue-200 dark:border-blue-800/50 pb-2"><Globe className="w-4 h-4" /> SEO & Social Meta</h4>
                      <div className="grid gap-4">
                        <div>
                          <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5">SEO Title</label>
                          <input type="text" value={item.seo_title || ''} onChange={e => handleNewsChange(item.id, 'seo_title', e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all" />
                        </div>
                        <div>
                          <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5">SEO Description</label>
                          <textarea value={item.seo_description || ''} onChange={e => handleNewsChange(item.id, 'seo_description', e.target.value)} rows={2} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all resize-none"></textarea>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5">Canonical URL</label>
                            <input type="url" value={item.canonical_url || ''} onChange={e => handleNewsChange(item.id, 'canonical_url', e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm dark:text-white font-mono focus:ring-2 focus:ring-blue-500 transition-all" />
                          </div>
                          <div>
                            <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5">Target Region</label>
                            <input type="text" value={item.target_region || ''} onChange={e => handleNewsChange(item.id, 'target_region', e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Global" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5">SEO Keywords</label>
                          <input type="text" value={item.seo_keywords || ''} onChange={e => handleNewsChange(item.id, 'seo_keywords', e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Comma separated" />
                        </div>
                        <div className="pt-2 border-t border-blue-200 dark:border-blue-800/50">
                          <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5">Related Application (Optional)</label>
                          <select 
                            value={item.related_app_id || ''} 
                            onChange={e => handleNewsChange(item.id, 'related_app_id', e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
                          >
                            <option value="">No App Linked</option>
                            {appsList && appsList.map((app: any) => (
                              <option key={app.id} value={app.id}>{app.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-7 space-y-6 flex flex-col">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-[20px] border border-black/5 dark:border-white/5 space-y-5">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2"><Image className="w-4 h-4 text-slate-400" /> Media & Content</h4>
                      
                      <div>
                        <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5">Cover Image URL</label>
                        <ImageUpload value={item.logo_url || ''} onChange={(val) => handleNewsChange(item.id, 'logo_url', val)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white focus-within:ring-2 focus-within:ring-blue-500 overflow-hidden" placeholder="https://..." />
                      </div>
                      
                      {item.logo_url && (
                        <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm relative group h-40">
                          <img src={item.logo_url} className="w-full h-full object-cover" alt="Preview" />
                        </div>
                      )}
                      
                      <div>
                        <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5">Source Link (Optional)</label>
                        <input type="url" value={item.link || ''} onChange={e => handleNewsChange(item.id, 'link', e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm dark:text-white font-mono focus:ring-2 focus:ring-blue-500 transition-all" placeholder="https://external-site.com" />
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-[20px] border border-black/5 dark:border-white/5 space-y-4 flex-1 flex flex-col">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">Full HTML / Markdown Content</h4>
                      <textarea value={item.content || item.description_html || ''} onChange={e => handleNewsChange(item.id, 'content', e.target.value)} className="w-full flex-1 bg-white dark:bg-[#1e1e1e] border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-slate-800 dark:text-slate-300 font-mono text-sm shadow-inner min-h-[300px] focus:ring-2 focus:ring-blue-500 transition-all resize-none leading-relaxed" placeholder="HTML content here..."></textarea>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="flex items-center gap-5 w-full">
                  <div className="w-24 h-24 rounded-xl overflow-hidden border border-black/5 dark:border-white/10 shrink-0 shadow-sm hidden sm:block">
                    <img src={item.logo_url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&h=200&fit=crop'} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider rounded-full">{item.category || 'General'}</span>
                      <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {item.date ? new Date(item.date).toLocaleDateString() : new Date().toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white truncate">{item.title || 'Untitled News'}</h3>
                    <p className="text-sm text-slate-500 truncate mt-1">/{item.slug || 'no-slug'}</p>
                    
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Globe className={`w-3.5 h-3.5 ${item.canonical_url ? 'text-emerald-500' : 'text-amber-500'}`} />
                        {item.canonical_url ? 'SEO Optimized' : 'Missing Canonical'}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                  <button onClick={() => setEditingNewsId(item.id)} className="flex-1 sm:flex-none flex justify-center items-center gap-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all border border-slate-200 dark:border-slate-700">
                    <Edit2 className="w-4 h-4" /> Edit
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
});

export default NewsTab;
