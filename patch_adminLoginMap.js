const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regexMapDef = /interface _AdminRLEntry \{[\s\S]*?const _adminLoginMap = new Map<string, _AdminRLEntry>\(\);\n/;
code = code.replace(regexMapDef, '');

const checkAdminRLRegex = /function _checkAdminRL\(ip: string\): \{ allowed: boolean; lockedUntil\?: number \} \{[\s\S]*?return \{ allowed: true \};\n\}/;
const newCheckAdminRL = `async function _checkAdminRL(ip: string): Promise<{ allowed: boolean; lockedUntil?: number }> {
  try {
    const adminDb = getFirebaseAdminDb();
    if (adminDb) {
      const docSnap = await adminDb.collection('admin_rate_limits').doc(ip).get();
      if (docSnap.exists) {
        const data = docSnap.data();
        const now = Date.now();
        if (data && data.lockedUntil > now) {
          return { allowed: false, lockedUntil: data.lockedUntil };
        }
      }
    }
  } catch (err) {}
  return { allowed: true };
}`;
code = code.replace(checkAdminRLRegex, newCheckAdminRL);

const recordAdminFailRegex = /function _recordAdminFail\(ip: string\): void \{[\s\S]*?\n\}/;
const newRecordAdminFail = `async function _recordAdminFail(ip: string): Promise<void> {
  const _ADMIN_MAX = 5;
  const _ADMIN_WIN = 15 * 60 * 1000;
  const _ADMIN_LOCK = 60 * 60 * 1000;
  try {
    const adminDb = getFirebaseAdminDb();
    if (adminDb) {
      const docRef = adminDb.collection('admin_rate_limits').doc(ip);
      const docSnap = await docRef.get();
      const now = Date.now();
      if (docSnap.exists) {
        const data = docSnap.data();
        if (data && now - data.windowStart > _ADMIN_WIN) {
          await docRef.set({ count: 1, windowStart: now, lockedUntil: 0 });
        } else if (data) {
          const newCount = (data.count || 0) + 1;
          const lockedUntil = newCount >= _ADMIN_MAX ? now + _ADMIN_LOCK : 0;
          await docRef.update({ count: newCount, lockedUntil });
        }
      } else {
        await docRef.set({ count: 1, windowStart: now, lockedUntil: 0 });
      }
    }
  } catch (err) {}
}`;
code = code.replace(recordAdminFailRegex, newRecordAdminFail);

const clearAdminRLRegex = /function _clearAdminRL\(ip: string\): void \{ _adminLoginMap\.delete\(ip\); \}/;
const newClearAdminRL = `async function _clearAdminRL(ip: string): Promise<void> {
  try {
    const adminDb = getFirebaseAdminDb();
    if (adminDb) await adminDb.collection('admin_rate_limits').doc(ip).delete();
  } catch (err) {}
}`;
code = code.replace(clearAdminRLRegex, newClearAdminRL);

// also clean up periodic map clearing
const periodicClearRegex = /setInterval\(\(\) => \{[\s\S]*?\}, 15 \* 60 \* 1000\);/;
code = code.replace(periodicClearRegex, '');


fs.writeFileSync('server.ts', code);
