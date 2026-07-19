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

// Remove Vite middleware for development block
// This block starts with // Vite middleware for development
// and ends before // Global Express Error Handler
const startComment = '// Vite middleware for development';
const endComment = '// Global Express Error Handler';

const startIdx = content.indexOf(startComment);
const endIdx = content.indexOf(endComment);

if (startIdx > -1 && endIdx > startIdx) {
    console.log('Stripping Vite development block from API build...');
    // We want to keep the production part of the block if it exists
    // The structure is:
    // if (process.env.NODE_ENV !== "production") { ... } else { PRODUCTION_LOGIC }
    
    const elseIdx = content.indexOf('} else {', startIdx);
    if (elseIdx > -1 && elseIdx < endIdx) {
        // Strip from startIdx to elseIdx + 8 (the length of '} else {')
        // and also strip the trailing '}' before endComment
        const prodLogicStart = elseIdx + 8;
        
        // Find the last closing brace before the endComment
        const lastBraceIdx = content.lastIndexOf('}', endIdx);
        if (lastBraceIdx > prodLogicStart) {
             content = content.substring(0, startIdx) + 
                       content.substring(prodLogicStart, lastBraceIdx) + 
                       content.substring(endIdx);
        } else {
            // Fallback: just remove the whole block if parsing fails
            content = content.substring(0, startIdx) + content.substring(endIdx);
        }
    } else {
        content = content.substring(0, startIdx) + content.substring(endIdx);
    }
}
// Clean up else block closing brace and any trailing residues before the error handler
content = content.replace(/\}\s*\);\s*\}\s*\n\s*\/\/ Global Express Error Handler/g, '});\n\n  // Global Express Error Handler');
content = content.replace(/\}\s*\}\s*\n\s*\/\/ Global Express Error Handler/g, '}\n\n  // Global Express Error Handler');

fs.writeFileSync('api/index.ts', content);

console.log("Compiling api/index.ts to api/index.js...");
// Use --minify to reduce file size and ensure syntax validity
execSync('npx esbuild api/index.ts --bundle --platform=node --format=cjs --packages=external --minify --outfile=api/index.js', { stdio: 'inherit' });
console.log("api/index.js generated successfully.");
fs.unlinkSync('api/index.ts');
