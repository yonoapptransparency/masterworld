import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { safeEncrypt, getAesSecret } from './src/server/crypto';
dotenv.config();

const AES_SECRET = getAesSecret() || 'fallback_aes_secret_for_local_dev_only';
const freshPayload = JSON.stringify({ admin: true, email: 'defentechscholar@gmail.com', exp: Date.now() + 7 * 24 * 60 * 60 * 1000 });
const token = safeEncrypt(freshPayload, AES_SECRET);

fetch('https://ais-dev-74ohzjoolrfooeegfjfr7f-232960592301.asia-southeast1.run.app/api/v1/admin/community/reviews?limit=5000', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json()).then(r => console.log('Live Dev URL reviews:', r.reviews?.length, r.error)).catch(console.error);
