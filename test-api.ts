import { safeEncrypt, getAesSecret } from './src/server/crypto';
import dotenv from 'dotenv';
dotenv.config();

const AES_SECRET = getAesSecret() || 'fallback_aes_secret_for_local_dev_only';
const freshPayload = JSON.stringify({ admin: true, email: process.env.ADMIN_EMAIL || 'defentechscholar@gmail.com', exp: Date.now() + 7 * 24 * 60 * 60 * 1000 });
const token = safeEncrypt(freshPayload, AES_SECRET);

fetch('http://localhost:3000/api/v1/admin/community/reviews', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json()).then(r => console.log(r.reviews?.length, r.error)).catch(console.error);
