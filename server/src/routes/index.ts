import { Router, type IRouter } from 'express';
import healthRouter from './health.js';
import authRouter from './auth.js';
import usersRouter from './users.js';
import postsRouter from './posts.js';
import tagsRouter from './tags.js';
import profileRouter from './profile.js';
import statsRouter from './stats.js';
import commentsRouter from './comments.js';
import reactionsRouter from './reactions.js';
import storageRouter from './storage.js';

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(postsRouter);
router.use(tagsRouter);
router.use(profileRouter);
router.use(statsRouter);
router.use(commentsRouter);
router.use(reactionsRouter);
router.use(storageRouter);

export default router;
