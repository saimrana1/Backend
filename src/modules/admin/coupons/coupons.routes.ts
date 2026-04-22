import { Router } from 'express';
import { asyncHandler } from '../../../common/utils/asyncHandler';
import { validateBody, validateQuery } from '../../../middlewares/validate';
import * as couponsController from './coupons.controller';
import {
  createCouponSchema,
  listCouponsQuerySchema,
  reorderCouponsBodySchema,
  updateCouponSchema,
} from './coupons.validation';

export const couponsRouter = Router();

couponsRouter.get('/', validateQuery(listCouponsQuerySchema), asyncHandler(couponsController.listCoupons));
couponsRouter.post('/', validateBody(createCouponSchema), asyncHandler(couponsController.createCoupon));
couponsRouter.get('/stores/:storeId/order', asyncHandler(couponsController.listCouponsOrderedForStore));
couponsRouter.put(
  '/stores/:storeId/order',
  validateBody(reorderCouponsBodySchema),
  asyncHandler(couponsController.reorderCouponsForStore),
);
couponsRouter.get('/:id', asyncHandler(couponsController.getCouponById));
couponsRouter.patch('/:id', validateBody(updateCouponSchema), asyncHandler(couponsController.updateCoupon));
couponsRouter.delete('/:id', asyncHandler(couponsController.deleteCoupon));
