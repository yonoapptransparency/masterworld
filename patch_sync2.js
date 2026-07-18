const fs = require('fs');
let file = fs.readFileSync('.github/workflows/split-sync.yml', 'utf8');

file = file.replace(
  'git config --global user.email "${{ github.event.head_commit.author.email || \'yonotransparency@gmail.com\' }}"',
  'git config --global user.email "defentechscholar@gmail.com"'
);

fs.writeFileSync('.github/workflows/split-sync.yml', file);
