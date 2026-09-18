import fs from 'fs';
let content = fs.readFileSync('src/server/config.ts', 'utf8');

const isProd = "process.env.NODE_ENV === 'production'";

content = content.replace(
  "const runtimeAesSecret = 'fallback_aes_secret_for_local_dev_only';",
  "const runtimeAesSecret = " + isProd + " ? '' : 'fallback_aes_secret_for_local_dev_only';"
);

fs.writeFileSync('src/server/config.ts', content);
