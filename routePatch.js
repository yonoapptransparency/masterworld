const fs = require('fs');
let code = fs.readFileSync('src/server/routes/communityRoutes.ts', 'utf8');

const regex = /let count = 0;\s+for \(const id of reviewIds\) \{[\s\S]+?count\+\+;\s+\}/;

const replacement = `
    const count = await communityStore.bulkActionReviews(reviewIds, action);
`;

if (regex.test(code)) {
    code = code.replace(regex, replacement.trim());
    fs.writeFileSync('src/server/routes/communityRoutes.ts', code);
    console.log('Successfully patched communityRoutes.ts');
} else {
    console.log('Could not find bulk loop to replace');
}
