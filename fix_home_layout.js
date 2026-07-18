const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

// The replacement content for the unified header and filters
const newHeader = `{activeTab.toLowerCase() !== 'categories' && (
        <div className="px-4 mb-4 mt-6 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 m-0">
            {searchTerm ? 'Search Results' : 
             activeTab.toLowerCase() === 'top charts' ? 'Top Charts' : 
             (activeTab.toLowerCase() === 'all apps' || activeTab.toLowerCase() === 'all' || activeTab.toLowerCase() === 'home' || activeTab.toLowerCase() === 'apps') ? 'Explore All' : 
             activeTab}
          </h2>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Star Rating Dropdown */}
            <div className="relative">
              <label className="sr-only">Filter by Rating</label>
              <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/10 rounded-xl px-3 py-1.5 shadow-sm text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer select-none">
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                  <span>Rating: {ratingFilter === 'all' ? 'All' : \`\${ratingFilter}+ Stars\`}</span>
                </span>
                <select
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                >
                  <option value="all">All Ratings</option>
                  <option value="4.5">4.5+ ★ Superior</option>
                  <option value="4.0">4.0+ ★ Top Rated</option>
                  <option value="3.5">3.5+ ★ Premium</option>
                  <option value="3.0">3.0+ ★ Standard</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              </div>
            </div>

            {/* Sort By Dropdown */}
            <div className="relative">
              <label className="sr-only">Sort by Order</label>
              <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/10 rounded-xl px-3 py-1.5 shadow-sm text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer select-none">
                <span className="flex items-center gap-1">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>Sort: {
                    sortBy === 'default' ? 'Recommended' : 
                    sortBy === 'rating_desc' ? 'Rating: High to Low' : 
                    'Rating: Low to High'
                  }</span>
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                >
                  <option value="default">Recommended</option>
                  <option value="rating_desc">Rating (Highest First)</option>
                  <option value="rating_asc">Rating (Lowest First)</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              </div>
            </div>

            {/* Clear filters if active */}
            {(ratingFilter !== 'all' || sortBy !== 'default') && (
              <button
                onClick={() => {
                  setRatingFilter('all');
                  setSortBy('default');
                }}
                className="text-xs font-bold text-red-500 hover:text-red-650 transition-colors px-2 py-1 cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      )}`;

// 1. Replace the old Filter Results section
const filterBlockRegex = /\{activeTab\.toLowerCase\(\) !== 'categories' && \([\s\S]*?className="px-2 sm:px-4 mb-4 flex flex-wrap items-center justify-between gap-3 bg-zinc-50\/40[\s\S]*?Reset\n              <\/button>\n            \)\}\n          <\/div>\n        <\/div>\n      \)\}/;

content = content.replace(filterBlockRegex, newHeader);

// 2. Remove the individual headings

// Remove Search Results heading
const searchResultsHeading = /<h2 className="text-xl font-bold mb-4 mt-6 text-zinc-900 dark:text-zinc-100 px-4">\s*Search Results\s*<\/h2>/;
content = content.replace(searchResultsHeading, '');

// Remove Top Charts heading
const topChartsHeading = /<h2 className="text-xl font-bold mb-4 mt-6 text-zinc-900 dark:text-zinc-100 flex items-center gap-2 px-4">\s*Top Charts\s*<\/h2>/;
content = content.replace(topChartsHeading, '');

// Remove Explore All heading
const exploreAllHeading = /<h2 className="text-xl font-bold mb-4 mt-8 text-zinc-900 dark:text-zinc-100 px-4">\s*Explore All\s*<\/h2>/;
content = content.replace(exploreAllHeading, '');

fs.writeFileSync('src/pages/Home.tsx', content, 'utf-8');
console.log("Replaced!");
