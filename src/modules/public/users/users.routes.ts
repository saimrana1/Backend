import { Router } from 'express';
import { asyncHandler } from '../../../common/utils/asyncHandler';
import { validateBody, validateQuery } from '../../../middlewares/validate';
import { authenticateJwt } from '../../../middlewares/authJwt';
import * as usersController from './users.controller';
import { updateProfileSchema, withdrawSchema, cashbackQuerySchema } from './users.validation';

export const publicUsersRouter = Router();

// All user-profile routes require authentication
publicUsersRouter.use(authenticateJwt);

publicUsersRouter.get('/me', asyncHandler(usersController.getProfile));
publicUsersRouter.put('/me', validateBody(updateProfileSchema), asyncHandler(usersController.updateProfile));
publicUsersRouter.get(
  '/me/cashback',
  validateQuery(cashbackQuerySchema),
  asyncHandler(usersController.getCashback),
);
publicUsersRouter.post(
  '/me/withdraw',
  validateBody(withdrawSchema),
  asyncHandler(usersController.withdraw),
);
