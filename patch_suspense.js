const fs = require('fs');
let content = fs.readFileSync('src/AppPublic.tsx', 'utf8');

content = content.replace(/<Route path="\/app\/:slug" element=\{<AppDetails \/>\} \/>/g, '<Route path="/app/:slug" element={<Suspense fallback={null}><AppDetails /></Suspense>} />');
content = content.replace(/<Route path="\/app\/:slug\/\*" element=\{<AppDetails \/>\} \/>/g, '<Route path="/app/:slug/*" element={<Suspense fallback={null}><AppDetails /></Suspense>} />');
content = content.replace(/<Route path="\/moreinfo\/:slug" element=\{<GatewayPage \/>\} \/>/g, '<Route path="/moreinfo/:slug" element={<Suspense fallback={null}><GatewayPage /></Suspense>} />');
content = content.replace(/<Route path="\/info\/:slug" element=\{<GatewayPage \/>\} \/>/g, '<Route path="/info/:slug" element={<Suspense fallback={null}><GatewayPage /></Suspense>} />');
content = content.replace(/<Route path="\/gateway\/:slug" element=\{<GatewayPage \/>\} \/>/g, '<Route path="/gateway/:slug" element={<Suspense fallback={null}><GatewayPage /></Suspense>} />');
content = content.replace(/<Route path="\/download\/:slug" element=\{<GatewayPage \/>\} \/>/g, '<Route path="/download/:slug" element={<Suspense fallback={null}><GatewayPage /></Suspense>} />');
content = content.replace(/<Route path="\/moredetail\/:slug" element=\{<GatewayPage \/>\} \/>/g, '<Route path="/moredetail/:slug" element={<Suspense fallback={null}><GatewayPage /></Suspense>} />');
content = content.replace(/<Route path="\/:slug" element=\{<FallbackRouteMatcher \/>\} \/>/g, '<Route path="/:slug" element={<Suspense fallback={null}><FallbackRouteMatcher /></Suspense>} />');
content = content.replace(/<Route path="\*" element=\{<FallbackRouteMatcher \/>\} \/>/g, '<Route path="*" element={<Suspense fallback={null}><FallbackRouteMatcher /></Suspense>} />');

fs.writeFileSync('src/AppPublic.tsx', content);
