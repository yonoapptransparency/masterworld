const fs = require('fs');
let content = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');
content = content.replace(
  '  const [appsList, setAppsList] = useState(mockApps);',
  '  const [appsList, setAppsList] = useState(mockApps);\n  const latestMockAppsRef = React.useRef(mockApps);\n  React.useEffect(() => {\n    latestMockAppsRef.current = mockApps;\n  }, [mockApps]);'
);
content = content.replace(
  'const mergedApps = mockApps.map(a => ({...a, more_information_url: secureMap.get(a.id) || a.more_information_url }));',
  'const mergedApps = latestMockAppsRef.current.map(a => ({...a, more_information_url: secureMap.get(a.id) || a.more_information_url }));'
);
fs.writeFileSync('src/pages/AdminDashboard.tsx', content);
