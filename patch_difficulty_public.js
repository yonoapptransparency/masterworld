const fs = require('fs');
let content = fs.readFileSync('public-api/index.js', 'utf8');

content = content.replace(/const difficulty = "0"; \/\/ Ultra-fast execution/g, 'const difficulty = "000"; // Medium execution');

fs.writeFileSync('public-api/index.js', content);
