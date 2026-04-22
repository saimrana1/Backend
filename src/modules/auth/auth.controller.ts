import type { Request, Response } from 'express';
import { z } from 'zod';
import { getValidatedBody } from '../../middlewares/validate';
import * as authService from './auth.service';
import { loginBodySchema, registerBodySchema } from './auth.validation';

export async function login(req: Request, res: Response) {
  const body = getValidatedBody<z.infer<typeof loginBodySchema>>(req);
  const data = await authService.loginWithPassword(body.username, body.password);
  res.json({ data });
}

export async function register(req: Request, res: Response) {
  const body = getValidatedBody<z.infer<typeof registerBodySchema>>(req);
  const data = await authService.registerUser(body.username, body.password);
  res.status(201).json({ data });
}

export async function me(req: Request, res: Response) {
  const u = req.authUser!;
  const data = await authService.getAuthProfile(u.userId);
  res.json({ data });
}
