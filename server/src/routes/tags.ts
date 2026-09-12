import { Router } from 'express';
import Tag from '../models/Tag.js';

const router = Router();

// GET /tags
router.get('/tags', async (_req, res) => {
  const tags = await Tag.aggregate([
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
      $project: {
        _id: 0,
        id: 1,
        name: 1,
        slug: 1,
        postCount: 1,
      },
    },
    { $sort: { name: 1 } },
  ]);

  return res.json(tags);
});

export default router;
