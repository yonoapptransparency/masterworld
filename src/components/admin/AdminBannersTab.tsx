import React from 'react';
import { LayoutDashboard, Plus, Trash2, Save } from 'lucide-react';
import ImageUpload from '../ImageUpload';

interface AdminBannersTabProps {
  banners: any[];
  handleAddBanner: () => void;
  handleRemoveBanner?: (index: number) => void;
  handleDeleteBanner?: (id: string) => void;
  handleUpdateBanner?: (index: number, field: string, value: any) => void;
  handleBannerChange?: (id: string, field: string, value: any) => void;
  handleSaveBanners?: (e: React.FormEvent) => void;
  saving: boolean;
  setSaving?: (saving: boolean) => void;
  appsList?: any[];
  blogs?: any[];
  newsList?: any[];
  saveSettings?: (settings: any) => Promise<void>;
  settings?: any;
  triggerHaptic?: () => void;
  toast?: (msg: string, type?: string) => void;
}

export const AdminBannersTab = React.memo(({
  banners,
  handleAddBanner,
  handleRemoveBanner,
  handleDeleteBanner,
  handleUpdateBanner,
  handleBannerChange,
  handleSaveBanners,
  saving,
  setSaving,
  saveSettings,
  settings,
  triggerHaptic,
  toast
}: AdminBannersTabProps) => {
  const onRemove = (index: number, id: string) => {
    if (handleDeleteBanner && id) {
      handleDeleteBanner(id);
    } else if (handleRemoveBanner) {
      handleRemoveBanner(index);
    }
  };

  const onUpdate = (index: number, id: string, field: string, value: any) => {
    if (handleBannerChange && id) {
      handleBannerChange(id, field, value);
    } else if (handleUpdateBanner) {
      handleUpdateBanner(index, field, value);
    }
  };

  const onSave = async (e: React.FormEvent) => {
    if (handleSaveBanners) {
      handleSaveBanners(e);
    } else if (saveSettings && settings) {
      if (setSaving) setSaving(true);
      await saveSettings({ ...settings, banners });
      if (triggerHaptic) triggerHaptic();
      if (setSaving) setSaving(false);
      if (toast) toast('Banners Synced to Frontend System.', 'success');
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-2xl border border-black/10 dark:border-white/10 shadow-sm">
        <div>
          <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-blue-500" /> Home Page Banners
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage promotional banners on the homepage.</p>
        </div>
        <button onClick={handleAddBanner} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors shadow-sm cursor-pointer border-0">
          <Plus className="w-4 h-4"/> Add Banner
        </button>
      </div>
      
      <div className="grid gap-6">
        {banners.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
            <p className="text-slate-500 dark:text-slate-400">No banners added yet.</p>
          </div>
        ) : (
          banners.map((banner: any, index: number) => (
            <div key={banner.id || index} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
                <h4 className="font-semibold text-slate-700 dark:text-slate-300 text-sm">Banner #{index + 1}</h4>
                <button onClick={() => onRemove(index, banner.id)} className="text-rose-500 hover:text-rose-600 p-1 cursor-pointer border-0 bg-transparent"><Trash2 className="w-4 h-4" /></button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <ImageUpload value={banner.image_url || banner.image} onChange={(val) => onUpdate(index, banner.id, banner.image_url !== undefined ? 'image_url' : 'image', val)} placeholder="Image URL" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white focus-within:ring-2 focus-within:ring-blue-500 overflow-hidden" />
                <input type="text" value={banner.link || ''} onChange={(e) => onUpdate(index, banner.id, 'link', e.target.value)} placeholder="Link URL" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all" />
              </div>
            </div>
          ))
        )}
      </div>
      
      {banners.length > 0 && (
        <div className="flex justify-end mt-6">
          <button onClick={onSave} disabled={saving} className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer border-0">
            {saving ? 'Saving...' : <><Save className="w-4 h-4"/> Save Banners</>}
          </button>
        </div>
      )}
    </div>
  );
});

AdminBannersTab.displayName = 'AdminBannersTab';

export default AdminBannersTab;
