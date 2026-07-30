/**
 * Home landing page layout
 * Features the showcase carousel, real-time download tabs, and categorized app directories.
 */

import { useState, useEffect, useMemo, useDeferredValue, useRef, useCallback } from 'react';
import { safeHtml } from '../lib/safeHtmlPublic';
import { Link, useSearchParams, useLocation, useNavigate, useNavigationType } from 'react-router-dom';
import { useData } from '../contexts/DataContextPublic';
import { Search, BadgeCheck, ShieldAlert, ShieldCheck, Sparkles, ArrowRight, TrendingUp, Star, SlidersHorizontal, ChevronDown, ListFilter, Github, Twitter } from 'lucide-react';
import { cn } from '../lib/utilsPublic';
import Meta from '../components/Meta';
import { FeaturedBanner, PlayStoreTabs, TopChartItem, AppListItem, AppListItemSkeleton, TopChartItemSkeleton, NewAdditionItemSkeleton } from '../components/PlayStoreUI';
import { WebsiteTitleHero } from '../components/WebsiteTitleHero';
import NewAdditions from '../components/public/NewAdditions';
import HomeFilterBar from '../components/public/HomeFilterBar';
import HomeFaqSection from '../components/public/HomeFaqSection';

const ITEMS_PER_PAGE = 15;
const STORAGE_KEY = 'rummy_home_feed_state';

export default function Home() {
  const { apps: mockApps, settings: mockSettings, loading } = useData();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'All Apps');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('default');

  const navType = useNavigationType();

  // Pagination & Infinite Prefetch
  const pageFromUrl = parseInt(searchParams.get('page') || '1', 10) || 1;
  const [visibleCount, setVisibleCount] = useState<number>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.visibleCount === 'number' && parsed.visibleCount > 0) {
          return parsed.visibleCount;
        }
      }
    } catch (e) {
      // Fallback
    }
    return Math.max(ITEMS_PER_PAGE, pageFromUrl * ITEMS_PER_PAGE);
  });

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const deferredSearchTerm = useDeferredValue(searchTerm);
  const deferredActiveTab = useDeferredValue(activeTab);
  const deferredRatingFilter = useDeferredValue(ratingFilter);
  const deferredSortBy = useDeferredValue(sortBy);

  // Handle scroll position on mount: restore ONLY on browser Back (POP navigation)
  useEffect(() => {
    if (navType === 'POP') {
      try {
        const saved = sessionStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed.scrollY === 'number' && parsed.scrollY > 0) {
            requestAnimationFrame(() => {
              setTimeout(() => {
                window.scrollTo({ top: parsed.scrollY, behavior: 'instant' });
              }, 50);
            });
            return;
          }
        }
      } catch (e) {
        // Ignore
      }
    } else {
      // Direct load, link click, or fresh entry: clear stale scroll and lock to top
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        // Ignore
      }
      window.scrollTo(0, 0);
    }
  }, [navType]);

  // Save scroll position & visible count to sessionStorage before navigating away
  useEffect(() => {
    const handleSaveState = () => {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
          visibleCount,
          scrollY: window.scrollY,
          activeTab
        }));
      } catch (e) {
        // Ignore storage errors
      }
    };

    window.addEventListener('beforeunload', handleSaveState);
    return () => {
      handleSaveState();
      window.removeEventListener('beforeunload', handleSaveState);
    };
  }, [visibleCount, activeTab]);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null && q !== searchTerm) {
      setSearchTerm(q);
    }
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams, location, mockSettings.categories]);

  // Reset pagination when filters or tab change
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [deferredSearchTerm, deferredActiveTab, deferredRatingFilter, deferredSortBy]);

  const filteredApps = useMemo(() => {
    const term = deferredSearchTerm.toLowerCase().trim();
    let baseApps = [...mockApps];

    // Filter by Rating
    if (deferredRatingFilter !== 'all') {
      const minRating = parseFloat(deferredRatingFilter);
      if (!isNaN(minRating)) {
        baseApps = baseApps.filter(app => {
          const r = typeof app.rating === 'number' ? app.rating : parseFloat(app.rating) || 0;
          return r >= minRating;
        });
      }
    }

    if (!term) {
      if (deferredSortBy === 'rating_desc') {
        baseApps.sort((a, b) => {
          const ra = typeof a.rating === 'number' ? a.rating : parseFloat(a.rating) || 0;
          const rb = typeof b.rating === 'number' ? b.rating : parseFloat(b.rating) || 0;
          return rb - ra;
        });
      } else if (deferredSortBy === 'rating_asc') {
        baseApps.sort((a, b) => {
          const ra = typeof a.rating === 'number' ? a.rating : parseFloat(a.rating) || 0;
          const rb = typeof b.rating === 'number' ? b.rating : parseFloat(b.rating) || 0;
          return ra - rb;
        });
      } else {
        baseApps.sort((a, b) => (a.serial_number || 0) - (b.serial_number || 0));
      }
      return baseApps;
    }

    const scored = baseApps
      .map(app => {
        let score = 0;
        const name = (app.name || "").toLowerCase();
        const cat = (app.category || "").toLowerCase();
        const keywords = app.seo_keywords?.toLowerCase() || "";

        // Exact matches
        if (name === term) score += 1000;

        // "Starts with" matches
        if (name.startsWith(term)) score += 500;

        // Word-level matches (e.g. "India" in "Best India Apps")
        const nameWords = name.split(/\s+/);
        if (nameWords.some(w => w === term)) score += 300;
        if (nameWords.some(w => w.startsWith(term))) score += 200;

        // SEO Keywords (highest value for non-name metadata)
        if (keywords.includes(term)) {
          const keywordList = keywords.split(/,\s*/);
          if (keywordList.some(k => k === term)) score += 250;
          else score += 100;
        }

        // Substring matches
        if (name.includes(term)) score += 50;
        if (cat.includes(term)) score += 30;

        return { app, score };
      })
      .filter(item => item.score > 0);

    const resultingApps = scored
      .sort((a, b) => {
        // Sort by score first (highest first)
        if (b.score !== a.score) return b.score - a.score;
        // Fallback to serial number for identical scores
        return (a.app.serial_number || 0) - (b.app.serial_number || 0);
      })
      .map(item => item.app);

    if (deferredSortBy === 'rating_desc') {
      resultingApps.sort((a, b) => {
        const ra = typeof a.rating === 'number' ? a.rating : parseFloat(a.rating) || 0;
        const rb = typeof b.rating === 'number' ? b.rating : parseFloat(b.rating) || 0;
        return rb - ra;
      });
    } else if (deferredSortBy === 'rating_asc') {
      resultingApps.sort((a, b) => {
        const ra = typeof a.rating === 'number' ? a.rating : parseFloat(a.rating) || 0;
        const rb = typeof b.rating === 'number' ? b.rating : parseFloat(b.rating) || 0;
        return ra - rb;
      });
    }

    return resultingApps;
  }, [mockApps, deferredSearchTerm, deferredRatingFilter, deferredSortBy]);

  const hasMore = visibleCount < filteredApps.length;

  // Zero-lag IntersectionObserver prefetch trigger
  useEffect(() => {
    if (!sentinelRef.current || !hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => {
            const nextCount = prev + ITEMS_PER_PAGE;
            const nextPage = Math.ceil(nextCount / ITEMS_PER_PAGE);
            const url = new URL(window.location.href);
            url.searchParams.set('page', String(nextPage));
            window.history.replaceState(null, '', url.toString());
            return nextCount;
          });
        }
      },
      { rootMargin: '400px 0px 400px 0px', threshold: 0.01 }
    );

    observer.observe(sentinelRef.current);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, loading, filteredApps.length]);

  const bannerItems = mockSettings.banners || [];

  return (
    <div className="select-none min-h-screen">
      <Meta 
        title={mockSettings.site_title}
        description={mockSettings.meta_description}
        keywords={mockSettings.seo_keywords}
        faqSchema={mockSettings.website_faqs && mockSettings.website_faqs.length > 0 ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": mockSettings.website_faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": typeof faq.answer === 'string' ? faq.answer.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim() : faq.answer
            }
          }))
        } : undefined}
      />
      {!deferredSearchTerm && (
        <WebsiteTitleHero settings={mockSettings} />
      )}

      {!deferredSearchTerm && deferredActiveTab.toLowerCase() !== 'categories' && deferredActiveTab.toLowerCase() !== 'top charts' && (
        <FeaturedBanner items={bannerItems} />
      )}

      {/* Modular New Additions Component */}
      {!deferredSearchTerm && (deferredActiveTab.toLowerCase() === 'all apps' || deferredActiveTab.toLowerCase() === 'all' || deferredActiveTab.toLowerCase() === 'home' || deferredActiveTab.toLowerCase() === 'apps') && (
        <NewAdditions loading={loading} apps={filteredApps} />
      )}

      <PlayStoreTabs activeTab={activeTab} onTabChange={setActiveTab} hideOnSearch={!!deferredSearchTerm} />

      {/* Modular Filter Bar */}
      <HomeFilterBar 
        ratingFilter={ratingFilter}
        setRatingFilter={setRatingFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        searchTerm={deferredSearchTerm}
        activeTab={deferredActiveTab}
      />

      {deferredSearchTerm && (
        <div className="px-0 sm:px-1">
          <div className="space-y-2">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <AppListItemSkeleton key={`skeleton-home-${i}`} />
              ))
            ) : (
              filteredApps.slice(0, visibleCount).map((app, index) => (
                <AppListItem key={`${app.id}-${index}`} app={app} index={index + 1} />
              ))
            )}
          </div>
        </div>
      )}

      {deferredActiveTab.toLowerCase() === 'top charts' && !deferredSearchTerm && (
        <div className="space-y-1 px-0 sm:px-1">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <TopChartItemSkeleton key={`skeleton-top-${i}`} rank={i + 1} />
            ))
          ) : (
            filteredApps.slice(0, visibleCount).map((app, index) => (
              <TopChartItem key={`${app.id}-${index}`} rank={index + 1} app={app} />
            ))
          )}
          {!loading && mockApps.length === 0 && (
            <div className="p-8 text-center bg-zinc-50 dark:bg-zinc-900 rounded-2xl mx-4 mt-8 border border-zinc-200 dark:border-zinc-800">
              <svg className="w-12 h-12 text-zinc-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">No apps available</h3>
              <p className="text-sm text-zinc-500">
                The database might be temporarily unavailable. Please check back later.
              </p>
            </div>
          )}
        </div>
      )}

      {(() => {
        if (deferredSearchTerm) return null;
        const activeTabLower = deferredActiveTab.toLowerCase();
        const isHomeTab = activeTabLower === 'all apps' || 
                          activeTabLower === 'all' || 
                          activeTabLower === 'home' || 
                          activeTabLower === 'apps';
        return isHomeTab && (
          <div className="px-0 sm:px-1">
            <div className="space-y-2">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <AppListItemSkeleton key={`skeleton-cat-${i}`} />
                ))
              ) : (
                filteredApps.slice(0, visibleCount).map((app, index) => (
                  <AppListItem key={`${app.id}-${index}`} app={app} index={index + 1} />
                ))
              )}
            </div>
          </div>
        );
      })()}

      {deferredActiveTab.toLowerCase() === 'categories' && (
        <div className="grid grid-cols-2 gap-4 animate-fade-in px-0">
           {(() => {
             const cats = mockSettings.categories || [];
             const seen = new Set();
             const uniqueCats = cats.filter(c => {
               const l = c.toLowerCase();
               if (seen.has(l)) return false;
               seen.add(l);
               return l !== (cats[0]?.toLowerCase() || 'all apps') && l !== 'top charts' && l !== 'categories';
             });
             return uniqueCats.map((cat, idx) => (
               <button key={`cat-grid-${cat}-${idx}`} onClick={() => setActiveTab(cat)} className="flex items-center gap-4 p-5 glass-panel text-left active:scale-[0.98] transition-all duration-300">
                  <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500 shrink-0">
                     <ShieldCheck className="w-6 h-6" />
                  </div>
                  <span className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">{cat}</span>
               </button>
             ));
           })()}
        </div>
      )}

      {(() => {
        const activeTabLower = deferredActiveTab.toLowerCase();
        const isHomeTab = activeTabLower === 'all apps' || 
                          activeTabLower === 'all' || 
                          activeTabLower === 'home' || 
                          activeTabLower === 'apps';
        const isExcluded = isHomeTab || activeTabLower === 'top charts' || activeTabLower === 'categories';
        
        return !isExcluded && (
        <div className="animate-fade-in space-y-2 px-0 sm:px-1">
          {(() => {
            if (loading) {
              return Array.from({ length: 6 }).map((_, i) => (
                <AppListItemSkeleton key={`skeleton-tab-apps-${i}`} />
              ));
            }
            const currentTabLower = deferredActiveTab.toLowerCase().trim();
            const tabApps = filteredApps.filter(app => {
              if (deferredSearchTerm) return true;
              const appCategories = app.category ? app.category.toLowerCase().split(',').map(c => c.trim()) : [];
              return appCategories.some(cat => cat === currentTabLower || cat.includes(currentTabLower) || currentTabLower.includes(cat));
            });
            return tabApps.length > 0 ? (
              tabApps.slice(0, visibleCount).map((app, index) => <AppListItem key={`${app.id}-${index}`} app={app} index={index + 1} />)
            ) : (
              <div className="text-center py-20 text-slate-400">
                <p className="text-lg">No apps found in {deferredActiveTab}</p>
              </div>
            );
          })()}
        </div>
        );
      })()}

      {!loading && filteredApps.length === 0 && deferredSearchTerm && (
        <div className="text-center py-20 text-slate-400">
          <p className="text-lg">No results found for "{searchTerm}"</p>
        </div>
      )}

      {/* Infinite Scroll Prefetch Sentinel & Zero-CLS Skeletons */}
      {hasMore && !loading && (
        <div ref={sentinelRef} className="py-4 space-y-2 px-0 sm:px-1">
          <AppListItemSkeleton />
          <AppListItemSkeleton />
        </div>
      )}

      {/* Modular Website FAQs Section */}
      <HomeFaqSection faqs={mockSettings.website_faqs} searchTerm={deferredSearchTerm} />

    </div>
  );
}
