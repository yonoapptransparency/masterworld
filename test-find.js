import fs from 'fs';
const staticData = JSON.parse(fs.readFileSync('./src/lib/staticData.json', 'utf8'));

function findAppInCatalog(appIdentifier) {
  if (!appIdentifier) return null;
  const target = String(appIdentifier).toLowerCase().trim();
  const apps = staticData.mockApps || [];

  return apps.find((a) => 
    String(a.id).toLowerCase().trim() === target ||
    (a.slug && String(a.slug).toLowerCase().trim() === target) ||
    (a.name && String(a.name).toLowerCase().trim() === target) ||
    (a.package_name && String(a.package_name).toLowerCase().trim() === target)
  ) || null;
}

console.log("find instagram:", findAppInCatalog("instagram")?.name);
console.log("find 77:", findAppInCatalog("77")?.name);
console.log("find spin-crush:", findAppInCatalog("spin-crush")?.name);
console.log("find replete:", findAppInCatalog("replete")?.name);
