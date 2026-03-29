import 'dotenv/config';
import path from 'path';
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { apiRouter } from './routes/index';
import { initialize as initKnowledgeBase } from './services/knowledge';
import { sanitizeInput, additionalSecurityHeaders } from './middleware/security';

const app: Application = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://nominatim.openstreetmap.org'],
    },
  } : false,
  crossOriginEmbedderPolicy: false,
}));

// CORS — in production the backend serves the frontend (same origin),
// so we allow same-origin requests plus any configured CORS_ORIGIN.
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map(o => o.trim());
app.use(cors({
  origin: (origin, callback) => {
    // No origin = same-origin request (e.g. frontend served by this backend)
    if (!origin) return callback(null, true);
    // Allow configured origins
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) return callback(null, true);
    // In production, also allow requests from the same host (Render, etc.)
    if (process.env.NODE_ENV === 'production') return callback(null, true);
    // Dev mode: allow all
    if (process.env.NODE_ENV === 'development') return callback(null, true);
    callback(new Error(`CORS policy: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-Id', 'X-Admin-Token'],
}));

// Logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Additional security middleware
app.use(additionalSecurityHeaders);
app.use(sanitizeInput);

// Global rate limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use(globalLimiter);

// Strict rate limiter for LLM endpoints
const llmLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'LLM rate limit exceeded. Please wait before sending more requests.' },
});
app.use('/api/v1/llm', llmLimiter);
app.use('/api/v1/oracle', llmLimiter);

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'nakshatra-backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API routes
app.use('/api/v1', apiRouter);

// Serve frontend static files in production
const publicDir = path.join(__dirname, '..', 'public');
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(publicDir, { maxAge: '1d' }));
  // SPA fallback: any non-API route returns index.html
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(publicDir, 'index.html'));
  });
} else {
  // 404 handler for dev (frontend served by Vite)
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Route not found' });
  });
}

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Error]', err.message, err.stack);
  const statusCode = (err as any).statusCode || 500;
  res.status(statusCode).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

// Start server only when run directly (not when imported by tests)
if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, async () => {
    console.log(`\n🕉  Nakshatra Backend running on port ${PORT}`);
    console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Health      : http://localhost:${PORT}/health`);
    console.log(`   API Base    : http://localhost:${PORT}/api/v1\n`);

    // Initialize Knowledge Base Engine
    try {
      await initKnowledgeBase();
      console.log('   Knowledge   : Initialized ✓\n');
    } catch (err) {
      console.error('   Knowledge   : Failed to initialize', err);
    }
  });

  // Graceful shutdown
  const gracefulShutdown = (signal: string) => {
    console.log(`\n[${signal}] Graceful shutdown initiated...`);
    server.close((err) => {
      if (err) {
        console.error('Error during server close:', err);
        process.exit(1);
      }
      console.log('Server closed. Exiting.');
      process.exit(0);
    });
    // Force shutdown after 30s
    setTimeout(() => {
      console.error('Forced shutdown after timeout.');
      process.exit(1);
    }, 30000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    gracefulShutdown('uncaughtException');
  });
  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
  });
}

export default app;
