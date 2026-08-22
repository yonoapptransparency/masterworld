const fs = require('fs');
let code = fs.readFileSync('public-api/index.js', 'utf8');

const getStr = `app.get(["/api/v1/public/community/reviews/:appId", "/api/public/community/reviews/:appId"], async (req, res) => {
  const { appId } = req.params;`;

const newGetStr = `app.get(["/api/v1/public/community/reviews/:appId", "/api/public/community/reviews/:appId"], async (req, res) => {
  let { appId } = req.params;
  
  // Resolve slug to ID
  try {
    const staticData = getStaticData();
    const mockApps = staticData.mockApps || staticData.apps || [];
    const matchedApp = resolveAppSlug(appId, mockApps);
    if (matchedApp && matchedApp.id) {
       appId = matchedApp.id;
    }
  } catch (e) {}`;

code = code.replace(getStr, newGetStr);

const postStr = `app.post(["/api/v1/public/community/reviews", "/api/public/community/reviews"], async (req, res) => {
  // Fire and forget, dummy success. 
  
  const appId = req.body.appId || req.body.app_id || req.body.slug;`;

const newPostStr = `app.post(["/api/v1/public/community/reviews", "/api/public/community/reviews"], async (req, res) => {
  // Fire and forget, dummy success. 
  
  let appId = req.body.appId || req.body.app_id || req.body.slug;
  
  try {
    const staticData = getStaticData();
    const mockApps = staticData.mockApps || staticData.apps || [];
    const matchedApp = resolveAppSlug(appId, mockApps);
    if (matchedApp && matchedApp.id) {
       appId = matchedApp.id;
    }
  } catch (e) {}`;

code = code.replace(postStr, newPostStr);

fs.writeFileSync('public-api/index.js', code, 'utf8');
console.log("Patched Vercel slug resolution");
