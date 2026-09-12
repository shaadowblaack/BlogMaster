import { Router, Response } from 'express';
import Reaction from '../models/Reaction';
import Post from '../models/Post';
import { AuthedRequest } from '../middleware/auth';

const router = Router();

// GET /posts/:id/reactions
router.get('/posts/:id/reactions', async (req: AuthedRequest, res: Response) => {
  const postId = parseInt(String(req.params.id));
  if (isNaN(postId)) return res.status(404).json({ error: 'Not found' });

  const rows = await Reaction.aggregate([
    { $match: { postId } },
    { $group: { _id: '$emoji', count: { $sum: 1 } } },
  ]);

  const counts: Record<string, number> = {};
  for (const row of rows) {
    counts[row._id] = row.count;
  }

  const myEmojis: string[] = [];
  if (req.isAuthenticated() && req.user?.role === 'user') {
    const mine = await Reaction.find({ postId, userId: req.user.id }, { emoji: 1 });
    myEmojis.push(...mine.map((r) => (r as { emoji: string }).emoji));
  } else {
    const guestId = req.headers['x-guest-id'] as string | undefined;
    if (guestId) {
      const mine = await Reaction.find({ postId, guestId }, { emoji: 1 });
      myEmojis.push(...mine.map((r) => (r as { emoji: string }).emoji));
    }
  }

  return res.json({ counts, mine: myEmojis });
});

// POST /posts/:id/reactions
router.post('/posts/:id/reactions', async (req: AuthedRequest, res: Response) => {
  const postId = parseInt(String(req.params.id));
  if (isNaN(postId)) return res.status(400).json({ error: 'Invalid post id' });

  const { emoji } = req.body ?? {};
  if (!emoji || typeof emoji !== 'string') {
    return res.status(400).json({ error: 'emoji is required' });
  }

  const post = await Post.findOne({ id: postId }, { status: 1 });
  if (!post || post.status !== 'published') {
    return res.status(404).json({ error: 'Post not found' });
  }

  let userId: string | null = null;
  let guestId: string | null = null;

  if (req.isAuthenticated() && req.user?.role === 'user') {
    userId = req.user.id;
  } else {
    guestId = (req.headers['x-guest-id'] as string) || null;
    if (!guestId) {
      return res.status(400).json({ error: 'x-guest-id header required for guests' });
    }
  }

  const existing = await Reaction.findOne({
    postId,
    ...(userId ? { userId } : { guestId }),
    emoji,
  });

  if (existing) {
    await Reaction.deleteOne({ _id: existing._id });
    return res.json({ toggled: 'off', emoji });
  } else {
    await Reaction.create({
      postId,
      userId,
      guestId,
      emoji,
    });
    return res.json({ toggled: 'on', emoji });
  }
});

export default router;
