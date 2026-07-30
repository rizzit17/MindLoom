import express from 'express';
import cors from 'cors';
import { createMindmapsRouter } from './routes/mindmaps.routes';
import { errorHandler } from './middleware/errorHandler';

export const createApp = () => {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Mindmaps API routes
  app.use('/api/mindmaps', createMindmapsRouter());

  // Global error handler middleware
  app.use(errorHandler);

  return app;
};
