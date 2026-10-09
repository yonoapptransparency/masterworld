import { Router } from 'express';
import { safeEncrypt, safeDecrypt, getAesSecret } from '../../lib/secureVault';
import { fetchStoreData } from '../../seoHelper';

export const adminVaultRouter = Router();

adminVaultRouter.get('/api/v1/admin/data', async (req, res) => {
  try {
    const storeData = await fetchStoreData();
    res.json({
      success: true,
      source: 'local_backup',
      apps: storeData.apps || [],
      settings: storeData.settings || {},
      news: storeData.news || [],
      videos: storeData.videos || []
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

adminVaultRouter.post('/api/v1/admin/seal-vault', (req, res) => {
  try {
    const { items } = req.body || {};
    const AES_SECRET = getAesSecret();
    const vaultArray: any[] = [];

    if (Array.isArray(items)) {
      items.forEach((item: any) => {
        const id = String(item.id || '').trim();
        const slug = String(item.slug || '').trim();
        const rawUrl = item.more_information_url || item.encrypted_link || item.url || '';
        if (!rawUrl || typeof rawUrl !== 'string') return;
        const trimmed = rawUrl.trim();
        if (trimmed.toLowerCase().includes('mediafire.com') || trimmed.includes('com.rummydex') || trimmed.includes('com.example')) return;
        const plainUrl = trimmed.startsWith('U2FsdGVkX1') ? (safeDecrypt(trimmed, AES_SECRET) || safeDecrypt(trimmed) || trimmed) : trimmed;
        if (!plainUrl || (!plainUrl.startsWith('http://') && !plainUrl.startsWith('https://'))) return;
        const encUrl = safeEncrypt(plainUrl, AES_SECRET);
        vaultArray.push({
          id,
          slug,
          name: item.name || '',
          more_information_url: encUrl,
          encrypted_link: encUrl
        });
      });
    }

    const ciphertext = safeEncrypt(JSON.stringify(vaultArray), AES_SECRET);
    res.json({ success: true, ciphertext });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

adminVaultRouter.post('/api/v1/admin/build-public-api', (req, res) => {
  try {
    const { ciphertext } = req.body || {};
    const content = `export const ENCRYPTED_VAULT = "${ciphertext || ''}";\n`;
    res.json({ success: true, content });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

adminVaultRouter.post('/api/v1/admin/sync-local', (req, res) => {
  res.json({ success: true, message: 'Local files synchronized' });
});

adminVaultRouter.get('/api/v1/admin/backup-links-get', (req, res) => {
  res.json({ items: [] });
});
