const fs = require('fs');
let code = fs.readFileSync('src/components/PlayStoreUI.tsx', 'utf8');

// Replace loading="lazy" with eager for TopChartItem
code = code.replace(/loading="lazy"([\s\S]*?)decoding="async"([\s\S]*?)className="w-full h-full object-cover"([\s\S]*?)onError=\{\(e\) => \{/g, 'loading={rank <= 5 ? "eager" : "lazy"}$1decoding="async"$2className="w-full h-full object-cover"$3onError={(e) => {');

// Wait, the TopChartItem has rank instead of index, AppListItem has nothing to indicate index.
// Let's see the signature of AppListItem.
