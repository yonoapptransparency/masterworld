import fs from 'fs';
const file = 'src/server/services/communityStoreService.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  `fetchExactCommunityAggregationCounts,
  ExactCommunityAggregationResult
  atomicUpdateAppStats,`,
  `fetchExactCommunityAggregationCounts,
  ExactCommunityAggregationResult,
  atomicUpdateAppStats,`
);

fs.writeFileSync(file, code);
