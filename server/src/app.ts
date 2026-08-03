import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
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

  // Serve compiled React static frontend in production if built
  const clientDistPath = path.resolve(__dirname, '../../client/dist');
  if (fs.existsSync(clientDistPath)) {
    app.use(
      express.static(clientDistPath, {
        setHeaders: (res, filePath) => {
          if (filePath.endsWith('index.html')) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          }
        },
      })
    );
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.sendFile(path.join(clientDistPath, 'index.html'));
    });
  }

  // Global error handler middleware
  app.use(errorHandler);

  return app;
};
