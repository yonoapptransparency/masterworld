const validateAppId = (appId) => {
  if (typeof appId !== 'string') return null;
  const clean = appId.trim();
  if (clean.length < 1 || clean.length > 64) return null;
  return /^[a-zA-Z0-9\-_]+$/.test(clean) ? clean.toLowerCase() : null;
};
console.log(validateAppId('spin-crush'));
console.log(validateAppId('spin-crush '));
console.log(validateAppId('spin_crush'));
console.log(validateAppId('a23-rummy'));
console.log(validateAppId('../admin'));
console.log(validateAppId('; DROP TABLE'));
