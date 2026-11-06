import React, { useState, useMemo, useEffect } from 'react';
import {
  Newspaper, Plus, Trash2, Search, Calendar, Pin,
  ArrowUpDown, X, ExternalLink, Edit3
} from 'lucide-react';
import { toast } from '../Toast';
import { AdminNewsEditor } from './news/AdminNewsEditor';

interface AdminNewsTabProps {
  newsList: any[];
  saving: boolean;
  handleAddNews: (initialCategory?: string) => string;
  handleNewsChange: (id: string, field: string, value: any) => void;
  handleDeleteNews: (id: string) => void;
  saveNews: (list: any[]) => Promise<void>;
  saveSingleNews?: (item: any) => Promise<any>;
  setSaving: (saving: boolean) => void;
  appsList?: any[];
}

const PRESET_CATEGORIES = [
  'General', 'Security Alert', 'App Update', 'Rummy Guide',
  'Bonus & Promo', 'Industry News', 'Transparency Report', 'New Launch'
];

const stripHtmlFast = (html: string): string =>
  String(html || '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const AdminNewsTab = React.memo(({
  newsList, saving, handleAddNews, handleNewsChange, handleDeleteNews,
  saveNews, saveSingleNews, setSaving, appsList = []
}: AdminNewsTabProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'pinned'>('all');
  const [linkedAppFilter, setLinkedAppFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');

  const [autoSlugMap, setAutoSlugMap] = useState<Record<string, boolean>>({});
  const [extraCategories, setExtraCategories] = useState<string[]>([]);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<any | null>(null);
  const [savingSingleId, setSavingSingleId] = useState<string | null>(null);

  const generateSlug = (text: string) =>
    String(text || '').toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

  const getArticleHtml = (item: any): string =>
    item ? String(item.content ?? item.description_html ?? item.content_html ?? '') : '';

  const getArticleImage = (item: any): string =>
    item ? String(item.image_url || item.logo_url || item.image || '') : '';

  const isArticlePinned = (item: any): boolean => Boolean(item?.is_pinned ?? item?.pinned);
  const isArticleDraft = (item: any): boolean => item?.status === 'draft' || item?.sync_to_public === false;

  const getTagsString = (item: any): string => {
    if (!item) return '';
    if (typeof item.seo_keywords === 'string' && item.seo_keywords.trim()) return item.seo_keywords;
    if (Array.isArray(item.tags)) return item.tags.filter(Boolean).join(', ');
    if (typeof item.tags === 'string') return item.tags;
    return '';
  };

  // Pre-index apps by ID for O(1) lookup
  const appsById = useMemo(() => {
    const map = new Map<string, any>();
    (appsList || []).forEach(a => {
      if (a?.id !== undefined) map.set(String(a.id), a);
    });
    return map;
  }, [appsList]);

  // Pre-compute plain text, word count, and search blob once per newsList update
  const enrichedNews = useMemo(() => {
    return (newsList || []).filter(Boolean).map(news => {
      const htmlBody = getArticleHtml(news);
      const plain = stripHtmlFast(htmlBody);
      const words = plain ? plain.split(/\s+/).filter(Boolean).length : 0;
      const tagsStr = getTagsString(news);
      const searchBlob = `${news.title || ''} ${news.description || ''} ${news.slug || ''} ${news.category || ''} ${tagsStr} ${plain}`.toLowerCase();
      return {
        raw: news,
        htmlBody,
        plain,
        words,
        searchBlob
      };
    });
  }, [newsList]);

  const availableCategories = useMemo(() => {
    const set = new Set<string>(PRESET_CATEGORIES);
    extraCategories.forEach(c => c.trim() && set.add(c.trim()));
    enrichedNews.forEach(({ raw }) => raw?.category && String(raw.category).trim() && set.add(String(raw.category).trim()));
    return Array.from(set);
  }, [enrichedNews, extraCategories]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: enrichedNews.length };
    enrichedNews.forEach(({ raw }) => {
      const cat = String(raw?.category || 'General').trim();
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [enrichedNews]);

  const stats = useMemo(() => {
    const total = enrichedNews.length;
    let drafts = 0;
    let pinned = 0;
    enrichedNews.forEach(({ raw }) => {
      if (isArticleDraft(raw)) drafts++;
      if (isArticlePinned(raw)) pinned++;
    });
    return { total, published: total - drafts, drafts, pinned };
  }, [enrichedNews]);

  const filteredNews = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = enrichedNews.filter(({ raw: news, searchBlob }) => {
      const matchesSearch = !q || searchBlob.includes(q);
      const itemCat = String(news.category || 'General').trim();
      const matchesCat = selectedCategory === 'all' || itemCat.toLowerCase() === selectedCategory.toLowerCase();
      const draft = isArticleDraft(news);
      const pinned = isArticlePinned(news);
      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'published' && !draft) ||
        (statusFilter === 'draft' && draft) ||
        (statusFilter === 'pinned' && pinned);
      const matchesApp = linkedAppFilter === 'all' ||
        (linkedAppFilter === 'linked' && Boolean(news.related_app_id)) ||
        (linkedAppFilter === 'unlinked' && !news.related_app_id) ||
        String(news.related_app_id || '') === linkedAppFilter;

      return matchesSearch && matchesCat && matchesStatus && matchesApp;
    });

    return [...filtered].sort((a, b) => {
      const aPin = isArticlePinned(a.raw);
      const bPin = isArticlePinned(b.raw);
      if (aPin && !bPin) return -1;
      if (!aPin && bPin) return 1;
      if (sortBy === 'title') return String(a.raw.title || '').localeCompare(String(b.raw.title || ''));
      const dA = new Date(a.raw.date || a.raw.published_at || a.raw.created_at || 0).getTime();
      const dB = new Date(b.raw.date || b.raw.published_at || b.raw.created_at || 0).getTime();
      return sortBy === 'oldest' ? dA - dB : dB - dA;
    });
  }, [enrichedNews, searchQuery, selectedCategory, statusFilter, linkedAppFilter, sortBy]);

  const editingArticle = useMemo(() =>
    editingId ? (newsList || []).find(n => n.id === editingId) || null : null
  , [newsList, editingId]);

  useEffect(() => {
    if (editingId) window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [editingId]);

  const handleCreateNewArticle = () => {
    const newId = handleAddNews(selectedCategory !== 'all' ? selectedCategory : 'General');
    if (newId) {
      setAutoSlugMap(prev => ({ ...prev, [newId]: true }));
      setEditingId(newId);
    }
  };

  const handleOpenEdit = (news: any) => {
    const isAuto = !news.slug || news.slug.startsWith('news-') || news.slug === generateSlug(news.title || '');
    setAutoSlugMap(prev => ({ ...prev, [news.id]: isAuto }));
    setEditingId(news.id);
  };

  const handleSaveCurrentArticle = async (news: any, closeAfterSave = false) => {
    if (!news) return;
    const trimmedTitle = String(news.title || '').trim();
    if (!trimmedTitle) {
      toast('Please enter an Article Headline before saving.', 'error');
      return;
    }
    const finalSlug = String(news.slug || '').trim() || generateSlug(trimmedTitle) || `news-${news.id}`;
    const htmlBody = getArticleHtml(news);
    const plainBody = stripHtmlFast(htmlBody);
    const words = plainBody ? plainBody.split(/\s+/).filter(Boolean).length : 0;
    const readTime = `${Math.max(1, Math.ceil(words / 200))} min read`;
    const finalDesc = String(news.description || '').trim() || (plainBody ? (plainBody.length > 155 ? `${plainBody.substring(0, 152).trim()}...` : plainBody) : trimmedTitle);
    const coverImg = getArticleImage(news);
    const draft = isArticleDraft(news);
    const pinned = isArticlePinned(news);

    const preparedItem = {
      ...news,
      title: trimmedTitle,
      slug: finalSlug,
      description: finalDesc,
      content: htmlBody,
      description_html: htmlBody,
      content_html: htmlBody,
      image_url: coverImg,
      logo_url: coverImg,
      image: coverImg,
      is_pinned: pinned,
      pinned,
      status: draft ? 'draft' : 'published',
      sync_to_public: !draft,
      read_time: news.read_time || readTime,
      updated_at: new Date().toISOString()
    };

    setSavingSingleId(news.id);
    setSaving(true);
    try {
      if (saveSingleNews) {
        await saveSingleNews(preparedItem);
      } else {
        await saveNews((newsList || []).map(item => (item.id === news.id ? preparedItem : item)));
      }
      if (closeAfterSave) setEditingId(null);
    } catch (_) {} finally {
      setSavingSingleId(null);
      setSaving(false);
    }
  };

  const handleQuickToggleStatus = async (news: any) => {
    const nextStatus = isArticleDraft(news) ? 'published' : 'draft';
    handleNewsChange(news.id, 'status', nextStatus);
    if (saveSingleNews) {
      try {
        await saveSingleNews({ ...news, status: nextStatus, sync_to_public: nextStatus === 'published', updated_at: new Date().toISOString() });
      } catch (_) {}
    }
  };

  const handleQuickTogglePin = async (news: any) => {
    const nextPinned = !isArticlePinned(news);
    handleNewsChange(news.id, 'is_pinned', nextPinned);
    if (saveSingleNews) {
      try {
        await saveSingleNews({ ...news, is_pinned: nextPinned, pinned: nextPinned, updated_at: new Date().toISOString() });
      } catch (_) {}
    }
  };

  return (
    <>
      {editingArticle ? (
        <AdminNewsEditor
          article={editingArticle}
          appsList={appsList}
          availableCategories={availableCategories}
          isAutoSlug={autoSlugMap[editingArticle.id] ?? false}
          setIsAutoSlug={(val) => setAutoSlugMap(prev => ({ ...prev, [editingArticle.id]: val }))}
          isSaving={saving || savingSingleId === editingArticle.id}
          onBack={() => setEditingId(null)}
          onChange={handleNewsChange}
          onSave={handleSaveCurrentArticle}
          onDeleteRequest={(art) => setDeleteConfirmItem(art)}
          onAddCustomCategory={(catName) => {
            if (!extraCategories.includes(catName)) setExtraCategories(prev => [...prev, catName]);
            handleNewsChange(editingArticle.id, 'category', catName);
            toast(`Category "${catName}" selected!`, 'success');
          }}
        />
      ) : (
        <div className="w-full space-y-2.5 pb-4 animate-fade-in">
          {/* Unified Compact Top Header + Search & Filter Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 sm:p-3.5 space-y-2.5 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Newspaper className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>News Articles</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                      {stats.total}
                    </span>
                  </h2>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {stats.published} Live · {stats.drafts} Drafts · {stats.pinned} Pinned
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCreateNewArticle}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer border-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add News Article</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <div className="sm:col-span-6 relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search headline, slug, category, tags..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-8 pr-7 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1.5 text-slate-400 hover:text-slate-600 cursor-pointer bg-transparent border-0 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="sm:col-span-3">
                <select
                  value={linkedAppFilter}
                  onChange={(e) => setLinkedAppFilter(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="all">📱 All Articles</option>
                  <option value="linked">🔗 Linked to App</option>
                  <option value="unlinked">📄 Unlinked News</option>
                  {appsList.map((app: any) => (
                    <option key={app.id} value={app.id}>App: {app.name}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3 relative">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2 pointer-events-none" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-8 pr-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="title">Title (A–Z)</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                {[
                  { id: 'all', label: `All (${stats.total})` },
                  { id: 'published', label: `Live (${stats.published})` },
                  { id: 'draft', label: `Drafts (${stats.drafts})` },
                  { id: 'pinned', label: `Pinned (${stats.pinned})` }
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setStatusFilter(tab.id as any)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap cursor-pointer border-0 ${
                      statusFilter === tab.id ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-full">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap cursor-pointer border ${
                    selectedCategory === 'all' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  All Categories
                </button>
                {availableCategories
                  .filter(cat => (categoryCounts[cat] || 0) > 0 || selectedCategory === cat)
                  .map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap cursor-pointer border ${
                        selectedCategory.toLowerCase() === cat.toLowerCase()
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {cat} ({categoryCounts[cat] || 0})
                    </button>
                  ))}
              </div>
            </div>
          </div>

          {/* Article List */}
          {filteredNews.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center space-y-2.5">
              <Newspaper className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">No matching news articles found</div>
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setStatusFilter('all'); setLinkedAppFilter('all'); }}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold cursor-pointer border-0"
                >
                  Reset Filters
                </button>
                <button
                  type="button"
                  onClick={handleCreateNewArticle}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer border-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add News Article</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {filteredNews.map(({ raw: news, plain, words }) => {
                const coverImg = getArticleImage(news);
                const draft = isArticleDraft(news);
                const pinned = isArticlePinned(news);
                const linkedApp = news.related_app_id ? appsById.get(String(news.related_app_id)) : null;
                const dateStr = String(news.date || news.published_at || news.created_at || '').split('T')[0];

                return (
                  <div
                    key={news.id}
                    className={`bg-white dark:bg-slate-900 border rounded-xl p-2.5 sm:p-3 transition-all hover:border-blue-400/70 shadow-2xs flex flex-col justify-between ${
                      pinned ? 'border-amber-300 dark:border-amber-700/60' : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        onClick={() => handleOpenEdit(news)}
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 flex items-center justify-center cursor-pointer"
                      >
                        {coverImg ? (
                          <img src={coverImg} alt="" loading="lazy" className="w-full h-full object-cover" />
                        ) : (
                          <Newspaper className="w-5 h-5 text-slate-400" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 flex-wrap mb-1">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                            !draft ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${!draft ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            {!draft ? 'Live' : 'Draft'}
                          </span>
                          {pinned && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                              <Pin className="w-2.5 h-2.5" /> Pinned
                            </span>
                          )}
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                            {news.category || 'General'}
                          </span>
                          {linkedApp && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 truncate max-w-[130px]">
                              🔗 {linkedApp.name}
                            </span>
                          )}
                        </div>

                        <h3
                          onClick={() => handleOpenEdit(news)}
                          className="text-xs sm:text-[13px] font-black text-slate-900 dark:text-white hover:text-blue-600 cursor-pointer line-clamp-1"
                        >
                          {news.title || 'Untitled Article'}
                        </h3>

                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {news.description || plain.substring(0, 130) || 'Click Edit to add article content...'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium min-w-0">
                        {dateStr && <span className="flex items-center gap-0.5 shrink-0"><Calendar className="w-3 h-3" />{dateStr}</span>}
                        <span className="shrink-0">{words}w</span>
                        <span className="font-mono truncate">/news/{news.slug || 'no-slug'}</span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(news)}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer border-0"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickToggleStatus(news)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-bold cursor-pointer border-0"
                        >
                          {draft ? 'Publish' : 'Draft'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickTogglePin(news)}
                          className={`p-1 rounded-lg cursor-pointer border-0 ${pinned ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
                        >
                          <Pin className="w-3 h-3" />
                        </button>
                        {news.slug && (
                          <a href={`/news/${news.slug}`} target="_blank" rel="noopener noreferrer" className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500">
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmItem(news)}
                          className="p-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 cursor-pointer border-0"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {deleteConfirmItem && (
        <div className="fixed inset-0 z-[110] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 max-w-sm w-full shadow-2xl space-y-4">
            <h4 className="text-base font-black text-slate-900 dark:text-white">Delete News Article?</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Permanently delete <strong>"{deleteConfirmItem.title || 'Untitled'}"</strong>?</p>
            <div className="flex items-center gap-2 pt-1">
              <button type="button" onClick={() => setDeleteConfirmItem(null)} className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold cursor-pointer border-0">Cancel</button>
              <button
                type="button"
                onClick={() => {
                  const id = deleteConfirmItem.id;
                  setDeleteConfirmItem(null);
                  setEditingId(null);
                  handleDeleteNews(id);
                }}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer border-0"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});
