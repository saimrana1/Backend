import { Router } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { authenticateJwt } from '../../middlewares/authJwt';
import { validateBody } from '../../middlewares/validate';
import * as authController from './auth.controller';
import { loginBodySchema, registerBodySchema } from './auth.validation';

export const authRouter = Router();

authRouter.post('/login', validateBody(loginBodySchema), asyncHandler(authController.login));
authRouter.post('/register', validateBody(registerBodySchema), asyncHandler(authController.register));
authRouter.get('/me', authenticateJwt, asyncHandler(authController.me));
