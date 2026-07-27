const fs = require('fs');
const file = 'src/pages/AdminDashboard.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

lines[2436] = "      toast('Cloud Sync Failed: ' + (err.message || 'Check network connection.'), 'error');";
lines[2732] = "      toast('Sync Failed: ' + (err.message || 'Unknown error. Check internet connection.'), 'error');";
lines[2868] = "      toast('Sync Failed: ' + (err.message || 'Unknown error. Check internet.'), 'error');";

// Also check lines 2635, 2660 just in case
for(let i=0; i<lines.length; i++) {
  if (lines[i].includes("alert('Cloud Sync Failed: ' + (err.message || err))")) {
    lines[i] = "      toast('Cloud Sync Failed: ' + (err.message || err), 'error');"
  } else if (lines[i].includes("toast('Cloud Sync Failed: ' + (err.message || err, 'Cloud Sync Failed: '")) {
    lines[i] = "      toast('Cloud Sync Failed: ' + (err.message || err), 'error');"
  }
}

fs.writeFileSync(file, lines.join('\n'));
