const fs = require('fs');
let file = fs.readFileSync('.github/workflows/split-sync.yml', 'utf8');

file = file.replace(
  'git config --global user.email "yonotransparency@gmail.com"',
  'git config --global user.email "${{ github.event.head_commit.author.email || \'yonotransparency@gmail.com\' }}"'
);

file = file.replace(
  'git config --global user.name "yonoapptransparency"',
  'git config --global user.name "${{ github.event.head_commit.author.name || \'yonoapptransparency\' }}"'
);

fs.writeFileSync('.github/workflows/split-sync.yml', file);
