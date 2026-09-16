import fs from 'fs';
const file = 'src/server/routes/communityRoutes.ts';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes("const deviceId = req.body.deviceId;")) {
  code = code.replace("const userName = req.body.userName || req.body.username;", "const userName = req.body.userName || req.body.username;\n  const deviceId = req.body.deviceId;");
  
  code = code.replace("const savedReview = await communityStore.addReview({", 
  `const generatedId = deviceId ? \`rev_\${appId}_\${deviceId}\` : undefined;
    const savedReview = await communityStore.addReview({
      id: generatedId,`);
      
  fs.writeFileSync(file, code);
  console.log("Patched communityRoutes.ts for deviceId");
} else {
  console.log("Already patched communityRoutes");
}
