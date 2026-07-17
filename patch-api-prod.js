const fs = require('fs');
let content = fs.readFileSync('api/index.ts', 'utf8');

// The block to remove is from `// Vite middleware for development` to `} else {`
const startIdx = content.indexOf('// Vite middleware for development');
const elseIdx = content.indexOf('} else {', startIdx);
if (startIdx > -1 && elseIdx > -1) {
  const before = content.substring(0, startIdx);
  // find the matching closing brace of the `else` block
  // Wait, I can just replace `if (process.env.NODE_ENV !== "production") { ... } else {` with just the contents of else.
  // Let's just do a simpler regex or manual string manipulation.
  
  // Actually, Vercel supports top-level await if we set target to es2022 in tsconfig.
  // But wait, it's easier to just strip the `vite` import.
}

content = content.replace(/if \(process\.env\.NODE_ENV !== "production"\) \{[\s\S]+?\} else \{/, '');
// We also need to remove the trailing `}` that closed the else block!
// The else block ends just before the error handling middleware:
//     app.use((err: any, req: any, res: any, next: any) => {

content = content.replace(/    \};\n  \}\n\n  \/\/ Global Error Handler/g, '    };\n\n  // Global Error Handler');

fs.writeFileSync('api/index.ts', content);
