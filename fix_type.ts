import fs from 'fs';
const file = 'src/server/services/communityStoreService.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/return this\.updateReview\(id, payload\);/g, "return (await this.updateReview(id, payload)) as ReviewRecord;");

fs.writeFileSync(file, code);
