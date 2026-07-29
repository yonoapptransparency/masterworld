import { useState, useEffect } from 'react';

export const useAdminSettings = (settings: any, news: any[], blogs: any[], videos: any[]) => {
  const [newsList, setNewsList] = useState(news);
  const [banners, setBanners] = useState(settings.banners || []);
  const [blogsList, setBlogsList] = useState(blogs);
  const [videosList, setVideosList] = useState(videos);
  const [categoriesList, setCategoriesList] = useState<string[]>(settings.categories || []);
  const [quickLinksList, setQuickLinksList] = useState(settings.quick_links || []);
  const [websiteFaqsList, setWebsiteFaqsList] = useState(settings.website_faqs || []);
  const [developersList, setDevelopersList] = useState(settings.developers || []);
  const [newCatInput, setNewCatInput] = useState('');

  useEffect(() => {
    setNewsList(news);
    setBanners(settings.banners || []);
    setBlogsList(blogs);
    setVideosList(videos);
    setCategoriesList(settings.categories || []);
    setQuickLinksList(settings.quick_links || []);
    setWebsiteFaqsList(settings.website_faqs || []);
    setDevelopersList(settings.developers || []);
  }, [settings, news, blogs, videos]);

  // Banners
  const handleAddBanner = () => {
    const newBanner = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'New Banner',
      subtitle: 'Subtitle text',
      image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80',
      link: '/'
    };
    setBanners([...banners, newBanner]);
  };

  const handleBannerChange = (id: string, field: string, value: string) => {
    setBanners(banners.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const handleDeleteBanner = (id: string) => {
    setBanners(banners.filter(b => b.id !== id));
  };

  // News
  const handleAddNews = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    const newItem = {
      id: newId,
      slug: 'new-news',
      title: 'New News',
      logo_url: '',
      description: 'News description...',
      description_html: '<p>Content...</p>',
      image_url: '',
      created_at: new Date().toISOString(),
      is_breaking: false,
      is_new: true,
      category: 'General',
      is_pinned: false
    };
    setNewsList([...newsList, newItem]);
    return newId;
  };

  const handleNewsChange = (id: string, field: string, value: any) => {
    setNewsList(newsList.map(n => n.id === id ? { ...n, [field]: value } : n));
  };

  const handleDeleteNews = (id: string) => {
    setNewsList(newsList.filter(n => n.id !== id));
  };

  // Categories
  const handleAddCategory = () => {
    const trimmed = newCatInput.trim();
    if (trimmed && !categoriesList.includes(trimmed)) {
      setCategoriesList([...categoriesList, trimmed]);
      setNewCatInput('');
    }
  };

  const handleRemoveCategory = (cat: string) => {
    setCategoriesList(categoriesList.filter(c => c !== cat));
  };

  // Videos
  const handleAddVideo = () => {
    setVideosList([...videosList, {
      id: Math.random().toString(36).substr(2, 9),
      title: 'New Video',
      url: '',
      thumbnail: '',
      description: '',
      created_at: new Date().toISOString()
    }]);
  };

  const handleDeleteVideo = (id: string) => {
    setVideosList(videosList.filter(v => v.id !== id));
  };

  const handleVideosChange = (id: string, field: string, value: any) => {
    setVideosList(videosList.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  // Website FAQs
  const handleAddWebsiteFaq = () => {
    setWebsiteFaqsList([...websiteFaqsList, { question: 'New Question', answer: 'New Answer' }]);
  };

  const handleRemoveWebsiteFaq = (index: number) => {
    const updated = [...websiteFaqsList];
    updated.splice(index, 1);
    setWebsiteFaqsList(updated);
  };

  const handleWebsiteFaqChange = (index: number, field: string, value: any) => {
    const updated = [...websiteFaqsList];
    updated[index] = { ...updated[index], [field]: value };
    setWebsiteFaqsList(updated);
  };

  // Quick Links
  const handleAddQuickLink = () => {
    setQuickLinksList([...quickLinksList, { title: 'New Link', subtitle: 'Description', icon: 'compass', color: 'blue', url: '/' }]);
  };

  const handleRemoveQuickLink = (index: number) => {
    const updated = [...quickLinksList];
    updated.splice(index, 1);
    setQuickLinksList(updated);
  };

  const handleQuickLinkChange = (index: number, field: string, value: any) => {
    const updated = [...quickLinksList];
    updated[index] = { ...updated[index], [field]: value };
    setQuickLinksList(updated);
  };

  // Developers
  const handleAddDeveloper = () => {
    setDevelopersList([...developersList, { name: 'New Developer', role: 'Role', image_url: '', github: '', twitter: '', bio: '' }]);
  };

  const handleRemoveDeveloper = (index: number) => {
    const updated = [...developersList];
    updated.splice(index, 1);
    setDevelopersList(updated);
  };

  const handleDeveloperChange = (index: number, field: string, value: any) => {
    const updated = [...developersList];
    updated[index] = { ...updated[index], [field]: value };
    setDevelopersList(updated);
  };

  return {
    newsList, setNewsList,
    banners, setBanners,
    blogsList, setBlogsList,
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
