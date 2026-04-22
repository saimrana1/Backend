import { Router } from 'express';
import { asyncHandler } from '../../../common/utils/asyncHandler';
import { validateBody } from '../../../middlewares/validate';
import * as networksController from './networks.controller';
import {
  createNetworkSchema,
  networkStatusBodySchema,
  updateNetworkSchema,
} from './networks.validation';

export const networksRouter = Router();

networksRouter.get('/', asyncHandler(networksController.listNetworks));
networksRouter.post('/', validateBody(createNetworkSchema), asyncHandler(networksController.createNetwork));
networksRouter.patch(
  '/:id/status',
  validateBody(networkStatusBodySchema),
  asyncHandler(networksController.setNetworkStatus),
);
networksRouter.get('/:id', asyncHandler(networksController.getNetworkById));
networksRouter.patch('/:id', validateBody(updateNetworkSchema), asyncHandler(networksController.updateNetwork));
networksRouter.delete('/:id', asyncHandler(networksController.deleteNetwork));
