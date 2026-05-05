import type { Request, Response } from 'express';
import { z } from 'zod';
import { getValidatedQuery } from '../../../middlewares/validate';
import * as storesService from './stores.service';
import { listPublicStoresQuerySchema } from './stores.validation';

export async function listStores(req: Request, res: Response) {
  const q = getValidatedQuery<z.infer<typeof listPublicStoresQuerySchema>>(req);
  const result = await storesService.listPublicStores(q);
  res.json(result);
}

export async function getStoreBySlug(req: Request, res: Response) {
  const slug = z.string().min(1).parse(req.params.slug);
  const data = await storesService.getStoreDetail(slug, req.authUser?.userId);
  res.json({ data });
}
