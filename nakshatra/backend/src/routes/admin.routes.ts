import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { getDB } from '../db';
import { requireAdmin } from '../middleware/auth';

const router = Router();
router.use(requireAdmin);

// GET /admin/users
router.get('/users', (_req: Request, res: Response) => {
  const db = getDB();
  const rows = db.prepare(`
    SELECT id, username, email, full_name, avatar, role, tier, level, xp,
           streak_days, longest_streak, last_activity_date, onboarding_complete, created_at
    FROM users ORDER BY created_at DESC
  `).all() as any[];

  const users = rows.map(r => ({
    id: r.id,
    username: r.username,
    email: r.email,
    fullName: r.full_name,
    avatar: r.avatar,
    role: r.role,
    tier: r.tier,
    level: r.level,
    xp: r.xp,
    streakDays: r.streak_days,
    longestStreak: r.longest_streak,
    lastActivityDate: r.last_activity_date,
    onboardingComplete: !!r.onboarding_complete,
    createdAt: r.created_at,
  }));

  return res.json({ success: true, users });
});

// PUT /admin/users/:id
const UpdateUserSchema = z.object({
  tier: z.enum(['free', 'pro', 'guru']).optional(),
  role: z.enum(['user', 'admin']).optional(),
  level: z.number().min(1).max(100).optional(),
  xp: z.number().min(0).optional(),
}).strict();

router.put('/users/:id', (req: Request, res: Response) => {
  const parse = UpdateUserSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'Validation failed', details: parse.error.flatten() });

  const updates = parse.data;
  const db = getDB();

  const fields: string[] = [];
  const values: any[] = [];

  if (updates.tier !== undefined) { fields.push('tier = ?'); values.push(updates.tier); }
  if (updates.role !== undefined) { fields.push('role = ?'); values.push(updates.role); }
  if (updates.level !== undefined) { fields.push('level = ?'); values.push(updates.level); }
  if (updates.xp !== undefined) { fields.push('xp = ?'); values.push(updates.xp); }

  if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });

  fields.push("updated_at = datetime('now')");
  values.push(req.params.id);

  db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`).run(...values);

  return res.json({ success: true });
});

// DELETE /admin/users/:id
router.delete('/users/:id', (req: Request, res: Response) => {
  const db = getDB();
  // Prevent deleting yourself
  if (req.params.id === req.user!.id) {
    return res.status(400).json({ error: 'Cannot delete your own account' });
  }
  db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  return res.json({ success: true });
});

// GET /admin/analytics
router.get('/analytics', (_req: Request, res: Response) => {
  const db = getDB();

  const totalUsers = (db.prepare('SELECT COUNT(*) as c FROM users').get() as any).c;
  const tierDist = db.prepare('SELECT tier, COUNT(*) as c FROM users GROUP BY tier').all() as any[];
  const totalKundlis = (db.prepare('SELECT COUNT(*) as c FROM kundlis').get() as any).c;
  const totalTarot = (db.prepare('SELECT COUNT(*) as c FROM tarot_readings').get() as any).c;
  const totalCards = (db.prepare('SELECT COUNT(*) as c FROM share_cards').get() as any).c;

  const today = new Date().toISOString().split('T')[0];
  const activeToday = (db.prepare("SELECT COUNT(*) as c FROM users WHERE last_activity_date LIKE ?").get(`%${today}%`) as any).c;

  const recentUsers = db.prepare(`
    SELECT id, username, full_name, avatar, tier, level, created_at
    FROM users ORDER BY created_at DESC LIMIT 5
  `).all() as any[];

  return res.json({
    success: true,
    analytics: {
      totalUsers,
      activeToday,
      tierDistribution: tierDist.reduce((acc: any, r: any) => ({ ...acc, [r.tier]: r.c }), {}),
      readings: { kundli: totalKundlis, tarot: totalTarot, shareCards: totalCards },
      recentUsers: recentUsers.map(r => ({
        id: r.id, username: r.username, fullName: r.full_name,
        avatar: r.avatar, tier: r.tier, level: r.level, createdAt: r.created_at,
      })),
    },
  });
});

// GET /admin/settings
router.get('/settings', (_req: Request, res: Response) => {
  const db = getDB();
  const rows = db.prepare('SELECT * FROM admin_settings').all() as any[];
  const settings = rows.reduce((acc: any, r: any) => ({ ...acc, [r.key]: r.value }), {});
  return res.json({ success: true, settings });
});

// PUT /admin/settings
router.put('/settings', (req: Request, res: Response) => {
  const db = getDB();
  const upsert = db.prepare("INSERT OR REPLACE INTO admin_settings (key, value, updated_at) VALUES (?, ?, datetime('now'))");

  const tx = db.transaction(() => {
    for (const [key, value] of Object.entries(req.body)) {
      if (typeof key === 'string' && typeof value === 'string') {
        upsert.run(key, value);
      }
    }
  });
  tx();

  return res.json({ success: true });
});

export default router;
