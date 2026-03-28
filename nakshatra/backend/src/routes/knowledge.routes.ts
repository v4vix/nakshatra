/**
 * Knowledge Base REST API Routes
 *
 * POST /api/v1/knowledge/upload   — Upload PDF/TXT, parse, chunk, embed, store
 * POST /api/v1/knowledge/scrape   — Scrape a URL and index it
 * GET  /api/v1/knowledge/sources  — List all indexed sources
 * DELETE /api/v1/knowledge/sources/:id — Remove a source
 * POST /api/v1/knowledge/search   — Semantic search across knowledge base
 * GET  /api/v1/knowledge/stats    — Stats (total chunks, sources, size)
 * POST /api/v1/knowledge/seed     — Seed built-in Vedic knowledge
 * GET  /api/v1/knowledge/authentic-sources — List pre-configured authentic sources
 */

import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { z } from 'zod';
import * as knowledgeBase from '../services/knowledge';
import { getAuthenticSources } from '../services/knowledge/scraper';

const router = Router();

// ─── Admin Auth Middleware ────────────────────────────────────────────────────────
// All knowledge routes require admin token via X-Admin-Token header
// In production, replace with proper JWT/session auth

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'nakshatra-admin-secret';

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const token = req.headers['x-admin-token'];
  if (token !== ADMIN_TOKEN) {
    res.status(403).json({ error: 'Forbidden — admin access required' });
    return;
  }
  next();
}

// Apply admin auth to ALL knowledge routes
router.use(requireAdmin);

// ─── Multer Config ──────────────────────────────────────────────────────────────

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB max
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'application/pdf',
      'text/plain',
      'text/markdown',
      'application/octet-stream', // some .txt files come as this
    ];
    if (allowed.includes(file.mimetype) || file.originalname.match(/\.(pdf|txt|md|text)$/i)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}. Accepted: PDF, TXT, MD.`));
    }
  },
});

// ─── Zod Schemas ────────────────────────────────────────────────────────────────

const ScrapeSchema = z.object({
  url: z.string().url('Must be a valid URL'),
});

const SearchSchema = z.object({
  query: z.string().min(1, 'Query must not be empty').max(1000, 'Query too long'),
  topK: z.number().int().min(1).max(20).optional().default(5),
});

// ─── Middleware ──────────────────────────────────────────────────────────────────

function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

// ─── Routes ─────────────────────────────────────────────────────────────────────

/**
 * POST /upload — Upload and index a document
 */
router.post(
  '/upload',
  upload.single('file'),
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded. Send a file in the "file" field.' });
      return;
    }

    const { originalname, mimetype, buffer } = req.file;

    let source;
    if (mimetype === 'application/pdf' || originalname.endsWith('.pdf')) {
      source = await knowledgeBase.ingestPDF(buffer, originalname);
    } else {
      const text = buffer.toString('utf-8');
      source = await knowledgeBase.ingestText(text, originalname);
    }

    res.status(201).json({
      message: `Successfully indexed "${source.metadata.title}"`,
      source,
    });
  }),
);

/**
 * POST /scrape — Scrape a URL and index its content
 */
router.post(
  '/scrape',
  asyncHandler(async (req: Request, res: Response) => {
    const parsed = ScrapeSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const source = await knowledgeBase.ingestURL(parsed.data.url);

    res.status(201).json({
      message: `Successfully scraped and indexed "${source.metadata.title}"`,
      source,
    });
  }),
);

/**
 * GET /sources — List all indexed sources
 */
router.get('/sources', (_req: Request, res: Response) => {
  const sources = knowledgeBase.getSources();
  res.json({ sources, count: sources.length });
});

/**
 * DELETE /sources/:id — Remove a source and its chunks
 */
router.delete(
  '/sources/:id',
  (req: Request, res: Response) => {
    const { id } = req.params;
    const removed = knowledgeBase.removeSource(id);

    if (!removed) {
      res.status(404).json({ error: `Source "${id}" not found.` });
      return;
    }

    res.json({ message: `Source "${id}" removed successfully.` });
  },
);

/**
 * POST /search — Semantic search across the knowledge base
 */
router.post(
  '/search',
  asyncHandler(async (req: Request, res: Response) => {
    const parsed = SearchSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const results = knowledgeBase.searchKnowledge(parsed.data.query, parsed.data.topK);

    res.json({
      query: parsed.data.query,
      results: results.map((r) => ({
        chunkId: r.chunk.id,
        text: r.chunk.text.slice(0, 500),
        score: Math.round(r.score * 10000) / 10000,
        sourceId: r.chunk.sourceId,
        section: r.chunk.metadata.section,
      })),
      count: results.length,
    });
  }),
);

/**
 * GET /stats — Knowledge base statistics
 */
router.get('/stats', (_req: Request, res: Response) => {
  const stats = knowledgeBase.getStats();
  res.json(stats);
});

/**
 * POST /seed — Seed the knowledge base with built-in Vedic knowledge
 */
router.post(
  '/seed',
  asyncHandler(async (_req: Request, res: Response) => {
    // Check if seed data already exists
    const sources = knowledgeBase.getSources();
    const existingSeed = sources.find((s) => s.type === 'seed');
    if (existingSeed) {
      res.status(409).json({
        message: 'Built-in Vedic knowledge is already seeded.',
        source: existingSeed,
      });
      return;
    }

    const source = await knowledgeBase.seedDefaultKnowledge();
    res.status(201).json({
      message: `Seeded ${source.chunkCount} built-in Vedic knowledge chunks.`,
      source,
    });
  }),
);

/**
 * GET /authentic-sources — List pre-configured authentic Vedic sources for scraping
 */
router.get('/authentic-sources', (_req: Request, res: Response) => {
  res.json({ sources: getAuthenticSources() });
});

export default router;
