import { Router } from 'express';
import { asyncHandler } from '../../../common/utils/asyncHandler';
import { validateQuery } from '../../../middlewares/validate';
import * as searchController from './search.controller';
import { searchQuerySchema } from './search.validation';

export const publicSearchRouter = Router();

publicSearchRouter.get('/', validateQuery(searchQuerySchema), asyncHandler(searchController.search));
