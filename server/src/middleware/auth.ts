import { Request, Response, NextFunction } from 'express';
import SessionModel, { SessionData } from '../models/Session.js';
import { logger } from '../lib/logger.js';

export const SESSION_COOKIE = 'sid';
export const SESSION_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

export type SessionUser = {
  id: string;
  username: string;
  displayName?: string;
  role: 'admin' | 'user';
};

export interface AuthedRequest extends Request {
  user?: SessionUser;
}

export function getSessionId(req: Request): string | undefined {
  const authHeader = req.headers['authorization'];
  if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  return req.cookies?.[SESSION_COOKIE];
}

export function setSessionCookie(res: Response, sid: string): void {
  const secure = process.env.SESSION_COOKIE_SECURE !== 'false';
  res.cookie(SESSION_COOKIE, sid, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL,
  });
}

export async function createSession(data: SessionData): Promise<string> {
  const crypto = await import('crypto');
  const sid = crypto.randomBytes(32).toString('hex');
  const expire = new Date(Date.now() + SESSION_TTL);
  await SessionModel.create({
    sid,
    sess: JSON.parse(JSON.stringify(data)),
    expire,
  });
  return sid;
}

export async function getSession(sid: string): Promise<SessionData | null> {
  const session = await SessionModel.findOne({ sid });
  if (!session || session.expire < new Date()) {
    if (session) {
      await SessionModel.deleteOne({ sid });
    }
    return null;
  }
  return session.sess as unknown as SessionData;
}

export async function deleteSession(sid: string): Promise<void> {
  await SessionModel.deleteOne({ sid });
}

export async function clearSession(res: Response, sid?: string): Promise<void> {
  if (sid) await deleteSession(sid);
  res.clearCookie(SESSION_COOKIE, { path: '/' });
}

export function authMiddleware(req: AuthedRequest, res: Response, next: NextFunction) {
  req.isAuthenticated = function (this: AuthedRequest) {
    return this.user != null;
  } as AuthedRequest['isAuthenticated'];

  const sid = getSessionId(req);
  if (!sid) {
    next();
    return;
  }

  getSession(sid)
    .then((session) => {
      if (!session?.user?.id) {
        return clearSession(res, sid).then(() => {
          next();
        });
      }
      req.user = session.user as SessionUser;
      next();
    })
    .catch((err) => {
      logger.error({ err }, 'Error in auth middleware');
      next();
    });
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface User extends SessionUser {}
    interface Request {
      isAuthenticated(): this is { user: SessionUser };
      user?: SessionUser;
    }
  }
}
