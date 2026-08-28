const fs = require('fs');
let content = fs.readFileSync('src/components/ClearanceButton.tsx', 'utf8');

// Replace standard terms with generic ones
content = content.replace(/Verifying Link\.\.\./g, 'Initializing...');
content = content.replace(/Verification Complete/g, 'Ready');
content = content.replace(/Verification failed/g, 'Initialization failed');
content = content.replace(/Verification could not be completed/g, 'Initialization could not be completed');
content = content.replace(/<span\>Proceed<\/span>/g, '<span>Proceed</span>'); // Keep proceed as required

// Make sure Lock icon is gone
content = content.replace(/<Lock className="w-4 h-4 text-emerald-100 shrink-0" \/>/g, '');

// Also change the Turnstile options to use generic action names
content = content.replace(/action: 'clearance'/g, "action: 'init'");

fs.writeFileSync('src/components/ClearanceButton.tsx', content);
