import { Router, type IRouter } from 'express';
import healthRouter from './health';
import authRouter from './auth';
import usersRouter from './users';
import postsRouter from './posts';
import tagsRouter from './tags';
import profileRouter from './profile';
import statsRouter from './stats';
import commentsRouter from './comments';
import reactionsRouter from './reactions';
import storageRouter from './storage';

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
