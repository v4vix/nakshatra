import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { getDB } from '../db';
import { requireAuth } from '../middleware/auth';

const router = Router();

// All routes require auth
router.use(requireAuth);

// GET /user/kundlis
router.get('/kundlis', (req: Request, res: Response) => {
  const db = getDB();
  const rows = db.prepare('SELECT * FROM kundlis WHERE user_id = ? ORDER BY created_at DESC').all(req.user!.id) as any[];
  const kundlis = rows.map(r => ({ id: r.id, name: r.name, ...JSON.parse(r.data), createdAt: r.created_at }));
  return res.json({ success: true, kundlis });
});

// POST /user/kundlis
router.post('/kundlis', (req: Request, res: Response) => {
  const db = getDB();
  const id = req.body.id || crypto.randomUUID();
  const name = req.body.name || '';
  const data = JSON.stringify(req.body);

  // Upsert: replace if same id exists
  db.prepare('INSERT OR REPLACE INTO kundlis (id, user_id, name, data) VALUES (?, ?, ?, ?)').run(id, req.user!.id, name, data);
  return res.json({ success: true, id });
});

// DELETE /user/kundlis/:id
router.delete('/kundlis/:id', (req: Request, res: Response) => {
  const db = getDB();
  db.prepare('DELETE FROM kundlis WHERE id = ? AND user_id = ?').run(req.params.id, req.user!.id);
  return res.json({ success: true });
});

// GET /user/tarot-readings
router.get('/tarot-readings', (req: Request, res: Response) => {
  const db = getDB();
  const rows = db.prepare('SELECT * FROM tarot_readings WHERE user_id = ? ORDER BY created_at DESC LIMIT 50').all(req.user!.id) as any[];
  const readings = rows.map(r => ({ id: r.id, ...JSON.parse(r.data), createdAt: r.created_at }));
  return res.json({ success: true, readings });
});

// POST /user/tarot-readings
router.post('/tarot-readings', (req: Request, res: Response) => {
  const db = getDB();
  const id = req.body.id || crypto.randomUUID();
  const data = JSON.stringify(req.body);
  db.prepare('INSERT INTO tarot_readings (id, user_id, data) VALUES (?, ?, ?)').run(id, req.user!.id, data);
  return res.json({ success: true, id });
});

// GET /user/numerology
router.get('/numerology', (req: Request, res: Response) => {
  const db = getDB();
  const row = db.prepare('SELECT * FROM numerology_profiles WHERE user_id = ? ORDER BY created_at DESC LIMIT 1').get(req.user!.id) as any;
  if (!row) return res.json({ success: true, profile: null });
  return res.json({ success: true, profile: JSON.parse(row.data) });
});

// POST /user/numerology
router.post('/numerology', (req: Request, res: Response) => {
  const db = getDB();
  const id = crypto.randomUUID();
  const data = JSON.stringify(req.body);
  db.prepare('INSERT INTO numerology_profiles (id, user_id, data) VALUES (?, ?, ?)').run(id, req.user!.id, data);
  return res.json({ success: true, id });
});

// POST /user/xp — add XP points
router.post('/xp', (req: Request, res: Response) => {
  const { amount } = req.body;
  if (typeof amount !== 'number' || amount < 0 || amount > 500) {
    return res.status(400).json({ error: 'Invalid XP amount' });
  }
  const db = getDB();
  const user = db.prepare('SELECT xp, level FROM users WHERE id = ?').get(req.user!.id) as any;
  const newXP = user.xp + amount;

  // Level up calculation
  let level = user.level;
  let xpLeft = newXP;
  while (xpLeft >= Math.floor(100 * Math.pow(level + 1, 1.5))) {
    xpLeft -= Math.floor(100 * Math.pow(level + 1, 1.5));
    level++;
  }

  db.prepare('UPDATE users SET xp = ?, level = ?, updated_at = datetime(\'now\') WHERE id = ?').run(newXP, level, req.user!.id);
  return res.json({ success: true, xp: newXP, level });
});

// POST /user/streak — update streak
router.post('/streak', (req: Request, res: Response) => {
  const db = getDB();
  const user = db.prepare('SELECT streak_days, longest_streak, last_activity_date FROM users WHERE id = ?').get(req.user!.id) as any;
  const today = new Date().toDateString();

  if (user.last_activity_date === today) {
    return res.json({ success: true, streak: user.streak_days });
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const isConsecutive = user.last_activity_date === yesterday.toDateString();
  const newStreak = isConsecutive ? user.streak_days + 1 : 1;
  const longest = Math.max(newStreak, user.longest_streak);

  db.prepare(`
    UPDATE users SET streak_days = ?, longest_streak = ?, last_activity_date = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(newStreak, longest, today, req.user!.id);

  return res.json({ success: true, streak: newStreak, longest });
});

export default router;
