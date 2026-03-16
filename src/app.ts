import express from 'express';
import cors from 'cors';
import path from 'path';
import completionsRouter from './routes/completions';
import apiRouter from './routes/api';

export function createApp(): express.Express {
  const app = express();

  // ─── Middleware ──────────────────────────────────────────────────
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  // ─── API Routes ─────────────────────────────────────────────────
  app.use('/v1/chat/completions', completionsRouter);
  app.use('/api', apiRouter);

  // ─── OpenAI-compatible model list ───────────────────────────────
  app.get('/v1/models', (_req, res) => {
    res.json({
      object: 'list',
      data: [
        {
          id: 'gemma-3-27b-it',
          object: 'model',
          created: Math.floor(Date.now() / 1000),
          owned_by: 'google',
        },
      ],
    });
  });

  // ─── Serve frontend static files ───────────────────────────────
  const clientPath = path.resolve(__dirname, 'client');
  app.use(express.static(clientPath));

  // SPA fallback: any unmatched route → index.html
  app.get('*', (_req, res) => {
    const indexPath = path.join(clientPath, 'index.html');
    res.sendFile(indexPath, (err) => {
      if (err) {
        res.status(404).json({ error: 'Frontend not built. Run: npm run build:client' });
      }
    });
  });

  return app;
}
