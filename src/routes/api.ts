import { Router, Request, Response } from 'express';
import { configManager } from '../config';
import { AppConfig } from '../types';

const router = Router();

/**
 * GET /api/health
 * Simple health check endpoint for the frontend status indicator.
 */
router.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

/**
 * GET /api/config
 * Returns current config with masked API key.
 * Also includes last usage metadata if available.
 */
router.get('/config', (_req: Request, res: Response) => {
  const config = configManager.getSafe();
  const lastUsage = (globalThis as any).__lastUsage || null;

  res.json({
    ...config,
    lastUsage,
  });
});

/**
 * POST /api/config
 * Merge partial config and save to disk.
 */
router.post('/config', (req: Request, res: Response) => {
  try {
    const partial = req.body as Partial<AppConfig>;

    // Validate port if provided
    if (partial.port !== undefined) {
      const port = Number(partial.port);
      if (isNaN(port) || port < 1 || port > 65535) {
        res.status(400).json({ error: 'Port must be between 1 and 65535' });
        return;
      }
      partial.port = port;
    }

    // Validate temperature if provided
    if (partial.temperature !== undefined) {
      const temp = Number(partial.temperature);
      if (isNaN(temp) || temp < 0 || temp > 2) {
        res.status(400).json({ error: 'Temperature must be between 0 and 2' });
        return;
      }
      partial.temperature = temp;
    }

    // Validate topP if provided
    if (partial.topP !== undefined) {
      const tp = Number(partial.topP);
      if (isNaN(tp) || tp < 0 || tp > 1) {
        res.status(400).json({ error: 'topP must be between 0 and 1' });
        return;
      }
      partial.topP = tp;
    }

    const updated = configManager.save(partial);
    const safe = configManager.getSafe();

    res.json({ success: true, config: safe });
  } catch (err: any) {
    console.error('⚠ Config save error:', err?.message || err);
    res.status(500).json({ error: 'Failed to save configuration' });
  }
});

export default router;
