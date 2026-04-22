import type { Request, Response } from 'express';
import { z } from 'zod';
import { getValidatedBody } from '../../../middlewares/validate';
import { idParamSchema } from '../../../common/validation/params';
import * as networksService from './networks.service';
import {
  createNetworkSchema,
  networkStatusBodySchema,
  updateNetworkSchema,
} from './networks.validation';

export async function listNetworks(_req: Request, res: Response) {
  const data = await networksService.listNetworks();
  res.json({ data });
}

export async function createNetwork(req: Request, res: Response) {
  const body = getValidatedBody<z.infer<typeof createNetworkSchema>>(req);
  const data = await networksService.createNetwork(body);
  res.status(201).json({ data });
}

export async function setNetworkStatus(req: Request, res: Response) {
  const id = idParamSchema.parse(req.params.id);
  const { status } = getValidatedBody<z.infer<typeof networkStatusBodySchema>>(req);
  const data = await networksService.setNetworkStatus(id, status);
  res.json({ data });
}

export async function getNetworkById(req: Request, res: Response) {
  const id = idParamSchema.parse(req.params.id);
  const data = await networksService.getNetwork(id);
  res.json({ data });
}

export async function updateNetwork(req: Request, res: Response) {
  const id = idParamSchema.parse(req.params.id);
  const body = getValidatedBody<z.infer<typeof updateNetworkSchema>>(req);
  const data = await networksService.updateNetwork(id, body);
  res.json({ data });
}

export async function deleteNetwork(req: Request, res: Response) {
  const id = idParamSchema.parse(req.params.id);
  await networksService.deleteNetwork(id);
  res.status(204).send();
}
