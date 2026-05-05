import type { Request, Response } from 'express';
import { z } from 'zod';
import { getValidatedBody } from '../../../middlewares/validate';
import * as newsletterService from './newsletter.service';
import { subscribeSchema, unsubscribeSchema } from './newsletter.validation';

export async function subscribe(req: Request, res: Response) {
  const body = getValidatedBody<z.infer<typeof subscribeSchema>>(req);
  const data = await newsletterService.subscribe(body.email);
  res.status(201).json({ data });
}

export async function unsubscribe(req: Request, res: Response) {
  const body = getValidatedBody<z.infer<typeof unsubscribeSchema>>(req);
  const data = await newsletterService.unsubscribe(body.email);
  res.json({ data });
}
