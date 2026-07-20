const fs = require('fs');

let content = fs.readFileSync('src/AppAdmin.tsx', 'utf8');

// The public components are mostly Header, Footer, BottomNav, BackToTop.
// We can just find their start and end.
function removeFunction(code, funcName) {
  const regex = new RegExp(`function ${funcName}\\(\\) \\{[\\s\\S]*?^\\}`, 'm');
  return code.replace(regex, `function ${funcName}() { return null; }`);
}

// Wait, the regex `^}` requires multi-line matching. 
// It's safer to just search for the strings.
