import { Router } from 'express';

export const adminAuthRouter = Router();

adminAuthRouter.post('/api/v1/admin/auth/login', (req, res) => {
  res.json({ success: true, token: 'session_token_' + Date.now() });
});

adminAuthRouter.post('/api/v1/admin/auth/verify-2fa', (req, res) => {
  res.json({ success: true, token: 'verified_token_' + Date.now() });
});

adminAuthRouter.get('/api/v1/admin/auth/me', (req, res) => {
  res.json({ authenticated: true, role: 'admin' });
});

adminAuthRouter.get('/api/v1/admin/auth/check-session', (req, res) => {
  res.json({ valid: true, authenticated: true });
});

adminAuthRouter.post('/api/v1/admin/auth/logout', (req, res) => {
  res.json({ success: true });
});
