const fs = require('fs');
const file = 'src/components/FallbackRouteMatcher.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('Helmet')) {
  content = content.replace("import { useData } from '../contexts/DataContextPublic';", "import { useData } from '../contexts/DataContextPublic';\nimport { Helmet } from 'react-helmet-async';");
  
  const notFoundReplacement = `
  return (
    <div className="text-center py-20 px-4 min-h-[40vh] flex flex-col justify-center items-center">
      <Helmet>
        <title>404 - Page Not Found</title>
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 rounded-2xl flex items-center justify-center mb-6">
`;
  
  content = content.replace('  return (\n    <div className="text-center py-20 px-4 min-h-[40vh] flex flex-col justify-center items-center">\n      <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 rounded-2xl flex items-center justify-center mb-6">', notFoundReplacement);
  
  fs.writeFileSync(file, content);
  console.log('FallbackRouteMatcher updated for Soft 404');
}
