const fs = require('fs');

function removeIndexChecks(file) {
  let code = fs.readFileSync(file, 'utf8');
  // Just use lazy to avoid any reference errors
  code = code.replace(/loading=\{typeof rank !== 'undefined' && rank <= 5\) \|\| \(typeof index !== 'undefined' && index <= 5\) \? "eager" : "lazy"\}/g, 'loading="lazy"');
  code = code.replace(/loading=\{\(typeof rank !== 'undefined' && rank <= 5\) \|\| \(typeof index !== 'undefined' && index <= 5\) \? "eager" : "lazy"\}/g, 'loading="lazy"');
  code = code.replace(/loading=\{typeof rank === 'number' && rank <= 5 \? "eager" : \(typeof index === 'number' && index <= 5 \? "eager" : "lazy"\)\}/g, 'loading="lazy"');
  fs.writeFileSync(file, code);
}

removeIndexChecks('src/components/PlayStoreUI.tsx');
