import type { Request, Response } from 'express';
import { z } from 'zod';
import { getValidatedQuery } from '../../../middlewares/validate';
import * as searchService from './search.service';
import { searchQuerySchema } from './search.validation';

export async function search(req: Request, res: Response) {
  const q = getValidatedQuery<z.infer<typeof searchQuerySchema>>(req);
  const data = await searchService.unifiedSearch(q);
  res.json({ data });
}
