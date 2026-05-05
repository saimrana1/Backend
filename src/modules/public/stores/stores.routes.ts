import { Router } from 'express';
import { asyncHandler } from '../../../common/utils/asyncHandler';
import { validateQuery } from '../../../middlewares/validate';
import { optionalJwt } from '../../../middlewares/optionalJwt';
import * as storesController from './stores.controller';
import { listPublicStoresQuerySchema } from './stores.validation';

export const publicStoresRouter = Router();

publicStoresRouter.get(
  '/',
  validateQuery(listPublicStoresQuerySchema),
  asyncHandler(storesController.listStores),
);

publicStoresRouter.get('/:slug', optionalJwt, asyncHandler(storesController.getStoreBySlug));
