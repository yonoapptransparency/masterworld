const fs = require('fs');
const lines = fs.readFileSync('src/contexts/DataContext.tsx', 'utf8').split('\n');

const badLines = [289, 532, 548, 580, 612, 620, 640, 648, 668, 676, 903, 1000, 1023, 1046, 1138, 1145, 1148, 1157, 1160];

const newLines = [];
for (let i = 0; i < lines.length; i++) {
  if (badLines.includes(i + 1)) {
    if (lines[i].trim() === ');' || lines[i].trim() === '));') {
      console.log(`Removed line ${i + 1}: ${lines[i]}`);
      continue;
    }
  }
  newLines.push(lines[i]);
}

fs.writeFileSync('src/contexts/DataContext.tsx', newLines.join('\n'));
