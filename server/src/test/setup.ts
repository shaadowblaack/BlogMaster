import { beforeAll, afterAll } from 'vitest';

beforeAll(() => {
  process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/blog_test';
  process.env.ADMIN_USERNAME = 'admin';
  process.env.ADMIN_PASSWORD = 'changeme';
  process.env.SESSION_COOKIE_SECURE = 'false';
  process.env.NODE_ENV = 'test';
});
