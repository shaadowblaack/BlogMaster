# Two-Service Render Deployment Plan

## Current State
- Backend: Express API at `server/`, serves `/api/*` and static `client/dist/`
- Frontend: React SPA built by Vite into `client/dist/`
- API client uses relative URLs (`/api/...`) and has an unused `setBaseUrl()` helper
- Server CORS is open: `cors({ credentials: true, origin: true })`

## Target State
- **Frontend** → Render Static Site (serves built SPA)
- **Backend** → Render Web Service (serves `/api/*` only)
- Frontend makes cross-origin API calls to backend URL injected at build time

## Step 1: Make frontend API base URL configurable

In `client/src/main.tsx`, call `setBaseUrl()` with an env var:

```ts
import { setBaseUrl } from './api/custom-fetch';
setBaseUrl(import.meta.env.VITE_API_BASE_URL || '');
```

In `client/vite.config.ts`, expose it via `env`:

```ts
env: {
  VITE_API_BASE_URL: process.env.VITE_API_BASE_URL || ''
}
```

This lets Render inject the backend URL when building the frontend.

## Step 2: Restrict server CORS to the frontend origin

In `server/src/app.ts`, change CORS to allow only the frontend origin:

```ts
const frontendOrigin = process.env.FRONTEND_URL || 'https://blog-master-frontend.onrender.com';
app.use(cors({ credentials: true, origin: frontendOrigin }));
```

Environment variable `FRONTEND_URL` is set in the Render backend service.

## Step 3: Configure two services in Render dashboard

### Service A — Backend API
- **Type**: Web Service
- **Root Directory**: `server`
- **Runtime**: Node
- **Node Version**: 22
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Health Check Path**: `/api/healthz`
- **Env Vars**:
  - `NODE_ENV=production`
  - `PORT=10000`
  - `SESSION_COOKIE_SECURE=true`
  - `MONGODB_URI` (secret)
  - `ADMIN_USERNAME` (generate)
  - `ADMIN_PASSWORD` (generate)
  - `FRONTEND_URL=https://<your-frontend-service>.onrender.com`

### Service B — Frontend Static Site
- **Type**: Static Site
- **Root Directory**: `client`
- **Runtime**: Node (for install/build)
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **Env Vars**:
  - `VITE_API_BASE_URL=https://<your-backend-service>.onrender.com`

## Step 4: Delete old single-service configuration

- Remove or ignore `render.yaml` (you said you don't want to rely on it)
- Ensure no stale Static Site service exists with the wrong config

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Frontend built with wrong backend URL | Rebuild frontend after both services exist and URLs are known |
| CORS blocks requests | Set `FRONTEND_URL` exactly matching the Render static site URL |
| Session cookies blocked by cross-origin | `credentials: true` in client fetch + server CORS + `httpOnly` cookies |
| Build order (backend depends on frontend dist) | Backend `dist/` only needs the path; frontend `dist/` is served by Render CDN, not backend. Backend no longer serves static files. |

## Open Question

**Backend static file serving**: Currently `server/src/app.ts` serves `client/dist/` as static files and has a SPA fallback. If the frontend becomes a separate Render Static Site, the backend no longer needs to serve static files.

Should the backend keep serving static files as a fallback (in case the static site is unreachable), or should those routes be removed entirely?

**Recommended answer**: Remove the static file serving from the backend. The static site handles all frontend traffic. The backend only handles `/api/*`. This is cleaner and avoids stale frontend assets being served from the backend.
