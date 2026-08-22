const fs = require('fs');

const backup = JSON.parse(fs.readFileSync('community_local_backup.json', 'utf8'));

const fileContent = `// Auto-generated verified community reviews dataset
export interface StaticReviewRecord {
  id: string;
  appId: string;
  appSlug?: string;
  appName?: string;
  userName: string;
  rating: number;
  reviewText: string;
  timestamp: string;
  status: 'published' | 'pending' | 'rejected';
  helpful_count: number;
  isPinned?: boolean;
  reported?: boolean;
  report_count?: number;
  source?: string;
  adminReply?: {
    text: string;
    author: string;
    timestamp: string;
  } | null;
  updated_at?: string;
}

export const STATIC_COMMUNITY_REVIEWS: StaticReviewRecord[] = ${JSON.stringify(backup.reviews, null, 2)};
`;

fs.writeFileSync('src/lib/communityReviewsData.ts', fileContent, 'utf8');
console.log('Successfully created src/lib/communityReviewsData.ts with ' + backup.reviews.length + ' reviews!');
