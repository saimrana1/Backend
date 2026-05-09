import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './config/env';
import { UPLOAD_ROOT } from './config/paths';
import { v1Router } from './api-routes/v1';
import { adminRouter } from './modules/admin';
import { errorHandler } from './middlewares/errorHandler';

const ALLOWED_ORIGINS = env.isProd
  ? (process.env.ALLOWED_ORIGINS ?? '').split(',').map((o) => o.trim()).filter(Boolean)
  : ['http://localhost:3000', 'http://127.0.0.1:3000'];

export function createApp() {
  const app = express();

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  }));
  app.use(morgan(env.isProd ? 'combined' : 'dev'));
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
