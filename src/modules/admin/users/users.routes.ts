import { Router } from 'express';
import { asyncHandler } from '../../../common/utils/asyncHandler';
import { validateBody } from '../../../middlewares/validate';
import * as usersController from './users.controller';
import {
  createUserSchema,
  updateUserSchema,
  userPermissionsBodySchema,
  userStatusBodySchema,
} from './users.validation';

export const usersRouter = Router();

usersRouter.get('/', asyncHandler(usersController.listUsers));
usersRouter.post('/', validateBody(createUserSchema), asyncHandler(usersController.createUser));
usersRouter.get('/:id/permissions', asyncHandler(usersController.getUserPermissions));
usersRouter.put(
  '/:id/permissions',
  validateBody(userPermissionsBodySchema),
  asyncHandler(usersController.replaceUserPermissions),
);
usersRouter.patch('/:id/status', validateBody(userStatusBodySchema), asyncHandler(usersController.setUserStatus));
usersRouter.get('/:id', asyncHandler(usersController.getUserById));
usersRouter.patch('/:id', validateBody(updateUserSchema), asyncHandler(usersController.updateUser));
usersRouter.delete('/:id', asyncHandler(usersController.deleteUser));
