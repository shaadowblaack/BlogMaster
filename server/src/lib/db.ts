import mongoose from 'mongoose';
import { logger } from '../lib/logger.js';

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is required');
  }

  try {
    await mongoose.connect(uri);
    logger.info('Connected to MongoDB');
  } catch (err) {
    logger.error({ err }, 'Failed to connect to MongoDB');
    process.exit(1);
  }
}
