const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'UserReviews.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Add useEffect, useRef to imports
content = content.replace(
  "import React, { useState } from 'react';",
  "import React, { useState, useEffect, useRef } from 'react';"
);

// We need to inject the IntersectionObserver hook logic
const observerLogic = `
  const [inView, setInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '500px' }
    );
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => observer.disconnect();
  }, []);

  const {
    reviews,
    setReviews,
    loading,
    loadingMore,
    hasMore,
    loadMore,
`;

content = content.replace(
  /const {\s*reviews,\s*setReviews,\s*loading,/m,
  observerLogic
);

// We need to update the useReviews hook call to pass `inView`
content = content.replace(
  "useReviews(appId, appTitle);",
  "useReviews(appId, appTitle, inView);"
);

// Make sure the top level div has the ref
content = content.replace(
  '<div id="ratings-and-reviews-section" className="py-8 border-t border-black/5 dark:border-white/5 select-none text-left">',
  '<div id="ratings-and-reviews-section" ref={containerRef} className="py-8 border-t border-black/5 dark:border-white/5 select-none text-left">'
);

// Add the Load More button at the bottom of the list
const loadMoreUI = `
              <div className="space-y-3">
                {filteredReviews.map((rev) => (
                  <ReviewItem
                    key={rev.id}
                    rev={rev}
                    isReported={!!reportedReviews[rev.id]}
                    isExpanded={!!expandedReviews[rev.id]}
                    isVoted={!!votedReviews[rev.id]}
                    onToggleExpand={toggleExpandReview}
                    onHelpfulVote={handleHelpfulVote}
                    onReport={handleReportReview}
                  />
                ))}
                
                {hasMore && filteredReviews.length > 0 && (
                  <div className="pt-4 flex justify-center">
                    <button 
                      type="button"
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="px-6 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold text-xs uppercase tracking-widest rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loadingMore ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        'Load More Reviews'
                      )}
                    </button>
                  </div>
                )}
              </div>
`;

content = content.replace(
  /<div className="space-y-3">[\s\S]*?<\/div>/,
  loadMoreUI
);

// Ensure Loader2 is imported since we use it in the Load More button
if (!content.includes('Loader2')) {
  content = content.replace(
    "import { Star, ThumbsUp, AlertCircle, Sparkles } from 'lucide-react';",
    "import { Star, ThumbsUp, AlertCircle, Sparkles, Loader2 } from 'lucide-react';"
  );
}

fs.writeFileSync(filePath, content);
console.log('Patched UserReviews.tsx for lazy load and pagination UI');
