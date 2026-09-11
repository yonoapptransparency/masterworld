const URL = 'http://localhost:3000/api/v1/admin/community/reviews?sortBy=newest&limit=5000';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

import { safeEncrypt, getAesSecret } from './src/server/crypto';
const AES_SECRET = getAesSecret() || 'fallback_aes_secret_for_local_dev_only';
const freshPayload = JSON.stringify({ admin: true, email: process.env.ADMIN_EMAIL || 'defentechscholar@gmail.com', exp: Date.now() + 7 * 24 * 60 * 60 * 1000 });
const token = safeEncrypt(freshPayload, AES_SECRET);

fetch(URL, { headers: { 'Authorization': `Bearer ${token}` } })
  .then(r => r.json())
  .then(r => console.log('Returned reviews length:', r.reviews?.length))
  .catch(console.error);
