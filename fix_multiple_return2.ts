import fs from 'fs';
const file = 'src/server/services/communityStoreService.ts';
let code = fs.readFileSync(file, 'utf8');

const addReviewStart = code.indexOf('public async addReview(');
const addMultipleReviewsStart = code.indexOf('public async addMultipleReviews(');

const chunk1 = code.substring(0, addMultipleReviewsStart);
const chunk2 = code.substring(addMultipleReviewsStart);

// Fix chunk2 (addMultipleReviews)
const fixedChunk2 = chunk2.replace(
  `// Anti-Spam: Treat duplicate as Edit
    const existing = this.reviews.get(id);
    if (existing) {
       return (await this.updateReview(id, payload)) as ReviewRecord;
    }`,
  `// Anti-Spam: Treat duplicate as Edit
    const existing = this.reviews.get(id);
    if (existing) {
       const updated = await this.updateReview(id, payload);
       if (updated) added.push(updated);
       continue;
    }`
);

fs.writeFileSync(file, chunk1 + fixedChunk2);
