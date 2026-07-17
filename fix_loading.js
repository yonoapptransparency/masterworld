const fs = require('fs');

let code = fs.readFileSync('src/components/PlayStoreUI.tsx', 'utf8');

// For TopChartItem, only use rank
code = code.replace(/loading=\{typeof rank === 'number' && rank <= 5 \? "eager" : \(typeof index === 'number' && index <= 5 \? "eager" : "lazy"\)\}/g, 
  "loading={(typeof rank !== 'undefined' && rank <= 5) || (typeof index !== 'undefined' && index <= 5) ? \"eager\" : \"lazy\"}");

fs.writeFileSync('src/components/PlayStoreUI.tsx', code);
console.log('done PlayStoreUI');
