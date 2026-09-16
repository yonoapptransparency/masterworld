import fs from 'fs';
const file = 'src/pages/AppDetails.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  "  const liveStats = useLiveAppStats(app?.id || '', app?.slug || '');\n",
  ""
);

code = code.replace(
  "  const [reviewsRefreshKey, setReviewsRefreshKey] = useState(0);",
  "  const [reviewsRefreshKey, setReviewsRefreshKey] = useState(0);\n  const liveStats = useLiveAppStats(app?.id || '', app?.slug || '');"
);

fs.writeFileSync(file, code);
