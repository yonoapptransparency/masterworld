const fs = require('fs');

let code = fs.readFileSync('src/pages/AppDetails.tsx', 'utf-8');

// The block to replace:
// <div className="pt-0.5 pb-3 mb-3 flex flex-col items-center text-center relative transition-all duration-300 border-b border-black/5 dark:border-white/5">
// ... down to ...
// {isActuallyComingSoon ? (

const startIndex = code.indexOf('<div className="pt-0.5 pb-3 mb-3 flex flex-col items-center text-center relative transition-all duration-300 border-b border-black/5 dark:border-white/5">');
const endIndex = code.indexOf('{isActuallyComingSoon ? (');

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = `
        <div className="flex w-full items-center gap-4 sm:gap-6 mb-6 px-2 sm:px-0 mt-2">
          <div className="relative w-[72px] h-[72px] sm:w-[96px] sm:h-[96px] shrink-0">
            <div className="w-full h-full rounded-[20px] overflow-hidden shadow-sm bg-white border border-black/5 dark:border-white/10 group">
              {app.icon_url ? (
                <img src={app.icon_url || undefined} alt={app.name} width={128} height={128} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-bold bg-zinc-800 text-zinc-500">
                  {(app.name || 'A').substring(0, 1)}
                </div>
              )}
            </div>
            {isActuallyComingSoon && (
              <div className="absolute top-[-8px] right-[-8px] pointer-events-none">
                <div className="bg-amber-500/95 backdrop-blur-[1px] text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded shadow-sm border border-amber-400">
                  Soon
                </div>
              </div>
            )}
          </div>
          
          <div className="flex flex-col justify-center flex-1">
            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 leading-tight mb-0.5 break-words">
              {app.name}
            </h1>
            <div className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
              {app.developer || "Developer"}
            </div>
            <div className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
              {app.is_new && <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-sm uppercase font-bold tracking-wider">New</span>}
              {app.safety_status === 'Verified' ? (
                <span className="flex items-center text-green-600 gap-0.5 font-medium"><ShieldCheck className="w-3.5 h-3.5" /> Verified</span>
              ) : (
                <span className="flex items-center text-orange-500 gap-0.5 font-medium"><ShieldAlert className="w-3.5 h-3.5" /> {app.safety_status}</span>
              )}
            </div>
          </div>
        </div>

        <div className="w-full flex overflow-x-auto hide-scrollbar gap-2 mb-6 pb-2 px-2 sm:px-0 snap-x">
          <div className="flex-none flex flex-col items-center justify-center px-4 border-r border-black/10 dark:border-white/10 snap-center min-w-[80px]">
            <div className="flex items-center gap-1 font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
              {app.rating ? app.rating.toFixed(1) : '5.0'} <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
            </div>
            <div className="text-[10px] sm:text-[11px] text-zinc-500 mt-0.5">1k reviews</div>
          </div>
          <div className="flex-none flex flex-col items-center justify-center px-4 border-r border-black/10 dark:border-white/10 snap-center min-w-[80px]">
            <div className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
              {app.file_size}
            </div>
            <div className="text-[10px] sm:text-[11px] text-zinc-500 mt-0.5">Size</div>
          </div>
          <div className="flex-none flex flex-col items-center justify-center px-4 border-r border-black/10 dark:border-white/10 snap-center min-w-[80px]">
            <div className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-sm text-[10px] sm:text-[11px] leading-none">
              12+
            </div>
            <div className="text-[10px] sm:text-[11px] text-zinc-500 mt-1">Rated for 12+</div>
          </div>
          <div className="flex-none flex flex-col items-center justify-center px-4 snap-center min-w-[80px]">
            <div className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
              100K+
            </div>
            <div className="text-[10px] sm:text-[11px] text-zinc-500 mt-0.5">Downloads</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row w-full sm:w-full justify-center select-none mb-6 px-2 sm:px-0">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full"
          >
            `;
            
  const newCode = code.slice(0, startIndex) + replacement + code.slice(endIndex);
  fs.writeFileSync('src/pages/AppDetails.tsx', newCode);
  console.log("AppDetails updated");
} else {
  console.error("Could not find boundaries");
}
