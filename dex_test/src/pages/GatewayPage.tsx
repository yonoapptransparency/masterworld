/**
 * GatewayPage redirection portal
 * Secure countdown and verification interface before serving high-priority mirror links.
 */

import { safeHtml } from '../lib/safeHtmlPublic';
import { useParams, Navigate } from 'react-router-dom';
import Meta from '../components/Meta';
import { useData } from '../contexts/DataContextPublic';
import { Shield, ShieldAlert, ShieldCheck, MessageSquare, AlertTriangle, Info, CheckCircle2, ChevronRight, ChevronLeft, Fingerprint, Lock, ArrowRight, ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '../lib/utilsPublic';
import { useState, useEffect, FormEvent, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ClearanceButton from '../components/ClearanceButton';
import AccordionItem from '../components/AccordionItem';

export default function GatewayPage() {
  const { apps: mockApps, settings: mockSettings, loading, appsSyncedWithServer, serverAppsFetched, refreshAll } = useData();
  const { slug } = useParams();
  const app = mockApps.find(a => a.slug?.toLowerCase() === slug?.toLowerCase());
  const [isClearing, setIsClearing] = useState(false);
  
  const sliderRef = useRef<HTMLDivElement>(null);

  const scrollPrev = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -280, behavior: 'smooth' });
    }
  };

  const scrollNext = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 280, behavior: 'smooth' });
    }
  };

  const similarApps = useMemo(() => {
    if (!app) return [];
    const currentCats = app.category ? app.category.toLowerCase().split(',').map(c => c.trim()) : [];
    
    // 1. Get apps sharing at least one category
    const categoryMatches = mockApps.filter(a => {
      if (a.id === app.id) return false;
      const appCats = a.category ? a.category.toLowerCase().split(',').map(c => c.trim()) : [];
      return appCats.some(cat => currentCats.includes(cat));
    });

    // 2. Fallback to other apps if we don't have enough matches (to make a rich scrollable list)
    if (categoryMatches.length < 8) {
      const matchedIds = new Set(categoryMatches.map(a => a.id));
      const fallbackApps = mockApps.filter(a => a.id !== app.id && !matchedIds.has(a.id));
      return [...categoryMatches, ...fallbackApps];
    }

    return categoryMatches;
  }, [mockApps, app]);
  
  const [triedRefresh, setTriedRefresh] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const syncAttemptedRef = useRef<Record<string, boolean>>({});

  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [progress, setProgress] = useState(0);
  const [verifyInterval, setVerifyInterval] = useState<ReturnType<typeof setInterval> | null>(null);

  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const isActuallyComingSoon = app?.is_coming_soon;

  useEffect(() => {
    // Auth check removed to reduce Firebase quotas.
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    setTriedRefresh(false);
    setIsRefreshing(false);
    // Reset verification states on transition to another application
    setIsVerified(false);
    setIsVerifying(false);
    setProgress(0);
    if (verifyInterval) {
      clearInterval(verifyInterval);
      setVerifyInterval(null);
    }
  }, [slug]);

  // Handle browser Back-Forward Cache (Bfcache) restorative states to guarantee fresh, re-executable moreinfo handshake
  useEffect(() => {
    const handlePageShow = () => {
      setIsVerified(false);
      setIsVerifying(false);
      setProgress(0);
      if (verifyInterval) {
        clearInterval(verifyInterval);
        setVerifyInterval(null);
      }
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => {
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [verifyInterval]);

  // Automatically trigger a silent cloud sync if the requested app is not found in local cache
  useEffect(() => {
    const slugKey = slug?.toLowerCase() || '';
    if (!slugKey) return;

    const found = mockApps.some(a => a.slug?.toLowerCase() === slugKey);
    if (!found && !syncAttemptedRef.current[slugKey] && !triedRefresh && !isRefreshing) {
      syncAttemptedRef.current[slugKey] = true;
      setIsRefreshing(true);
      console.log(`Deep Link Sync: Verification moreinfo index for "${slug}" not found in local cache. Syncing latest indices...`);
      refreshAll(true)
        .catch((e: any) => {
          console.warn("Deep Link Auto-Sync failed (quota or net):", e.message || e);
        })
        .finally(() => {
          setTriedRefresh(true);
          setIsRefreshing(false);
        });
    }
  }, [slug, mockApps, triedRefresh, isRefreshing, refreshAll]);

  useEffect(() => {
    return () => {
      if (verifyInterval) {
        clearInterval(verifyInterval);
      }
    };
  }, [verifyInterval]);

  const playSoftClick = () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
    audio.volume = 0.4;
    audio.play().catch(e => console.log("Audio play blocked", e));
  };

  const startVerification = () => {
    if (isVerifying || isVerified) return;
    
    playSoftClick();
    setIsVerifying(true);
    setProgress(0);
    
    if (verifyInterval) {
      clearInterval(verifyInterval);
    }

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setVerifyInterval(null);
          setIsVerified(true);
          setIsVerifying(false);
          return 100;
        }
        return prev + 10; // smooth 10-step verification (0.5 second overall)
      });
    }, 50);
    setVerifyInterval(interval);
  };

  if (loading && !app) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[40vh]">
        <div className="w-8 h-8 border-[3px] border-black/10 dark:border-white/10 border-t-blue-500 rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-medium tracking-wide text-zinc-500 animate-pulse">Loading information...</p>
      </div>
    );
  }

  // Graceful interstitial for slow database cold-starts or deep links on first visit
  if (!app && (!serverAppsFetched || isRefreshing || !triedRefresh)) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[40vh] text-center px-4 max-w-sm mx-auto">
        <div className="w-8 h-8 border-[3px] border-black/10 dark:border-white/10 border-t-blue-500 rounded-full animate-spin mb-4"></div>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mt-2">Retrieving App Specifications</h3>
        <p className="text-sm text-zinc-500 mt-2 leading-relaxed">
          Loading app details from the server...
        </p>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4 max-w-md mx-auto">
        <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 rounded-2xl flex items-center justify-center mb-6">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Details Pending</h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-3 leading-relaxed mb-8">
          The requested page for "<span className="font-mono font-medium text-zinc-800 dark:text-zinc-200">{slug}</span>" could not be located. It may have been relocated or removed.
        </p>
        <Link 
          to="/" 
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-[16px] font-semibold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md"
        >
          <ArrowLeft className="w-4 h-4" /> Go back to homepage
        </Link>
      </div>
    );
  }

  const faqSchema = app.faqs && app.faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": app.faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": typeof faq.answer === 'string' ? faq.answer.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim() : faq.answer
      }
    }))
  } : null;

  const stripHtml = (html: string) => {
    if (!html) return '';
    const stripped = html.replace(/<[^>]*>?/gm, ' ');
    return stripped.replace(/\s+/g, ' ').trim();
  };

  const cleanSeoDescription = (rawDesc: string) => {
    if (!rawDesc) return '';
    const trimmed = rawDesc.trim();
    if (trimmed.startsWith('<') || trimmed.includes('<meta ')) {
      const metaMatch = trimmed.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);
      if (metaMatch && metaMatch[1]) {
        return metaMatch[1].trim();
      }
      const ogMatch = trimmed.match(/<meta\s+property=["']og:description["']\s+content=["'](.*?)["']/i);
      if (ogMatch && ogMatch[1]) {
        return ogMatch[1].trim();
      }
      return stripHtml(trimmed).substring(0, 160);
    }
    return trimmed;
  };

  const cleanedAppDesc = cleanSeoDescription(app.seo_description) || (app.description_html ? stripHtml(app.description_html).substring(0, 160) : `${app.name} technical specs.`);

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": app.name,
    "description": cleanedAppDesc,
    "applicationCategory": app.category,
    "operatingSystem": "All",
    "softwareVersion": app.version,
    "image": app.og_image_url || app.icon_url,
    "offers": {
      "price": "0",
      "priceCurrency": "USD"
    }
  };

    const [username, setUsername] = useState('');
    const [rating, setRating] = useState('5');
    const [review, setReview] = useState('');

  const handleReviewSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !review.trim()) {
      alert("Please provide both name and review.");
      return;
    }
    alert("Review submitted and awaiting moderation.");
    setUsername('');
    setRating('5');
    setReview('');
  };

  return (
    <div className="animate-fade-in select-none pb-40 w-full bg-zinc-50/30 dark:bg-zinc-950/20 min-h-screen">
      {/* Sleek Premium Back Button */}
      <div className="max-w-4xl mx-auto mb-8 pt-8 px-4 sm:px-6">
        <Link 
          to={`/app/${app.slug}`} 
          className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-zinc-500 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400 transition-colors bg-white dark:bg-zinc-900 px-4 py-2.5 rounded-full border border-black/[0.05] dark:border-white/[0.05] shadow-sm hover:shadow-md transition-all group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform duration-200" />
          Back to details
        </Link>
      </div>

      <Meta 
        title={`${app.name} - Details`}
        description={`${app.name} detail page. Complete verification to access the requested information.`}
        keywords={app.seo_keywords ? `${app.seo_keywords}, info ${app.name}, ${app.name} technical info` : undefined}
        image={app.og_image_url || app.icon_url}
        canonical={app.canonical_url || `${window.location.origin}/${app.slug}`}
        schema={softwareSchema}
        faqSchema={faqSchema}
      />
      
      {/* Main App Presentation & Action */}
      <div className="max-w-4xl mx-auto w-full mb-12 px-4 sm:px-6">
        <div className="flex flex-col items-center gap-8">
          {/* App Logo & Details */}
          <div className="flex flex-col items-center text-center gap-4 w-full">
            <div className="relative group shrink-0 premium-logo-container">
              {/* Dynamic premium glowing aura background */}
              <div className="premium-logo-aura"></div>
              
              <motion.div 
                className="relative z-10 w-28 h-28 sm:w-32 sm:h-32 rounded-[2rem] bg-white dark:bg-zinc-800 p-1 shadow-2xl overflow-hidden premium-logo-slow-vibrate"
                whileHover={{ scale: 1.05 }}
              >
                {app.icon_url ? (
                  <img 
                    src={app.icon_url} 
                    alt={app.name} 
                    className="w-full h-full object-cover rounded-[1.8rem]"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <ShieldCheck className="w-12 h-12 text-emerald-500 animate-pulse" />
                )}
              </motion.div>
            </div>

            <div className="flex flex-col items-center">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2 text-zinc-800 dark:text-zinc-100">{app.name}</h2>
              <div className="flex flex-wrap justify-center items-center gap-1.5">
                <span className="inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-black/[0.04] shadow-sm">
                  ID: {app.serial_number}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-black/[0.04] shadow-sm">
                  Ver: {app.version}
                </span>
              </div>
            </div>
          </div>

          {/* Dynamic Verified Action Button */}
          <div className="flex flex-col items-center gap-4 w-full">
            {isActuallyComingSoon ? (
              <div className="w-full sm:w-72 flex flex-col items-center">
                <button disabled className="w-full py-4 px-10 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-sm text-sm font-bold shrink-0 cursor-not-allowed bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  Coming Soon
                </button>
              </div>
            ) : (
               <div className="w-full sm:w-72">
                 <ClearanceButton appId={app.id} status={app.safety_status as 'Verified' | 'Caution' | 'Unsafe'} />
               </div>
            )}
          </div>
        </div>
      </div>

      {/* Strict Section Order 4: Helpline Block */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 max-w-4xl mx-auto w-full mt-12 mb-20 px-4 sm:px-6">
        {mockSettings.helpline_whatsapp && (
          <a href={`https://wa.me/${mockSettings.helpline_whatsapp.replace('+','')}`} target="_blank" rel="nofollow noopener noreferrer" className="flex items-center justify-center gap-2 text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-bold text-xs uppercase tracking-wider bg-white dark:bg-zinc-900 px-6 py-3.5 rounded-full border border-black/[0.05] dark:border-white/[0.05] shadow-sm hover:shadow">
            WhatsApp Support
          </a>
        )}
        {mockSettings.helpline_telegram && (
          <a href={`https://t.me/${mockSettings.helpline_telegram.replace('@','')}`} target="_blank" rel="nofollow noopener noreferrer" className="flex items-center justify-center gap-2 text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-bold text-xs uppercase tracking-wider bg-white dark:bg-zinc-900 px-6 py-3.5 rounded-full border border-black/[0.05] dark:border-white/[0.05] shadow-sm hover:shadow">
            Telegram Support
          </a>
        )}
      </div>
    </div>
  );
}
