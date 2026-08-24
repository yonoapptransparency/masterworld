import React, { useState, useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { RefreshCw, Sparkles } from 'lucide-react';
import { toast } from "../components/Toast";
import { useData } from '../contexts/DataContext';
import { isFirebaseConfigured, db } from '../lib/firebase';
import { adminFetch } from '../services/adminAuthService';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { useAdminApps } from '../hooks/useAdminApps';
import { useAdminSettings } from '../hooks/useAdminSettings';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { AdminTabContent } from '../components/admin/AdminTabContent';
import { FirebaseStatusIndicator } from '../components/FirebaseStatusIndicator';
import { AdminWelcomeOverlay } from '../components/admin/AdminWelcomeOverlay';

export default function AdminDashboard() {
  const { 
    apps, settings, news, videos, 
    saveApps, saveSettings, saveNews, saveVideos,
    loading, refreshAll, gitConfig, gitConfigLoading, saveGitConfig, pushAllToGitHub
  } = useData();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [saving, setSaving] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [editingAppId, setEditingAppId] = useState<string | null>(null);
  const [showWelcomeOverlay, setShowWelcomeOverlay] = useState<boolean>(() => {
    try {
      return !sessionStorage.getItem('masterworld_welcome_shown');
    } catch (e) {
      return true;
    }
  });

  const handleWelcomeComplete = () => {
    setShowWelcomeOverlay(false);
    try {
      sessionStorage.setItem('masterworld_welcome_shown', 'true');
    } catch (e) {}
  };

  const { user, checkingAuth, isAdminUser, sessionTimeLeft, handleLogout } = useAdminAuth();
  
  const { 
    appsList, setAppsList, fetchFailed, cachedSecureMapRef, syncSecureVault, recordAppDeletion
  } = useAdminApps(apps, loading, isAdminUser);

  const {
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
  } = useAdminSettings(settings, news, videos);

  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean; title: string; message: string; confirmText?: string; cancelText?: string; onConfirm: () => void | Promise<void>;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  const triggerHaptic = (intensity = 50) => {
    try { if (window.navigator?.vibrate) window.navigator.vibrate(intensity); } catch (e) {}
  };

  const handleReloadCloudData = async () => {
    setSaving(true);
    try {
      await refreshAll();
      toast('Global sync successful.', 'success');
    } catch (err: any) {
      toast('Sync failed: ' + err.message, 'error');
    } finally { setSaving(false); }
  };

  const handleSaveSettingsBase = async (updatedSettings: any) => {
    setSaving(true);
    try {
      let mergedSettings = {};
      if (updatedSettings && updatedSettings.preventDefault) {
        updatedSettings.preventDefault();
        const formData = new FormData(updatedSettings.currentTarget);
        const formSettings: any = {};
        formData.forEach((value, key) => { formSettings[key] = value; });
        mergedSettings = {
          categories: categoriesList,
          quick_links: quickLinksList,
          website_faqs: websiteFaqsList,
          developers: developersList,
          banners: banners,
          ...formSettings
        };
      } else {
        mergedSettings = {
          categories: categoriesList,
          quick_links: quickLinksList,
          website_faqs: websiteFaqsList,
          developers: developersList,
          banners: banners,
          ...updatedSettings
        };
      }

      await saveSettings(mergedSettings);
      triggerHaptic();
      toast('Settings saved successfully!', 'success');
    } catch (err: any) {
      toast('Error saving settings: ' + err.message, 'error');
    } finally { setSaving(false); }
  };

  const handleSaveApp = async (e: React.FormEvent<HTMLFormElement> | any, formFieldsOverride?: any) => {
    e?.preventDefault?.();
    setSaving(true);
    try {
      const formData = e?.currentTarget ? new FormData(e.currentTarget) : null;
      const name = formFieldsOverride?.name?.trim() || (formData ? (formData.get('name') as string || formData.get('hidden_name') as string) : '') || 'New App';
      const rawSlug = formFieldsOverride?.slug || (formData ? (formData.get('slug') as string || formData.get('hidden_slug') as string) : '');
      const slug = rawSlug?.trim().toLowerCase().replace(/[^a-z0-9-_]+/g, '-') || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const rawUrl = formFieldsOverride?.more_information_url ?? (formData ? ((formData.get('more_information_url') as string) ?? (formData.get('hidden_more_information_url') as string)) : '');
      const inputUrl = (rawUrl || '').trim();
      
      let encryptedUrlVal = '';
      let plaintextUrl = inputUrl || '';

      if (plaintextUrl && !plaintextUrl.startsWith('U2FsdGVkX1') && !plaintextUrl.toLowerCase().startsWith('http://') && !plaintextUrl.toLowerCase().startsWith('https://')) {
        plaintextUrl = 'https://' + plaintextUrl;
      }

      if (plaintextUrl && !plaintextUrl.startsWith('U2FsdGVkX1')) {
         const idToken = await user?.getIdToken();
         const res = await adminFetch('/api/v1/admin/encrypt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` },
            body: JSON.stringify({ url: plaintextUrl })
         });
         if (res.ok) encryptedUrlVal = (await res.json()).encrypted;
      }

      let category = 'General';
      if (formFieldsOverride) {
        let catArr: string[] = [];
        if (Array.isArray(formFieldsOverride.category_list)) {
          catArr = [...formFieldsOverride.category_list].filter(Boolean);
        }
        if (formFieldsOverride.custom_category?.trim()) {
          const customItems = formFieldsOverride.custom_category
            .split(',')
            .map((s: string) => s.trim())
            .filter(Boolean);
          catArr.push(...customItems);
        }
        const uniqueCats = catArr.filter((item, index) => {
          return catArr.findIndex(c => c.toLowerCase() === item.toLowerCase()) === index;
        });
        if (uniqueCats.length > 0) category = uniqueCats.join(', ');
      } else if (formData) {
        let catArr: string[] = (formData.getAll('category_list') as string[]).filter(Boolean);
        const customVal = (formData.get('custom_category') as string || '').trim();
        if (customVal) {
          const customItems = customVal.split(',').map((s: string) => s.trim()).filter(Boolean);
          catArr.push(...customItems);
        }
        const uniqueCats = catArr.filter((item, index) => {
          return catArr.findIndex(c => c.toLowerCase() === item.toLowerCase()) === index;
        });
        if (uniqueCats.length > 0) category = uniqueCats.join(', ');
      }

      const actualAppId = editingAppId || Math.random().toString(36).substr(2, 9);
      const existingApp = editingAppId ? appsList.find(a => a.id === editingAppId) : null;
      const appData = {
        id: actualAppId,
        name,
        slug,
        icon_url: (formFieldsOverride?.icon_url ?? (formData ? (formData.get('icon_url') as string || formData.get('hidden_icon_url') as string) : '')) || '',
        category,
        more_information_url: plaintextUrl,
        encrypted_link: encryptedUrlVal || (plaintextUrl.startsWith('U2FsdGVkX1') ? plaintextUrl : ''),
        rating: formFieldsOverride ? (parseFloat(formFieldsOverride.rating) || 5.0) : (parseFloat(formData?.get('rating') as string || formData?.get('hidden_rating') as string) || 5.0),
        review_count: formFieldsOverride?.review_count !== undefined ? formFieldsOverride.review_count : (formData?.get('review_count') as string || formData?.get('hidden_review_count') as string || ''),
        safety_status: formFieldsOverride?.safety_status || (formData?.get('safety_status') as any) || 'Verified',
        serial_number: formFieldsOverride?.serial_number ? (parseInt(formFieldsOverride.serial_number) || appsList.length + 1) : (parseInt(formData?.get('serial_number') as string) || appsList.length + 1),
        version: formFieldsOverride?.version ?? (formData?.get('version') as string) ?? '1.0',
        file_size: formFieldsOverride?.file_size ?? (formData?.get('file_size') as string) ?? 'Unknown',
        developer: formFieldsOverride?.developer ?? (formData?.get('developer') as string) ?? 'Admin',
        description_html: formFieldsOverride?.description_html ?? (formData ? (formData.get('description_html') as string ?? formData.get('hidden_description_html') as string) : '') ?? '',
        features_html: formFieldsOverride?.features_html ?? (formData ? (formData.get('features_html') as string ?? formData.get('hidden_features_html') as string) : '') ?? '',
        custom_admin_box_heading: formFieldsOverride?.custom_admin_box_heading ?? (formData ? (formData.get('custom_admin_box_heading') as string ?? formData.get('hidden_custom_admin_box_heading') as string) : '') ?? '',
        custom_admin_box_html: formFieldsOverride?.custom_admin_box_html ?? (formData ? (formData.get('custom_admin_box_html') as string ?? formData.get('hidden_custom_admin_box_html') as string) : '') ?? '',
        seo_title: formFieldsOverride?.seo_title ?? (formData ? (formData.get('seo_title') as string ?? formData.get('hidden_seo_title') as string) : '') ?? '',
        seo_description: formFieldsOverride?.seo_description ?? (formData ? (formData.get('seo_description') as string ?? formData.get('hidden_seo_description') as string) : '') ?? '',
        seo_keywords: formFieldsOverride?.seo_keywords ?? (formData ? (formData.get('seo_keywords') as string ?? formData.get('hidden_seo_keywords') as string) : '') ?? '',
        og_image_url: formFieldsOverride?.og_image_url ?? (formData ? (formData.get('og_image_url') as string ?? formData.get('hidden_og_image_url') as string) : '') ?? '',
        canonical_url: formFieldsOverride?.canonical_url ?? (formData ? (formData.get('canonical_url') as string ?? formData.get('hidden_canonical_url') as string) : '') ?? '',
        video_url: formFieldsOverride?.video_url ?? (formData ? (formData.get('video_url') as string ?? formData.get('hidden_video_url') as string) : '') ?? '',
        publish_date: formFieldsOverride?.publish_date ?? (formData ? (formData.get('publish_date') as string ?? formData.get('hidden_publish_date') as string) : '') ?? '',
        release_notes: formFieldsOverride?.release_notes ?? (formData ? (formData.get('release_notes') as string ?? formData.get('hidden_release_notes') as string) : '') ?? '',
        red_box_msg: formFieldsOverride?.red_box_msg ?? (formData ? (formData.get('red_box_msg') as string ?? formData.get('hidden_red_box_msg') as string) : '') ?? '',
        yellow_box_msg: formFieldsOverride?.yellow_box_msg ?? (formData ? (formData.get('yellow_box_msg') as string ?? formData.get('hidden_yellow_box_msg') as string) : '') ?? '',
        idea_box_msg: formFieldsOverride?.idea_box_msg ?? (formData ? (formData.get('idea_box_msg') as string ?? formData.get('hidden_idea_box_msg') as string) : '') ?? '',
        is_new: formFieldsOverride ? !!formFieldsOverride.is_new : (formData?.get('is_new') === 'on'),
        is_coming_soon: formFieldsOverride ? !!formFieldsOverride.is_coming_soon : (formData?.get('is_coming_soon') === 'on'),
        screenshots: formFieldsOverride?.screenshots ? formFieldsOverride.screenshots : JSON.parse((formData ? (formData.get('screenshots_json') as string || formData.get('hidden_screenshots_json') as string) : '') || '[]'),
        faqs: formFieldsOverride?.faqs ? formFieldsOverride.faqs : JSON.parse((formData ? (formData.get('faqs_json') as string || formData.get('hidden_faqs_json') as string) : '') || '[]'),
        created_at: existingApp?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (plaintextUrl) cachedSecureMapRef.current.set(actualAppId, plaintextUrl);
      else cachedSecureMapRef.current.delete(actualAppId);

      const updatedApps = editingAppId ? appsList.map(a => a.id === editingAppId ? { ...a, ...appData } : a) : [...appsList, appData];
      await syncSecureVault(true, updatedApps);
      await saveApps(updatedApps);
      setAppsList(updatedApps);
      setEditingAppId(null);
      toast('Application saved successfully!', 'success');
    } catch (err: any) {
      toast('Save failed: ' + err.message, 'error');
    } finally { setSaving(false); }
  };

  const handleDeleteApp = (id: string) => {
    setConfirmConfig({
      isOpen: true, title: 'Delete App', message: 'Permanently delete this app?',
      onConfirm: async () => {
        try {
          cachedSecureMapRef.current.delete(id);
          recordAppDeletion(id);
          const updatedApps = appsList.filter(a => a.id !== id);
          await saveApps(updatedApps);
          toast('App deleted.', 'success');
        } catch (err: any) { toast('Delete failed.', 'error'); }
      }
    });
  };

  if (checkingAuth) return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center"><RefreshCw className="animate-spin text-blue-600" /></div>;
  if (!user || isAdminUser === false) return <Navigate to={getAdminPath('/login')} replace />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-100 dark:selection:bg-blue-900/30">
      <AdminSidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen} 
        handleLogout={handleLogout} 
        sessionTimeLeft={sessionTimeLeft} 
        onRefresh={handleReloadCloudData}
        isRefreshing={saving}
      />

      <main className="lg:pl-64 min-h-screen transition-all duration-300">
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80  border-b border-slate-200 dark:border-slate-800 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-black tracking-tight capitalize">
              {activeTab === 'news' ? 'News Section' : activeTab.replace('-', ' ')}
            </h2>
            <FirebaseStatusIndicator />
          </div>
          <div className="flex items-center gap-3">
             <button 
              type="button"
              onClick={() => setShowWelcomeOverlay(true)}
              title="Replay Welcome Experience"
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-lg font-bold text-xs transition-all border border-amber-500/20 cursor-pointer active:scale-95 whitespace-nowrap"
             >
                <Sparkles size={13} className="text-amber-500" />
                <span className="hidden sm:inline">Welcome Intro</span>
             </button>
             <button 
              onClick={handleReloadCloudData} 
              disabled={saving} 
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg font-bold text-xs transition-all border-0 cursor-pointer shadow-sm shadow-blue-500/10 active:scale-95 disabled:opacity-50 whitespace-nowrap"
             >
                <RefreshCw size={14} className={saving ? 'animate-spin' : ''} />
                <span>{saving ? 'Syncing...' : 'Global Refresh'}</span>
             </button>
          </div>
        </header>

        <div className="p-4 max-w-7xl mx-auto">
          <AdminTabContent 
            activeTab={activeTab} appsList={appsList} newsList={newsList} banners={banners} videosList={videosList}
            categoriesList={categoriesList} quickLinksList={quickLinksList} websiteFaqsList={websiteFaqsList} developersList={developersList}
            settings={settings} gitConfig={gitConfig} db={db} saving={saving} setSaving={setSaving} editingAppId={editingAppId}
            setEditingAppId={setEditingAppId}
            handleDeleteApp={handleDeleteApp} handleSaveApp={handleSaveApp} handleSaveSettings={handleSaveSettingsBase} 
            handleSaveNews={async (list?: any) => {
              setSaving(true);
              try {
                const targetList = (list && Array.isArray(list) && list.length > 0) ? list : newsList;
                await saveNews(targetList);
                triggerHaptic();
                toast('News saved and synchronized successfully!', 'success');
              } catch (err: any) {
                toast('Save failed: ' + (err?.message || 'Unknown error'), 'error');
              } finally {
                setSaving(false);
              }
            }}
            handleSaveCategories={(e) => { e.preventDefault(); handleSaveSettingsBase({ categories: categoriesList }); }}
            handleSaveQuickLinks={(e) => { e.preventDefault(); handleSaveSettingsBase({ quick_links: quickLinksList }); }}
            handleSaveWebsiteFaqs={(e) => { e.preventDefault(); handleSaveSettingsBase({ website_faqs: websiteFaqsList }); }}
            handleSaveDevelopers={(e) => { e.preventDefault(); handleSaveSettingsBase({ developers: developersList }); }}
            handleSaveVideos={() => saveVideos(videosList)}
            saveGitConfig={saveGitConfig} pushAllToGitHub={pushAllToGitHub} handleReloadCloudData={handleReloadCloudData} triggerHaptic={triggerHaptic}
            
            newCatInput={newCatInput}
            setNewCatInput={setNewCatInput}
            handleAddBanner={handleAddBanner}
            handleBannerChange={handleBannerChange}
            handleDeleteBanner={handleDeleteBanner}
            handleAddNews={handleAddNews}
            handleNewsChange={handleNewsChange}
            handleDeleteNews={handleDeleteNews}
            handleAddCategory={handleAddCategory}
            handleRemoveCategory={handleRemoveCategory}
            handleAddVideo={handleAddVideo}
            handleDeleteVideo={handleDeleteVideo}
            handleVideosChange={handleVideosChange}
            handleAddWebsiteFaq={handleAddWebsiteFaq}
            handleRemoveWebsiteFaq={handleRemoveWebsiteFaq}
            handleWebsiteFaqChange={handleWebsiteFaqChange}
            handleAddQuickLink={handleAddQuickLink}
            handleRemoveQuickLink={handleRemoveQuickLink}
            handleQuickLinkChange={handleQuickLinkChange}
            handleAddDeveloper={handleAddDeveloper}
            handleRemoveDeveloper={handleRemoveDeveloper}
            handleDeveloperChange={handleDeveloperChange}
          />
        </div>
      </main>

      {confirmConfig.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60  animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{confirmConfig.title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium leading-relaxed">{confirmConfig.message}</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmConfig({ ...confirmConfig, isOpen: false })} className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-xl transition-all border-0 cursor-pointer">Cancel</button>
              <button onClick={() => { confirmConfig.onConfirm(); setConfirmConfig({ ...confirmConfig, isOpen: false }); }} className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-rose-600/20 border-0 cursor-pointer">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {showWelcomeOverlay && (
        <AdminWelcomeOverlay 
          onComplete={handleWelcomeComplete}
          siteTitle={settings?.site_title || 'MasterWorld'}
          adminName="Boss"
        />
      )}
    </div>
  );
}

const getAdminPath = (path: string) => {
  const adminBase = import.meta.env.VITE_ADMIN_PATH || 'masterworld';
  return `/${adminBase}${path}`;
};
