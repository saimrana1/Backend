import type { Request, Response } from 'express';
import { z } from 'zod';
import { getValidatedBody } from '../../../middlewares/validate';
import { idParamSchema } from '../../../common/validation/params';
import * as storesService from './stores.service';
import { createStoreSchema, storeFeaturedBodySchema, updateStoreSchema } from './stores.validation';

export async function listStores(_req: Request, res: Response) {
  const data = await storesService.listStores();
  res.json({ data });
}

export async function createStore(req: Request, res: Response) {
  const body = getValidatedBody<z.infer<typeof createStoreSchema>>(req);
  const data = await storesService.createStore(body);
  res.status(201).json({ data });
}

export async function setStoreFeatured(req: Request, res: Response) {
  const id = idParamSchema.parse(req.params.id);
  const { featured } = getValidatedBody<z.infer<typeof storeFeaturedBodySchema>>(req);
  const data = await storesService.setStoreFeatured(id, featured);
  res.json({ data });
}

export async function uploadStoreLogo(req: Request, res: Response) {
  const id = idParamSchema.parse(req.params.id);
  if (!req.file) {
    res.status(400).json({ error: { message: 'file field is required (multipart/form-data)', code: 'BAD_REQUEST' } });
    return;
  }
  if (!/^image\//.test(req.file.mimetype)) {
    res.status(400).json({ error: { message: 'Only image uploads are allowed', code: 'BAD_REQUEST' } });
    return;
  }

  const publicUrl = `/uploads/stores/${req.file.filename}`;
  const data = await storesService.updateStore(id, { logoUrl: publicUrl });
  res.json({ data });
}

export async function getStoreById(req: Request, res: Response) {
  const id = idParamSchema.parse(req.params.id);
  const data = await storesService.getStore(id);
  res.json({ data });
}

export async function updateStore(req: Request, res: Response) {
  const id = idParamSchema.parse(req.params.id);
  const body = getValidatedBody<z.infer<typeof updateStoreSchema>>(req);
  const data = await storesService.updateStore(id, body);
  res.json({ data });
}

export async function deleteStore(req: Request, res: Response) {
  const id = idParamSchema.parse(req.params.id);
  await storesService.deleteStore(id);
  res.status(204).send();
}
