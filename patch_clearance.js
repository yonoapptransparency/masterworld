const fs = require('fs');
let content = fs.readFileSync('src/components/ClearanceButton.tsx', 'utf8');

// Remove "100% Encrypted & Bot Protected"
content = content.replace(
  /\{!isProcessing && !errorMessage && !resolvedUrl && \(\s*<div className="text-\[11px\] text-zinc-400 dark:text-zinc-500 font-medium text-center">\s*100% Encrypted & Bot Protected\s*<\/div>\s*\)\}/g,
  ''
);

// Remove the Lock icon and replace with something neutral like a Cloud or Link or just remove it
content = content.replace(
  /<Lock className="w-4 h-4 text-emerald-100 shrink-0" \/>/g,
  ''
);

fs.writeFileSync('src/components/ClearanceButton.tsx', content);
