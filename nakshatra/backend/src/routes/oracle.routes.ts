/**
 * Oracle API Routes — RAG-Enhanced Chat
 *
 * POST /api/v1/oracle/chat   — Streaming RAG chat (SSE)
 * GET  /api/v1/oracle/models — List available LLM models
 */

import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as knowledgeBase from '../services/knowledge';

const router = Router();

// ─── Zod Schemas ────────────────────────────────────────────────────────────────

const ChatSchema = z.object({
  query: z.string().min(1, 'Query must not be empty').max(2000, 'Query too long'),
  topK: z.number().int().min(1).max(20).optional().default(5),
  temperature: z.number().min(0).max(2).optional().default(0.7),
  maxTokens: z.number().int().min(50).max(4096).optional().default(1024),
  stream: z.boolean().optional().default(true),
});

// ─── Middleware ──────────────────────────────────────────────────────────────────

function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

// ─── Routes ─────────────────────────────────────────────────────────────────────

/**
 * POST /chat — RAG-enhanced Oracle chat
 *
 * If stream=true (default): SSE stream of text chunks
 * If stream=false: JSON response with complete answer
 */
router.post(
  '/chat',
  asyncHandler(async (req: Request, res: Response) => {
    const parsed = ChatSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const { query, topK, temperature, maxTokens, stream } = parsed.data;

    if (!stream) {
      // Non-streaming response
      const result = await knowledgeBase.oracleChatSync(query, {
        topK,
        temperature,
        maxTokens,
      });

      res.json(result);
      return;
    }

    // ── SSE Streaming Response ──

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

    // Send initial event with search results
    const searchResults = knowledgeBase.searchKnowledge(query, topK);
    const sourcesEvent = {
      type: 'sources',
      sources: searchResults.slice(0, 3).map((r) => ({
        sourceId: r.chunk.sourceId,
        snippet: r.chunk.text.slice(0, 200),
        score: Math.round(r.score * 10000) / 10000,
        section: r.chunk.metadata.section,
      })),
    };
    res.write(`data: ${JSON.stringify(sourcesEvent)}\n\n`);

    // Stream LLM response with 30-second timeout
    const STREAM_TIMEOUT_MS = 30_000;
    let streamTimedOut = false;
    const streamTimer = setTimeout(() => {
      streamTimedOut = true;
      const timeoutEvent = { type: 'error', error: 'Response timed out. Please try again.' };
      res.write(`data: ${JSON.stringify(timeoutEvent)}\n\n`);
      res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
      res.end();
    }, STREAM_TIMEOUT_MS);

    try {
      for await (const chunk of knowledgeBase.oracleChat(query, {
        topK,
        temperature,
        maxTokens,
      })) {
        if (streamTimedOut) break;
        clearTimeout(streamTimer); // Reset on each chunk (connection is alive)
        const event = {
          type: 'text',
          text: chunk.text,
          provider: chunk.provider,
          model: chunk.model,
          done: chunk.done,
        };
        res.write(`data: ${JSON.stringify(event)}\n\n`);

        if (chunk.done) break;
      }
    } catch (err) {
      if (!streamTimedOut) {
        const errorEvent = {
          type: 'error',
          error: (err as Error).message,
        };
        res.write(`data: ${JSON.stringify(errorEvent)}\n\n`);
      }
    } finally {
      clearTimeout(streamTimer);
    }

    // End stream (skip if already ended by timeout)
    if (!streamTimedOut) {
      res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
      res.end();
    }
  }),
);

/**
 * GET /models — List available LLM models
 */
router.get(
  '/models',
  asyncHandler(async (_req: Request, res: Response) => {
    const models = await knowledgeBase.listLLMModels();
    res.json({
      models,
      count: models.length,
    });
  }),
);

export default router;
