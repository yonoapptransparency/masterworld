import re

with open('src/components/admin/AdminReviewsTab.tsx', 'r') as f:
    code = f.read()

# 1. Find the start of the Carousel
carousel_start = code.find('{/* Visual Interactive App Catalog Selector Carousel */}')

# 2. Find the start of the Spotlight
spotlight_start = code.find('{/* Selected App Context Banner (App Spotlight) */}')

# 3. Find the end of the main return block. Wait, it's easier to find the end of the container.
# The container closes right before `</AdminReviewsTab>` or the last `</div>`.
end_div = code.rfind('</div>\n  );\n};')

# Let's extract the Carousel block
carousel_block = code[carousel_start:spotlight_start]

# We need to rewrite the Carousel block to be a vertical sidebar.
new_sidebar = """
      <div className="flex flex-col lg:flex-row gap-6 items-start h-[calc(100vh-140px)] min-h-[800px]">
        {/* Left Sidebar: App Selector */}
        <div className="w-full lg:w-[320px] shrink-0 flex flex-col gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm h-full overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" /> Applications
              </h3>
              <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                {filteredAppsList.length}
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={appFilterQuery}
                  onChange={(e) => setAppFilterQuery(e.target.value)}
                  placeholder="Filter apps..."
                  className="w-full pl-9 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
                {appFilterQuery && (
                  <button 
                    onClick={() => setAppFilterQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl">
                <button
                  onClick={() => setAppSortBy('reviews')}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                    appSortBy === 'reviews' 
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  Most Revs
                </button>
                <button
                  onClick={() => setAppSortBy('pending')}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                    appSortBy === 'pending' 
                      ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setAppSortBy('name')}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                    appSortBy === 'name' 
                      ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  A-Z
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
            {filteredAppsList.map((app) => {
              const appStats = getAppStats(app);
              const isSelected = selectedAppId === (app.slug || app.id);
              
              return (
                <button
                  key={app.id || app.slug}
                  onClick={() => setSelectedAppId(app.slug || app.id)}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-2xl border transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/25 ring-2 ring-blue-500/30'
                      : 'bg-transparent text-slate-700 dark:text-slate-300 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:border-slate-200 dark:hover:border-slate-700'
                  }`}
                >
                  <img
                    src={app.icon_url || 'https://via.placeholder.com/48'}
                    alt={app.name}
                    className="w-10 h-10 rounded-xl object-cover shrink-0 bg-slate-200 dark:bg-slate-700 shadow-sm"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-black truncate leading-tight">{app.name}</div>
                    <div className={`text-[10px] font-medium mt-1 flex items-center gap-1.5 ${
                      isSelected ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'
                    }`}>
                      <span className={`font-bold ${isSelected ? 'text-amber-200' : 'text-slate-600 dark:text-slate-300'}`}>
                        {appStats.total} <span className="opacity-70 font-normal">revs</span>
                      </span>
                      {appStats.pending > 0 && (
                        <>
                          <span className="opacity-50">•</span>
                          <span className={`font-black ${isSelected ? 'text-amber-200' : 'text-amber-600 dark:text-amber-400'}`}>
                            {appStats.pending} new
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Content: Dedicated App Panel */}
        <div className="flex-1 min-w-0 flex flex-col gap-6 overflow-y-auto h-full pr-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
          {!selectedAppId || selectedAppId === 'all' ? (
            <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm h-full min-h-[400px]">
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <Layers className="w-10 h-10 text-slate-300 dark:text-slate-600" />
              </div>
              <h2 className="text-2xl font-black text-slate-800 dark:text-slate-200 mb-2">Select an Application</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-sm leading-relaxed">
                Choose an application from the sidebar to view, moderate, and manage its community reviews and ratings.
              </p>
            </div>
          ) : (
            <>
"""

# The remaining part of the file until the end div
remaining_content = code[spotlight_start:end_div]

# Wait, `activeApp && selectedAppId !== 'all' && (` is inside the Spotlight. 
# We don't need the `{activeApp && selectedAppId !== 'all' && (` wrapping anymore because we check `!selectedAppId || selectedAppId === 'all'` above!
# Actually, it's safer to just leave the spotlight as-is inside our `<>` fragment, or slightly clean it up. Let's just drop it in.

new_code = code[:carousel_start] + new_sidebar + remaining_content + "\n            </>\n          )}\n        </div>\n      </div>\n" + code[end_div:]

with open('src/components/admin/AdminReviewsTab.tsx', 'w') as f:
    f.write(new_code)

print("Done")
