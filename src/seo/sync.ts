import fs from 'fs';
import path from 'path';
import { getRawFirebaseConfig, parseFirestoreDoc } from './firebaseConfig';

// Dynamically resolve staticData to bypass TSX watcher
const getStaticData = () => {
  try {
    return require('../lib/staticData');
  } catch (e) {
    return { mockApps: [], mockSettings: {}, mockNews: [], mockBlogs: [], mockVideos: [] };
  }
};

export async function syncFromFirestore(): Promise<any> {
  try {
    const freshStatic = getStaticData();
    let existingBackup: any = {
      apps: freshStatic.mockApps || [],
      settings: freshStatic.mockSettings || {},
      news: freshStatic.mockNews || [],
      blogs: freshStatic.mockBlogs || [],
      videos: freshStatic.mockVideos || []
    };

    const fsMod = require('fs'); 
    const pathMod = require('path'); 
    const publicBackupPath = pathMod.join(process.cwd(), 'src/lib/public_backup.json');
    try {
      const fileContent = fsMod.existsSync(publicBackupPath) ? JSON.parse(fsMod.readFileSync(publicBackupPath, 'utf8')) : null;
      if (fileContent) {
        if (Array.isArray(fileContent.apps)) existingBackup.apps = fileContent.apps;
        if (fileContent.settings && Object.keys(fileContent.settings).length > 0) existingBackup.settings = fileContent.settings;
        if (Array.isArray(fileContent.news)) existingBackup.news = fileContent.news;
        if (Array.isArray(fileContent.blogs)) existingBackup.blogs = fileContent.blogs;
        if (Array.isArray(fileContent.videos)) existingBackup.videos = fileContent.videos;
      }
    } catch (e) {}

    return existingBackup;
  } catch (err) {
    console.error("Error in syncFromFirestore:", err);
    return null;
  }
}
