const fs = require('fs');
let content = fs.readFileSync('src/components/FirebaseStatusIndicator.tsx', 'utf8');

content = content.replace("const isLive = result.status === 'live';", "const isLive = result.status === 'live';\n  const isWriteOnly = result.status === 'write_only';");
content = content.replace("? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'", "? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'"); // do this carefully

content = content.replace("isReadOnly\n      ? 'bg-amber-500/10", "(isReadOnly || isWriteOnly)\n      ? 'bg-amber-500/10");
content = content.replace("isReadOnly\n      ? 'bg-amber-500 animate-pulse'", "(isReadOnly || isWriteOnly)\n      ? 'bg-amber-500 animate-pulse'");

content = content.replace("? 'Firestore: Read-Only'\n        : `Firestore: Offline`;", "? 'Firestore: Read-Only'\n        : isWriteOnly\n          ? 'Firestore: Write-Only (Read Quota)'\n          : `Firestore: Offline`;");

content = content.replace("? `Firestore Offline or Unreachable", "? isWriteOnly\n        ? `Firestore Write-Only\\nProject: ${result.projectId || 'ai-studio-yonostore'}\\nReads: Blocked (Quota)\\nWrites: OK (${result.writeLatencyMs || 0}ms)\\nVault Security: ${result.aesConfigured ? 'AES ACTIVE' : 'AES MISSING'}\\n\\nClick to run instant re-test`\n        : `Firestore Offline or Unreachable");

fs.writeFileSync('src/components/FirebaseStatusIndicator.tsx', content);
