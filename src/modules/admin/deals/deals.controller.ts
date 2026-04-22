import type { Request, Response } from 'express';
import { z } from 'zod';
import { getValidatedBody } from '../../../middlewares/validate';
import { idParamSchema } from '../../../common/validation/params';
import * as dealsService from './deals.service';
import { createDealSchema, updateDealSchema } from './deals.validation';

export async function listDeals(_req: Request, res: Response) {
  const data = await dealsService.listDeals();
  res.json({ data });
}

export async function createDeal(req: Request, res: Response) {
  const body = getValidatedBody<z.infer<typeof createDealSchema>>(req);
  const data = await dealsService.createDeal(body);
  res.status(201).json({ data });
}

export async function getDealById(req: Request, res: Response) {
  const id = idParamSchema.parse(req.params.id);
  const data = await dealsService.getDeal(id);
  res.json({ data });
}

export async function updateDeal(req: Request, res: Response) {
  const id = idParamSchema.parse(req.params.id);
  const body = getValidatedBody<z.infer<typeof updateDealSchema>>(req);
  const data = await dealsService.updateDeal(id, body);
  res.json({ data });
}

export async function deleteDeal(req: Request, res: Response) {
  const id = idParamSchema.parse(req.params.id);
  await dealsService.deleteDeal(id);
  res.status(204).send();
}
