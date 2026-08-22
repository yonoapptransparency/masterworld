import { AppConfig, GlobalSettings, NewsItem, BlogPost, VideoItem } from '../types';
import staticData from './staticData.json';

export const mockApps: AppConfig[] = ((staticData as any).mockApps || (staticData as any).apps || []) as unknown as AppConfig[];
export const mockSettings: GlobalSettings = ((staticData as any).mockSettings || (staticData as any).settings || {}) as unknown as GlobalSettings;
export const mockNews: NewsItem[] = ((staticData as any).mockNews || (staticData as any).news || []) as unknown as NewsItem[];
export const mockBlogs: BlogPost[] = ((staticData as any).mockBlogs || (staticData as any).blogs || []) as unknown as BlogPost[];
export const mockVideos: VideoItem[] = ((staticData as any).mockVideos || (staticData as any).videos || []) as unknown as VideoItem[];

