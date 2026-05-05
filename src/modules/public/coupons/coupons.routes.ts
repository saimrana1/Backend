import { Router } from 'express';
import { asyncHandler } from '../../../common/utils/asyncHandler';
import { validateBody, validateQuery } from '../../../middlewares/validate';
import { authenticateJwt } from '../../../middlewares/authJwt';
import { optionalJwt } from '../../../middlewares/optionalJwt';
import * as couponsController from './coupons.controller';
import {
  listPublicCouponsQuerySchema,
  couponCommentBodySchema,
  listCommentsQuerySchema,
} from './coupons.validation';

export const publicCouponsRouter = Router();

// Public (optional auth for user-specific data like "userLiked")
publicCouponsRouter.get(
  '/',
  optionalJwt,
  validateQuery(listPublicCouponsQuerySchema),
  asyncHandler(couponsController.listCoupons),
);
publicCouponsRouter.get('/:id', optionalJwt, asyncHandler(couponsController.getCouponById));

// Comments — public read, auth write
publicCouponsRouter.get(
  '/:id/comments',
  validateQuery(listCommentsQuerySchema),
  asyncHandler(couponsController.listComments),
);
publicCouponsRouter.post(
  '/:id/comments',
  authenticateJwt,
  validateBody(couponCommentBodySchema),
  asyncHandler(couponsController.addComment),
);

// Auth required
publicCouponsRouter.post('/:id/use', authenticateJwt, asyncHandler(couponsController.useCoupon));
publicCouponsRouter.post('/:id/like', authenticateJwt, asyncHandler(couponsController.toggleLike));
