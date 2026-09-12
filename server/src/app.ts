import express, { type Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { authMiddleware } from './middleware/auth.js';
import { apiLimiter } from './middleware/rateLimit.js';
import router from './routes/index.js';

const app: Express = express();

const envOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((s) => s.trim())
  : [];
const allowedOrigins = new Set([...envOrigins, 'https://blogmaster-client.onrender.com']);

app.use(
  cors({
    credentials: true,
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
  }),
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(authMiddleware);

app.use('/api', apiLimiter, router);

const uploadsPath = path.resolve(process.cwd(), 'uploads');

app.use('/uploads', express.static(uploadsPath));

export default app;
