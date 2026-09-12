import { Router } from 'express';
import crypto from 'crypto';
import User from '../models/User';
import PasswordResetToken from '../models/PasswordResetToken';
import { hashPassword, verifyPassword } from '../lib/password';
import { createSession, clearSession, getSessionId, setSessionCookie } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimit';

const router = Router();

// GET /users/me — current registered user (not admin)
router.get('/users/me', (req, res) => {
  if (!req.isAuthenticated() || req.user?.role !== 'user') {
    return res.json({ user: null });
  }
  return res.json({ user: req.user });
});

// POST /users/register
router.post('/users/register', authLimiter, async (req, res) => {
  const { username, displayName, email, password } = req.body ?? {};

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const existing = await User.findOne({
    $or: [
      { username },
      ...(email ? [{ email }] : []),
    ],
  });

  if (existing) {
    return res.status(409).json({ error: 'Username or email already taken' });
  }

  const passwordHash = await hashPassword(password);

  const user = new User({
    username,
    displayName: displayName || username,
    email: email || null,
    passwordHash,
    role: 'user',
  });
  await user.save();

  const sid = await createSession({
    user: {
      id: user._id,
      username: user.username,
      displayName: user.displayName ?? user.username,
      role: 'user',
    },
  });
  setSessionCookie(res, sid);

  return res.status(201).json({
    user: {
      id: user._id,
      username: user.username,
      displayName: user.displayName,
      email: user.email,
    },
  });
});

// POST /users/login
router.post('/users/login', authLimiter, async (req, res) => {
  const { username, password } = req.body ?? {};

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const user = await User.findOne({ username });

  if (!user?.passwordHash) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const sid = await createSession({
    user: {
      id: user._id,
      username: user.username,
      displayName: user.displayName ?? user.username,
      role: 'user',
    },
  });
  setSessionCookie(res, sid);

  return res.json({
    user: {
      id: user._id,
      username: user.username,
      displayName: user.displayName,
      email: user.email,
    },
  });
});

// POST /users/logout
router.post('/users/logout', async (req, res) => {
  const sid = getSessionId(req);
  await clearSession(res, sid);
  return res.json({ success: true });
});

// POST /users/change-password
router.post('/users/change-password', async (req, res) => {
  if (!req.isAuthenticated() || req.user?.role !== 'user') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { currentPassword, newPassword } = req.body ?? {};
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'currentPassword and newPassword are required' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters' });
  }

  const user = await User.findById(req.user.id);

  if (!user?.passwordHash) {
    return res.status(404).json({ error: 'User not found' });
  }

  const ok = await verifyPassword(currentPassword, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }

  user.passwordHash = await hashPassword(newPassword);
  await user.save();

  return res.json({ success: true });
});

// PATCH /users/me
router.patch('/users/me', async (req, res) => {
  if (!req.isAuthenticated() || req.user?.role !== 'user') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { displayName, email } = req.body ?? {};

  const updates: { displayName?: string; email?: string | null } = {};
  if (displayName !== undefined) updates.displayName = displayName;
  if (email !== undefined) updates.email = email || null;

  const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.json({
    user: {
      id: user._id,
      username: user.username,
      displayName: user.displayName,
      email: user.email,
    },
  });
});

// POST /users/forgot-password
router.post('/users/forgot-password', authLimiter, async (req, res) => {
  const { identifier } = req.body ?? {};
  if (!identifier?.trim()) {
    return res.status(400).json({ error: 'Username or email is required' });
  }

  const user = await User.findOne({
    $or: [{ username: identifier.trim() }, { email: identifier.trim() }],
  });

  if (!user) {
    return res.json({ token: null, message: 'If that account exists, a reset token has been generated.' });
  }

  await PasswordResetToken.deleteMany({ userId: user._id });

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await PasswordResetToken.create({
    userId: user._id,
    token,
    expiresAt,
  });

  return res.json({ token });
});

// POST /users/reset-password
router.post('/users/reset-password', authLimiter, async (req, res) => {
  const { token, newPassword } = req.body ?? {};

  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token and new password are required' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const resetToken = await PasswordResetToken.findOne({
    token,
    used: false,
  });

  if (!resetToken || resetToken.expiresAt < new Date()) {
    return res.status(400).json({ error: 'Reset link is invalid or has expired. Request a new one.' });
  }

  const passwordHash = await hashPassword(newPassword);
  await User.findByIdAndUpdate(resetToken.userId, { passwordHash });

  resetToken.used = true;
  await resetToken.save();

  return res.json({ success: true });
});

export default router;
