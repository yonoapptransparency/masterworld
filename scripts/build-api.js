const fs = require('fs');
const { execSync } = require('child_process');

console.log("Generating api/index.js from server.ts...");

let content = fs.readFileSync('server.ts', 'utf8');

// 1. Rewrite imports for api/ location
content = content.replace(/from "\.\/src\//g, 'from "../src/');

// 2. Extract the body of startServer
const startToken = 'async function startServer() {';
const startIdx = content.indexOf(startToken);
if (startIdx !== -1) {
    const prelude = content.substring(0, startIdx);
    let body = content.substring(startIdx + startToken.length);
    
    // Find the end of the function - it's before startServer();
    const endCall = 'startServer();';
    const endCallIdx = body.lastIndexOf(endCall);
    if (endCallIdx !== -1) {
        body = body.substring(0, endCallIdx);
        // Remove the last closing brace of startServer()
        const lastBraceIdx = body.lastIndexOf('}');
        if (lastBraceIdx !== -1) {
            body = body.substring(0, lastBraceIdx) + body.substring(lastBraceIdx + 1);
        }
    }
    content = prelude + body;
}

// 3. Replace app.listen with module.exports for Vercel
// We need to be careful as app.listen contains nested braces
const listenStartToken = 'app.listen(PORT';
const listenIdx = content.indexOf(listenStartToken);
if (listenIdx !== -1) {
    // Find the end of the block. In our server.ts, it's the last }); before the end of the string
    const listenEndIdx = content.lastIndexOf('});');
    if (listenEndIdx !== -1 && listenEndIdx > listenIdx) {
        content = content.substring(0, listenIdx) + 'module.exports = app;' + content.substring(listenEndIdx + 3);
    }
}

// 4. Strip Vite/Static block (not needed in Serverless Function)
const startComment = '// Vite middleware for development';
const endComment = '// Global Express Error Handler';
const vIdx = content.indexOf(startComment);
const eIdx = content.indexOf(endComment);

if (vIdx !== -1 && eIdx !== -1) {
    console.log('Stripping Vite/Static block from API build...');
    content = content.substring(0, vIdx) + '\n\n' + content.substring(eIdx);
}

fs.writeFileSync('api/index.ts', content);

console.log("Compiling api/index.ts to api/index.js...");
// Use --minify to ensure validity and smaller size
execSync('npx esbuild api/index.ts --bundle --platform=node --format=cjs --packages=external --minify --outfile=api/index.js', { stdio: 'inherit' });
console.log("api/index.js generated successfully.");
fs.unlinkSync('api/index.ts');
