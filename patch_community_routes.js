const fs = require('fs');
let code = fs.readFileSync('src/server/routes/communityRoutes.ts', 'utf8');

code = code.replace(
  /communityRouter\.get\("\/api\/v1\/public\/community\/reviews\/:appId", async \(req: any, res: any\) => \{/,
  `communityRouter.get("/api/v1/public/community/reviews/:appId", async (req: any, res: any) => {
  console.log("[GET REVIEWS API] Requested appId:", req.params.appId);
`
);

fs.writeFileSync('src/server/routes/communityRoutes.ts', code);
console.log('Patched communityRoutes.ts');
