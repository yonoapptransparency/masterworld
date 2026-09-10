import React, { useState } from 'react';
import { AppInspector } from './admin/apps/AppInspector';
import { AppForm } from './admin/apps/AppForm';
import { useAppForm } from '../hooks/useAppForm';

interface AppsTabProps {
  appsList: any[];
  editingAppId: string | null;
  setEditingAppId: (id: string | null) => void;
  handleDeleteApp: (id: string) => void;
  handleSaveApp: (e: any, app?: any) => Promise<void> | void;
  handleTogglePublicSync: (id: string) => void;
  categories: string[];
  saving: boolean;
}

export default function AppsTab({
  appsList,
  editingAppId,
  setEditingAppId,
  handleDeleteApp,
  handleSaveApp,
  handleTogglePublicSync,
  categories,
  saving
}: AppsTabProps) {
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  const editApp = editingAppId ? appsList.find(a => String(a.id) === String(editingAppId)) || {} : null;

  const {
    formFields,
    activeFormTab,
    setActiveFormTab,
    handleFieldChange,
    handleQuickClean
  } = useAppForm(editApp, editingAppId, appsList, categories);

  if (editingAppId !== null) {
    return (
      <AppForm 
        editingAppId={editingAppId}
        formFields={formFields}
        activeFormTab={activeFormTab}
        setActiveFormTab={setActiveFormTab}
        handleFieldChange={handleFieldChange}
        handleSaveApp={handleSaveApp}
        handleQuickClean={handleQuickClean}
        setEditingAppId={setEditingAppId}
        categories={categories}
        saving={saving}
      />
    );
  }

  if (selectedAppId) {
    const selectedApp = appsList.find(a => String(a.id) === String(selectedAppId));
    if (selectedApp) {
      return (
        <AppInspector 
          selectedApp={selectedApp}
          setSelectedAppId={setSelectedAppId}
          setEditingAppId={setEditingAppId}
          setActiveFormTab={setActiveFormTab}
          handleDeleteApp={handleDeleteApp}
          handleTogglePublicSync={handleTogglePublicSync}
        />
      );
    }
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">App Catalog</h2>
        <button 
          onClick={() => setEditingAppId('new')} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Add New App
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {appsList.map(app => (
          <div 
            key={app.id} 
            onClick={() => setSelectedAppId(app.id)} 
            className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              {app.icon_url && (
                <img src={app.icon_url} alt={app.name} className="w-12 h-12 rounded-lg object-cover bg-slate-100 dark:bg-slate-800" />
              )}
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1">{app.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Ver: {app.version || '1.0'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
