const fs = require('fs');
const { execSync } = require('child_process');

console.log("Generating api/index.ts from server.ts...");

let content = fs.readFileSync('server.ts', 'utf8');

// Rewrite imports for api/ location
content = content.replace(/from "\.\/src\//g, 'from "../src/');

// Strip startServer wrapper
content = content.replace(/async function startServer\(\) \{\s*const app = express\(\);/, 'const app = express();');
content = content.replace(/\n\}\n\nstartServer\(\);\n*$/, '\n');

// Replace app.listen properly
const listenIdx = content.indexOf('app.listen(PORT');
if (listenIdx > -1) {
    content = content.substring(0, listenIdx) + 'module.exports = app;\n';
}

// Remove Vite middleware for development
const startIdx = content.indexOf('if (process.env.NODE_ENV !== "production") {');
if (startIdx > -1) {
    const elseIdx = content.indexOf('} else {', startIdx);
    if (elseIdx > -1) {
        content = content.substring(0, startIdx) + content.substring(elseIdx + 8);
    }
}
// Clean up else block closing brace
content = content.replace(/    \}\);\n  \}\n\n  \/\/ Global Express Error Handler/g, '    });\n\n  // Global Express Error Handler');

fs.writeFileSync('api/index.ts', content);

console.log("Compiling api/index.ts to api/index.js...");
execSync('npx esbuild api/index.ts --bundle --platform=node --format=cjs --outfile=api/index.js', { stdio: 'inherit' });
console.log("api/index.js generated successfully.");
fs.unlinkSync('api/index.ts');
