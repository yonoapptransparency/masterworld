const fs = require('fs');
let code = fs.readFileSync('src/AppAdmin.tsx', 'utf8');

// Strip everything after `export default App;`
code = code.replace(/export default App;[\s\S]*$/, 'export default App;\n');

fs.writeFileSync('src/AppAdmin.tsx', code);
