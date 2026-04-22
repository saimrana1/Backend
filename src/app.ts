import express from 'express';
import cors from 'cors';
import { UPLOAD_ROOT } from './config/paths';
import { v1Router } from './api-routes/v1';
import { adminRouter } from './modules/admin';
import { errorHandler } from './middlewares/errorHandler';

export function createApp() {
  const app = express();

  app.use(cors({ origin: true }));
  app.use(express.json({ limit: '2mb' }));
  app.use('/uploads', express.static(UPLOAD_ROOT));

  app.get('/', (_req, res) => {
    res.type('text/plain').send('Server is running');
  });

  app.use('/api/v1', v1Router);
  // Purana path — frontend ko break na ho
  app.use('/api/admin', adminRouter);

  app.use(errorHandler);
  return app;
}
