const fs = require('fs');

function patchFile(filepath) {
  let content = fs.readFileSync(filepath, 'utf8');

  content = content.replace(
    /return res\.status\(403\)\.json\(\{ success: false, error: 'Security verification failed\. Please try again\.' \}\);/g,
    "return res.status(404).json({ success: false, error: 'Content not found' });"
  );
  
  content = content.replace(
    /return res\.status\(403\)\.json\(\{ success: false, error: 'Security verification failed\. Please refresh and try again\.' \}\);/g,
    "return res.status(404).json({ success: false, error: 'Content not found' });"
  );

  content = content.replace(
    /return res\.status\(403\)\.json\(\{ success: false, error: 'Forbidden: Automated access blocked\.' \}\);/g,
    "return res.status(404).json({ success: false, error: 'Content not found' });"
  );

  content = content.replace(
    /return res\.status\(403\)\.json\(\{ success: false, error: 'Forbidden: Valid browser agent required\.' \}\);/g,
    "return res.status(404).json({ success: false, error: 'Content not found' });"
  );
  
  content = content.replace(
    /return res\.status\(429\)\.json\(\{ success: false, error: 'Rate limit exceeded\. Please wait a moment\.' \}\);/g,
    "return res.status(404).json({ success: false, error: 'Content not found' });"
  );

  fs.writeFileSync(filepath, content);
}

patchFile('src/server/routes/securityRoutes.ts');
patchFile('public-api/index.js');
