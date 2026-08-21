import { findAppInCatalog } from './src/server/services/communityStoreService';

console.log("find instagram:", findAppInCatalog("instagram")?.name);
console.log("find 77:", findAppInCatalog("77")?.name);
console.log("find spin-crush:", findAppInCatalog("spin-crush")?.name);
