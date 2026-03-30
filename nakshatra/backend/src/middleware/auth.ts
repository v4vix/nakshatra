/**
 * Authentication middleware for Nakshatra
 * Session-based auth using SQLite + HTTP-only cookies
 */

import { Request, Response, NextFunction } from 'express';
import { getDB } from '../db';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  avatar: string;
  role: 'user' | 'admin';
  tier: 'free' | 'pro' | 'guru';
  level: number;
  xp: number;
}

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

const SESSION_COOKIE = 'nakshatra_session';

function getUserFromSession(token: string): AuthUser | null {
  const db = getDB();
  const row = db.prepare(`
    SELECT u.id, u.username, u.email, u.full_name, u.avatar, u.role, u.tier, u.level, u.xp
    FROM sessions s JOIN users u ON s.user_id = u.id
    WHERE s.token = ? AND s.expires_at > datetime('now')
  `).get(token) as any;

  if (!row) return null;

  return {
    id: row.id,
    username: row.username,
    email: row.email,
    fullName: row.full_name,
    avatar: row.avatar,
    role: row.role,
    tier: row.tier,
    level: row.level,
    xp: row.xp,
  };
}

/** Require authenticated user */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.[SESSION_COOKIE];
  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const user = getUserFromSession(token);
  if (!user) {
    res.clearCookie(SESSION_COOKIE);
    res.status(401).json({ error: 'Session expired' });
    return;
  }

  req.user = user;
  next();
}

/** Require admin role */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  requireAuth(req, res, () => {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }
    next();
  });
}

/** Optionally attach user if session exists */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = req.cookies?.[SESSION_COOKIE];
  if (token) {
    const user = getUserFromSession(token);
    if (user) req.user = user;
  }
  next();
}
