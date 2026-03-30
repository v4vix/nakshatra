import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { getDB } from '../db';
import { requireAuth, optionalAuth } from '../middleware/auth';

const router = Router();

// POST /share/cards — save a shareable card
router.post('/cards', requireAuth, (req: Request, res: Response) => {
  const { type, title, data } = req.body;
  if (!type || !data) return res.status(400).json({ error: 'type and data are required' });

  const db = getDB();
  const id = crypto.randomUUID();
  const slug = crypto.randomBytes(4).toString('hex');

  db.prepare('INSERT INTO share_cards (id, user_id, type, title, data, public_slug) VALUES (?, ?, ?, ?, ?, ?)').run(
    id, req.user!.id, type, title || '', JSON.stringify(data), slug
  );

  return res.json({ success: true, id, slug, url: `/s/${slug}` });
});

// GET /share/cards — list user's saved cards
router.get('/cards', requireAuth, (req: Request, res: Response) => {
  const db = getDB();
  const rows = db.prepare('SELECT * FROM share_cards WHERE user_id = ? ORDER BY created_at DESC').all(req.user!.id) as any[];
  const cards = rows.map(r => ({
    id: r.id,
    type: r.type,
    title: r.title,
    data: JSON.parse(r.data),
    slug: r.public_slug,
    url: `/s/${r.public_slug}`,
    createdAt: r.created_at,
  }));
  return res.json({ success: true, cards });
});

// GET /share/cards/:slug — public card view (no auth required)
router.get('/cards/:slug', optionalAuth, (req: Request, res: Response) => {
  const db = getDB();
  const row = db.prepare(`
    SELECT sc.*, u.full_name as author_name, u.avatar as author_avatar
    FROM share_cards sc JOIN users u ON sc.user_id = u.id
    WHERE sc.public_slug = ?
  `).get(req.params.slug) as any;

  if (!row) return res.status(404).json({ error: 'Card not found' });

  return res.json({
    success: true,
    card: {
      id: row.id,
      type: row.type,
      title: row.title,
      data: JSON.parse(row.data),
      slug: row.public_slug,
      author: { name: row.author_name, avatar: row.author_avatar },
      createdAt: row.created_at,
    },
  });
});

// DELETE /share/cards/:id
router.delete('/cards/:id', requireAuth, (req: Request, res: Response) => {
  const db = getDB();
  db.prepare('DELETE FROM share_cards WHERE id = ? AND user_id = ?').run(req.params.id, req.user!.id);
  return res.json({ success: true });
});

export default router;
