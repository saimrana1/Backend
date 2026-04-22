import { Router } from 'express';
import { asyncHandler } from '../../../common/utils/asyncHandler';
import { validateBody } from '../../../middlewares/validate';
import * as storesController from './stores.controller';
import { createStoreSchema, storeFeaturedBodySchema, updateStoreSchema } from './stores.validation';
import { uploadStoreLogo } from './stores.upload';

export const storesRouter = Router();

storesRouter.get('/', asyncHandler(storesController.listStores));
storesRouter.post('/', validateBody(createStoreSchema), asyncHandler(storesController.createStore));
storesRouter.patch(
  '/:id/featured',
  validateBody(storeFeaturedBodySchema),
  asyncHandler(storesController.setStoreFeatured),
);
storesRouter.post('/:id/logo', uploadStoreLogo.single('file'), asyncHandler(storesController.uploadStoreLogo));
storesRouter.get('/:id', asyncHandler(storesController.getStoreById));
storesRouter.patch('/:id', validateBody(updateStoreSchema), asyncHandler(storesController.updateStore));
storesRouter.delete('/:id', asyncHandler(storesController.deleteStore));
