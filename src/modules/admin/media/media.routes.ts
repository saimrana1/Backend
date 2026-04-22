import { Router } from 'express';
import { asyncHandler } from '../../../common/utils/asyncHandler';
import { validateBody } from '../../../middlewares/validate';
import * as mediaController from './media.controller';
import { mediaUploadMetaSchema } from './media.validation';
import { uploadMediaFile } from './media.upload';

export const mediaRouter = Router();

mediaRouter.post(
  '/',
  uploadMediaFile.single('file'),
  validateBody(mediaUploadMetaSchema),
  asyncHandler(mediaController.uploadMedia),
);
