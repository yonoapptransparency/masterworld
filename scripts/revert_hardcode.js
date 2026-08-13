const fs = require("fs");

// 1. Admin Settings Tab
let as = fs.readFileSync("src/components/admin/AdminSettingsTab.tsx", "utf8");
if (!as.includes('name="logo_url"')) {
  as = as.replace(
    /<div>\s*<label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Main Index Heading<\/label>/,
    `<div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Main Logo URL</label>
            <ImageUpload name="logo_url" defaultValue={settings.logo_url} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white focus-within:ring-2 focus-within:ring-blue-500 overflow-hidden" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Favicon URL</label>
            <ImageUpload name="favicon_url" defaultValue={settings.favicon_url} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white focus-within:ring-2 focus-within:ring-blue-500 overflow-hidden" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Main Index Heading</label>`
  );
  fs.writeFileSync("src/components/admin/AdminSettingsTab.tsx", as);
}

// 2. DataContexts
['src/contexts/DataContext.tsx', 'src/contexts/DataContextPublic.tsx'].forEach(file => {
  let dc = fs.readFileSync(file, "utf8");
  dc = dc.replace(/favicon_url:\s*defaultLogo,/g, "favicon_url: (!fav || fav.includes('1000132678_1_ro1ftj') || fav.includes('ezgif')) ? defaultLogo : fav,");
  dc = dc.replace(/logo_url:\s*defaultLogo/g, "logo_url: (!logo || logo.includes('1000132678_1_ro1ftj') || logo.includes('ezgif')) ? defaultLogo : logo");
  fs.writeFileSync(file, dc);
});

// 3. hooks/useSEO.ts
let useSeo = fs.readFileSync("src/hooks/useSEO.ts", "utf8");
useSeo = useSeo.replace(/const hardcodedLogo = typeof window !== 'undefined' \? window\.location\.origin \+ '\/logo\.png' : 'https:\/\/www\.rummydex\.com\/logo\.png';/g, "");
useSeo = useSeo.replace(/let pageOgImage = hardcodedLogo;/g, "let pageOgImage = settings.logo_url || '';");
useSeo = useSeo.replace(/hardcodedLogo/g, "settings.logo_url");
fs.writeFileSync("src/hooks/useSEO.ts", useSeo);

// 4. Meta.tsx
let meta = fs.readFileSync("src/components/Meta.tsx", "utf8");
meta = meta.replace(/const rawImage = image || '\/logo\.png';/g, "const rawImage = image || settings?.logo_url || settings?.favicon_url || 'https://res.cloudinary.com/diewalae4/image/upload/v1786556304/1000134161_11zon_fgqzz6.png';");
meta = meta.replace(/const favIconUrl = '\/logo\.png';/g, "const favIconUrl = settings?.favicon_url || settings?.logo_url || 'https://res.cloudinary.com/diewalae4/image/upload/v1786556304/1000134161_11zon_fgqzz6.png';");
// Remove the <link rel="icon"> from Meta.tsx so they don't clash with index.html static tags
meta = meta.replace(/<link rel="icon" type="image\/x-icon".*?\/>/g, "");
meta = meta.replace(/<link rel="icon" type="image\/png".*?\/>/g, "");
meta = meta.replace(/<link rel="apple-touch-icon".*?\/>/g, "");
fs.writeFileSync("src/components/Meta.tsx", meta);

// 5. seoHelper.ts
let sh = fs.readFileSync("src/seoHelper.ts", "utf8");
sh = sh.replace(/const logoUrl = '\/logo\.png';/g, "let logoUrl = getField(settings, 'logo_url') || '/logo.png';");
sh = sh.replace(/const faviconUrl = logoUrl;/g, "const faviconUrl = getField(settings, 'favicon_url') || logoUrl;");
fs.writeFileSync("src/seoHelper.ts", sh);

// 6. seoRoutes.ts
let sr = fs.readFileSync("src/server/routes/seoRoutes.ts", "utf8");
sr = sr.replace(/customFaviconUrl = '\/logo\.png';/g, "customFaviconUrl = (storeData.settings.favicon_url && storeData.settings.favicon_url.trim()) || '';");
sr = sr.replace(/customLogoUrl = customFaviconUrl;/g, "customLogoUrl = (storeData.settings.logo_url && storeData.settings.logo_url.trim()) || '';");
// Ensure Cloudinary uses c_scale instead of c_fill
sr = sr.replace(/c_fill/g, "c_scale");
fs.writeFileSync("src/server/routes/seoRoutes.ts", sr);

// 7. PublicHeader.tsx
let ph = fs.readFileSync("src/components/public/PublicHeader.tsx", "utf8");
ph = ph.replace(/<img src="\/logo\.png".*?alt=\{\`\$\{settings\.site_title \|\| 'RummyDex'\} Official Logo\`\} \/>/g, 
  `{settings.logo_url ? <img src={settings.logo_url} width={56} height={56} loading="eager" fetchPriority="high" decoding="async" className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 object-contain drop-shadow-sm" alt={\`\${settings.site_title || 'RummyDex'} Official Logo\`} /> : <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white font-semibold text-lg">{settings.site_title?.substring(0, 1)}</div>}`);
ph = ph.replace(/<img src="\/logo\.png".*?alt=\{\`\$\{settings\.site_title \|\| 'RummyDex'\} Brand Logo\`\} \/>/g, 
  `{settings.logo_url ? <img src={settings.logo_url} loading="lazy" decoding="async" width={48} height={48} className="w-12 h-12 object-contain drop-shadow-sm" alt={\`\${settings.site_title || 'RummyDex'} Brand Logo\`} /> : <Shield className="w-6 h-6 text-blue-500" />}`);
fs.writeFileSync("src/components/public/PublicHeader.tsx", ph);

// 8. PublicFooter.tsx
let pf = fs.readFileSync("src/components/public/PublicFooter.tsx", "utf8");
pf = pf.replace(/<img src="\/logo\.png".*?alt=\{\`\$\{settings\.site_title \|\| 'RummyDex'\} Footer Logo\`\} \/>/g, 
  `{settings.logo_url ? <img src={settings.logo_url} loading="lazy" decoding="async" width={48} height={48} className="w-12 h-12 object-contain drop-shadow-sm" alt={\`\${settings.site_title || 'RummyDex'} Footer Logo\`} /> : <Shield className="w-8 h-8 text-blue-400" />}`);
fs.writeFileSync("src/components/public/PublicFooter.tsx", pf);

// 9. AdminSidebar.tsx
let as2 = fs.readFileSync("src/components/admin/AdminSidebar.tsx", "utf8");
as2 = as2.replace(/<img \s*src="\/logo\.png"/g, `<img src={getTransformedUrl(settings?.logo_url || '')}`);
as2 = as2.replace(/c_fit/g, 'c_scale');
fs.writeFileSync("src/components/admin/AdminSidebar.tsx", as2);

// 10. AppAdmin.tsx
let aa = fs.readFileSync("src/AppAdmin.tsx", "utf8");
aa = aa.replace(/const targetUrl = "\/logo\.png";/g, 'const targetUrl = settings.favicon_url || settings.logo_url || "https://res.cloudinary.com/diewalae4/image/upload/v1786556304/1000134161_11zon_fgqzz6.png";');
fs.writeFileSync("src/AppAdmin.tsx", aa);

// 11. seo/renderers.ts
let rr = fs.readFileSync("src/seo/renderers.ts", "utf8");
rr = rr.replace(/const logoUrl = '\/logo\.png';/g, "const logoUrl = getField(settings, 'logo_url');");
fs.writeFileSync("src/seo/renderers.ts", rr);

