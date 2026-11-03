import React, { useState, useMemo } from 'react';
import {
  FileText,
  Plus,
  Save,
  Trash2,
  Eye,
  Code,
  Sparkles,
  Check,
  ChevronDown,
  ChevronUp,
  Search,
  Pin,
  Clock,
  Globe,
  Lock,
  ExternalLink,
  Copy,
  Tag,
  SlidersHorizontal,
  Smartphone,
  ArrowUpDown,
  X,
  FolderKanban,
  Wand2
} from 'lucide-react';
import { getOptimizedImageUrl } from '../../seo/utils';
import { sanitizeHtml } from '../../seo/renderers/common';
import { formatPageTitle } from '../../lib/seoUtils';
import ImageUpload from '../ImageUpload';
import { toast } from '../Toast';

const formatNewsTitle = (title?: string) => (title ? formatPageTitle(title, '') : '');

const ImageInputWithUpload: React.FC<{
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  previewClassName?: string;
}> = ({ label, value, onChange, placeholder }) => (
  <div className="space-y-1">
    <label className="block text-[11px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
      {label}
    </label>
    <ImageUpload
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  </div>
);

interface AdminNewsTabProps {
  newsList: any[];
  saving: boolean;
  handleAddNews: () => string;
  handleNewsChange: (id: string, field: string, value: any) => void;
  handleDeleteNews: (id: string) => void;
  saveNews: (list?: any[]) => Promise<void>;
  saveSingleNews?: (item: any) => Promise<any>;
  setSaving: (saving: boolean) => void;
  appsList?: any[];
}

const PRESET_NEWS_CATEGORIES = [
  'General',
  'App Launch',
  'Update',
  'Security & Trust',
  'Bonus & Events',
  'Guide',
  'Industry'
];

type EditorSectionTab = 'essentials' | 'content' | 'seo' | 'all';
type SortOption = 'pinned_newest' | 'newest' | 'oldest' | 'updated' | 'title_asc';

export const AdminNewsTab: React.FC<AdminNewsTabProps> = ({
  newsList,
  saving,
  handleAddNews,
  handleNewsChange,
  handleDeleteNews,
  saveNews,
  saveSingleNews,
  setSaving,
  appsList = []
}) => {
  const [previewModes, setPreviewModes] = useState<{ [id: string]: boolean }>({});
  const [savedItems, setSavedItems] = useState<{ [id: string]: boolean }>({});
  const [savingItemId, setSavingItemId] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<{ [id: string]: boolean }>({});
  const [editorSectionByItem, setEditorSectionByItem] = useState<{ [id: string]: EditorSectionTab }>({});

  // Filtering, Categorization & Sorting State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft' | 'pinned'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAppFilter, setSelectedAppFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('pinned_newest');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Map app IDs to app objects for quick lookup
  const appById = useMemo(() => {
    const map = new Map<string, any>();
    for (const app of appsList || []) {
      if (app?.id) map.set(String(app.id), app);
    }
    return map;
  }, [appsList]);

  // Compute all categories + live counts
  const categoryStats = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of newsList || []) {
      const rawCat = String(item?.category || 'General').trim() || 'General';
      counts.set(rawCat, (counts.get(rawCat) || 0) + 1);
    }
    const sorted = Array.from(counts.entries()).sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return a[0].localeCompare(b[0]);
    });
    return sorted;
  }, [newsList]);

  // All available categories for the editor quick-pills (presets + custom ones from DB)
  const allAvailableCategories = useMemo(() => {
    const set = new Set<string>(PRESET_NEWS_CATEGORIES);
    for (const [cat] of categoryStats) {
      if (cat) set.add(cat);
    }
    return Array.from(set);
  }, [categoryStats]);

  // Status counts
  const statusCounts = useMemo(() => {
    let published = 0;
    let draft = 0;
    let pinned = 0;
    for (const item of newsList || []) {
      const isPub = (item?.status || 'published') === 'published';
      if (isPub) published++;
      else draft++;
      if (item?.pinned) pinned++;
    }
    return {
      all: (newsList || []).length,
      published,
      draft,
      pinned
    };
  }, [newsList]);

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const togglePreview = (id: string) => {
    setPreviewModes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getEditorTab = (id: string): EditorSectionTab => {
    return editorSectionByItem[id] || 'essentials';
  };

  const setEditorTab = (id: string, tab: EditorSectionTab) => {
    setEditorSectionByItem(prev => ({ ...prev, [id]: tab }));
  };

  const persistSingleArticle = async (article: any, closeAfter = false) => {
    if (!article) return;
    setSavingItemId(article.id);
    setSaving(true);
    try {
      if (saveSingleNews) {
        await saveSingleNews(article);
      } else {
        await saveNews(newsList);
      }
      setSavedItems(prev => ({ ...prev, [article.id]: true }));
      setTimeout(() => {
        setSavedItems(prev => ({ ...prev, [article.id]: false }));
      }, 2000);
      if (closeAfter) {
        setExpandedItems(prev => ({ ...prev, [article.id]: false }));
      }
    } catch (err) {
      console.error('Error saving article:', err);
    } finally {
      setSavingItemId(null);
      setSaving(false);
    }
  };

  const handleTogglePin = async (id: string, currentPin: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextPinned = !currentPin;
    handleNewsChange(id, 'pinned', nextPinned);
    const target = newsList.find(n => n.id === id);
    if (!target) return;
    const updatedItem = { ...target, pinned: nextPinned };
    await persistSingleArticle(updatedItem, false);
  };

  const handleToggleStatus = async (id: string, currentStatus: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = currentStatus === 'draft' ? 'published' : 'draft';
    handleNewsChange(id, 'status', newStatus);
    const target = newsList.find(n => n.id === id);
    if (!target) return;
    const updatedItem = { ...target, status: newStatus };
    await persistSingleArticle(updatedItem, false);
  };

  const copySlugUrl = (slug: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/news/${slug}`;
    navigator.clipboard.writeText(url);
    toast('Article link copied!', 'success');
  };

  const generateSlugFromTitle = (title: string, id: string) => {
    const clean = String(title || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 75)
      .replace(/^-+|-+$/g, '');
    return clean || `news-${id.slice(0, 6)}`;
  };

  const handleAutoSlug = (item: any) => {
    const nextSlug = generateSlugFromTitle(item.title, item.id);
    handleNewsChange(item.id, 'slug', nextSlug);
    toast('Clean URL slug generated', 'info');
  };

  const handleAutoReadTime = (item: any) => {
    const textOnly = String(item.content_html || item.description || '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const words = textOnly ? textOnly.split(' ').length : 0;
    const mins = Math.max(1, Math.ceil(words / 180));
    const formatted = `${mins} min read`;
    handleNewsChange(item.id, 'read_time', formatted);
    toast(`Estimated reading time: ${formatted} (${words} words)`, 'info');
  };

  const insertHtmlSnippet = (item: any, snippet: string) => {
    const current = String(item.content_html || '');
    const next = current ? `${current}\n${snippet}` : snippet;
    handleNewsChange(item.id, 'content_html', next);
  };

  const filteredNews = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return (newsList || [])
      .filter(news => {
        const linkedApp = news.related_app_id ? appById.get(String(news.related_app_id)) : null;
        const matchesSearch =
          !q ||
          (news.title || '').toLowerCase().includes(q) ||
          (news.category || '').toLowerCase().includes(q) ||
          (news.slug || '').toLowerCase().includes(q) ||
          (news.description || '').toLowerCase().includes(q) ||
          (news.ceo_name || '').toLowerCase().includes(q) ||
          (news.tags || '').toLowerCase().includes(q) ||
          (linkedApp?.name || '').toLowerCase().includes(q);

        const itemStatus = news.status || 'published';
        const matchesStatus =
          filterStatus === 'all' ||
          (filterStatus === 'pinned' ? Boolean(news.pinned) : itemStatus === filterStatus);

        const itemCategory = String(news.category || 'General').trim() || 'General';
        const matchesCategory =
          selectedCategory === 'all' || itemCategory.toLowerCase() === selectedCategory.toLowerCase();

        const matchesApp =
          selectedAppFilter === 'all' ||
          (selectedAppFilter === 'linked' && Boolean(news.related_app_id)) ||
          (selectedAppFilter === 'unlinked' && !news.related_app_id) ||
          String(news.related_app_id || '') === selectedAppFilter;

        return matchesSearch && matchesStatus && matchesCategory && matchesApp;
      })
      .sort((a, b) => {
        if (sortBy === 'pinned_newest') {
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        }
        if (sortBy === 'newest') {
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        }
        if (sortBy === 'oldest') {
          return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
        }
        if (sortBy === 'updated') {
          return (
            new Date(b.updated_at || b.created_at || 0).getTime() -
            new Date(a.updated_at || a.created_at || 0).getTime()
          );
        }
        if (sortBy === 'title_asc') {
          return String(a.title || '').localeCompare(String(b.title || ''));
        }
        return 0;
      });
  }, [newsList, searchQuery, filterStatus, selectedCategory, selectedAppFilter, sortBy, appById]);

  const activeFilterCount =
    (filterStatus !== 'all' ? 1 : 0) +
    (selectedCategory !== 'all' ? 1 : 0) +
    (selectedAppFilter !== 'all' ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  const resetAllFilters = () => {
    setSearchQuery('');
    setFilterStatus('all');
    setSelectedCategory('all');
    setSelectedAppFilter('all');
    setSortBy('pinned_newest');
  };

  return (
    <div className="space-y-3 sm:space-y-4 max-w-6xl mx-auto pb-16">
      {/* Compact Sticky Control Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-3 sm:p-4 space-y-3 sticky top-[49px] z-20">
        {/* Top Row: Title, Stats & Primary Actions */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-600/10 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <FileText size={18} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white truncate">
                  News & Announcements
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {filteredNews.length}/{newsList.length}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate hidden sm:block">
                Categorized editorial hub • Instant single-article cloud save
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                const newId = handleAddNews();
                if (selectedCategory !== 'all') {
                  setTimeout(() => handleNewsChange(newId, 'category', selectedCategory), 0);
                }
                setExpandedItems(prev => ({ ...prev, [newId]: true }));
                setEditorTab(newId, 'essentials');
              }}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-3.5 py-2 rounded-xl font-bold text-xs shadow-sm transition-all cursor-pointer active:scale-95 border-0"
            >
              <Plus size={15} strokeWidth={2.5} />
              <span>New Article</span>
            </button>
            <button
              type="button"
              onClick={() => saveNews(newsList)}
              disabled={saving}
              title="Save all articles in list"
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white px-3 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer active:scale-95 disabled:opacity-50 border-0"
            >
              <Save size={14} />
              <span className="hidden sm:inline">{saving ? 'Saving...' : 'Save All'}</span>
            </button>
          </div>
        </div>

        {/* Second Row: Search Input + Status Pills + Filter Toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Search title, category, slug, author, tags, or app..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-md border-0 bg-transparent cursor-pointer"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/70 dark:border-slate-800 shrink-0">
              {([
                { id: 'all', label: 'All', count: statusCounts.all },
                { id: 'published', label: 'Live', count: statusCounts.published },
                { id: 'draft', label: 'Drafts', count: statusCounts.draft },
                { id: 'pinned', label: 'Pinned', count: statusCounts.pinned }
              ] as const).map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilterStatus(tab.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border-0 flex items-center gap-1 whitespace-nowrap ${
                    filterStatus === tab.id
                      ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-2xs'
                      : 'bg-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className="text-[10px] opacity-75">({tab.count})</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowAdvancedFilters(prev => !prev)}
              className={`px-2.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                showAdvancedFilters || selectedAppFilter !== 'all' || sortBy !== 'pinned_newest'
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/60'
                  : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
              }`}
              title="Sort & App Filter"
            >
              <SlidersHorizontal size={14} />
              <span className="hidden md:inline">Sort & App</span>
            </button>
          </div>
        </div>

        {/* Third Row: Horizontal Category Filter Pills with Live Counts */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1 shrink-0 mr-1">
            <FolderKanban size={12} />
            Category:
          </span>
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer border shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            All Categories ({newsList.length})
          </button>
          {categoryStats.map(([catName, count]) => {
            const isSelected = selectedCategory.toLowerCase() === catName.toLowerCase();
            return (
              <button
                key={catName}
                type="button"
                onClick={() => setSelectedCategory(isSelected ? 'all' : catName)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer border shrink-0 flex items-center gap-1 ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <span>{catName}</span>
                <span className={`text-[10px] px-1 rounded ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200/70 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Collapsible Sort & Linked App Filter Bar */}
        {showAdvancedFilters && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-2 animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 shrink-0">
                <Smartphone size={13} />
                Linked App:
              </label>
              <select
                value={selectedAppFilter}
                onChange={(e) => setSelectedAppFilter(e.target.value)}
                className="flex-1 min-w-0 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Articles (Linked & Unlinked)</option>
                <option value="linked">Only Linked to an App</option>
                <option value="unlinked">Not Linked to Any App</option>
                {appsList.map(app => (
                  <option key={app.id} value={app.id}>
                    {app.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 shrink-0">
                <ArrowUpDown size={13} />
                Sort Order:
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="flex-1 min-w-0 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="pinned_newest">Pinned First, then Newest</option>
                <option value="newest">Newest Published First</option>
                <option value="updated">Recently Edited First</option>
                <option value="oldest">Oldest First</option>
                <option value="title_asc">Title (A to Z)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Active Filter Notice Bar */}
      {activeFilterCount > 0 && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 rounded-xl text-xs">
          <span className="text-slate-600 dark:text-slate-300 font-medium truncate">
            Showing <strong className="font-black text-slate-900 dark:text-white">{filteredNews.length}</strong> matching articles
            {selectedCategory !== 'all' ? ` in "${selectedCategory}"` : ''}
          </span>
          <button
            type="button"
            onClick={resetAllFilters}
            className="text-blue-600 dark:text-blue-400 hover:underline font-bold text-xs shrink-0 ml-2 border-0 bg-transparent cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Articles List */}
      <div className="space-y-2.5">
        {filteredNews.map((news) => {
          const isExpanded = !!expandedItems[news.id];
          const isPublished = (news.status || 'published') === 'published';
          const isPinned = !!news.pinned;
          const isItemSaving = savingItemId === news.id;
          const linkedApp = news.related_app_id ? appById.get(String(news.related_app_id)) : null;
          const currentTab = getEditorTab(news.id);
          const categoryLabel = String(news.category || 'General').trim() || 'General';

          return (
            <div
              key={news.id}
              className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-200 overflow-hidden ${
                isExpanded
                  ? 'border-blue-500/60 dark:border-blue-500/50 shadow-md ring-1 ring-blue-500/20'
                  : isPinned
                  ? 'border-amber-300/80 dark:border-amber-500/30 shadow-2xs'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {/* Compact Mobile-First Article Summary Row */}
              <div
                onClick={() => toggleExpand(news.id)}
                className="p-3 sm:p-3.5 flex items-center justify-between gap-2.5 cursor-pointer select-none hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                  {/* Compact Thumbnail */}
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200/80 dark:border-slate-700 relative flex items-center justify-center">
                    {news.image_url ? (
                      <img
                        src={getOptimizedImageUrl(news.image_url, 120)}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://placehold.co/120x120/1e293b/cbd5e1?text=News';
                        }}
                      />
                    ) : (
                      <FileText className="text-slate-400" size={18} />
                    )}
                    {isPinned && (
                      <div className="absolute top-0.5 right-0.5 bg-amber-500 text-white p-0.5 rounded-md shadow-xs">
                        <Pin size={9} className="fill-current" />
                      </div>
                    )}
                  </div>

                  {/* Title & Compact Metadata Badges */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                          isPublished
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {isPublished ? <Globe size={9} /> : <Lock size={9} />}
                        {isPublished ? 'Live' : 'Draft'}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCategory(
                            selectedCategory.toLowerCase() === categoryLabel.toLowerCase()
                              ? 'all'
                              : categoryLabel
                          );
                        }}
                        title={`Filter by ${categoryLabel}`}
                        className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-[10px] font-extrabold uppercase tracking-wider border border-blue-200/60 dark:border-blue-800/50 cursor-pointer hover:bg-blue-100 transition-colors"
                      >
                        {categoryLabel}
                      </button>

                      {linkedApp && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 text-[10px] font-bold border border-purple-200/60 dark:border-purple-800/50 truncate max-w-[130px]">
                          <Smartphone size={9} />
                          <span className="truncate">{linkedApp.name}</span>
                        </span>
                      )}

                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1">
                        <Clock size={9} />
                        {news.created_at
                          ? new Date(news.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })
                          : 'Today'}
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate leading-snug">
                      {formatNewsTitle(news.title) || 'Untitled News Article'}
                    </h4>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate hidden sm:block">
                      {news.description || `/news/${news.slug || news.id}`}
                    </p>
                  </div>
                </div>

                {/* Right Quick Action Buttons */}
                <div
                  className="flex items-center gap-1 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={(e) => handleTogglePin(news.id, isPinned, e)}
                    disabled={isItemSaving}
                    className={`p-1.5 sm:p-2 rounded-lg transition-all cursor-pointer border-0 ${
                      isPinned
                        ? 'bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400'
                        : 'bg-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    title={isPinned ? 'Unpin Article' : 'Pin Article to Top'}
                  >
                    <Pin size={14} className={isPinned ? 'fill-current' : ''} />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleToggleStatus(news.id, news.status || 'published', e)}
                    disabled={isItemSaving}
                    className={`p-1.5 sm:p-2 rounded-lg transition-all cursor-pointer border-0 ${
                      isPublished
                        ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        : 'bg-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    title={isPublished ? 'Switch to Draft' : 'Publish Live'}
                  >
                    {isPublished ? <Globe size={14} /> : <Lock size={14} />}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => copySlugUrl(news.slug || news.id, e)}
                    className="hidden sm:flex p-2 rounded-lg bg-transparent text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all cursor-pointer border-0"
                    title="Copy Public URL"
                  >
                    <Copy size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteNews(news.id)}
                    className="p-1.5 sm:p-2 rounded-lg bg-transparent text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all cursor-pointer border-0"
                    title="Delete Article"
                  >
                    <Trash2 size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleExpand(news.id)}
                    className={`p-1.5 sm:p-2 rounded-lg transition-all cursor-pointer border-0 ${
                      isExpanded
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                    aria-label={isExpanded ? 'Collapse editor' : 'Expand editor'}
                  >
                    {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </button>
                </div>
              </div>

              {/* Expanded Mobile-Friendly Segmented Editor */}
              {isExpanded && (
                <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40 space-y-3.5 animate-in fade-in duration-150">
                  {/* Editor Sub-Navigation Tabs + Quick Save Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-200/80 dark:border-slate-800">
                    <div className="flex items-center gap-1 bg-slate-200/70 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar">
                      {([
                        { id: 'essentials', label: '1. Essentials' },
                        { id: 'content', label: '2. Content Body' },
                        { id: 'seo', label: '3. SEO & App' },
                        { id: 'all', label: 'All Fields' }
                      ] as const).map(tab => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setEditorTab(news.id, tab.id)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer border-0 whitespace-nowrap ${
                            currentTab === tab.id
                              ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-2xs'
                              : 'bg-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <a
                        href={`/news/${news.slug || news.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:text-blue-600 flex items-center gap-1 no-underline"
                      >
                        <ExternalLink size={12} />
                        <span className="hidden sm:inline">View Live</span>
                      </a>

                      <button
                        type="button"
                        disabled={saving || isItemSaving}
                        onClick={() => persistSingleArticle(news, false)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border-0 shadow-2xs ${
                          savedItems[news.id]
                            ? 'bg-emerald-600 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {savedItems[news.id] ? <Check size={13} /> : <Save size={13} />}
                        <span>
                          {isItemSaving
                            ? 'Saving...'
                            : savedItems[news.id]
                            ? 'Saved!'
                            : 'Save Article'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* TAB 1: ESSENTIALS (Title, Category Chips, Slug, Summary, Cover Image) */}
                  {(currentTab === 'essentials' || currentTab === 'all') && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Article Headline */}
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                            Article Headline (H1)
                          </label>
                          <input
                            type="text"
                            value={news.title || ''}
                            onChange={(e) => {
                              const nextTitle = e.target.value;
                              handleNewsChange(news.id, 'title', nextTitle);
                              if (!news.slug || news.slug.startsWith('article-')) {
                                handleNewsChange(
                                  news.id,
                                  'slug',
                                  generateSlugFromTitle(nextTitle, news.id)
                                );
                              }
                            }}
                            placeholder="Enter article headline..."
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-xs sm:text-sm"
                          />
                        </div>

                        {/* Category Selector with 1-Tap Quick Chips */}
                        <div className="sm:col-span-2 bg-white dark:bg-slate-900 p-2.5 sm:p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <label className="text-[11px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                              <Tag size={12} className="text-blue-500" />
                              Article Category
                            </label>
                            <span className="text-[10px] text-slate-400 font-medium">
                              Tap a preset or type a custom category
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                            {allAvailableCategories.map(catOption => {
                              const isCurrent =
                                String(news.category || 'General').trim().toLowerCase() ===
                                catOption.toLowerCase();
                              return (
                                <button
                                  key={catOption}
                                  type="button"
                                  onClick={() => handleNewsChange(news.id, 'category', catOption)}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer border shrink-0 ${
                                    isCurrent
                                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                      : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-blue-400'
                                  }`}
                                >
                                  {catOption}
                                </button>
                              );
                            })}
                          </div>

                          <input
                            type="text"
                            value={news.category || ''}
                            onChange={(e) => handleNewsChange(news.id, 'category', e.target.value)}
                            placeholder="Or type a custom category name (e.g. Tournament, Patch Notes)..."
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-semibold text-slate-900 dark:text-white focus:border-blue-500 outline-none text-xs"
                          />
                        </div>

                        {/* URL Slug with Auto-Generate Button */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[11px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                              URL Slug
                            </label>
                            <button
                              type="button"
                              onClick={() => handleAutoSlug(news)}
                              className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 border-0 bg-transparent cursor-pointer"
                            >
                              <Wand2 size={10} />
                              Auto Slug
                            </button>
                          </div>
                          <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden focus-within:border-blue-500">
                            <span className="px-2.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-400 font-mono text-[11px] border-r border-slate-200 dark:border-slate-700 shrink-0">
                              /news/
                            </span>
                            <input
                              type="text"
                              value={news.slug || ''}
                              onChange={(e) =>
                                handleNewsChange(
                                  news.id,
                                  'slug',
                                  e.target.value.toLowerCase().replace(/[^a-z0-9-_]+/g, '-')
                                )
                              }
                              placeholder="article-url-slug"
                              className="w-full px-2.5 py-2 bg-transparent font-mono text-xs text-slate-900 dark:text-white outline-none"
                            />
                          </div>
                        </div>

                        {/* Related App Selector (Moved to Essentials for quick access) */}
                        <div>
                          <label className="block text-[11px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                            Linked Application (Optional)
                          </label>
                          <select
                            value={news.related_app_id || ''}
                            onChange={(e) =>
                              handleNewsChange(news.id, 'related_app_id', e.target.value)
                            }
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold text-slate-900 dark:text-white focus:border-blue-500 outline-none text-xs"
                          >
                            <option value="">-- No Linked App --</option>
                            {appsList.map(app => (
                              <option key={app.id} value={app.id}>
                                {app.name} ({app.version || 'v1.0'})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Cover Image Upload */}
                        <div className="sm:col-span-2">
                          <ImageInputWithUpload
                            label="Cover Image URL (16:9 Recommended)"
                            value={news.image_url || ''}
                            onChange={(val) => handleNewsChange(news.id, 'image_url', val)}
                            placeholder="https://..."
                            previewClassName="w-20 h-12 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-100 dark:bg-slate-800"
                          />
                        </div>

                        {/* Card Summary / Excerpt */}
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                            Short Summary / Card Excerpt
                          </label>
                          <textarea
                            value={news.description || ''}
                            onChange={(e) =>
                              handleNewsChange(news.id, 'description', e.target.value)
                            }
                            rows={2}
                            placeholder="Brief 1-2 sentence summary shown on news cards..."
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-blue-500 outline-none resize-y"
                          />
                        </div>

                        {/* Quick Status, Pin & Read Time Row */}
                        <div className="sm:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                              Visibility
                            </label>
                            <select
                              value={news.status || 'published'}
                              onChange={(e) =>
                                handleNewsChange(news.id, 'status', e.target.value)
                              }
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white outline-none"
                            >
                              <option value="published">Live (Published)</option>
                              <option value="draft">Draft (Hidden)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                              Author Name
                            </label>
                            <input
                              type="text"
                              value={news.ceo_name || ''}
                              onChange={(e) =>
                                handleNewsChange(news.id, 'ceo_name', e.target.value)
                              }
                              placeholder="Editorial Team"
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white outline-none"
                            />
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-[10px] font-bold text-slate-500 uppercase">
                                Read Time
                              </label>
                              <button
                                type="button"
                                onClick={() => handleAutoReadTime(news)}
                                className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline border-0 bg-transparent cursor-pointer"
                              >
                                Calc
                              </button>
                            </div>
                            <input
                              type="text"
                              value={news.read_time || ''}
                              onChange={(e) =>
                                handleNewsChange(news.id, 'read_time', e.target.value)
                              }
                              placeholder="3 min read"
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white outline-none"
                            />
                          </div>

                          <div className="flex items-end">
                            <label className="w-full flex items-center justify-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={!!news.pinned}
                                onChange={(e) =>
                                  handleNewsChange(news.id, 'pinned', e.target.checked)
                                }
                                className="w-3.5 h-3.5 text-blue-600 rounded focus:ring-blue-500"
                              />
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                Pin to Top
                              </span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: CONTENT BODY (HTML Editor, Mobile Tag Bar, Live Preview, Highlight Callout) */}
                  {(currentTab === 'content' || currentTab === 'all') && (
                    <div className="space-y-3 pt-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <label className="text-[11px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Code size={13} className="text-blue-500" />
                          Full Article Body (HTML / Rich Text)
                        </label>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleAutoReadTime(news)}
                            className="px-2 py-1 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors cursor-pointer border-0"
                          >
                            Update Read Time
                          </button>
                          <button
                            type="button"
                            onClick={() => togglePreview(news.id)}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border-0 ${
                              previewModes[news.id]
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {previewModes[news.id] ? (
                              <>
                                <Code size={12} /> Edit HTML
                              </>
                            ) : (
                              <>
                                <Eye size={12} /> Live Preview
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* 1-Tap Mobile HTML Formatting Bar */}
                      {!previewModes[news.id] && (
                        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-0.5">
                          {[
                            { label: 'H2', snippet: '<h2>Section Heading</h2>' },
                            { label: 'H3', snippet: '<h3>Subheading</h3>' },
                            { label: 'Paragraph', snippet: '<p>Write paragraph text here...</p>' },
                            { label: 'Bold', snippet: '<strong>Important text</strong>' },
                            {
                              label: 'Bullet List',
                              snippet: '<ul>\n  <li>First point</li>\n  <li>Second point</li>\n</ul>'
                            },
                            {
                              label: 'Callout Quote',
                              snippet: '<blockquote>Key takeaway or official statement.</blockquote>'
                            },
                            {
                              label: 'Link',
                              snippet: '<a href="https://www.rummydex.com">Link text</a>'
                            }
                          ].map(btn => (
                            <button
                              key={btn.label}
                              type="button"
                              onClick={() => insertHtmlSnippet(news, btn.snippet)}
                              className="px-2 py-1 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 shrink-0 cursor-pointer transition-colors"
                            >
                              + {btn.label}
                            </button>
                          ))}
                        </div>
                      )}

                      {previewModes[news.id] ? (
                        <div
                          className="w-full min-h-[220px] max-h-[420px] overflow-y-auto p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 prose dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed"
                          dangerouslySetInnerHTML={{
                            __html: sanitizeHtml(
                              news.content_html ||
                                news.description ||
                                '<p class="text-slate-400 italic">No content written yet...</p>'
                            )
                          }}
                        />
                      ) : (
                        <textarea
                          value={news.content_html || ''}
                          onChange={(e) =>
                            handleNewsChange(news.id, 'content_html', e.target.value)
                          }
                          rows={9}
                          placeholder="<p>Write full article HTML content here...</p>"
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs text-slate-900 dark:text-white focus:border-blue-500 outline-none leading-relaxed resize-y"
                        />
                      )}

                      {/* Optional Custom Highlight Box */}
                      <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl border border-indigo-200/60 dark:border-indigo-800/40 space-y-2">
                        <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-400 font-extrabold text-[11px] uppercase tracking-wider">
                          <Sparkles size={13} />
                          <span>Highlight Callout Box (Optional)</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <input
                            type="text"
                            value={news.custom_box_heading || ''}
                            onChange={(e) =>
                              handleNewsChange(news.id, 'custom_box_heading', e.target.value)
                            }
                            placeholder="Box Title (e.g. Key Takeaways)"
                            className="px-2.5 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800/50 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white outline-none"
                          />
                          <input
                            type="text"
                            value={news.custom_box_html || ''}
                            onChange={(e) =>
                              handleNewsChange(news.id, 'custom_box_html', e.target.value)
                            }
                            placeholder="Callout HTML or text..."
                            className="sm:col-span-2 px-2.5 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800/50 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: SEO, TAGS, AUTHOR & DATES */}
                  {(currentTab === 'seo' || currentTab === 'all') && (
                    <div className="space-y-3 pt-1">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                            SEO Meta Title
                          </label>
                          <input
                            type="text"
                            value={news.seo_title || ''}
                            onChange={(e) =>
                              handleNewsChange(news.id, 'seo_title', e.target.value)
                            }
                            placeholder={news.title || 'Custom SEO title...'}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                            Tags / Keywords (Comma-separated)
                          </label>
                          <input
                            type="text"
                            value={news.tags || news.seo_keywords || ''}
                            onChange={(e) => {
                              handleNewsChange(news.id, 'tags', e.target.value);
                              handleNewsChange(news.id, 'seo_keywords', e.target.value);
                            }}
                            placeholder="rummy, update, security, yono..."
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                            SEO Meta Description
                          </label>
                          <textarea
                            value={news.seo_description || ''}
                            onChange={(e) =>
                              handleNewsChange(news.id, 'seo_description', e.target.value)
                            }
                            rows={2}
                            placeholder="Search engine description (150-160 characters recommended)..."
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none resize-y"
                          />
                        </div>

                        <div>
                          <ImageInputWithUpload
                            label="Author Avatar URL"
                            value={news.ceo_image || ''}
                            onChange={(val) => handleNewsChange(news.id, 'ceo_image', val)}
                            placeholder="https://..."
                            previewClassName="w-9 h-9 rounded-full overflow-hidden border border-slate-200 shrink-0"
                          />
                        </div>

                        <div>
                          <ImageInputWithUpload
                            label="Custom Social Share Image (OG)"
                            value={news.og_image_url || ''}
                            onChange={(val) => handleNewsChange(news.id, 'og_image_url', val)}
                            placeholder="Defaults to cover image..."
                            previewClassName="w-14 h-9 rounded-lg overflow-hidden border border-slate-200 shrink-0"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                            Published Date
                          </label>
                          <input
                            type="datetime-local"
                            value={
                              news.created_at
                                ? new Date(
                                    new Date(news.created_at).getTime() -
                                      new Date().getTimezoneOffset() * 60000
                                  )
                                    .toISOString()
                                    .slice(0, 16)
                                : ''
                            }
                            onChange={(e) => {
                              if (e.target.value) {
                                handleNewsChange(
                                  news.id,
                                  'created_at',
                                  new Date(e.target.value).toISOString()
                                );
                              }
                            }}
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                            Canonical URL Override (Optional)
                          </label>
                          <input
                            type="url"
                            value={news.canonical_url || ''}
                            onChange={(e) =>
                              handleNewsChange(news.id, 'canonical_url', e.target.value)
                            }
                            placeholder="https://www.rummydex.com/news/..."
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Compact Bottom Action Bar */}
                  <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-slate-200/80 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => toggleExpand(news.id)}
                      className="px-3 py-1.5 rounded-xl font-bold text-xs bg-slate-200/70 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer border-0"
                    >
                      Collapse
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={saving || isItemSaving}
                        onClick={() => persistSingleArticle(news, true)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer border-0 shadow-sm active:scale-95 ${
                          savedItems[news.id]
                            ? 'bg-emerald-600 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {savedItems[news.id] ? <Check size={14} /> : <Save size={14} />}
                        <span>
                          {isItemSaving
                            ? 'Saving...'
                            : savedItems[news.id]
                            ? 'Saved!'
                            : 'Save & Close'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredNews.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-6">
            <FileText className="mx-auto text-slate-400 mb-2" size={28} />
            <p className="text-slate-700 dark:text-slate-200 font-bold text-sm">
              No matching articles found
            </p>
            <p className="text-slate-400 dark:text-slate-500 text-xs mt-1 mb-4">
              {searchQuery || selectedCategory !== 'all' || filterStatus !== 'all'
                ? 'Try clearing your active category or search filters.'
                : 'Create your first news announcement to get started.'}
            </p>
            {activeFilterCount > 0 ? (
              <button
                type="button"
                onClick={resetAllFilters}
                className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold border-0 cursor-pointer"
              >
                Clear All Filters
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  const newId = handleAddNews();
                  setExpandedItems(prev => ({ ...prev, [newId]: true }));
                }}
                className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-sm transition-all cursor-pointer border-0"
              >
                <Plus size={15} /> Create First Article
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
