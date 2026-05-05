import { Router } from 'express';
import { adminRouter } from '../../modules/admin';
import { authRouter } from '../../modules/auth/auth.routes';
import { publicRouter } from '../../modules/public';
import { authRateLimiter } from '../../middlewares/rateLimiter';

/**
 * Versioned API entry — saari mounts yahan (aapke reference image jaisa).
 * Base URL: `/api/v1`
 */
export const v1Router = Router();

// Auth routes with rate limiting
v1Router.use('/auth', authRateLimiter, authRouter);

// Admin routes (protected by API key)
v1Router.use('/admin', adminRouter);

// Public / user-facing routes
v1Router.use('/', publicRouter);
