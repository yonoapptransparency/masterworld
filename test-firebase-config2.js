const isRealValue = (id) => {
  if (!id) return false;
  const clean = String(id).trim();
  if (clean === '' ||
      clean === 'PLACEHOLDER' || 
      clean === 'undefined' ||
      clean === 'null' ||
      clean.includes('REPLACE_WITH_YOUR_REAL_KEY') || 
      clean.includes('YOUR_API_KEY')) return false;
  return true;
};
console.log(isRealValue('gen-lang-client-0825832493'));
console.log(isRealValue('AIzaSyBey9sUbeWlrcXS2kl4ewOzkTy4arg03Ok'));
console.log(isRealValue('gen-lang-client-0825832493.firebaseapp.com'));
