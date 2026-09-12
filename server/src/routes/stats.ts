import { Router } from 'express';
import Post from '../models/Post';
import Tag from '../models/Tag';

const router = Router();

// GET /stats
router.get('/stats', async (_req, res) => {
  const [totalPosts, publishedPosts, draftPosts, totalViews] = await Promise.all([
    Post.countDocuments(),
    Post.countDocuments({ status: 'published' }),
    Post.countDocuments({ status: 'draft' }),
    Post.aggregate([{ $group: { _id: null, total: { $sum: '$viewCount' } } }]),
  ]);

  const topTags = await Tag.aggregate([
    {
      $lookup: {
        from: 'posttags',
        localField: 'id',
        foreignField: 'tagId',
        as: 'postTags',
      },
    },
    {
      $addFields: {
        postCount: { $size: '$postTags' },
      },
    },
    {
      $sort: { postCount: -1 },
    },
    { $limit: 5 },
    {
      $project: {
        _id: 0,
        id: 1,
        name: 1,
        slug: 1,
        postCount: 1,
      },
    },
  ]);

  return res.json({
    totalPosts,
    publishedPosts,
    draftPosts,
    totalViews: Number(totalViews[0]?.total ?? 0),
    topTags,
  });
});

export default router;
