const fs = require('fs');
let code = fs.readFileSync('src/components/PlayStoreUI.tsx', 'utf8');

// For TopChartItem
code = code.replace(
  /loading="lazy"\n\s*decoding="async"\n\s*referrerPolicy="no-referrer"\n\s*className="w-full h-full object-cover"\n\s*onError=\{\(e\) => \{/g,
  `loading={typeof rank === 'number' && rank <= 5 ? "eager" : (typeof index === 'number' && index <= 5 ? "eager" : "lazy")}
              decoding="async"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {`
);

fs.writeFileSync('src/components/PlayStoreUI.tsx', code);
console.log('done');
