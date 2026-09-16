const fs = require('fs');
let code = fs.readFileSync('src/lib/communityFirebase.ts', 'utf-8');

// Find start and end indices for the functions to remove
const startIndex = code.indexOf('/**\n * Direct Client-Side Single-Query Firestore REST Engine');
const endIndex = code.indexOf('/**\n * LIVE Community Review Engine');

if (startIndex !== -1 && endIndex !== -1) {
  code = code.substring(0, startIndex) + code.substring(endIndex);
}

// Now replace fetchLiveReviews fallbacks
const fallbackStart = code.indexOf('  // 2. Fallback: Direct Firestore REST query');
const fallbackEnd = code.indexOf('  // 4. Fallback: Check for any locally saved');

if (fallbackStart !== -1 && fallbackEnd !== -1) {
    code = code.substring(0, fallbackStart) + code.substring(fallbackEnd);
}

fs.writeFileSync('src/lib/communityFirebase.ts', code);
