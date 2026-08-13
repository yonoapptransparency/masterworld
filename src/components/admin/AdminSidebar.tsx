import React from 'react';
import { 
  LayoutDashboard, 
  Smartphone, 
  TrendingUp, 
  Menu, 
  X, 
  ShieldAlert, 
  LogOut, 
  FileText, 
  Newspaper, 
  Video as VideoIcon, 
  Github, 
  HelpCircle, 
  Users, 
  Layers, 
  Link as LinkIcon, 
  Settings,
  Shield,
  MessageSquare,
  RefreshCw
} from 'lucide-react';
import { AdminSidebarItem as SidebarItem } from './AdminSidebarItem';
import { useData } from '../../contexts/DataContext';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  handleLogout: () => void;
  sessionTimeLeft: number;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const AdminSidebar = ({ 
  activeTab, 
  onTabChange, 
  isMobileMenuOpen, 
  setIsMobileMenuOpen, 
  handleLogout,
  sessionTimeLeft,
  onRefresh,
  isRefreshing
}: AdminSidebarProps) => {
  const { settings } = useData();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTransformedUrl = (url: string) => {
    if (url && url.includes('res.cloudinary.com')) {
      return url.replace(/\/upload\/([^\/]+)\//, '/upload/w_120,h_120,c_fit,q_auto/');
    }
    return url;
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        type="button"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
        className="lg:hidden fixed top-4 right-4 z-50 p-2.5 bg-blue-600 text-white rounded-2xl shadow-lg border-0 cursor-pointer"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <img 
                src="https://res.cloudinary.com/diewalae4/image/upload/w_120,h_120,c_fit,q_auto/v1786556304/1000134161_11zon_fgqzz6.png" 
                alt="Admin Logo" 
                className="w-10 h-10 object-contain drop-shadow-sm" 
                loading="lazy" 
                width={40} 
                height={40} 
              />
              <div>
                <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{settings?.site_title || 'MasterWorld'}</h1>
                <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Admin Control</p>
              </div>
            </div>
            <div className="mt-4 px-3 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Session Time</span>
                <span className={`text-[10px] font-mono font-bold ${sessionTimeLeft < 60 ? 'text-rose-500 animate-pulse' : 'text-slate-600 dark:text-slate-400'}`}>
                  {formatTime(sessionTimeLeft)}
                </span>
              </div>
              <div className="mt-1 h-1 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${sessionTimeLeft < 60 ? 'bg-rose-500' : 'bg-blue-600'}`}
                  style={{ width: `${(sessionTimeLeft / (15 * 60)) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
            <div className="pb-2 px-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Main Management</div>
            <SidebarItem id="dashboard" icon={LayoutDashboard} label="Dashboard" active={activeTab === 'dashboard'} onClick={onTabChange} />
            <SidebarItem id="apps" icon={Smartphone} label="App Catalog" active={activeTab === 'apps'} onClick={onTabChange} />
            <SidebarItem id="banners" icon={TrendingUp} label="Banners & Ads" active={activeTab === 'banners'} onClick={onTabChange} />
            <SidebarItem id="categories" icon={Layers} label="Categories" active={activeTab === 'categories'} onClick={onTabChange} />
            
            <div className="pt-4 pb-2 px-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Content Editor</div>
            <SidebarItem id="news" icon={Newspaper} label="News Section" active={activeTab === 'news'} onClick={onTabChange} />
            <SidebarItem id="videos" icon={VideoIcon} label="Video Guides" active={activeTab === 'videos'} onClick={onTabChange} />
            <SidebarItem id="faqs" icon={HelpCircle} label="Website FAQs" active={activeTab === 'faqs'} onClick={onTabChange} />
            <SidebarItem id="quick-links" icon={LinkIcon} label="Quick Links" active={activeTab === 'quick-links'} onClick={onTabChange} />

            <div className="pt-4 pb-2 px-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">System & Sync</div>
            <SidebarItem id="github" icon={Github} label="GitHub Sync" active={activeTab === 'github'} onClick={onTabChange} />
            <SidebarItem id="developers" icon={Users} label="Developer Team" active={activeTab === 'developers'} onClick={onTabChange} />
            <SidebarItem id="reviews" icon={MessageSquare} label="App Reviews" active={activeTab === 'reviews'} onClick={onTabChange} />
            <SidebarItem id="security" icon={Shield} label="Security Panel" active={activeTab === 'security'} onClick={onTabChange} />
            <SidebarItem id="settings" icon={Settings} label="Global Settings" active={activeTab === 'settings'} onClick={onTabChange} />
          </nav>


          <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            {onRefresh && (
              <button 
                type="button"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-3 w-full px-4 py-2 text-blue-600 dark:text-blue-400 font-bold text-sm hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-xl transition-all border-0 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
                <span>{isRefreshing ? 'Syncing...' : 'Sync Data Now'}</span>
              </button>
            )}
            <button 
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-2 text-rose-600 dark:text-rose-400 font-bold text-sm hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all border-0 cursor-pointer"
            >
              <LogOut size={18} />
              <span>Terminate Session</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-30 bg-slate-900/60  lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};
