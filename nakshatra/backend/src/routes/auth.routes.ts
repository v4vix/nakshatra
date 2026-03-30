import { Router, Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { getDB } from '../db';
import { requireAuth } from '../middleware/auth';

const router = Router();
const SESSION_COOKIE = 'nakshatra_session';
const SESSION_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days

function createSession(userId: string, res: Response): string {
  const db = getDB();
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE).toISOString();

  db.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)').run(token, userId, expiresAt);

  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });

  return token;
}

function getUserProfile(userId: string) {
  const db = getDB();
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
  if (!row) return null;

  return {
    id: row.id,
    username: row.username,
    email: row.email,
    fullName: row.full_name,
    avatar: row.avatar,
    role: row.role,
    tier: row.tier,
    birthDate: row.birth_date,
    birthTime: row.birth_time,
    birthPlace: row.birth_place,
    birthLat: row.birth_lat,
    birthLon: row.birth_lon,
    level: row.level,
    xp: row.xp,
    streakDays: row.streak_days,
    longestStreak: row.longest_streak,
    lastActivityDate: row.last_activity_date,
    achievements: JSON.parse(row.achievements || '[]'),
    completedChallenges: JSON.parse(row.completed_challenges || '[]'),
    onboardingComplete: !!row.onboarding_complete,
    createdAt: row.created_at,
  };
}

// POST /auth/register
const RegisterSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  fullName: z.string().min(1).max(100),
});

router.post('/register', (req: Request, res: Response) => {
  const parse = RegisterSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'Validation failed', details: parse.error.flatten() });

  const { username, email, password, fullName } = parse.data;
  const db = getDB();

  const existing = db.prepare('SELECT id FROM users WHERE email = ? OR username = ?').get(email, username) as any;
  if (existing) return res.status(409).json({ error: 'Email or username already taken' });

  const id = crypto.randomUUID();
  const hash = bcrypt.hashSync(password, 10);

  db.prepare(`
    INSERT INTO users (id, username, email, password_hash, full_name)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, username, email, hash, fullName);

  createSession(id, res);
  return res.status(201).json({ success: true, user: getUserProfile(id) });
});

// POST /auth/login
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post('/login', (req: Request, res: Response) => {
  const parse = LoginSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'Invalid credentials' });

  const { email, password } = parse.data;
  const db = getDB();

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Clean up old sessions for this user
  db.prepare("DELETE FROM sessions WHERE user_id = ? AND expires_at < datetime('now')").run(user.id);

  createSession(user.id, res);

  // Update last activity
  db.prepare("UPDATE users SET last_activity_date = datetime('now'), updated_at = datetime('now') WHERE id = ?").run(user.id);

  return res.json({ success: true, user: getUserProfile(user.id) });
});

// POST /auth/logout
router.post('/logout', (req: Request, res: Response) => {
  const token = req.cookies?.[SESSION_COOKIE];
  if (token) {
    const db = getDB();
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
  }
  res.clearCookie(SESSION_COOKIE);
  return res.json({ success: true });
});

// GET /auth/me
router.get('/me', requireAuth, (req: Request, res: Response) => {
  const profile = getUserProfile(req.user!.id);
  if (!profile) return res.status(404).json({ error: 'User not found' });
  return res.json({ success: true, user: profile });
});

// PUT /auth/profile
const ProfileUpdateSchema = z.object({
  fullName: z.string().min(1).max(100).optional(),
  avatar: z.string().max(10).optional(),
  birthDate: z.string().optional(),
  birthTime: z.string().optional(),
  birthPlace: z.string().optional(),
  birthLat: z.number().optional(),
  birthLon: z.number().optional(),
  onboardingComplete: z.boolean().optional(),
}).strict();

router.put('/profile', requireAuth, (req: Request, res: Response) => {
  const parse = ProfileUpdateSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'Validation failed', details: parse.error.flatten() });

  const updates = parse.data;
  const db = getDB();

  const fields: string[] = [];
  const values: any[] = [];

  if (updates.fullName !== undefined) { fields.push('full_name = ?'); values.push(updates.fullName); }
  if (updates.avatar !== undefined) { fields.push('avatar = ?'); values.push(updates.avatar); }
  if (updates.birthDate !== undefined) { fields.push('birth_date = ?'); values.push(updates.birthDate); }
  if (updates.birthTime !== undefined) { fields.push('birth_time = ?'); values.push(updates.birthTime); }
  if (updates.birthPlace !== undefined) { fields.push('birth_place = ?'); values.push(updates.birthPlace); }
  if (updates.birthLat !== undefined) { fields.push('birth_lat = ?'); values.push(updates.birthLat); }
  if (updates.birthLon !== undefined) { fields.push('birth_lon = ?'); values.push(updates.birthLon); }
  if (updates.onboardingComplete !== undefined) { fields.push('onboarding_complete = ?'); values.push(updates.onboardingComplete ? 1 : 0); }

  if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });

  fields.push("updated_at = datetime('now')");
  values.push(req.user!.id);

  db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`).run(...values);

  return res.json({ success: true, user: getUserProfile(req.user!.id) });
});

export default router;
