import { Router } from 'express';
import { authLimiter } from '../middleware/rateLimit';
import {
  createSession,
  clearSession,
  getSessionId,
  setSessionCookie,
} from '../middleware/auth';
import { logger } from '../lib/logger';

const router = Router();

// GET /auth/user — returns current auth state
router.get('/auth/user', (req, res) => {
  if (req.isAuthenticated()) {
    return res.json({ user: req.user });
  }
  return res.json({ user: null });
});

// POST /auth/login — admin login via env vars
router.post('/auth/login', authLimiter, async (req, res) => {
  const { username, password } = req.body ?? {};

  const expectedUsername = process.env.ADMIN_USERNAME;
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!expectedUsername || !expectedPassword) {
    logger.error('ADMIN_USERNAME or ADMIN_PASSWORD env vars are not set');
    return res.status(500).json({ error: 'Auth not configured' });
  }

  if (username !== expectedUsername || password !== expectedPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const sid = await createSession({ user: { id: 'admin', username, role: 'admin' } });
  setSessionCookie(res, sid);
  return res.json({ user: { id: 'admin', username, role: 'admin' } });
});

// POST /auth/logout
router.post('/auth/logout', async (req, res) => {
  const sid = getSessionId(req);
  await clearSession(res, sid);
  return res.json({ success: true });
});

export default router;
