import fs from 'fs';
const file = 'src/server/services/communityStoreService.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
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

fs.writeFileSync(file, code);
