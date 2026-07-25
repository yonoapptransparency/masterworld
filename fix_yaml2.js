const fs = require('fs');

const content = fs.readFileSync('.github/workflows/split-sync.yml', 'utf8');

const jsonContent = `{
  "version": 2,
  "outputDirectory": "dist",
  "buildCommand": "npm run build",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/index" },
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=0, must-revalidate" },
        { "key": "Vary", "value": "Accept-Encoding" }
      ]
    },
    {
      "source": "/(.*)\\\\.(jpg|jpeg|png|webp|svg|gif|ico|woff|woff2|ttf|otf|css|js|json|xml|wasm|webmanifest)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" },
        { "key": "Expires", "value": "Thu, 31 Dec 2037 23:59:59 GMT" },
        { "key": "Vary", "value": "Accept-Encoding" }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" },
        { "key": "Expires", "value": "Thu, 31 Dec 2037 23:59:59 GMT" },
        { "key": "Vary", "value": "Accept-Encoding" }
      ]
    }
  ]
}`;

const lines = content.split('\n');
const newLines = [];
let inVercel = false;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("cat << 'VERCEL_EOF' > vercel.json")) {
    newLines.push("              echo '");
    const jsonLines = jsonContent.split('\n');
    for (const jLine of jsonLines) {
      newLines.push('              ' + jLine.replace(/\\\\/g, '\\'));
    }
    newLines.push("              ' > vercel.json");
    inVercel = true;
    continue;
  }
  
  if (inVercel) {
    if (lines[i] === '              sed -i "s/^              //" vercel.json') {
      inVercel = false;
    }
    continue;
  }
  
  newLines.push(lines[i]);
}

fs.writeFileSync('.github/workflows/split-sync.yml', newLines.join('\n'));
console.log('Fixed YAML');
