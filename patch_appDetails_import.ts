import fs from 'fs';

const file = 'src/pages/AppDetails.tsx';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('useLiveAppStats')) {
  code = code.replace(
    "import AccordionItem from '../components/AccordionItem';",
    "import AccordionItem from '../components/AccordionItem';\nimport { useLiveAppStats } from '../hooks/useReviews';"
  );
  
  // Use the hook inside AppDetails
  const splatLine = "const slug = routeSlug || splatStripped;";
  code = code.replace(
    splatLine,
    splatLine + "\n\n  const liveStats = useLiveAppStats(app?.id || '', app?.slug || '');\n"
  );
  
  fs.writeFileSync(file, code);
  console.log("Patched AppDetails import");
}
