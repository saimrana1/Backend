import type { Request, Response } from 'express';
import { z } from 'zod';
import { getValidatedBody, getValidatedQuery } from '../../../middlewares/validate';
import * as usersService from './users.service';
import { updateProfileSchema, withdrawSchema, cashbackQuerySchema } from './users.validation';

export async function getProfile(req: Request, res: Response) {
  const data = await usersService.getProfile(req.authUser!.userId);
  res.json({ data });
}

export async function updateProfile(req: Request, res: Response) {
  const body = getValidatedBody<z.infer<typeof updateProfileSchema>>(req);
  const data = await usersService.updateProfile(req.authUser!.userId, body);
  res.json({ data });
}

export async function getCashback(req: Request, res: Response) {
  const q = getValidatedQuery<z.infer<typeof cashbackQuerySchema>>(req);
  const data = await usersService.getCashbackInfo(req.authUser!.userId, q);
  res.json({ data });
}

export async function withdraw(req: Request, res: Response) {
  const body = getValidatedBody<z.infer<typeof withdrawSchema>>(req);
  const data = await usersService.withdrawCashback(req.authUser!.userId, body);
  res.json({ data });
}
