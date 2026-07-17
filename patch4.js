const fs = require('fs');
const file = 'src/components/AppsTab.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    '  // Auto-select first app when list loads or changes\n  useEffect(() => {\n    if (!selectedAppId && appsList && appsList.length > 0) {\n      setSelectedAppId(appsList[0].id);\n    }\n  }, [appsList, selectedAppId]);',
    '  // Auto-select removed for mobile compatibility'
);

fs.writeFileSync(file, content);
console.log("Patched auto-select");
