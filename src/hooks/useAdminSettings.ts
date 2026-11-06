import { useState, useEffect, useRef } from 'react';
import { mockNews, mockVideos, mockSettings } from '../lib/staticData';
import { formatPageTitle } from '../lib/seoUtils';

function normalizeAdminNewsItem(n: any) {
  if (!n || typeof n !== 'object') return n;
  let content = n.content ?? n.description_html ?? n.content_html ?? '';
  if (!content || !String(content).trim()) {
    const staticFallback = (mockNews || []).find(
      (m: any) => (m.id && m.id === n.id) || (m.slug && n.slug && m.slug.toLowerCase() === n.slug.toLowerCase())
    );
    if (staticFallback?.content || staticFallback?.description_html) {
      content = staticFallback.content || staticFallback.description_html;
    }
  }
  const cleanTitle = n.title ? formatPageTitle(n.title, '') : '';
  const rawSeoTitle = n.seo_title || n.meta_title || '';
  const cleanSeoTitle = rawSeoTitle ? formatPageTitle(rawSeoTitle, '') : '';
  const coverImg = n.image_url || n.logo_url || n.image || '';
  const isPinned = Boolean(n.is_pinned ?? n.pinned);
  const isDraft = n.status === 'draft' || n.sync_to_public === false;
  const tagsArray = Array.isArray(n.tags)
    ? n.tags.map((t: any) => String(t || '').trim()).filter(Boolean)
    : typeof n.tags === 'string' && n.tags.trim()
      ? n.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
      : typeof n.seo_keywords === 'string' && n.seo_keywords.trim()
        ? n.seo_keywords.split(',').map((t: string) => t.trim()).filter(Boolean)
        : [];
  const seoKeywords = typeof n.seo_keywords === 'string' && n.seo_keywords.trim()
    ? n.seo_keywords.trim()
    : tagsArray.join(', ');

  return {
    ...n,
    title: cleanTitle || n.title || '',
    seo_title: cleanSeoTitle,
    meta_title: cleanSeoTitle,
    seo_description: n.seo_description || n.meta_description || '',
    meta_description: n.seo_description || n.meta_description || '',
    content,
    description_html: content,
    content_html: content,
    image_url: coverImg,
    logo_url: coverImg,
    image: coverImg,
    is_pinned: isPinned,
    pinned: isPinned,
    status: isDraft ? 'draft' : 'published',
    sync_to_public: !isDraft,
    tags: tagsArray,
    seo_keywords: seoKeywords,
    ceo_name: n.ceo_name || n.author || 'RummyDex Editorial Team',
    author: n.author || n.ceo_name || 'RummyDex Editorial Team',
    category: n.category || 'General'
  };
}

export const useAdminSettings = (settings: any, news: any[], videos: any[]) => {
  const [newsList, setNewsList] = useState<any[]>(() =>
    (Array.isArray(news) && news.length > 0 ? news : (mockNews || [])).map(normalizeAdminNewsItem)
  );
  const [banners, setBanners] = useState<any[]>(() => (settings?.banners || mockSettings?.banners || []));
  const [videosList, setVideosList] = useState<any[]>(() => (Array.isArray(videos) && videos.length > 0 ? videos : (mockVideos || [])));
  const [categoriesList, setCategoriesList] = useState<string[]>(() => (settings?.categories || mockSettings?.categories || []));
  const [quickLinksList, setQuickLinksList] = useState<any[]>(() => (settings?.quick_links || mockSettings?.quick_links || []));
  const [websiteFaqsList, setWebsiteFaqsList] = useState<any[]>(() => (settings?.website_faqs || mockSettings?.website_faqs || []));
  const [developersList, setDevelopersList] = useState<any[]>(() => (settings?.developers || mockSettings?.developers || []));
  const [newCatInput, setNewCatInput] = useState('');

  const deletedNewsIdsRef = useRef(new Set<string>());
  const deletedBannerIdsRef = useRef(new Set<string>());
  const deletedVideoIdsRef = useRef(new Set<string>());
  const deletedCategoryNamesRef = useRef(new Set<string>());

  // Synchronize news directly when fresh server data arrives while preserving unsaved local drafts
  useEffect(() => {
    if (Array.isArray(news) && news.length > 0) {
      const mapped = news
        .filter(n => !deletedNewsIdsRef.current.has(n.id))
        .map(normalizeAdminNewsItem);
      setNewsList(prev => {
        const serverIds = new Set(mapped.map(m => m.id));
        const unsavedLocal = prev.filter(p => p._isLocalUnsaved && !serverIds.has(p.id) && !deletedNewsIdsRef.current.has(p.id));
        return [...unsavedLocal, ...mapped];
      });
    }
  }, [news]);

  // Synchronize videos directly when fresh server data arrives
  useEffect(() => {
    if (Array.isArray(videos) && videos.length > 0) {
      setVideosList(videos.filter(v => !deletedVideoIdsRef.current.has(v.id)));
    }
  }, [videos]);

  // Synchronize settings (banners, categories, faqs, quicklinks, developers)
  useEffect(() => {
    if (settings && typeof settings === 'object') {
      if (Array.isArray(settings.banners)) {
        setBanners(settings.banners.filter((b: any) => !deletedBannerIdsRef.current.has(b.id)));
      }
      if (Array.isArray(settings.categories)) {
        setCategoriesList(settings.categories.filter((c: string) => !deletedCategoryNamesRef.current.has(c)));
      }
      if (Array.isArray(settings.quick_links)) {
        setQuickLinksList(settings.quick_links);
      }
      if (Array.isArray(settings.website_faqs)) {
        setWebsiteFaqsList(settings.website_faqs);
      }
      if (Array.isArray(settings.developers)) {
        setDevelopersList(settings.developers);
      }
    }
  }, [settings]);


  // Banners
  const handleAddBanner = () => {
    const newBanner = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'New Banner',
      subtitle: 'Subtitle text',
      image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80',
      link: '/'
    };
    setBanners(prev => [...prev, newBanner]);
  };

  const handleBannerChange = (id: string, field: string, value: string) => {
    setBanners(prev => prev.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const handleDeleteBanner = (id: string) => {
    deletedBannerIdsRef.current.add(id);
    setBanners(prev => prev.filter(b => b.id !== id));
  };

  const handleClearAllBanners = () => {
    setBanners(prev => {
      prev.forEach(b => {
        if (b.id) deletedBannerIdsRef.current.add(b.id);
      });
      return [];
    });
  };

  // News
  const handleAddNews = (initialCategory?: string) => {
    const newId = Math.random().toString(36).substr(2, 9);
    const nowIso = new Date().toISOString();
    const cat = initialCategory && initialCategory !== 'all' ? initialCategory : 'General';
    const newItem = {
      id: newId,
      slug: '',
      title: '',
      logo_url: '',
      image_url: '',
      image: '',
      description: '',
      description_html: '',
      content: '',
      content_html: '',
      seo_title: '',
      meta_title: '',
      seo_description: '',
      meta_description: '',
      seo_keywords: '',
      tags: [],
      ceo_name: 'RummyDex Editorial Team',
      ceo_description: 'Transparency & Security Analyst',
      author: 'RummyDex Editorial Team',
      created_at: nowIso,
      date: nowIso.split('T')[0],
      published_at: nowIso,
      updated_at: nowIso,
      read_time: '2 min read',
      is_breaking: false,
      is_new: true,
      category: cat,
      is_pinned: false,
      pinned: false,
      status: 'published',
      sync_to_public: true,
      related_app_id: '',
      _isLocalUnsaved: true
    };
    setNewsList(prev => [newItem, ...prev]);
    return newId;
  };

  const handleNewsChange = (id: string, field: string, value: any) => {
    setNewsList(prev => prev.map(n => {
      if (n.id !== id) return n;
      const updated: any = { ...n, [field]: value, updated_at: new Date().toISOString() };
      if (field === 'title' && (!n.slug || n.slug.startsWith('news-') || n.slug === 'new-news-item')) {
        updated.slug = String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
      if (field === 'seo_title' || field === 'meta_title') {
        updated.seo_title = value;
        updated.meta_title = value;
      }
      if (field === 'seo_description' || field === 'meta_description') {
        updated.seo_description = value;
        updated.meta_description = value;
      }
      if (field === 'content' || field === 'description_html' || field === 'content_html') {
        updated.content = value;
        updated.description_html = value;
        updated.content_html = value;
        const words = String(value || '').replace(/<[^>]*>?/gm, ' ').trim().split(/\s+/).filter(Boolean).length;
        if (words > 0) {
          updated.read_time = `${Math.max(1, Math.ceil(words / 200))} min read`;
        }
      }
      if (field === 'logo_url' || field === 'image_url' || field === 'image') {
        updated.image_url = value;
        updated.logo_url = value;
        updated.image = value;
      }
      if (field === 'ceo_name' || field === 'author') {
        updated.ceo_name = value;
        updated.author = value;
      }
      if (field === 'date' || field === 'published_at') {
        updated.date = value;
        updated.published_at = value;
      }
      if (field === 'pinned' || field === 'is_pinned') {
        const boolVal = Boolean(value);
        updated.pinned = boolVal;
        updated.is_pinned = boolVal;
      }
      if (field === 'status') {
        const isDraft = value === 'draft';
        updated.status = isDraft ? 'draft' : 'published';
        updated.sync_to_public = !isDraft;
      } else if (field === 'sync_to_public') {
        const pub = Boolean(value);
        updated.sync_to_public = pub;
        updated.status = pub ? 'published' : 'draft';
      }
      if (field === 'tags') {
        const arr = Array.isArray(value)
          ? value.map((t: any) => String(t || '').trim()).filter(Boolean)
          : String(value || '').split(',').map((t: string) => t.trim()).filter(Boolean);
        updated.tags = arr;
        updated.seo_keywords = arr.join(', ');
      } else if (field === 'seo_keywords') {
        const str = String(value || '');
        updated.seo_keywords = str;
        updated.tags = str.split(',').map((t: string) => t.trim()).filter(Boolean);
      }
      return updated;
    }));
  };

  const handleDeleteNews = (id: string) => {
    deletedNewsIdsRef.current.add(id);
    setNewsList(prev => prev.filter(n => n.id !== id));
  };

  // Categories
  const handleAddCategory = () => {
    const trimmed = newCatInput.trim();
    if (trimmed && !categoriesList.includes(trimmed)) {
      setCategoriesList(prev => [...prev, trimmed]);
      setNewCatInput('');
    }
  };

  const handleRemoveCategory = (cat: string) => {
    deletedCategoryNamesRef.current.add(cat);
    setCategoriesList(prev => prev.filter(c => c !== cat));
  };

  // Videos
  const handleAddVideo = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    setVideosList(prev => [{
      id: newId,
      title: 'New Video',
      slug: `video-${newId}`,
      youtube_url: '',
      video_url: '',
      url: '',
      thumbnail: '',
      description: '',
      category: 'Video Guide',
      duration: '',
      seo_title: '',
      seo_description: '',
      seo_keywords: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, ...prev]);
  };

  const handleDeleteVideo = (id: string) => {
    deletedVideoIdsRef.current.add(id);
    setVideosList(prev => prev.filter(v => v.id !== id));
  };

  const handleVideosChange = (id: string, field: string, value: any) => {
    setVideosList(prev => prev.map(v => {
      if (v.id !== id) return v;
      const updated: any = { ...v, [field]: value, updated_at: new Date().toISOString() };
      if (field === 'title' && (!v.slug || v.slug.startsWith('video-') || v.slug === 'new-video')) {
        updated.slug = String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `video-${id}`;
      }
      if (field === 'youtube_url' || field === 'video_url' || field === 'url') {
        updated.youtube_url = value;
        updated.video_url = value;
        updated.url = value;
      }
      if (field === 'seo_title') {
        updated.meta_title = value;
      } else if (field === 'meta_title') {
        updated.seo_title = value;
      }
      if (field === 'seo_description') {
        updated.meta_description = value;
      } else if (field === 'meta_description') {
        updated.seo_description = value;
      }
      return updated;
    }));
  };

  // Website FAQs
  const handleAddWebsiteFaq = () => {
    setWebsiteFaqsList(prev => [...prev, { question: 'New Question', answer: 'New Answer' }]);
  };

  const handleRemoveWebsiteFaq = (index: number) => {
    setWebsiteFaqsList(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleWebsiteFaqChange = (index: number, field: string, value: any) => {
    setWebsiteFaqsList(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Quick Links
  const handleAddQuickLink = () => {
    setQuickLinksList(prev => [...prev, { title: 'New Link', subtitle: 'Description', icon: 'compass', color: 'blue', url: '/' }]);
  };

  const handleRemoveQuickLink = (index: number) => {
    setQuickLinksList(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleQuickLinkChange = (index: number, field: string, value: any) => {
    setQuickLinksList(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Developers
  const handleAddDeveloper = () => {
    setDevelopersList(prev => [...prev, { name: 'New Developer', role: 'Role', image_url: '', github: '', twitter: '', bio: '' }]);
  };

  const handleRemoveDeveloper = (index: number) => {
    setDevelopersList(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleDeveloperChange = (index: number, field: string, value: any) => {
    setDevelopersList(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  return {
    newsList, setNewsList,
    banners, setBanners,
    videosList, setVideosList,
    categoriesList, setCategoriesList,
    quickLinksList, setQuickLinksList,
    websiteFaqsList, setWebsiteFaqsList,
    developersList, setDevelopersList,
    newCatInput, setNewCatInput,
    handleAddBanner, handleBannerChange, handleDeleteBanner, handleClearAllBanners,
    handleAddNews, handleNewsChange, handleDeleteNews,
    handleAddCategory, handleRemoveCategory,
    handleAddVideo, handleDeleteVideo, handleVideosChange,
    handleAddWebsiteFaq, handleRemoveWebsiteFaq, handleWebsiteFaqChange,
    handleAddQuickLink, handleRemoveQuickLink, handleQuickLinkChange,
    handleAddDeveloper, handleRemoveDeveloper, handleDeveloperChange
  };
};
