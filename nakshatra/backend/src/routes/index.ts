import { Router } from 'express';
import kundliRouter from './kundli.routes';
import llmRouter from './llm.routes';
import tarotRouter from './tarot.routes';
import numerologyRouter from './numerology.routes';
import vastuRouter from './vastu.routes';
import scriptureRouter from './scripture.routes';
import knowledgeRouter from './knowledge.routes';
import oracleRouter from './oracle.routes';
import authRouter from './auth.routes';
import userRouter from './user.routes';
import shareRouter from './share.routes';
import adminRouter from './admin.routes';

export const apiRouter = Router();

// Auth & user routes
apiRouter.use('/auth', authRouter);
apiRouter.use('/user', userRouter);
apiRouter.use('/share', shareRouter);
apiRouter.use('/admin', adminRouter);

// Feature routes
apiRouter.use('/kundli', kundliRouter);
apiRouter.use('/llm', llmRouter);
apiRouter.use('/tarot', tarotRouter);
apiRouter.use('/numerology', numerologyRouter);
apiRouter.use('/vastu', vastuRouter);
apiRouter.use('/scripture', scriptureRouter);
apiRouter.use('/knowledge', knowledgeRouter);
apiRouter.use('/oracle', oracleRouter);

// API root info
apiRouter.get('/', (_req, res) => {
  res.json({
    service: 'Nakshatra Vedic Wisdom API',
    version: '1.0.0',
    endpoints: {
      kundli: {
        'POST /kundli/calculate': 'Compute complete Vedic birth chart',
        'GET /kundli/nakshatras': 'All 27 Nakshatras with metadata',
        'GET /kundli/rashis': 'All 12 Rashis with metadata',
        'GET /kundli/grahas': 'All 9 Vedic Grahas with metadata',
      },
      llm: {
        'POST /llm/interpret': 'LLM interpretation (non-streaming)',
        'POST /llm/stream': 'SSE streaming interpretation',
        'GET /llm/status': 'Check active LLM provider',
        'GET /llm/domains': 'List available interpretation domains',
      },
      tarot: {
        'GET /tarot/cards': 'All 78 Tarot cards',
        'POST /tarot/draw': 'Draw N cards from shuffled deck',
        'POST /tarot/reading': 'Save reading with AI interpretation',
        'GET /tarot/reading/:id': 'Retrieve a saved reading',
        'GET /tarot/card/:name': 'Get specific card with interpretation',
      },
      numerology: {
        'POST /numerology/calculate': 'Calculate all numerology numbers',
        'GET /numerology/meaning/:number': 'Get meaning of a number',
        'POST /numerology/compatibility': 'Check number compatibility',
      },
      vastu: {
        'GET /vastu/zones': 'List all 9 Vastu zones',
        'POST /vastu/zone': 'Analyze a specific zone',
        'POST /vastu/analyze': 'Full property Vastu analysis',
      },
      scripture: {
        'GET /scripture/daily': 'Today\'s shloka',
        'GET /scripture/all': 'All shlokas in collection',
        'POST /scripture/ask': 'Ask a scripture question',
      },
      knowledge: {
        'POST /knowledge/upload': 'Upload PDF/TXT to knowledge base',
        'POST /knowledge/scrape': 'Scrape and index a URL',
        'GET /knowledge/sources': 'List all indexed sources',
        'DELETE /knowledge/sources/:id': 'Remove a source',
        'POST /knowledge/search': 'Semantic search across knowledge base',
        'GET /knowledge/stats': 'Knowledge base statistics',
        'POST /knowledge/seed': 'Seed built-in Vedic knowledge',
        'GET /knowledge/authentic-sources': 'List authentic source URLs',
      },
      oracle: {
        'POST /oracle/chat': 'RAG-enhanced Oracle chat (SSE streaming)',
        'GET /oracle/models': 'List available LLM models',
      },
    },
    documentation: 'Consult /health for service status.',
  });
});
