# Blog Master

A full-stack personal blog application with an admin dashboard. Built with a TypeScript Express + Mongoose backend and a React + Vite + TypeScript + Tailwind CSS frontend.

## Features

- **Admin dashboard** — create, edit, publish, and delete posts
- **Public frontend** — browse posts by tag, read individual posts, view author profile
- **Comments** — readers can comment on published posts; admins can moderate
- **Reactions** — like/unlike posts and comments
- **Tagging** — categorize posts with tags, filter by tag
- **File uploads** — upload cover images via direct-to-storage
- **Theme toggle** — dark/light mode
- **Session-based auth** — cookie-based sessions with 7-day TTL
- **Password reset** — forgot/reset password flow via tokens
- **Blog statistics** — post count, comment count, view count

## Project Structure

```
Blog-Master/
├── client/           # React + Vite + Tailwind frontend
│   ├── src/
│   │   ├── pages/    # Route pages (Home, Post, Tag, Dashboard, etc.)
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── api/      # Generated API client (Orval)
│   │   └── hooks/
├── server/           # Express + Mongoose backend
│   ├── src/
│   │   ├── routes/   # API routes (posts, auth, users, comments, etc.)
│   │   ├── models/   # Mongoose models
│   │   ├── middleware/
│   │   └── lib/      # DB, logger, password utilities
│   └── .env.example
├── render.yaml       # Render deployment configuration
├── .env.example      # Environment variable template
└── README.md
```

## Prerequisites

- [Node.js](https://nodejs.org/) >= 20
- [MongoDB](https://www.mongodb.com/) (local or [Atlas](https://www.mongodb.com/atlas))

## Local Development

### 1. Clone and install dependencies

```bash
git clone <your-repo-url>
cd Blog-Master

# Install and build everything
npm run build
# OR for development:
npm run dev:server   # starts Express on http://localhost:5000
npm run dev:client   # starts Vite on http://localhost:5173
```

### 2. Configure environment

Copy `.env.example` to `.env` and edit as needed:

```bash
cp .env.example server/.env
```

Key variables:

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `PORT` | Server port (default 5000) |
| `ADMIN_USERNAME` | Admin login username |
| `ADMIN_PASSWORD` | Admin login password |
| `SESSION_COOKIE_SECURE` | Set `true` in production (HTTPS) |
| `NODE_ENV` | `development` or `production` |

### 3. Run locally

```bash
npm run dev:server   # Express API + server on :5000
npm run dev:client   # Vite dev server on :5173 (proxies /api to :5000)
```

The Vite dev server proxies `/api` requests to the Express backend, so you can run both simultaneously for development.

## Deploying to Render

### Option A: Using render.yaml (recommended)

1. Push this repository to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com) → New → Blueprint
3. Connect your GitHub repo
4. Render will auto-detect `render.yaml`
5. Set the `MONGODB_URI` environment variable to your MongoDB Atlas connection string
6. Deploy

### Option B: Manual setup

1. Push this repository to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com) → New → Web Service
3. Connect your GitHub repo
4. Set the following:
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Starter ($7/mo)
5. Add environment variables:

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `PORT` | `10000` |
| `SESSION_COOKIE_SECURE` | `true` |
| `ADMIN_USERNAME` | Your admin username |
| `ADMIN_PASSWORD` | Your admin password |

6. Click Deploy

### MongoDB Atlas Setup

Render does not provide managed MongoDB. Use MongoDB Atlas:

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create an M0 (free) cluster
3. Create a database user with read/write permissions
4. Add your IP to the network access list (0.0.0.0/0 for development)
5. Copy the connection string (replace `<username>`, `<password>`, and `<dbname>` with `blog`)
6. Paste it into the `MONGODB_URI` environment variable on Render

## Production Notes

- The Express server builds and serves the React frontend from `client/dist/`
- Uploaded files are stored in `server/uploads/` and served via `/uploads/`
- Sessions are stored in MongoDB with a 7-day TTL
- `SESSION_COOKIE_SECURE` must be `true` in production (HTTPS)

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/healthz` | Health check |
| POST | `/api/auth/login` | Admin login (username/password from env) |
| POST | `/api/auth/logout` | Admin logout |
| GET | `/api/auth/user` | Get admin auth state |
| POST | `/api/users/register` | Register a new user |
| POST | `/api/users/login` | User login |
| POST | `/api/users/logout` | User logout |
| GET | `/api/users/me` | Get current user |
| POST | `/api/users/change-password` | Change user password |
| GET | `/api/posts` | List posts (with pagination and tag filters) |
| GET | `/api/posts/recent` | Recent published posts |
| GET | `/api/posts/slug/:slug` | Get post by slug |
| GET | `/api/posts/:id` | Get post by ID |
| POST | `/api/posts` | Create a post (admin) |
| PATCH | `/api/posts/:id` | Update a post (admin) |
| DELETE | `/api/posts/:id` | Delete a post (admin) |
| POST | `/api/posts/:id/publish` | Publish a post (admin) |
| POST | `/api/posts/:id/unpublish` | Unpublish a post (admin) |
| GET | `/api/tags` | List tags with post counts |
| GET | `/api/comments/:id` | List comments for a post |
| DELETE | `/api/comments/:id` | Delete a comment (admin) |
| POST | `/api/posts/:id/comments` | Add a comment to a post |
| GET | `/api/stats` | Blog statistics |
| POST | `/api/storage/upload` | Upload a file |
