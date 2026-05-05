import { Router } from 'express';
import { publicCouponsRouter } from './coupons/coupons.routes';
import { publicStoresRouter } from './stores/stores.routes';
import { publicUsersRouter } from './users/users.routes';
import { publicSearchRouter } from './search/search.routes';
import { publicFeedbackRouter } from './feedback/feedback.routes';
import { publicNewsletterRouter } from './newsletter/newsletter.routes';

/**
 * Public / user-facing API router.
 * Base URL: `/api/v1` (mounted alongside auth and admin)
 */
export const publicRouter = Router();

publicRouter.use('/coupons', publicCouponsRouter);
publicRouter.use('/stores', publicStoresRouter);
publicRouter.use('/users', publicUsersRouter);
publicRouter.use('/search', publicSearchRouter);
publicRouter.use('/feedback', publicFeedbackRouter);
publicRouter.use('/newsletter', publicNewsletterRouter);
