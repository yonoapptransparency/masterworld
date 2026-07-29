import React from 'react';
import { Sparkles } from 'lucide-react';

export const PromotionSection = React.memo(() => {
  return (
    <div className="mx-0 mb-10 overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Video Card */}
        <div className="aspect-video rounded-2xl sm:rounded-[24px] overflow-hidden bg-zinc-900 border border-black/5 dark:border-white/5 shadow-sm relative group min-h-[200px] w-full">
          <iframe 
            className="w-full h-full"
            src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0&mute=1" 
            title="Promotional Video" 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
            loading="lazy"
          ></iframe>
        </div>

        {/* Secure Access Hub Card */}
        <div className="bg-blue-600 rounded-2xl sm:rounded-[24px] p-8 flex flex-col justify-between text-white relative overflow-hidden shadow-md group min-h-[200px]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
          
          <div className="relative z-10 w-full max-w-[280px]">
            <h3 className="text-2xl font-bold tracking-tight mb-2">Editor's Choice</h3>
            <p className="text-blue-100 text-sm font-medium leading-relaxed mb-6">Discover the most innovative and carefully crafted applications curated by our team.</p>
          </div>

          <div className="relative z-10 flex items-center gap-4">
            <button className="bg-white text-blue-600 px-6 py-3 rounded-full font-semibold text-sm shadow-sm hover:bg-blue-50 transition-all active:scale-95 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Explore Selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
