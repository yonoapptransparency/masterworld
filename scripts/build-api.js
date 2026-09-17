const fs = require('fs');
const { execSync } = require('child_process');

if (!process.env.VERCEL && !process.env.GITHUB_ACTIONS && !process.env.FORCE_API_BUILD) {
    console.log("Not running in Vercel or CI environment. Skipping api/index.js generation to prevent local bloat.");
    process.exit(0);
}

if (!fs.existsSync('server.ts')) {
    console.log("server.ts not found. Skipping api/index.js generation.");
    process.exit(0);
}

console.log("Compiling server.ts to api/index.js for Vercel...");

// Create a small wrapper that imports server and exports the app as module.exports for Vercel Serverless
const wrapperContent = `
import app from './server';
module.exports = app;
`;

fs.writeFileSync('api_temp.ts', wrapperContent);

console.log("Running esbuild...");
execSync('npx esbuild api_temp.ts --bundle --platform=node --format=cjs --define:import.meta.env=process.env --packages=external --minify --outfile=api/index.js', { stdio: 'inherit' });

console.log("api/index.js generated successfully.");

if (fs.existsSync('api_temp.ts')) {
    fs.unlinkSync('api_temp.ts');
}
