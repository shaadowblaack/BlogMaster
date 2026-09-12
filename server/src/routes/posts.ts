import { Router, Request, Response } from 'express';
import { FilterQuery } from 'mongoose';
import Post, { PostDoc } from '../models/Post';
import Tag from '../models/Tag';
import PostTag from '../models/PostTag';
import { slugify } from '../lib/slugify';
import { AuthedRequest } from '../middleware/auth';

interface TagSummary {
  id: number;
  name: string;
  slug: string;
}

const router = Router();

async function uniqueSlug(base: string, excludeId?: number): Promise<string> {
  let slug = base;
  const filter: FilterQuery<PostDoc> = { slug };
  if (excludeId !== undefined) {
    filter.id = { $ne: excludeId };
  }
  const existing = await Post.findOne(filter, { slug: 1 });
  if (existing) {
    slug = `${base}-${Date.now()}`;
  }
  return slug;
}

async function getOrCreateTags(tagNames: string[]): Promise<number[]> {
  const ids: number[] = [];
  for (const name of tagNames) {
    const slug = slugify(name);
    let tag = await Tag.findOne({ slug });
    if (tag) {
      ids.push(tag.id);
    } else {
      tag = new Tag({ name, slug });
      await tag.save();
      ids.push(tag.id);
    }
  }
  return ids;
}

async function fetchPostsWithTags(postIds: number[]): Promise<Record<number, TagSummary[]>> {
  if (postIds.length === 0) return {};
  const postTags = await PostTag.find({ postId: { $in: postIds } });
  const tagIds = [...new Set(postTags.map((pt) => pt.tagId))];
  const tags = await Tag.find({ id: { $in: tagIds } });
  const tagMap: Record<number, TagSummary | undefined> = {};
  for (const tag of tags) {
    tagMap[tag.id] = { id: tag.id, name: tag.name, slug: tag.slug };
  }
  const result: Record<number, TagSummary[]> = {};
  for (const pt of postTags) {
    if (!result[pt.postId]) result[pt.postId] = [];
    result[pt.postId].push(tagMap[pt.tagId]!);
  }
  return result;
}

// GET /posts
router.get('/posts', async (req: Request, res: Response) => {
  const tag = req.query.tag as string | undefined;
  const page = req.query.page as string | undefined;
  const limit = req.query.limit as string | undefined;
  let status = (req.query.status as string) ?? 'published';

  if ((status === 'draft' || status === 'all') && !req.isAuthenticated()) {
    status = 'published';
  }

  const pageNum = Math.max(1, parseInt(page || '1') || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit || '10') || 10));
  const offset = (pageNum - 1) * limitNum;

  let statusFilter: string | undefined;
  if (status === 'all') {
    statusFilter = undefined;
  } else if (status === 'draft' || status === 'published') {
    statusFilter = status;
  } else {
    statusFilter = 'published';
  }

  let postIdsForTag: number[] | undefined;
  if (tag) {
    const tagRow = await Tag.findOne({ slug: tag });
    if (!tagRow) {
      return res.json({ posts: [], total: 0, page: pageNum, limit: limitNum });
    }
     const ptRows = await PostTag.find({ tagId: tagRow.id }, { postId: 1 });
     postIdsForTag = ptRows.map((r) => r.postId);
    if (postIdsForTag.length === 0) {
      return res.json({ posts: [], total: 0, page: pageNum, limit: limitNum });
    }
  }

  const query: FilterQuery<PostDoc> = {};
  if (statusFilter) {
    query.status = statusFilter;
  }
  if (postIdsForTag) {
    query.id = { $in: postIdsForTag };
  }

  const [posts, totalDoc] = await Promise.all([
    Post.find(query)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limitNum),
    Post.countDocuments(query),
  ]);

  const tagMap = await fetchPostsWithTags(posts.map((p) => p.id));
  return res.json({
    posts: posts.map((p) => ({
      ...p.toObject(),
      tags: tagMap[p.id] ?? [],
    })),
    total: totalDoc,
    page: pageNum,
    limit: limitNum,
  });
});

// GET /posts/recent
router.get('/posts/recent', async (req: Request, res: Response) => {
  const limitParam = req.query.limit as string | undefined;
  const limitNum = Math.min(20, Math.max(1, parseInt(limitParam || '5') || 5));
  const posts = await Post.find({ status: 'published' })
    .sort({ publishedAt: -1 })
    .limit(limitNum);
  const tagMap = await fetchPostsWithTags(posts.map((p) => p.id));
   return res.json(
      posts.map((p) => ({
      ...p.toObject(),
      tags: tagMap[p.id] ?? [],
    })),
  );
});

// GET /posts/slug/:slug
router.get('/posts/slug/:slug', async (req: Request, res: Response) => {
  const post = await Post.findOne({ slug: req.params.slug, status: 'published' });
  if (!post) return res.status(404).json({ error: 'Not found' });

  post.viewCount = (post.viewCount || 0) + 1;
  await post.save();

  const tagMap = await fetchPostsWithTags([post.id]);
  return res.json({
    ...post.toObject(),
    viewCount: post.viewCount,
    tags: tagMap[post.id] ?? [],
  });
});

// POST /posts
router.post('/posts', async (req: AuthedRequest, res: Response) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: 'Unauthorized' });

  const { title, content, excerpt, coverImageUrl, tagNames } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'title and content are required' });
  }

  const slug = await uniqueSlug(slugify(title));
  const post = new Post({
    title,
    content,
    excerpt: excerpt ?? null,
    coverImageUrl: coverImageUrl ?? null,
    slug,
  });
  await post.save();

  if (tagNames && Array.isArray(tagNames) && tagNames.length > 0) {
    const tagIds = await getOrCreateTags(tagNames as string[]);
    await PostTag.insertMany(tagIds.map((tagId) => ({ postId: post.id, tagId })));
  }

  const tagMap = await fetchPostsWithTags([post.id]);
  return res.status(201).json({
    ...post.toObject(),
    tags: tagMap[post.id] ?? [],
  });
});

// GET /posts/:id
router.get('/posts/:id', async (req: Request, res: Response) => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) return res.status(404).json({ error: 'Not found' });

  const post = await Post.findOne({ id });
  if (!post) return res.status(404).json({ error: 'Not found' });

  if (post.status === 'draft' && !req.isAuthenticated()) {
    return res.status(404).json({ error: 'Not found' });
  }

  const tagMap = await fetchPostsWithTags([post.id]);
  return res.json({
    ...post.toObject(),
    tags: tagMap[post.id] ?? [],
  });
});

// PATCH /posts/:id
router.patch('/posts/:id', async (req: AuthedRequest, res: Response) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: 'Unauthorized' });

  const id = parseInt(String(req.params.id));
  if (isNaN(id)) return res.status(404).json({ error: 'Not found' });

  const { title, content, excerpt, coverImageUrl, tagNames, status } = req.body;

  const post = await Post.findOne({ id });
  if (!post) return res.status(404).json({ error: 'Not found' });

  if (title !== undefined) {
    post.title = title;
    post.slug = await uniqueSlug(slugify(title), id);
  }
  if (content !== undefined) post.content = content;
  if (excerpt !== undefined) post.excerpt = excerpt;
  if (coverImageUrl !== undefined) post.coverImageUrl = coverImageUrl;
  if (status !== undefined) {
    post.status = status;
    if (status === 'published' && !post.publishedAt) {
      post.publishedAt = new Date();
    }
  }
  post.updatedAt = new Date();
  await post.save();

  if (tagNames !== undefined && Array.isArray(tagNames)) {
    await PostTag.deleteMany({ postId: id });
    if (tagNames.length > 0) {
      const tagIds = await getOrCreateTags(tagNames as string[]);
      await PostTag.insertMany(tagIds.map((tagId) => ({ postId: id, tagId })));
    }
  }

  const tagMap = await fetchPostsWithTags([post.id]);
  return res.json({
    ...post.toObject(),
    tags: tagMap[post.id] ?? [],
  });
});

// DELETE /posts/:id
router.delete('/posts/:id', async (req: AuthedRequest, res: Response) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: 'Unauthorized' });

  const id = parseInt(String(req.params.id));
  if (isNaN(id)) return res.status(404).json({ error: 'Not found' });

  await Post.deleteOne({ id });
  await PostTag.deleteMany({ postId: id });
  return res.status(204).send();
});

// POST /posts/:id/publish
router.post('/posts/:id/publish', async (req: AuthedRequest, res: Response) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: 'Unauthorized' });

  const id = parseInt(String(req.params.id));
  if (isNaN(id)) return res.status(404).json({ error: 'Not found' });

  const post = await Post.findOne({ id });
  if (!post) return res.status(404).json({ error: 'Not found' });

  post.status = 'published';
  post.publishedAt = new Date();
  post.updatedAt = new Date();
  await post.save();

  const tagMap = await fetchPostsWithTags([post.id]);
  return res.json({
    ...post.toObject(),
    tags: tagMap[post.id] ?? [],
  });
});

// POST /posts/:id/unpublish
router.post('/posts/:id/unpublish', async (req: AuthedRequest, res: Response) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: 'Unauthorized' });

  const id = parseInt(String(req.params.id));
  if (isNaN(id)) return res.status(404).json({ error: 'Not found' });

  const post = await Post.findOne({ id });
  if (!post) return res.status(404).json({ error: 'Not found' });

  post.status = 'draft';
  post.publishedAt = null;
  post.updatedAt = new Date();
  await post.save();

  const tagMap = await fetchPostsWithTags([post.id]);
  return res.json({
    ...post.toObject(),
    tags: tagMap[post.id] ?? [],
  });
});

export default router;
