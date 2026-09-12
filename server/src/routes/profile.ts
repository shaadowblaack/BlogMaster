import { Router } from 'express';
import Profile from '../models/Profile.js';
import { AuthedRequest } from '../middleware/auth.js';

const router = Router();

// GET /profile
router.get('/profile', async (_req, res) => {
  const profile = await Profile.findOne().sort({ id: 1 });
  if (!profile) {
    return res.json({
      id: 0,
      name: 'The Author',
      bio: null,
      avatarUrl: null,
      twitterUrl: null,
      githubUrl: null,
      websiteUrl: null,
    });
  }
  return res.json(profile.toObject());
});

// PUT /profile
router.put('/profile', async (req: AuthedRequest, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: 'Unauthorized' });

  const { name, bio, avatarUrl, twitterUrl, githubUrl, websiteUrl } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });

  let profile = await Profile.findOne();
  if (!profile) {
    profile = new Profile({
      name,
      bio: bio ?? null,
      avatarUrl: avatarUrl ?? null,
      twitterUrl: twitterUrl ?? null,
      githubUrl: githubUrl ?? null,
      websiteUrl: websiteUrl ?? null,
    });
    await profile.save();
  } else {
    profile.name = name;
    profile.bio = bio ?? null;
    profile.avatarUrl = avatarUrl ?? null;
    profile.twitterUrl = twitterUrl ?? null;
    profile.githubUrl = githubUrl ?? null;
    profile.websiteUrl = websiteUrl ?? null;
    await profile.save();
  }

  return res.json(profile.toObject());
});

export default router;
