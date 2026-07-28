const fs = require('fs');
const code = fs.readFileSync('server.ts', 'utf8');
let open = 0, close = 0;
let inString = false, inComment = false, inLineComment = false;
let stringChar = '';

for (let i = 0; i < code.length; i++) {
  const c = code[i];
  const nextC = code[i+1];
  
  if (!inString && !inComment && !inLineComment) {
    if (c === '/' && nextC === '*') { inComment = true; i++; continue; }
    if (c === '/' && nextC === '/') { inLineComment = true; i++; continue; }
    if (c === '"' || c === "'" || c === "`") { inString = true; stringChar = c; continue; }
    if (c === '{') open++;
    if (c === '}') close++;
  } else if (inLineComment && c === '\n') {
    inLineComment = false;
  } else if (inComment && c === '*' && nextC === '/') {
    inComment = false; i++;
  } else if (inString && c === stringChar && code[i-1] !== '\\') {
    inString = false;
  }
  
  if (close > open) {
    const lines = code.substring(0, i).split('\n');
    console.log(`Extra } found at line ${lines.length}`);
    process.exit(0);
  }
}
console.log(`End of file. open=${open} close=${close}`);
