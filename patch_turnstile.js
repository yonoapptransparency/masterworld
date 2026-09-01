const fs = require('fs');
let content = fs.readFileSync('src/components/ClearanceButton.tsx', 'utf8');

const validationFn = `
const isValidSiteKey = (key: string | undefined): boolean => {
  if (!key) return false;
  const clean = key.trim();
  if (clean === '' || clean.includes('PLACEHOLDER') || clean.includes('YOUR_API_KEY')) return false;
  // Turnstile keys don't have special characters like ! @ # $ % ^ & *
  if (/[#!@$%^&*()+=\\[\\]{};':"\\\\|,<>\/?]/.test(clean)) return false;
  return true;
};
`;

if (!content.includes('isValidSiteKey')) {
  content = content.replace(
    'export default function ClearanceButton({ appId }: ClearanceButtonProps) {',
    validationFn + '\nexport default function ClearanceButton({ appId }: ClearanceButtonProps) {'
  );
}

content = content.replace(
  'const siteKey = import.meta.env.VITE_CF_TURNSTILE_SITE_KEY;',
  'const rawSiteKey = import.meta.env.VITE_CF_TURNSTILE_SITE_KEY;\n  const siteKey = isValidSiteKey(rawSiteKey) ? rawSiteKey : null;'
);

fs.writeFileSync('src/components/ClearanceButton.tsx', content);
