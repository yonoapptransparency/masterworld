const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'UserReviews.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

content = content.replace(
  "import { Star, ThumbsUp, AlertCircle, Sparkles } from 'lucide-react';",
  "import { Star, ThumbsUp, AlertCircle, Sparkles, Loader2 } from 'lucide-react';"
);

fs.writeFileSync(filePath, content);
console.log('Fixed Loader2 import');
