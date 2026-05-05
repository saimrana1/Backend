import { Router } from 'express';
import { asyncHandler } from '../../../common/utils/asyncHandler';
import { validateBody } from '../../../middlewares/validate';
import * as newsletterController from './newsletter.controller';
import { subscribeSchema, unsubscribeSchema } from './newsletter.validation';

export const publicNewsletterRouter = Router();

// Both endpoints are public — no authentication required
publicNewsletterRouter.post(
  '/subscribe',
  validateBody(subscribeSchema),
  asyncHandler(newsletterController.subscribe),
);
publicNewsletterRouter.post(
  '/unsubscribe',
  validateBody(unsubscribeSchema),
  asyncHandler(newsletterController.unsubscribe),
);
