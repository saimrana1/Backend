import { Router } from 'express';
import { asyncHandler } from '../../../common/utils/asyncHandler';
import { validateBody } from '../../../middlewares/validate';
import * as dealsController from './deals.controller';
import { createDealSchema, updateDealSchema } from './deals.validation';

export const dealsRouter = Router();

dealsRouter.get('/', asyncHandler(dealsController.listDeals));
dealsRouter.post('/', validateBody(createDealSchema), asyncHandler(dealsController.createDeal));
dealsRouter.get('/:id', asyncHandler(dealsController.getDealById));
dealsRouter.patch('/:id', validateBody(updateDealSchema), asyncHandler(dealsController.updateDeal));
dealsRouter.delete('/:id', asyncHandler(dealsController.deleteDeal));
