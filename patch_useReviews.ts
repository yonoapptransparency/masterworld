import fs from 'fs';

const file = 'src/hooks/useReviews.ts';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('const [stats, setStats] = useState<any>')) {
  // Add stats state
  code = code.replace(
    'const [expandedReviews, setExpandedReviews] = useState<Record<string, boolean>>({});',
    'const [expandedReviews, setExpandedReviews] = useState<Record<string, boolean>>({});\n  const [stats, setStats] = useState<any>(null);'
  );
  
  // Add stats setting
  code = code.replace(
    'setHasMore(result.hasMore);',
    'setHasMore(result.hasMore);\n      if (result.stats && !isLoadMore) setStats(result.stats);'
  );
  
  // Add stats update on addReview
  code = code.replace(
    "const handleAddReview = useCallback(async (reviewText: string, rating: number) => {",
    "const handleAddReview = useCallback(async (reviewText: string, rating: number) => {"
  );
  
  // Expose stats
  code = code.replace(
    'handleReportReview\n  };',
    'handleReportReview,\n    stats\n  };'
  );
  
  fs.writeFileSync(file, code);
  console.log("Patched useReviews");
}
