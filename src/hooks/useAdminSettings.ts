import { useState, useEffect, useRef } from 'react';
import { mockNews, mockVideos, mockSettings } from '../lib/staticData';

export const useAdminSettings = (settings: any, news: any[], videos: any[]) => {
  const [newsList, setNewsList] = useState<any[]>(() => (Array.isArray(news) && news.length > 0 ? news : (mockNews || [])));
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

  // Synchronize news directly when fresh server data arrives
  useEffect(() => {
    if (Array.isArray(news) && news.length > 0) {
      setNewsList(news.filter(n => !deletedNewsIdsRef.current.has(n.id)));
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

  // News
  const handleAddNews = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    const newItem = {
      id: newId,
      slug: `news-${newId}`,
      title: 'New News Item',
      logo_url: '',
      description: 'News description...',
      description_html: '<p>Content...</p>',
      content: '<p>Content...</p>',
      image_url: '',
      created_at: new Date().toISOString(),
      date: new Date().toISOString(),
      published_at: new Date().toISOString(),
      is_breaking: false,
      is_new: true,
      category: 'General',
      is_pinned: false
    };
    setNewsList(prev => [newItem, ...prev]);
    return newId;
  };

  const handleNewsChange = (id: string, field: string, value: any) => {
    setNewsList(prev => prev.map(n => {
      if (n.id !== id) return n;
      const updated: any = { ...n, [field]: value, updated_at: new Date().toISOString() };
      if (field === 'title' && (!n.slug || n.slug.startsWith('news-') || n.slug === 'new-news-item')) {
        updated.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
      if (field === 'content') {
        updated.description_html = value;
      } else if (field === 'description_html') {
        updated.content = value;
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
    setVideosList(prev => [...prev, {
      id: newId,
      title: 'New Video',
      url: '',
      thumbnail: '',
      description: '',
      created_at: new Date().toISOString()
    }]);
  };

  const handleDeleteVideo = (id: string) => {
    deletedVideoIdsRef.current.add(id);
    setVideosList(prev => prev.filter(v => v.id !== id));
  };

  const handleVideosChange = (id: string, field: string, value: any) => {
    setVideosList(prev => prev.map(v => v.id === id ? { ...v, [field]: value, updated_at: new Date().toISOString() } : v));
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
    handleAddBanner, handleBannerChange, handleDeleteBanner,
    handleAddNews, handleNewsChange, handleDeleteNews,
    handleAddCategory, handleRemoveCategory,
    handleAddVideo, handleDeleteVideo, handleVideosChange,
    handleAddWebsiteFaq, handleRemoveWebsiteFaq, handleWebsiteFaqChange,
    handleAddQuickLink, handleRemoveQuickLink, handleQuickLinkChange,
    handleAddDeveloper, handleRemoveDeveloper, handleDeveloperChange
  };
};
