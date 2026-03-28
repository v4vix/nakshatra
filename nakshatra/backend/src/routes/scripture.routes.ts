import { Router, Request, Response } from 'express';
import { ruleBasedEngine } from '../services/llm/RuleBasedEngine';
import { llmOrchestrator } from '../services/llm/LLMOrchestrator';

const router = Router();

/**
 * GET /api/v1/scripture/daily
 * Get the daily shloka based on today's date.
 */
router.get('/daily', (_req: Request, res: Response) => {
  const shloka = ruleBasedEngine.getDailyShloka(new Date());
  res.json({ success: true, date: new Date().toISOString().split('T')[0], shloka });
});

/**
 * GET /api/v1/scripture/all
 * Get all shlokas in the collection.
 */
router.get('/all', (_req: Request, res: Response) => {
  const shlokas = ruleBasedEngine.getAllShlokas();
  res.json({ success: true, count: shlokas.length, shlokas });
});

/**
 * POST /api/v1/scripture/ask
 * Ask a question about Vedic scriptures.
 */
router.post('/ask', async (req: Request, res: Response) => {
  try {
    const { question } = req.body;
    if (!question || typeof question !== 'string' || question.trim().length < 3) {
      return res.status(400).json({ error: 'A question of at least 3 characters is required' });
    }

    const dailyShloka = ruleBasedEngine.getDailyShloka(new Date());

    const llmResult = await llmOrchestrator.process({
      domain: 'scripture',
      question: question.trim(),
      context: { dailyShloka },
    });

    return res.json({
      success: true,
      question: question.trim(),
      response: { content: llmResult.content, provider: llmResult.provider },
      relatedShloka: dailyShloka,
    });
  } catch (err) {
    const error = err as Error;
    return res.status(500).json({ error: 'Scripture inquiry failed', details: error.message });
  }
});

export default router;
