import React, { Suspense } from 'react';
import { lazyWithRetry } from '../../lib/lazyWithRetry';
import AppsTab from '../AppsTab';
import SecurityTab from '../SecurityTab';
import FirebaseStatusPanel from '../FirebaseStatusPanel';
import { AdminDashboardOverview as DashboardTab } from './AdminDashboardOverview';
import { AdminSettingsTab as SettingsTab } from './AdminSettingsTab';
import { AdminCategoriesTab } from './AdminCategoriesTab';
import { AdminBannersTab } from './AdminBannersTab';
import { AdminGithubTab } from './AdminGithubTab';
import { AdminNewsTab } from './AdminNewsTab';
import { AdminVideosTab } from './AdminVideosTab';
import { AdminQuickLinksTab } from './AdminQuickLinksTab';
import { AdminWebsiteFaqsTab } from './AdminWebsiteFaqsTab';
import { AdminDevelopersTab } from './AdminDevelopersTab';

// Lazy load heavy admin modules on demand with retry
const AdminReviewsTab = lazyWithRetry(() => import('./AdminReviewsTab'));
const AdminReportsTab = lazyWithRetry(() => import('./AdminReportsTab'));
const AdminCommunityTab = lazyWithRetry(() => import('./AdminCommunityTab'));
const AdminAIReviewStudioTab = lazyWithRetry(() => import('./AdminAIReviewStudioTab'));

const TabLoadingFallback = () => (
  <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8">
    <div className="animate-spin rounded-full h-10 w-10 border-3 border-blue-600 border-t-transparent" />
    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Module...</p>
  </div>
);

interface AdminTabContentProps {
  activeTab: string;
  appsList: any[];
  newsList: any[];
  banners: any[];
  videosList: any[];
  categoriesList: string[];
  quickLinksList: any[];
  websiteFaqsList: any[];
  developersList: any[];
  settings: any;
  gitConfig: any;
  db: any;
  saving: boolean;
  setSaving?: (saving: boolean) => void;
  editingAppId: string | null;
  setEditingAppId: (id: string | null) => void;
  handleDeleteApp: (id: string) => void;
  handleSaveApp: (e: any) => void;
  handleSaveSettings: (e: any) => void;
  handleSaveNews: (list?: any) => void;
  handleSaveCategories: (e: any) => void;
  handleSaveQuickLinks: (e: any) => void;
  handleSaveWebsiteFaqs: (e: any) => void;
  handleSaveDevelopers: (e: any) => void;
  handleSaveVideos?: (e?: any) => Promise<void> | void;
  saveGitConfig: (conf: any) => Promise<void>;
  pushAllToGitHub: () => Promise<void>;
  handleReloadCloudData: () => void;
  triggerHaptic: () => void;
  
  // Handlers from useAdminSettings
  newCatInput: string;
  setNewCatInput: (val: string) => void;
  handleAddBanner: () => void;
  handleBannerChange: (id: string, field: string, value: any) => void;
  handleDeleteBanner: (id: string) => void;
  handleAddNews: () => string;
  handleNewsChange: (id: string, field: string, value: any) => void;
  handleDeleteNews: (id: string) => void;
  handleAddCategory: () => void;
  handleRemoveCategory: (cat: string) => void;
  handleAddVideo: () => void;
  handleDeleteVideo: (id: string) => void;
  handleVideosChange: (id: string, field: string, value: any) => void;
  handleAddWebsiteFaq: () => void;
  handleRemoveWebsiteFaq: (index: number) => void;
  handleWebsiteFaqChange: (index: number, field: string, value: any) => void;
  handleAddQuickLink: () => void;
  handleRemoveQuickLink: (index: number) => void;
  handleQuickLinkChange: (index: number, field: string, value: any) => void;
  handleAddDeveloper: () => void;
  handleRemoveDeveloper: (index: number) => void;
  handleDeveloperChange: (index: number, field: string, value: any) => void;
}

export const AdminTabContent = ({
  activeTab,
  appsList,
  newsList,
  banners,
  videosList,
  categoriesList,
  quickLinksList,
  websiteFaqsList,
  developersList,
  settings,
  gitConfig,
  db,
  saving,
  setSaving,
  editingAppId,
  setEditingAppId,
  handleDeleteApp,
  handleSaveApp,
  handleSaveSettings,
  handleSaveNews,
  handleSaveCategories,
  handleSaveQuickLinks,
  handleSaveWebsiteFaqs,
  handleSaveDevelopers,
  handleSaveVideos,
  saveGitConfig,
  pushAllToGitHub,
  handleReloadCloudData,
  triggerHaptic,
  
  newCatInput,
  setNewCatInput,
  handleAddBanner,
  handleBannerChange,
  handleDeleteBanner,
  handleAddNews,
  handleNewsChange,
  handleDeleteNews,
  handleAddCategory,
  handleRemoveCategory,
  handleAddVideo,
  handleDeleteVideo,
  handleVideosChange,
  handleAddWebsiteFaq,
  handleRemoveWebsiteFaq,
  handleWebsiteFaqChange,
  handleAddQuickLink,
  handleRemoveQuickLink,
  handleQuickLinkChange,
  handleAddDeveloper,
  handleRemoveDeveloper,
  handleDeveloperChange
}: AdminTabContentProps) => {
  switch (activeTab) {
    case 'dashboard':
      return <DashboardTab apps={appsList} news={newsList} />;
    case 'apps':
      return (
        <AppsTab 
          appsList={appsList} 
          editingAppId={editingAppId} 
          setEditingAppId={setEditingAppId} 
          handleDeleteApp={handleDeleteApp}
          handleSaveApp={handleSaveApp}
          categories={categoriesList}
          saving={saving}
        />
      );
    case 'banners':
      return (
        <AdminBannersTab 
          banners={banners} 
          saving={saving} 
          handleSaveBanners={(e: any) => { e?.preventDefault?.(); handleSaveSettings({ banners }); }}
          handleAddBanner={handleAddBanner}
          handleBannerChange={handleBannerChange}
          handleDeleteBanner={handleDeleteBanner}
        />
      );
    case 'categories':
      return (
        <AdminCategoriesTab 
          categoriesList={categoriesList} 
          saving={saving}
          newCatInput={newCatInput}
          setNewCatInput={setNewCatInput}
          addCategory={handleAddCategory}
          removeCategory={handleRemoveCategory}
          handleSaveCategories={handleSaveCategories}
        />
      );
    case 'news':
      return (
        <AdminNewsTab 
          newsList={newsList} 
          saving={saving} 
          handleAddNews={handleAddNews}
          handleNewsChange={handleNewsChange}
          handleDeleteNews={handleDeleteNews}
          saveNews={async (list) => { await handleSaveNews(list); }}
          setSaving={setSaving || (() => {})}
          appsList={appsList}
        />
      );
    case 'videos':
      return (
        <AdminVideosTab 
          videosList={videosList} 
          saving={saving}
          handleAddVideo={handleAddVideo}
          handleDeleteVideo={handleDeleteVideo}
          handleVideosChange={handleVideosChange}
          handleSaveVideos={async (e) => { e?.preventDefault?.(); await handleSaveVideos?.(e); }}
        />
      );
    case 'faqs':
      return (
        <AdminWebsiteFaqsTab 
          websiteFaqsList={websiteFaqsList} 
          saving={saving} 
          handleAddWebsiteFaq={handleAddWebsiteFaq}
          handleRemoveWebsiteFaq={handleRemoveWebsiteFaq}
          handleWebsiteFaqChange={handleWebsiteFaqChange}
          handleSaveWebsiteFaqs={handleSaveWebsiteFaqs}
        />
      );
    case 'quick-links':
      return (
        <AdminQuickLinksTab 
          quickLinksList={quickLinksList} 
          saving={saving} 
          handleAddQuickLink={handleAddQuickLink}
          handleRemoveQuickLink={handleRemoveQuickLink}
          handleQuickLinkChange={handleQuickLinkChange}
          handleSaveQuickLinks={handleSaveQuickLinks}
        />
      );
    case 'github':
      return (
        <AdminGithubTab 
          gitConfig={gitConfig} 
          saveGitConfig={saveGitConfig} 
          pushAllToGitHub={pushAllToGitHub} 
          appsList={appsList}
          settings={settings}
          newsList={newsList}
          videosList={videosList}
          generatePreview={() => "Preview not available in this view"}
        />
      );
    case 'developers':
      return (
        <AdminDevelopersTab 
          developersList={developersList} 
          saving={saving} 
          handleAddDeveloper={handleAddDeveloper}
          handleRemoveDeveloper={handleRemoveDeveloper}
          handleDeveloperChange={handleDeveloperChange}
          handleSaveDevelopers={handleSaveDevelopers}
        />
      );
    case 'reviews':
      return (
        <Suspense fallback={<TabLoadingFallback />}>
          <AdminReviewsTab appsList={appsList} />
        </Suspense>
      );
    case 'ai-reviews':
      return (
        <Suspense fallback={<TabLoadingFallback />}>
          <AdminAIReviewStudioTab appsList={appsList} />
        </Suspense>
      );
    case 'reports':
      return (
        <Suspense fallback={<TabLoadingFallback />}>
          <AdminReportsTab appsList={appsList} />
        </Suspense>
      );
    case 'security':
      return (
        <div className="space-y-6">
          <SecurityTab />
          <FirebaseStatusPanel />
        </div>
      );
    case 'settings':
      return <SettingsTab settings={settings} saving={saving} handleSaveSettings={(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const updatedSettings = {
          ...settings,
          banners: banners ?? settings.banners ?? [],
          categories: categoriesList ?? settings.categories ?? [],
          quick_links: quickLinksList ?? settings.quick_links ?? [],
          website_faqs: websiteFaqsList ?? settings.website_faqs ?? [],
          developers: developersList ?? settings.developers ?? []
        };
        formData.forEach((value, key) => {
          updatedSettings[key] = value;
        });
        updatedSettings.social_links = {
          facebook: (formData.get('social_facebook') as string) || '',
          instagram: (formData.get('social_instagram') as string) || '',
          twitter: (formData.get('social_twitter') as string) || '',
          linkedin: (formData.get('social_linkedin') as string) || '',
          youtube: (formData.get('social_youtube') as string) || '',
        };
        delete updatedSettings.social_facebook;
        delete updatedSettings.social_instagram;
        delete updatedSettings.social_twitter;
        delete updatedSettings.social_linkedin;
        delete updatedSettings.social_youtube;
        updatedSettings.hero_title_visible = formData.get('hero_title_visible') === 'true';

        handleSaveSettings(updatedSettings);
      }} />;

    default:
      return null;
  }
};
