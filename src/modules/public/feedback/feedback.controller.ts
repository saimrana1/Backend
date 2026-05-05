import type { Request, Response } from 'express';
import { z } from 'zod';
import { getValidatedBody, getValidatedQuery } from '../../../middlewares/validate';
import * as feedbackService from './feedback.service';
import { submitFeedbackSchema, listFeedbackQuerySchema } from './feedback.validation';

export async function listFeedback(req: Request, res: Response) {
  const q = getValidatedQuery<z.infer<typeof listFeedbackQuerySchema>>(req);
  const result = await feedbackService.listFeedback(q.page, q.limit);
  res.json(result);
}

export async function submitFeedback(req: Request, res: Response) {
  const body = getValidatedBody<z.infer<typeof submitFeedbackSchema>>(req);
  const data = await feedbackService.submitFeedback(req.authUser!.userId, body);
  res.status(201).json({ data });
}
