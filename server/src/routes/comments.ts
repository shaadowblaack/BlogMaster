import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import { AuthedRequest } from '../middleware/auth.js';

const router = Router();

// GET /posts/:id/comments
router.get('/posts/:id/comments', async (req: Request, res: Response) => {
  const postId = parseInt(String(req.params.id));
  if (isNaN(postId)) return res.status(404).json({ error: 'Not found' });

  const comments = await Comment.find({ postId }).sort({ createdAt: -1 });

  return res.json(
    comments.map((c) => ({
      id: c.id,
      postId: c.postId,
      authorName: c.authorName,
      body: c.body,
      userId: c.userId,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    })),
  );
});

// POST /posts/:id/comments
router.post('/posts/:id/comments', async (req: AuthedRequest, res: Response) => {
  const postId = parseInt(String(req.params.id));
  if (isNaN(postId)) return res.status(400).json({ error: 'Invalid post id' });

  let authorName: string;
  let authorEmail: string | null = null;
  let userId: string | null = null;

  if (req.isAuthenticated() && req.user?.role === 'user') {
    userId = req.user.id;
    authorName = req.user.displayName || req.user.username;
  } else {
    const { authorName: guestName, authorEmail: guestEmail } = req.body;
    if (!guestName?.trim()) {
      return res.status(400).json({ error: 'Name is required for guest comments' });
    }
    authorName = guestName.trim();
    authorEmail = guestEmail?.trim() || null;
  }

  const { body } = req.body;
  if (!body?.trim()) {
    return res.status(400).json({ error: 'Comment body is required' });
  }

  const post = await Post.findOne({ id: postId }, { id: 1, status: 1 });
  if (!post || post.status !== 'published') {
    return res.status(404).json({ error: 'Post not found' });
  }

  const editToken = userId ? null : crypto.randomBytes(24).toString('hex');

  const comment = new Comment({
    postId,
    userId,
    authorName,
    authorEmail,
    body: body.trim(),
    editToken,
  });
  await comment.save();

  return res.status(201).json({
    id: comment.id,
    postId: comment.postId,
    authorName: comment.authorName,
    authorEmail: comment.authorEmail,
    body: comment.body,
    userId: comment.userId,
    editToken,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
  });
});

// PATCH /comments/:id
router.patch('/comments/:id', async (req: AuthedRequest, res: Response) => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) return res.status(404).json({ error: 'Not found' });

  const { body, editToken } = req.body ?? {};
  if (!body?.trim()) {
    return res.status(400).json({ error: 'Comment body is required' });
  }

  const comment = await Comment.findOne({ id });
  if (!comment) return res.status(404).json({ error: 'Comment not found' });

  const isAdmin = req.isAuthenticated() && req.user?.role === 'admin';
  const isOwner =
    req.isAuthenticated() &&
    req.user?.role === 'user' &&
    comment.userId === req.user.id;
  const isGuestWithToken =
    !comment.userId && editToken && comment.editToken === editToken;

  if (!isAdmin && !isOwner && !isGuestWithToken) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  comment.body = body.trim();
  comment.updatedAt = new Date();
  await comment.save();

  return res.json({
    id: comment.id,
    postId: comment.postId,
    authorName: comment.authorName,
    authorEmail: comment.authorEmail,
    body: comment.body,
    userId: comment.userId,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
  });
});

// DELETE /comments/:id
router.delete('/comments/:id', async (req: AuthedRequest, res: Response) => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) return res.status(404).json({ error: 'Not found' });

  const comment = await Comment.findOne({ id });
  if (!comment) return res.status(404).json({ error: 'Not found' });

  const isAdmin = req.isAuthenticated() && req.user?.role === 'admin';
  const isOwner =
    req.isAuthenticated() &&
    req.user?.role === 'user' &&
    comment.userId === req.user.id;
  const { editToken } = req.body ?? {};
  const isGuestWithToken =
    !comment.userId && editToken && comment.editToken === editToken;

  if (!isAdmin && !isOwner && !isGuestWithToken) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  await Comment.deleteOne({ id });
  return res.status(204).send();
});

export default router;
