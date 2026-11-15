import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import { errorHandler, notFound } from './lib/errors.js';
import { readSession } from './middleware/auth.js';
import { apiLimiter, originGuard } from './middleware/security.js';
import { router as adminRouter } from './routes/admin.js';
import { router as articlesRouter } from './routes/articles.js';
import { router as authRouter } from './routes/auth.js';
import { router as favoritesRouter } from './routes/favorites.js';
import { router as marketRouter } from './routes/market.js';
import { router as mediaRouter } from './routes/media.js';
import { router as metaRouter } from './routes/meta.js';
import { router as pushRouter } from './routes/push.js';
import { router as usersRouter } from './routes/users.js';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  // The API only sits behind the Next.js proxy and Coolify's Traefik (private networks).
  app.set('trust proxy', 'loopback, linklocal, uniquelocal');

  app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: 'same-site' } }));
  app.use(express.json({ limit: '32kb' }));
  app.use(cookieParser());
  app.use(readSession);

  app.use('/api', metaRouter);
  app.use('/api', originGuard, apiLimiter);
  app.use('/api/auth', authRouter);
  app.use('/api/users', usersRouter);
  app.use('/api', marketRouter);
  app.use('/api/articles', articlesRouter);
  app.use('/api/favorites', favoritesRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/media', mediaRouter);
  app.use('/api/push', pushRouter);

  app.get('/', (_req, res) => res.json({ name: 'Kryptonews API', docs: '/api/health' }));
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
