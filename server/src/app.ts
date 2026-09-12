import express, { type Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { authMiddleware } from './middleware/auth.js';
import { apiLimiter } from './middleware/rateLimit.js';
import router from './routes/index.js';

const app: Express = express();

const frontendOrigin = process.env.FRONTEND_URL || 'https://blogmaster-client.onrender.com';
app.use(cors({ credentials: true, origin: frontendOrigin }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(authMiddleware);

app.use('/api', apiLimiter, router);

const uploadsPath = path.resolve(process.cwd(), 'uploads');

app.use('/uploads', express.static(uploadsPath));

export default app;
