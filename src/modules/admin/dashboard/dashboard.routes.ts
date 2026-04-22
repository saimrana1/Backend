import { Router } from 'express';
import { asyncHandler } from '../../../common/utils/asyncHandler';
import * as dashboardController from './dashboard.controller';

export const dashboardRouter = Router();

dashboardRouter.get('/stats', asyncHandler(dashboardController.getDashboardStats));
