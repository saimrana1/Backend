import { Router } from 'express';
import { asyncHandler } from '../../../common/utils/asyncHandler';
import { validateBody, validateQuery } from '../../../middlewares/validate';
import { authenticateJwt } from '../../../middlewares/authJwt';
import * as feedbackController from './feedback.controller';
import { submitFeedbackSchema, listFeedbackQuerySchema } from './feedback.validation';

export const publicFeedbackRouter = Router();

// Public — anyone can view feedback
publicFeedbackRouter.get(
  '/',
  validateQuery(listFeedbackQuerySchema),
  asyncHandler(feedbackController.listFeedback),
);

// Auth required — only logged-in users can submit feedback
publicFeedbackRouter.post(
  '/',
  authenticateJwt,
  validateBody(submitFeedbackSchema),
  asyncHandler(feedbackController.submitFeedback),
);
