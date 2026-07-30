import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Star, Facebook, Instagram, Twitter, Linkedin, Youtube } from 'lucide-react';
import { useData } from '../../contexts/DataContextPublic';
import StarRatingFeedback from '../StarRatingFeedback';
import PublicSyncStatus from './PublicSyncStatus';

export function PublicFooter() {
  const { settings } = useData();

  const brandAndRating = (
    <>
      <h3 className="text-2xl font-bold tracking-tight mb-4 flex items-center gap-2">
        <div className="p-1 bg-white/10 rounded-xl">
          {settings.logo_url ? (
            <img src={settings.logo_url} loading="lazy" width={48} height={48} className="w-12 h-12 object-contain drop-shadow-sm" alt="Logo" />
          ) : (
            <Shield className="w-8 h-8 text-blue-400" />
          )}
        </div>
        <span className="truncate">{settings.site_title}</span>
      </h3>
      
      <p className="text-[15px] mb-8 text-slate-300 leading-relaxed font-medium">
        {settings.meta_description}
      </p>
      
      <div className="mt-4 w-full">
        <StarRatingFeedback />
      </div>

      <a href="#" className="inline-flex items-center gap-3 bg-white/5 hover:bg-white/10 transition-colors border border-white/10 rounded-full py-2.5 px-5 backdrop-blur-sm mt-8 w-fit shadow-lg shadow-black/20 group">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          <span className="text-sm font-bold text-white">Google Rating</span>
        </div>
        <div className="flex items-center gap-1.5 border-l border-white/20 pl-4">
          <span className="text-sm font-bold text-white">4.9</span>
          <Star fill="currentColor" strokeWidth={0} className="w-4 h-4 text-[#FBBC05]" />
        </div>
      </a>
    </>
  );

  const footerLinks = (
    <div className="w-full max-w-[500px] grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-10 lg:text-right">
      <div className="flex flex-col gap-3 lg:items-end">
        <h4 className="text-slate-900 font-bold mb-1">Company</h4>
        <Link to="/" className="text-slate-600 hover:text-blue-600 font-medium transition-colors text-sm">Home</Link>
        <Link to="/about" className="text-slate-600 hover:text-blue-600 font-medium transition-colors text-sm">About Us</Link>
        <Link to="/developers" className="text-slate-600 hover:text-blue-600 font-medium transition-colors text-sm">Our Team</Link>
        <Link to="/contact" className="text-slate-600 hover:text-blue-600 font-medium transition-colors text-sm">Contact</Link>
      </div>
      
      <div className="flex flex-col gap-3 lg:items-end">
        <h4 className="text-slate-900 font-bold mb-1">Discover</h4>
        <Link to="/new-apps" className="text-slate-600 hover:text-blue-600 font-medium transition-colors text-sm">New Apps</Link>
        <Link to="/videos" className="text-slate-600 hover:text-blue-600 font-medium transition-colors text-sm">Apps</Link>
        <Link to="/blogs" className="text-slate-600 hover:text-blue-600 font-medium transition-colors text-sm">App Updates</Link>
        <Link to="/news" className="text-slate-600 hover:text-blue-600 font-medium transition-colors text-sm">News</Link>
      </div>
      
      <div className="flex flex-col gap-3 lg:items-end col-span-2 border-t border-black/5 pt-6">
        <h4 className="text-slate-900 font-bold mb-2">Legal Docs</h4>
        <div className="grid grid-cols-2 gap-3 lg:flex lg:flex-col lg:items-end w-full">
          <Link to="/privacy" className="text-slate-600 hover:text-blue-600 font-medium transition-colors text-sm">Privacy</Link>
          <Link to="/report-removal" className="text-slate-600 hover:text-blue-600 font-medium transition-colors text-sm">Report & Removal</Link>
          <Link to="/terms" className="text-slate-600 hover:text-blue-600 font-medium transition-colors text-sm">Terms</Link>
          <Link to="/notice" className="text-slate-600 hover:text-blue-600 font-medium transition-colors text-sm">Notice</Link>
          <Link to="/ethics" className="text-slate-600 hover:text-blue-600 font-medium transition-colors text-sm">Ethics</Link>
          <Link to="/disclaimer" className="text-slate-600 hover:text-blue-600 font-medium transition-colors text-sm">Disclaimer</Link>
        </div>
      </div>
    </div>
  );

  return (
    <footer className="w-full mt-12 bg-white flex flex-col z-10 border-t border-black/5">
      <div className="hidden lg:flex relative overflow-hidden w-full min-h-[500px]">
        <svg 
          className="absolute top-0 left-0 w-full h-full text-slate-900 pointer-events-none z-0"
          preserveAspectRatio="none" 
          viewBox="0 0 100 100"
        >
          <path d="M 0,0 C 20,40 40,80 65,100 L 0,100 Z" fill="currentColor" />
        </svg>

        <div className="relative z-10 w-full px-8 py-20 flex items-stretch">
           <div className="w-[45%] flex flex-col text-white pr-10 xl:pr-16">
              {brandAndRating}
           </div>
           
           <div className="w-[55%] flex justify-end items-end pb-8 pl-12">
              {footerLinks}
           </div>
        </div>
      </div>

      <div className="flex flex-col lg:hidden w-full">
        <div className="w-full bg-slate-900 text-white px-6 pt-16 pb-28 relative overflow-hidden">
             <svg 
               className="absolute -bottom-1 left-0 w-full h-12 sm:h-16 text-white fill-current pointer-events-none" 
               preserveAspectRatio="none" 
               viewBox="0 0 100 20"
             >
               <path d="M 0,20 L 100,20 L 100,0 Q 50,30 0,0 Z" />
             </svg>
             <div className="relative z-10 flex flex-col items-center text-center">
               {brandAndRating}
             </div>
        </div>

        <div className="w-full bg-white px-6 pb-16 pt-8 flex justify-center text-left">
           {footerLinks}
        </div>
      </div>

      <div className="w-full bg-slate-950 py-8 px-6 sm:px-12 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-white/5">
        <div className="text-xs text-slate-500 flex flex-col md:flex-row items-center gap-4">
          <span>&copy; {new Date().getFullYear()} {settings.site_title}. All rights reserved.</span>
          <div className="flex items-center gap-3 md:ml-4">
            {settings.social_links?.facebook && (
              <a aria-label="Facebook" href={settings.social_links.facebook} target="_blank" rel="nofollow noopener noreferrer" className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"><Facebook className="w-4 h-4" /></a>
            )}
            {settings.social_links?.instagram && (
              <a aria-label="Instagram" href={settings.social_links.instagram} target="_blank" rel="nofollow noopener noreferrer" className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"><Instagram className="w-4 h-4" /></a>
            )}
            {settings.social_links?.twitter && (
              <a aria-label="Twitter" href={settings.social_links.twitter} target="_blank" rel="nofollow noopener noreferrer" className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"><Twitter className="w-4 h-4" /></a>
            )}
            {settings.social_links?.linkedin && (
              <a aria-label="LinkedIn" href={settings.social_links.linkedin} target="_blank" rel="nofollow noopener noreferrer" className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"><Linkedin className="w-4 h-4" /></a>
            )}
            {settings.social_links?.youtube && (
              <a aria-label="YouTube" href={settings.social_links.youtube} target="_blank" rel="nofollow noopener noreferrer" className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"><Youtube className="w-4 h-4" /></a>
            )}
          </div>
        </div>
        <div className="scale-90 opacity-70 hover:opacity-100 transition-opacity">
          <PublicSyncStatus />
        </div>
      </div>
    </footer>
  );
}

export default PublicFooter;
