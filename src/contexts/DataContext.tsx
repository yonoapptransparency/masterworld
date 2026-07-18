import React, { createContext, useContext, useState } from 'react';
import { mockApps, mockSettings, mockNews, mockBlogs, mockVideos } from '../lib/staticData';

const DataContext = createContext<any>(null);

export const DataProvider = ({ children }: any) => {
  const [apps] = useState(mockApps || []);
  const [settings] = useState(mockSettings || {});
  const [news] = useState(mockNews || []);
  const [blogs] = useState(mockBlogs || []);
  const [videos] = useState(mockVideos || []);

  const value = {
    apps, settings, news, blogs, videos,
    loading: false, loadedFromServer: false,
    appsSyncedWithServer: true, settingsSyncedWithServer: true,
    newsSyncedWithServer: true, blogsSyncedWithServer: true,
    videosSyncedWithServer: true,
    serverAppsFetched: true, serverNewsFetched: true,
    serverBlogsFetched: true, serverVideosFetched: true,
    syncVersion: 1, lastSyncTime: Date.now(),
    refreshAll: async () => {}, testCloudConnection: async () => false,
    saveApps: async () => {}, saveSettings: async () => {}, saveNews: async () => {},
    saveBlogs: async () => {}, saveVideos: async () => {},
    isConnected: true, isLive: false, quotaExceeded: false,
    gitConfig: null, gitConfigLoading: false, saveGitConfig: async () => {},
    pushAllToGitHub: async () => {}
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within DataProvider");
  return context;
};
