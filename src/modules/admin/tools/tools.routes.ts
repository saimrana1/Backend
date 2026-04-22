import { Router } from 'express';
import { asyncHandler } from '../../../common/utils/asyncHandler';
import { validateBody } from '../../../middlewares/validate';
import * as toolsController from './tools.controller';
import { compressImageBodySchema } from './tools.validation';
import { uploadImageMemory } from './tools.upload';

export const toolsRouter = Router();

toolsRouter.post(
  '/compress-image',
  uploadImageMemory.single('file'),
  validateBody(compressImageBodySchema),
  asyncHandler(toolsController.compressImage),
);
