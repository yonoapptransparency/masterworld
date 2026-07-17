const fs = require('fs');
const html = fs.readFileSync('dom.html', 'utf8');
// remove script tags
const clean = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
const body = clean.match(/<body[^>]*>([\s\S]*)<\/body>/i)[1];
console.log(body.substring(0, 1000));
