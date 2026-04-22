import { Router } from 'express';
import * as permissionsController from './permissions.controller';

export const permissionsRouter = Router();

permissionsRouter.get('/', permissionsController.listPermissionIds);
