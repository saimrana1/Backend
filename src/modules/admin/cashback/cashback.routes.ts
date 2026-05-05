import { Router } from 'express';
import { asyncHandler } from '../../../common/utils/asyncHandler';
import { validateBody, validateQuery } from '../../../middlewares/validate';
import * as cashbackController from './cashback.controller';
import { cashbackListQuerySchema, cashbackFeaturedSchema } from './cashback.validation';

export const cashbackAdminRouter = Router();

// Cashback management
cashbackAdminRouter.get(
  '/cashback',
  validateQuery(cashbackListQuerySchema),
  asyncHandler(cashbackController.listCashbackTransactions),
);
cashbackAdminRouter.put('/cashback/:id/confirm', asyncHandler(cashbackController.confirmCashback));

// Feedback management
cashbackAdminRouter.put(
  '/feedback/:id/feature',
  validateBody(cashbackFeaturedSchema),
  asyncHandler(cashbackController.setFeedbackFeatured),
);
