import fs from 'fs';
let content = fs.readFileSync('src/lib/communityStoreFallback.ts', 'utf8');

const oldLine = "export const STATIC_COMMUNITY_REVIEWS: ReviewRecord[] = [];";
const newLine = "import { STATIC_COMMUNITY_REVIEWS as preRenderedReviews } from './communityReviewsData';\nexport const STATIC_COMMUNITY_REVIEWS: ReviewRecord[] = preRenderedReviews as ReviewRecord[];";

content = content.replace(oldLine, newLine);
fs.writeFileSync('src/lib/communityStoreFallback.ts', content);
