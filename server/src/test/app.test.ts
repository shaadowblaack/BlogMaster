import { describe, expect, test, vi } from 'vitest';
import request from 'supertest';

function chainableMock(resolvedValue: unknown) {
  const mock: Record<string, any> = {
    sort: vi.fn().mockReturnThis(),
    skip: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    exec: vi.fn().mockResolvedValue(resolvedValue),
    then: vi.fn().mockImplementation((resolve: any) => resolve(resolvedValue)),
  };
  return mock;
}

vi.mock('../models/Post', () => ({
  default: {
    find: vi.fn().mockImplementation(() => chainableMock([])),
    findOne: vi.fn().mockResolvedValue(null),
    create: vi.fn(),
    deleteOne: vi.fn().mockResolvedValue({ deletedCount: 1 }),
    countDocuments: vi.fn().mockResolvedValue(0),
    aggregate: vi.fn().mockResolvedValue([]),
    updateOne: vi.fn().mockResolvedValue({ modifiedCount: 1 }),
    save: vi.fn(),
    toObject: vi.fn(),
  },
}));

vi.mock('../models/Tag', () => ({
  default: {
    find: vi.fn().mockResolvedValue([]),
    findOne: vi.fn().mockResolvedValue(null),
    create: vi.fn(),
    aggregate: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('../models/PostTag', () => ({
  default: {
    find: vi.fn().mockResolvedValue([]),
    insertMany: vi.fn().mockResolvedValue([]),
    deleteMany: vi.fn().mockResolvedValue({ deletedCount: 0 }),
  },
}));

vi.mock('../models/Profile', () => ({
  default: {
    findOne: vi.fn().mockImplementation(() => {
      const mock = {
        sort: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        exec: vi.fn().mockResolvedValue(null),
        then: vi.fn().mockImplementation((resolve: any) => resolve(null)),
      };
      return mock;
    }),
    save: vi.fn(),
  },
}));

vi.mock('../models/Session', () => ({
  default: {
    create: vi.fn().mockResolvedValue({
      sid: 'test-sid',
      sess: { user: { id: 'admin', username: 'admin', role: 'admin' } },
    }),
    findOne: vi.fn().mockResolvedValue(null),
    deleteOne: vi.fn().mockResolvedValue({ deletedCount: 0 }),
  },
}));

vi.mock('../models/Comment', () => ({
  default: {
    find: vi.fn().mockReturnThis(),
    sort: vi.fn().mockReturnThis(),
    then: vi.fn().mockResolvedValue([]),
    create: vi.fn(),
  },
}));

vi.mock('../models/Reaction', () => ({
  default: {
    find: vi.fn().mockResolvedValue([]),
    aggregate: vi.fn().mockResolvedValue([]),
    findOne: vi.fn().mockResolvedValue(null),
    deleteOne: vi.fn().mockResolvedValue({ deletedCount: 0 }),
    create: vi.fn(),
  },
}));

vi.mock('../models/User', () => ({
  default: {
    findOne: vi.fn().mockResolvedValue(null),
    create: vi.fn(),
    findOneAndUpdate: vi.fn().mockResolvedValue(null),
  },
}));

vi.mock('../models/PasswordResetToken', () => ({
  default: {
    findOne: vi.fn().mockResolvedValue(null),
    create: vi.fn(),
    deleteOne: vi.fn().mockResolvedValue({ deletedCount: 0 }),
  },
}));

import app from '../app.js';

async function loginAsAdmin() {
  const agent = request.agent(app);
  const res = await agent
    .post('/api/auth/login')
    .send({ username: process.env.ADMIN_USERNAME, password: process.env.ADMIN_PASSWORD });
  expect(res.status).toBe(200);
  return agent;
}

describe('Health Check', () => {
  test('GET /api/healthz returns 200 and ok status', async () => {
    const res = await request(app).get('/api/healthz');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});

describe('Auth Routes', () => {
  test('POST /api/auth/login with wrong credentials returns 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'wrong', password: 'wrong' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid credentials');
  });

  test('POST /api/auth/login with correct credentials returns user and sets cookie', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: process.env.ADMIN_USERNAME,
        password: process.env.ADMIN_PASSWORD,
      });
    expect(res.status).toBe(200);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.username).toBe(process.env.ADMIN_USERNAME);
    expect(res.body.user.role).toBe('admin');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  test('GET /api/auth/user returns null when not authenticated', async () => {
    const res = await request(app).get('/api/auth/user');
    expect(res.status).toBe(200);
    expect(res.body.user).toBeNull();
  });

  test('POST /api/auth/logout clears session', async () => {
    const agent = await loginAsAdmin();
    const res = await agent.post('/api/auth/logout');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('Posts API (unauthenticated)', () => {
  test('GET /api/posts returns list with correct shape', async () => {
    const res = await request(app).get('/api/posts');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('posts');
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('page');
    expect(res.body).toHaveProperty('limit');
  });

  test('GET /api/posts/recent returns array', async () => {
    const res = await request(app).get('/api/posts/recent');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/stats returns stats object', async () => {
    const res = await request(app).get('/api/stats');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('totalPosts');
    expect(res.body).toHaveProperty('publishedPosts');
    expect(res.body).toHaveProperty('draftPosts');
    expect(res.body).toHaveProperty('totalViews');
  });

  test('GET /api/tags returns array', async () => {
    const res = await request(app).get('/api/tags');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/posts/slug/:slug returns 404 for nonexistent slug', async () => {
    const res = await request(app).get('/api/posts/slug/nonexistent');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Not found');
  });
});

describe('Protected Routes (unauthenticated)', () => {
  test('POST /api/posts returns 401 without auth', async () => {
    const res = await request(app).post('/api/posts').send({ title: 'Test', content: 'Content' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
  });

  test('PATCH /api/posts/:id returns 401 without auth', async () => {
    const res = await request(app).patch('/api/posts/1').send({ title: 'Updated' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
  });

  test('DELETE /api/posts/:id returns 401 without auth', async () => {
    const res = await request(app).delete('/api/posts/1');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
  });

  test('POST /api/posts/:id/publish returns 401 without auth', async () => {
    const res = await request(app).post('/api/posts/1/publish');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
  });
});

describe('Profile API', () => {
  test('GET /api/profile returns default profile when none exists', async () => {
    const res = await request(app).get('/api/profile');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('name');
  });
});
