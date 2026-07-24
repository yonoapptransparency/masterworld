import React, { useState } from 'react';
import { FileText, Plus, Trash2, Edit2, LayoutDashboard, Globe, AlertTriangle, MessageSquare, Search, Eye, Tag, Calendar, Image, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import ImageUpload from "./ImageUpload";
const BlogsTab = React.memo(({ blogs, handleAddBlog, handleDeleteBlog, handleBlogChange, handleSaveBlogs, saving }: any) => {
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredBlogs = blogs.filter((b: any) => 
    b.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.slug?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-slate-900 p-6 rounded-[24px] border border-black/5 dark:border-white/5 shadow-sm gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3 dark:text-white">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl">
              <FileText className="w-6 h-6" />
            </div>
            App Updates Manager
          </h2>
          <p className="text-sm text-slate-500 mt-1">Manage app release notes, walkthroughs, and developer updates.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search updates..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
            />
          </div>
          <button 
            onClick={() => {
              const newId = handleAddBlog();
              if (newId) setEditingBlogId(newId);
            }} 
            className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4" /> 
            <span className="hidden sm:inline">New Update</span>
          </button>
        </div>
        <button 
          onClick={handleSaveBlogs} 
          disabled={saving}
          className="shrink-0 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all shadow-sm active:scale-95"
        >
          {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
          <span className="hidden sm:inline">{saving ? 'Saving...' : 'Save Updates'}</span>
        </button>

      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredBlogs.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[24px] border border-black/5 border-dashed">
            <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No updates found</h3>
            <p className="text-slate-500 mt-1">Click "New Update" to create your first app update.</p>
          </div>
        ) : (
          filteredBlogs.map((blog: any) => (
            <motion.div 
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={blog.id} 
              className={`bg-white dark:bg-slate-900 border ${editingBlogId === blog.id ? 'border-blue-500 shadow-md ring-4 ring-blue-500/10' : 'border-black/5 dark:border-white/5'} rounded-[24px] p-6 shadow-sm relative overflow-hidden transition-all`}
            >
              {editingBlogId === blog.id ? (
                <div className="space-y-8">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-black/5 dark:border-white/5 pb-4 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <Edit2 className="w-5 h-5"/>
                      </div>
                      <div>
                        <h3 className="font-bold text-xl text-slate-900 dark:text-white">Edit Update Entry</h3>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {blog.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button onClick={() => handleDeleteBlog(blog.id)} className="flex-1 sm:flex-none flex justify-center items-center gap-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 text-rose-600 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all">
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                      <button onClick={() => setEditingBlogId(null)} className="flex-1 sm:flex-none flex justify-center items-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all">
                        Done Editing
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column - Core Info */}
                    <div className="lg:col-span-5 space-y-6">
                      
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-[20px] border border-black/5 dark:border-white/5 space-y-5">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                          <FileText className="w-4 h-4 text-slate-400" /> Core Information
                        </h4>
                        
                        <div>
                          <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5">Update Title</label>
                          <input type="text" value={blog.title || ''} onChange={(e) => handleBlogChange(blog.id, 'title', e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all font-medium" placeholder="e.g. Version 2.0 Release Notes" />
                        </div>
                        
                        <div>
                          <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5">URL Slug (Permalink)</label>
                          <input type="text" value={blog.slug || ''} onChange={(e) => handleBlogChange(blog.id, 'slug', e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm dark:text-white font-mono focus:ring-2 focus:ring-blue-500 transition-all" placeholder="version-2-0-release" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5">Author Name</label>
                            <input type="text" value={blog.author || ''} onChange={(e) => handleBlogChange(blog.id, 'author', e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Admin Team" />
                          </div>
                          <div>
                            <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5">Publish Date</label>
                            <input type="date" value={blog.publish_date ? new Date(blog.publish_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]} onChange={(e) => handleBlogChange(blog.id, 'publish_date', e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all" />
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-[20px] border border-black/5 dark:border-white/5 space-y-5">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                          <LayoutDashboard className="w-4 h-4 text-slate-400" /> App Association
                        </h4>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5">Related App Slug</label>
                            <input type="text" value={blog.related_app_slug || ''} onChange={(e) => handleBlogChange(blog.id, 'related_app_slug', e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm dark:text-white font-mono focus:ring-2 focus:ring-blue-500 transition-all" placeholder="app-slug" />
                          </div>
                          <div>
                            <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5">Related App Name</label>
                            <input type="text" value={blog.related_app_name || ''} onChange={(e) => handleBlogChange(blog.id, 'related_app_name', e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all" placeholder="App Name" />
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50/50 dark:bg-blue-900/10 p-5 rounded-[20px] border border-blue-100 dark:border-blue-800/30 space-y-5">
                        <h4 className="font-bold text-sm text-blue-800 dark:text-blue-300 flex items-center gap-2">
                          <Globe className="w-4 h-4 text-blue-500" /> SEO & Canonical Optimisation
                        </h4>
                        
                        <div>
                          <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5">SEO Title (Meta Title)</label>
                          <input type="text" value={blog.seo_title || ''} onChange={(e) => handleBlogChange(blog.id, 'seo_title', e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Optimised Title for Search Engines" />
                        </div>
                        
                        <div>
                          <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5">Canonical URL</label>
                          <input type="url" value={blog.canonical_url || ''} onChange={(e) => handleBlogChange(blog.id, 'canonical_url', e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm dark:text-white font-mono focus:ring-2 focus:ring-blue-500 transition-all" placeholder="https://example.com/blog/version-2" />
                          <p className="text-[10px] text-slate-500 mt-1.5 leading-snug">Crucial for SEO. Set the preferred URL if this content is duplicated across multiple pages or domains.</p>
                        </div>
                        
                        <div>
                          <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5">SEO Description</label>
                          <textarea value={blog.seo_description || ''} onChange={(e) => handleBlogChange(blog.id, 'seo_description', e.target.value)} rows={2} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all resize-none" placeholder="Brief summary for search engine results..."></textarea>
                        </div>

                        <div>
                          <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5">Keywords (Comma Separated)</label>
                          <input type="text" value={blog.seo_keywords || ''} onChange={(e) => handleBlogChange(blog.id, 'seo_keywords', e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all" placeholder="update, new features, gaming" />
                        </div>
                        
                        <div>
                          <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5">Target Region</label>
                          <input type="text" value={blog.target_region || ''} onChange={(e) => handleBlogChange(blog.id, 'target_region', e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Global" />
                        </div>
                      </div>
                      
                    </div>

                    {/* Right Column - Content & Media */}
                    <div className="lg:col-span-7 space-y-6">
                      
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-[20px] border border-black/5 dark:border-white/5 space-y-5">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                          <Image className="w-4 h-4 text-slate-400" /> Media & Visuals
                        </h4>
                        
                        <div>
                          <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5">Hero Cover Image URL</label>
                          <ImageUpload value={blog.cover_url || ''} onChange={(val) => handleBlogChange(blog.id, 'cover_url', val)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white focus-within:ring-2 focus-within:ring-blue-500 overflow-hidden" placeholder="https://..." />
                        </div>
                        
                        {blog.cover_url && (
                          <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm relative group">
                            <img src={blog.cover_url} className="w-full h-40 object-cover" alt="Cover Preview" onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80'; }} />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <span className="text-white text-xs font-bold uppercase tracking-wider bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">Image Preview</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-[20px] border border-black/5 dark:border-white/5 space-y-4 flex flex-col h-[calc(100%-250px)] min-h-[500px]">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                          <FileText className="w-4 h-4 text-slate-400" /> Markdown / HTML Content
                        </h4>
                        <textarea 
                          value={blog.content || ''} 
                          onChange={(e) => handleBlogChange(blog.id, 'content', e.target.value)} 
                          className="w-full flex-1 bg-white dark:bg-[#1e1e1e] border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-slate-800 dark:text-slate-300 font-mono text-sm shadow-inner focus:ring-2 focus:ring-blue-500 transition-all resize-none leading-relaxed" 
                          placeholder="## Write your update here...&#10;&#10;Supports full Markdown and HTML. Use headings, lists, and images to format your release notes."
                        ></textarea>
                      </div>

                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                  <div className="flex items-center gap-5 w-full">
                    <div className="w-24 h-24 rounded-xl overflow-hidden border border-black/5 dark:border-white/10 shrink-0 shadow-sm hidden sm:block">
                      <img src={blog.cover_url || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=200&h=200&fit=crop'} alt={blog.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider rounded-full">{blog.related_app_name || 'General'}</span>
                        <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {blog.publish_date ? new Date(blog.publish_date).toLocaleDateString() : new Date().toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white truncate">{blog.title || 'Untitled Update'}</h3>
                      <p className="text-sm text-slate-500 truncate mt-1">/{blog.slug || 'no-slug'}</p>
                      
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Globe className={`w-3.5 h-3.5 ${blog.canonical_url ? 'text-emerald-500' : 'text-amber-500'}`} />
                          {blog.canonical_url ? 'SEO Optimized' : 'Missing Canonical'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                    <button onClick={() => setEditingBlogId(blog.id)} className="flex-1 sm:flex-none flex justify-center items-center gap-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all border border-slate-200 dark:border-slate-700">
                      <Edit2 className="w-4 h-4" /> Edit
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
});

export default BlogsTab;
