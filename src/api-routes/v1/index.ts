import { Router } from 'express';
import { adminRouter } from '../../modules/admin';

/**
 * Versioned API entry — saari mounts yahan (aapke reference image jaisa).
 * Base URL: `/api/v1`
 */
export const v1Router = Router();

v1Router.use('/admin', adminRouter);
