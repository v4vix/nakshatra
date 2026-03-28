import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { llmOrchestrator, LLMDomain } from '../services/llm/LLMOrchestrator';

const router = Router();

const VALID_DOMAINS: LLMDomain[] = ['kundli', 'tarot', 'numerology', 'vastu', 'scripture', 'general'];

// Validation schema for interpret request
const InterpretSchema = z.object({
  domain: z.enum(['kundli', 'tarot', 'numerology', 'vastu', 'scripture', 'general']),
  question: z.string().min(3).max(1000),
  context: z.record(z.unknown()).optional().default({}),
  sessionId: z.string().optional(),
});

// Validation schema for stream request
const StreamSchema = z.object({
  domain: z.enum(['kundli', 'tarot', 'numerology', 'vastu', 'scripture', 'general']),
  question: z.string().min(3).max(1000),
  context: z.record(z.unknown()).optional().default({}),
  sessionId: z.string().optional(),
});

/**
 * POST /api/v1/llm/interpret
 * Main LLM interpretation endpoint (non-streaming).
 */
router.post('/interpret', async (req: Request, res: Response) => {
  try {
    const parseResult = InterpretSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.flatten(),
      });
    }

    const { domain, question, context, sessionId } = parseResult.data;

    const result = await llmOrchestrator.process({
      domain: domain as LLMDomain,
      question,
      context: context as Record<string, unknown>,
      stream: false,
      sessionId,
    });

    return res.json({
      success: true,
      content: result.content,
      provider: result.provider,
      confidence: result.confidence,
      metadata: result.metadata,
    });
  } catch (err) {
    const error = err as Error;
    console.error('[LLMRoute/interpret] Error:', error.message);
    return res.status(500).json({ error: 'Interpretation failed', details: error.message });
  }
});

/**
 * GET /api/v1/llm/status
 * Check which LLM provider is currently active.
 */
router.get('/status', async (_req: Request, res: Response) => {
  try {
    const status = await llmOrchestrator.getProviderStatus();
    return res.json({
      success: true,
      status,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const error = err as Error;
    return res.status(500).json({ error: 'Failed to get provider status', details: error.message });
  }
});

/**
 * POST /api/v1/llm/stream
 * Server-Sent Events (SSE) streaming interpretation endpoint.
 */
router.post('/stream', async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = StreamSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.flatten(),
      });
      return;
    }

    const { domain, question, context, sessionId } = parseResult.data;

    await llmOrchestrator.processStream(
      {
        domain: domain as LLMDomain,
        question,
        context: context as Record<string, unknown>,
        stream: true,
        sessionId,
      },
      res
    );
  } catch (err) {
    const error = err as Error;
    console.error('[LLMRoute/stream] Error:', error.message);

    // If headers haven't been sent yet, return JSON error
    if (!res.headersSent) {
      res.status(500).json({ error: 'Streaming failed', details: error.message });
      return;
    }

    // Otherwise write SSE error event
    res.write(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`);
    res.end();
  }
});

/**
 * GET /api/v1/llm/domains
 * List available interpretation domains.
 */
router.get('/domains', (_req: Request, res: Response) => {
  res.json({
    success: true,
    domains: VALID_DOMAINS.map(d => ({
      id: d,
      label: d.charAt(0).toUpperCase() + d.slice(1),
    })),
  });
});

export default router;
