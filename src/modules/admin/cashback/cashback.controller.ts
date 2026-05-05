import type { Request, Response } from 'express';
import { z } from 'zod';
import { idParamSchema } from '../../../common/validation/params';
import { getValidatedBody, getValidatedQuery } from '../../../middlewares/validate';
import * as cashbackService from './cashback.service';
import { cashbackFeaturedSchema, cashbackListQuerySchema } from './cashback.validation';

export async function confirmCashback(req: Request, res: Response) {
  const id = idParamSchema.parse(req.params.id);
  const data = await cashbackService.confirmCashback(id);
  res.json({ data });
}

export async function listCashbackTransactions(req: Request, res: Response) {
  const q = getValidatedQuery<z.infer<typeof cashbackListQuerySchema>>(req);
  const result = await cashbackService.listCashbackTransactions(q);
  res.json(result);
}

export async function setFeedbackFeatured(req: Request, res: Response) {
  const id = idParamSchema.parse(req.params.id);
  const body = getValidatedBody<z.infer<typeof cashbackFeaturedSchema>>(req);
  const data = await cashbackService.setFeedbackFeatured(id, body.featured);
  res.json({ data });
}
