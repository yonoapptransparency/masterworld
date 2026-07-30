import React from 'react';
import AppsTab from '../AppsTab';
import BlogsTab from '../BlogsTab';
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
import { AdminReviewsTab } from './AdminReviewsTab';

interface AdminTabContentProps {
  activeTab: string;
  appsList: any[];
  newsList: any[];
  banners: any[];
  blogsList: any[];
  videosList: any[];
  categoriesList: string[];
  quickLinksList: any[];
  websiteFaqsList: any[];
  developersList: any[];
  settings: any;
  gitConfig: any;
  db: any;
  saving: boolean;
  editingAppId: string | null;
  setEditingAppId: (id: string | null) => void;
  handleDeleteApp: (id: string) => void;
  handleSaveApp: (e: any) => void;
  handleSaveSettings: (e: any) => void;
  handleSaveNews: () => void;
  handleSaveCategories: (e: any) => void;
  handleSaveQuickLinks: (e: any) => void;
  handleSaveWebsiteFaqs: (e: any) => void;
  handleSaveDevelopers: (e: any) => void;
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
  handleAddBlog?: () => void;
  handleBlogChange?: (id: string, field: string, value: any) => void;
  handleDeleteBlog?: (id: string) => void;
  handleSaveBlogs?: () => void;
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
  blogsList,
  videosList,
  categoriesList,
  quickLinksList,
  websiteFaqsList,
  developersList,
  settings,
  gitConfig,
  db,
  saving,
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
  handleAddBlog,
  handleBlogChange,
  handleDeleteBlog,
  handleSaveBlogs,
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
      return <DashboardTab apps={appsList} news={newsList} updates={blogsList} />;
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
          handleSaveBanners={(e: any) => { e?.preventDefault?.(); handleSaveSettings({ ...settings, banners }); }}
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
          saveNews={async (list) => { await handleSaveNews(); }}
          setSaving={() => {}}
          appsList={appsList}
        />
      );
    case 'blogs':
      return <BlogsTab 
        blogs={blogsList}
        saving={saving}
        handleAddBlog={handleAddBlog}
        handleBlogChange={handleBlogChange}
        handleDeleteBlog={handleDeleteBlog}
        handleSaveBlogs={handleSaveBlogs}
      />;
    case 'videos':
      return (
        <AdminVideosTab 
          videosList={videosList} 
          saving={saving}
          handleAddVideo={handleAddVideo}
          handleDeleteVideo={handleDeleteVideo}
          handleVideosChange={handleVideosChange}
          handleSaveVideos={async (e) => { e.preventDefault(); await handleReloadCloudData(); }}
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
          blogs={blogsList}
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
      return <AdminReviewsTab db={db} />;
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
        const updatedSettings = { ...settings };
        formData.forEach((value, key) => {
          updatedSettings[key] = value;
        });
        handleSaveSettings(updatedSettings);
      }} />;

    default:
      return null;
  }
};
