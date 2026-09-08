const fs = require('fs');
let file = fs.readFileSync('src/components/admin/AdminAIReviewStudioTab.tsx', 'utf8');

const brokenLineStr = '          </div><div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
const fixStr = `          </div>
      {mode === 'autopilot' ? (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shrink-0">
                <Bot size={26} className={autoPilotStatus?.state === 'running' ? 'animate-bounce text-amber-300' : 'text-white'} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">
                    Full-Catalog AI Review Auto-Pilot
                  </h2>
                  {autoPilotStatus?.state === 'running' && (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/20 animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      RUNNING
                    </span>
                  )}
                  {autoPilotStatus?.state === 'paused' && (
                    <span className="px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-full border border-amber-500/20">
                      ⏸️ PAUSED
                    </span>
                  )}
                  {autoPilotStatus?.state === 'completed' && (
                    <span className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-full border border-blue-500/20">
                      ✅ COMPLETED
                    </span>
                  )}
                </div>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Queue multiple apps and let the AI background worker generate, validate, and publish reviews automatically.
                </p>
              </div>
            </div>

            <div className="mt-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Smartphone size={16} className="text-blue-600" />
                  <span>Select Target Apps for Auto-Pilot Queue</span>
                </h3>
                
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search apps..."
                      value={autoPilotAppSearch}
                      onChange={(e) => setAutoPilotAppSearch(e.target.value)}
                      className="w-full sm:w-64 pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedAutoPilotAppIds(appsList.map(a => String(a.id || a.slug)))}
                    className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedAutoPilotAppIds([])}
                    className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4`;

file = file.replace(brokenLineStr, fixStr);
fs.writeFileSync('src/components/admin/AdminAIReviewStudioTab.tsx', file);
console.log("Fixed AutoPilot section");
