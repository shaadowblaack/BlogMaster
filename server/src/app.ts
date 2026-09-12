import express, { type Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { authMiddleware } from './middleware/auth.js';
import { apiLimiter } from './middleware/rateLimit.js';
import router from './routes/index.js';

const app: Express = express();

app.use(cors({ credentials: true, origin: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(authMiddleware);

app.use('/api', apiLimiter, router);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '..', '..', 'client', 'dist');
const uploadsPath = path.resolve(process.cwd(), 'uploads');

app.use('/uploads', express.static(uploadsPath));
app.use(express.static(distPath));

app.get(/.*/, (_req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath);
});

export default app;
