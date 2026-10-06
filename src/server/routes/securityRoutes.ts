import { Router } from 'express';
import { safeDecrypt, getAesSecret } from '../../lib/secureVault';

export const securityRouter = Router();

securityRouter.post('/api/v1/public/secure-link', (req, res) => {
  try {
    const { link } = req.body || {};
    if (!link) {
      return res.status(400).json({ error: 'Missing link' });
    }
    const AES_SECRET = getAesSecret();
    const decrypted = safeDecrypt(link, AES_SECRET) || link;
    res.json({ success: true, url: decrypted });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to resolve link' });
  }
});
